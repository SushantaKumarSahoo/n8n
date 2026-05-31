import requests


def send_email(recipient_email, subject, body, brevo_api_key: str, sender_email: str, sender_name: str):
    if not brevo_api_key:
        raise ValueError("Brevo API key is not configured")
    if not sender_email:
        raise ValueError("Sender email is not configured")

    headers = {
        "accept": "application/json",
        "api-key": brevo_api_key,
        "content-type": "application/json",
    }

    payload = {
        "sender": {"name": sender_name or "TechBuildix", "email": sender_email},
        "to": [{"email": recipient_email}],
        "subject": subject,
        "htmlContent": body.replace("\n", "<br>"),
    }

    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers=headers,
        json=payload,
    )

    if response.status_code not in (200, 201):
        return False

    response.raise_for_status()
    return True
