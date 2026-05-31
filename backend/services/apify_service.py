from apify_client import ApifyClient


def get_businesses(search_term: str, apify_token: str):
    if not apify_token:
        raise ValueError("Apify token is not configured")
    client = ApifyClient(apify_token)

    run = client.actor("compass/crawler-google-places").call(
        run_input={
            "searchStringsArray": [search_term],
            "maxCrawledPlacesPerSearch": 20,
        }
    )

    dataset_id = run.default_dataset_id
    items = list(client.dataset(dataset_id).iterate_items())
    return items
