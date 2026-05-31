from google import genai


def generate_email(company_name, website, website_content, gemini_api_key: str):
    if not gemini_api_key:
        raise ValueError("Gemini API key is not configured")
    client = genai.Client(api_key=gemini_api_key)

    prompt = f"""
You are an expert B2B sales copywriter.

Our company:
TechBuildix

Website:
https://techbuildix.com

Services:
- Salesforce Development
- AI Automation
- CRM Solutions
- React Development
- Custom Software Development
- MuleSoft Integration

Target Company:
{company_name}

Website:
{website}

Website Content:
{website_content[:8000]}

TASK:

Analyze the company website and generate a highly personalized cold outreach email.

Rules:

1. Mention something specific from their website.
2. Never use placeholders like:
   - [Name]
   - [Contact Name]
   - Dear Sir/Madam
3. Start with:
   Hi Team,
4. Maximum 150 words.
5. Focus on how TechBuildix can help them.
6. Include a strong CTA.
7. Return ONLY the following format:

Subject: <subject>

Email:
<email body>
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )

    return response.text
