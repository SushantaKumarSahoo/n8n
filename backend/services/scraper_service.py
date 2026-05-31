import requests
from bs4 import BeautifulSoup

def scrape_website(url):

    try:

        response = requests.get(
            url,
            timeout=15,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        return text[:5000]

    except Exception as e:

        print(e)
        return ""