import requests

from app.data import login as login_data

def get_single_issue_data(issue_id):
    body = {
        "filter": {"_id": {"$eq": issue_id}},
        "sort_ascending": True,
        "models": [],
        "page": 1,
        "limit": 1
    }
    x = requests.get(f"{login_data.get_db()}/ui", json=body, verify=False)
    if not x.status_code == 200:
        print(x.json())
    return x.json()["data"][0]

def get_search_data(body):
    x = requests.get(f"{login_data.get_search()}/search", verify=False, json=body)
    if not x.status_code == 200:
        print(x.json())
    return x.json()