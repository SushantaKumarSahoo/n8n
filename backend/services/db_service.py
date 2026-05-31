from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from datetime import datetime

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def save_lead(user_id, company, website, emails, generated_email):
    supabase.table("leads").insert({
        "user_id": user_id,
        "company": company,
        "website": website,
        "emails": emails,
        "generated_email": generated_email,
        "status": "PENDING",
        "sent_date": None,
    }).execute()


def get_all_leads(user_id):
    res = supabase.table("leads").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data or []


def get_lead_stats(user_id):
    rows = get_all_leads(user_id)
    total = len(rows)
    sent = sum(1 for r in rows if r.get("status", "").upper() == "SENT")
    pending = total - sent
    return {"total": total, "sent": sent, "pending": pending}


def mark_lead_sent(lead_id):
    supabase.table("leads").update({
        "status": "SENT",
        "sent_date": datetime.now().isoformat(),
    }).eq("id", lead_id).execute()


def get_api_keys(user_id):
    res = supabase.table("api_keys").select("service, key_value").eq("user_id", user_id).execute()
    return {row["service"]: row["key_value"] for row in (res.data or [])}


def upsert_api_key(user_id, service, key_value):
    supabase.table("api_keys").upsert(
        {"user_id": user_id, "service": service, "key_value": key_value},
        on_conflict="user_id, service",
    ).execute()


def add_log(user_id, job_type, message, level="info"):
    supabase.table("job_logs").insert({
        "user_id": user_id,
        "job_type": job_type,
        "message": message,
        "level": level,
    }).execute()


def get_logs(user_id, job_type=None, limit=100):
    query = supabase.table("job_logs").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit)
    if job_type:
        query = query.eq("job_type", job_type)
    res = query.execute()
    return list(reversed(res.data or []))
