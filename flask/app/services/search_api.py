import requests

search_api_url = "https://localhost:8042"

def search(body):
    x = requests.get(f"{search_api_url}/search", verify=False, json=body)
    if not x.status_code == 200:
        print(x.json())
    return x.json()