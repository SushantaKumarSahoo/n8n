import re


def extract_subject_body(content):

    subject = "TechBuildix Partnership"

    match = re.search(
        r"Subject:\s*(.*?)\n",
        content
    )

    if match:
        subject = match.group(1).strip()

    body = re.sub(
        r"Subject:.*?\n",
        "",
        content,
        count=1
    )

    body = body.replace(
        "Email:",
        ""
    ).strip()

    return subject, body