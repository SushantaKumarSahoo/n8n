from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time, os
from datetime import datetime

import stripe
from services.apify_service import get_businesses
from services.scraper_service import scrape_website
from services.email_extractor import extract_emails
from services.gemini_service import generate_email
from services.email_sender import send_email
from utils.utils import extract_subject_body
from services.db_service import (
    save_lead, get_all_leads, get_lead_stats, mark_lead_sent,
    add_log, get_logs, upsert_api_key, get_api_keys,
)
from services.subscription_service import (
    get_plans, get_user_subscription, get_usage, check_limits,
    create_checkout_session, create_portal_session, handle_stripe_webhook,
)
from config import STRIPE_SECRET_KEY, APP_URL

stripe.api_key = STRIPE_SECRET_KEY

app = FastAPI(title="TechBuildix Leads API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

job_status = {
    "scrape": {"running": False, "message": "Idle", "last_run": None},
    "email":  {"running": False, "message": "Idle", "last_run": None},
}


class ScrapeRequest(BaseModel):
    search_term: Optional[str] = "digital marketing agencies london"


class SettingsPayload(BaseModel):
    apify_token: Optional[str] = None
    gemini_api_key: Optional[str] = None
    brevo_api_key: Optional[str] = None
    brevo_smtp_server: Optional[str] = None
    brevo_smtp_port: Optional[str] = None
    brevo_smtp_user: Optional[str] = None
    brevo_smtp_password: Optional[str] = None
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None


REQUIRED_KEYS = ["apify", "gemini", "brevo", "sender_email"]


def require_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ", 1)[1]
    from supabase import create_client
    from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
    sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    try:
        user_resp = sb.auth.get_user(token)
        return user_resp.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def log(user_id, job_type, message, level="info"):
    try:
        add_log(user_id, job_type, message, level)
    except Exception:
        pass


def run_scrape_job(user_id: str, search_term: str):
    job_status["scrape"]["running"] = True
    job_status["scrape"]["message"] = f"Scraping: {search_term}..."
    job_status["scrape"]["last_run"] = datetime.now().isoformat()
    log(user_id, "scrape", f"Starting scrape for: {search_term}")

    try:
        keys = get_api_keys(user_id)
        apify_token = keys.get("apify")
        gemini_key = keys.get("gemini")

        if not apify_token:
            raise ValueError("Set your Apify API key in Settings first.")
        if not gemini_key:
            raise ValueError("Set your Gemini API key in Settings first.")

        businesses = get_businesses(search_term, apify_token)
        log(user_id, "scrape", f"Fetched {len(businesses)} businesses from Apify")

        processed = 0
        for business in businesses:
            company = business.get("title", "")
            website = business.get("website", "")
            if not website:
                continue

            msg = f"Processing: {company} ({website})"
            job_status["scrape"]["message"] = msg
            log(user_id, "scrape", msg)

            page_text = scrape_website(website)
            emails = extract_emails(page_text)
            email_str = ", ".join(emails)
            generated_email = generate_email(company, website, page_text, gemini_key)

            save_lead(user_id, company, website, email_str, generated_email)
            log(user_id, "scrape", f"Saved lead: {company} — emails: {email_str or 'none found'}")
            processed += 1

        done_msg = f"Done — {processed} leads saved."
        job_status["scrape"]["message"] = done_msg
        log(user_id, "scrape", done_msg)

    except Exception as e:
        err = f"Scrape error: {str(e)}"
        job_status["scrape"]["message"] = err
        log(user_id, "scrape", err, "error")

    finally:
        job_status["scrape"]["running"] = False


def run_email_job(user_id: str):
    job_status["email"]["running"] = True
    job_status["email"]["message"] = "Starting email sender..."
    job_status["email"]["last_run"] = datetime.now().isoformat()
    log(user_id, "email", "Email job started")

    try:
        keys = get_api_keys(user_id)
        brevo_key = keys.get("brevo")
        sender_name = keys.get("sender_name") or "TechBuildix"
        sender_email = keys.get("sender_email")

        if not brevo_key:
            raise ValueError("Set your Brevo API key in Settings first.")
        if not sender_email:
            raise ValueError("Set your sender email in Settings first.")

        rows = get_all_leads(user_id)
        success_count = 0
        failed_count = 0
        skipped_count = 0

        for row in rows:
            lead_id = row.get("id")
            email = (row.get("emails") or "").strip()
            generated_email = row.get("generated_email") or ""
            status = (row.get("status") or "").strip()
            company = row.get("company", "Unknown")

            if not email:
                skipped_count += 1
                continue
            if status.upper() == "SENT":
                skipped_count += 1
                continue
            if not generated_email:
                skipped_count += 1
                continue
            if "[Name]" in generated_email or "[Contact Name]" in generated_email:
                skipped_count += 1
                continue

            msg = f"Sending to {email} ({company})"
            job_status["email"]["message"] = msg
            log(user_id, "email", msg)

            try:
                subject, body = extract_subject_body(generated_email)
                ok = send_email(email, subject, body, brevo_key, sender_email, sender_name)
                if ok:
                    mark_lead_sent(lead_id)
                    success_count += 1
                    log(user_id, "email", f"Sent to {email}")
                else:
                    failed_count += 1
                    log(user_id, "email", f"Failed to send to {email}", "error")
                    time.sleep(10)
            except Exception as e:
                failed_count += 1
                log(user_id, "email", f"Exception for {email}: {e}", "error")

        done = f"Done — {success_count} sent, {failed_count} failed, {skipped_count} skipped."
        job_status["email"]["message"] = done
        log(user_id, "email", done)

    except Exception as e:
        err = f"Email job error: {str(e)}"
        job_status["email"]["message"] = err
        log(user_id, "email", err, "error")

    finally:
        job_status["email"]["running"] = False


@app.get("/")
def root():
    return {"status": "ok", "app": "TechBuildix Leads API"}


@app.get("/leads")
def get_leads(user_id: str = Depends(require_user)):
    try:
        rows = get_all_leads(user_id)
        return {"leads": rows, "total": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/leads/stats")
def get_stats(user_id: str = Depends(require_user)):
    try:
        return get_lead_stats(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/scrape")
def start_scrape(
    payload: ScrapeRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(require_user),
):
    if job_status["scrape"]["running"]:
        raise HTTPException(status_code=409, detail="Scrape job already running.")
    background_tasks.add_task(run_scrape_job, user_id, payload.search_term)
    return {"message": "Scraping started", "search_term": payload.search_term}


@app.get("/scrape/status")
def scrape_status():
    return job_status["scrape"]


@app.post("/send-emails")
def start_send_emails(
    background_tasks: BackgroundTasks,
    user_id: str = Depends(require_user),
):
    if job_status["email"]["running"]:
        raise HTTPException(status_code=409, detail="Email job already running.")
    background_tasks.add_task(run_email_job, user_id)
    return {"message": "Email sending started"}


@app.get("/send-emails/status")
def email_status():
    return job_status["email"]


@app.get("/logs")
def get_logs_endpoint(
    job_type: Optional[str] = None,
    limit: int = 100,
    user_id: str = Depends(require_user),
):
    try:
        return {"logs": get_logs(user_id, job_type, limit)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/settings")
def get_settings(user_id: str = Depends(require_user)):
    keys = get_api_keys(user_id)
    return {
        "apify_token": keys.get("apify", ""),
        "gemini_api_key": keys.get("gemini", ""),
        "brevo_api_key": keys.get("brevo", ""),
        "brevo_smtp_server": keys.get("brevo_smtp_server", ""),
        "brevo_smtp_port": keys.get("brevo_smtp_port", ""),
        "brevo_smtp_user": keys.get("brevo_smtp_user", ""),
        "brevo_smtp_password": keys.get("brevo_smtp_password", ""),
        "sender_name": keys.get("sender_name", ""),
        "sender_email": keys.get("sender_email", ""),
    }


@app.get("/settings/status")
def settings_status(user_id: str = Depends(require_user)):
    keys = get_api_keys(user_id)
    missing = [k for k in REQUIRED_KEYS if not keys.get(k)]
    return {
        "configured": len(missing) == 0,
        "missing": missing,
    }


@app.post("/settings")
def update_settings(
    payload: SettingsPayload,
    user_id: str = Depends(require_user),
):
    mappings = {
        "apify_token": "apify",
        "gemini_api_key": "gemini",
        "brevo_api_key": "brevo",
        "brevo_smtp_server": "brevo_smtp_server",
        "brevo_smtp_port": "brevo_smtp_port",
        "brevo_smtp_user": "brevo_smtp_user",
        "brevo_smtp_password": "brevo_smtp_password",
        "sender_name": "sender_name",
        "sender_email": "sender_email",
    }
    for field, service in mappings.items():
        val = getattr(payload, field, None)
        if val:
            upsert_api_key(user_id, service, val)
    return {"message": "Settings saved successfully."}


@app.get("/plans")
def list_plans():
    return {"plans": get_plans()}


@app.get("/subscription")
def get_my_subscription(user_id: str = Depends(require_user)):
    sub = get_user_subscription(user_id)
    usage = get_usage(user_id)
    return {**sub, **usage}


@app.post("/subscription/create-checkout")
def checkout(
    plan_id: str = "pro",
    interval: str = "monthly",
    user_id: str = Depends(require_user),
):
    prices = {
        "pro_monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY"),
        "pro_yearly": os.getenv("STRIPE_PRICE_PRO_YEARLY"),
        "enterprise_monthly": os.getenv("STRIPE_PRICE_ENTERPRISE_MONTHLY"),
        "enterprise_yearly": os.getenv("STRIPE_PRICE_ENTERPRISE_YEARLY"),
    }
    price_key = f"{plan_id}_{interval}"
    price_id = prices.get(price_key)

    if not price_id:
        raise HTTPException(status_code=400, detail=f"No price configured for {price_key}")

    url, err = create_checkout_session(
        user_id, price_id,
        f"{APP_URL}/settings?tab=plans",
        f"{APP_URL}/settings?tab=plans",
    )
    if err:
        raise HTTPException(status_code=500, detail=err)
    return {"url": url}


@app.post("/subscription/portal")
def billing_portal(
    user_id: str = Depends(require_user),
):
    url, err = create_portal_session(user_id, f"{APP_URL}/settings?tab=plans")
    if err:
        raise HTTPException(status_code=400, detail=err)
    return {"url": url}


@app.get("/subscription/limits")
def get_limits(user_id: str = Depends(require_user)):
    sub = get_user_subscription(user_id)
    plan = sub.get("plan", {})
    features = plan.get("features", {})
    usage = get_usage(user_id)
    return {
        "plan": plan["name"],
        "plan_id": plan["id"],
        "leads": {"limit": features.get("leads_per_month", 20), "used": usage["leads_used"]},
        "emails": {"limit": features.get("emails_per_month", 10), "used": usage["emails_used"]},
        "features": features,
    }


@app.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")

    event, err = handle_stripe_webhook(payload, sig_header)
    if err:
        raise HTTPException(status_code=400, detail=err)
    return {"received": True}
