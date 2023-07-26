import requests

from app.data import common, login

@login.auth_req
def remove_tag(issue, tag):
    return requests.delete(f"{login.get_db()}/issues/{issue}/tags/{tag}", verify=False, headers=common._auth_header())

def get_tags_for(issue):
    return requests.get(f"{login.get_db()}/issues/{issue}/tags", verify=False).json()['tags']

@login.auth_req
def add_tag_to(issue, tag):
    return requests.post(f"{login.get_db()}/issues/{issue}/tags", verify=False, headers=common._auth_header(), json={"tag": tag})

@login.auth_req
def delete_tag(tag):
    return requests.delete(f"{login.get_db()}/tags/{tag}", verify=False, headers=common._auth_header())

def get_manual_tags():
    tags = requests.get(f"{login.get_db()}/tags", verify=False).json()['tags']
    result = {}
    for tag in tags:
        if tag['type'] != 'project' and tag['name'] not in ['has-label', 'needs-review']:
            result[tag['name']] = tag['description']
    return result

def create_tag(name, desc):
    x = requests.post(f"{login.get_db()}/tags", verify=False, headers=common._auth_header(), json={
        "tag": name,
        "description": desc
    })

    if x.status_code != 200:
        print(f"ERROR occurred in creating new tag. code: {x.status_code}")
        print(x.json())
        print('\n')