from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from datetime import datetime, timezone
import stripe

stripe.api_key = STRIPE_SECRET_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

FREE_PLAN = {
    "id": "free",
    "name": "Free Trial",
    "price_monthly": 0,
    "price_yearly": 0,
    "stripe_price_id": None,
    "features": {
        "leads_per_month": 20,
        "emails_per_month": 10,
        "ai_personalization": False,
        "priority_support": False,
        "custom_branding": False,
        "advanced_filters": False,
    },
    "is_active": True,
}

PRO_PLAN = {
    "id": "pro",
    "name": "Pro",
    "price_monthly": 2900,
    "price_yearly": 29000,
    "stripe_price_id": None,
    "features": {
        "leads_per_month": 500,
        "emails_per_month": 300,
        "ai_personalization": True,
        "priority_support": True,
        "custom_branding": False,
        "advanced_filters": True,
    },
    "is_active": True,
}

ENTERPRISE_PLAN = {
    "id": "enterprise",
    "name": "Enterprise",
    "price_monthly": 9900,
    "price_yearly": 99000,
    "stripe_price_id": None,
    "features": {
        "leads_per_month": -1,
        "emails_per_month": -1,
        "ai_personalization": True,
        "priority_support": True,
        "custom_branding": True,
        "advanced_filters": True,
    },
    "is_active": True,
}

PLANS = {p["id"]: p for p in [FREE_PLAN, PRO_PLAN, ENTERPRISE_PLAN]}


def get_plans():
    return [FREE_PLAN, PRO_PLAN, ENTERPRISE_PLAN]


def get_user_subscription(user_id):
    try:
        res = supabase.table("user_subscriptions").select("*").eq("user_id", user_id).maybe_single().execute()
        sub = res.data
        if sub:
            plan = PLANS.get(sub.get("plan_id"), FREE_PLAN)
            return {**sub, "plan": plan}
    except Exception:
        pass
    return {
        "user_id": user_id,
        "plan_id": "free",
        "status": "active",
        "plan": FREE_PLAN,
    }


def get_usage(user_id):
    try:
        res = supabase.table("leads").select("id, status").eq("user_id", user_id).execute()
        leads = res.data or []
        total_leads = len(leads)
        sent_emails = sum(1 for r in leads if r.get("status", "").upper() == "SENT")
        return {"leads_used": total_leads, "emails_used": sent_emails}
    except Exception:
        return {"leads_used": 0, "emails_used": 0}


def check_limits(user_id, action="scrape"):
    sub = get_user_subscription(user_id)
    plan = sub.get("plan", FREE_PLAN)
    features = plan.get("features", {})
    usage = get_usage(user_id)

    if action == "scrape":
        limit = features.get("leads_per_month", 20)
        used = usage["leads_used"]
    elif action == "email":
        limit = features.get("emails_per_month", 10)
        used = usage["emails_used"]
    else:
        return True, None

    if limit == -1:
        return True, None

    if used >= limit:
        return False, {
            "limit": limit,
            "used": used,
            "plan": plan["name"],
            "message": f"You've reached your {plan['name']} limit of {limit} {action}s per month. Upgrade to continue.",
        }

    return True, None


def create_checkout_session(user_id, price_id, success_url, cancel_url):
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            client_reference_id=user_id,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"user_id": user_id},
        )
        return session.url, None
    except stripe.StripeError as e:
        return None, str(e)


def create_portal_session(user_id, return_url):
    try:
        sub = supabase.table("user_subscriptions").select("stripe_customer_id").eq("user_id", user_id).maybe_single().execute()
        customer_id = sub.data.get("stripe_customer_id") if sub.data else None
    except Exception:
        customer_id = None
    if not customer_id:
        return None, "No subscription found"

    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session.url, None
    except stripe.StripeError as e:
        return None, str(e)


def handle_stripe_webhook(payload, sig_header):
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.SignatureVerificationError) as e:
        return None, str(e)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")

        if user_id and subscription_id:
            try:
                stripe_sub = stripe.Subscription.retrieve(subscription_id)
                plan_id = "pro"
                if stripe_sub["items"]["data"]:
                    price_id = stripe_sub["items"]["data"][0]["price"]["id"]
                    for pid, p in PLANS.items():
                        if p.get("stripe_price_id") == price_id:
                            plan_id = pid
                            break

                current_period_end = datetime.fromtimestamp(
                    stripe_sub["current_period_end"], tz=timezone.utc
                ).isoformat()
                current_period_start = datetime.fromtimestamp(
                    stripe_sub["current_period_start"], tz=timezone.utc
                ).isoformat()

                try:
                    supabase.table("user_subscriptions").upsert({
                        "user_id": user_id,
                        "plan_id": plan_id,
                        "stripe_customer_id": customer_id,
                        "stripe_subscription_id": subscription_id,
                        "status": "active",
                        "current_period_start": current_period_start,
                        "current_period_end": current_period_end,
                    }, on_conflict="user_id").execute()
                except Exception:
                    pass
            except Exception:
                pass

    elif event["type"] == "customer.subscription.updated":
        sub_data = event["data"]["object"]
        sub_id = sub_data.get("id")
        status = sub_data.get("status")
        cancel_at_period_end = sub_data.get("cancel_at_period_end", False)

        try:
            supabase.table("user_subscriptions").update({
                "status": "canceled" if cancel_at_period_end else status,
            }).eq("stripe_subscription_id", sub_id).execute()
        except Exception:
            pass

    elif event["type"] == "customer.subscription.deleted":
        sub_data = event["data"]["object"]
        sub_id = sub_data.get("id")

        try:
            supabase.table("user_subscriptions").update({
                "status": "canceled",
                "plan_id": "free",
            }).eq("stripe_subscription_id", sub_id).execute()
        except Exception:
            pass

    return event, None
