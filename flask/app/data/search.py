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
    x = requests.post(f"{login_data.get_search()}/search", verify=False, json=body)
    if not x.status_code == 200:
        print(x.json())
    return x.json()


def index_search_data(body):
    x = requests.post(f'{login_data.get_search()}/create-index', verify=False, json=body)
    if x.status_code == 200:
        print(x.json())
    return x.json()


def get_projects_by_repo():
    r = requests.get(f'{login_data.get_db()}/repos', verify=False)
    if not r.status_code == 200:
        print(r.json)
        return []
    repos = r.json()['repos']
    projects_by_repo = {}
    for repo in repos:
        r = requests.get(f'{login_data.get_db()}/repos/{repo}/projects', verify=False)
        if not r.status_code == 200:
            print(r.json())
        projects_by_repo[repo] = r.json()['projects']
    return {
        'repos': repos,
        'projects_by_repo': projects_by_repo
    }
