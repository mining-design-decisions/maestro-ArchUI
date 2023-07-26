import requests

from app.data import common, login

@login.auth_req
def mark_review(id):
    return requests.post(f"{login.get_db()}/issues/{id}/mark-review", verify=False, headers=common._auth_header())

@login.auth_req
def mark_training(id):
    return requests.post(f"{login.get_db()}/issues/{id}/finish-review", verify=False, headers=common._auth_header())

@login.auth_req
def set_manual_label(issue, classifications):
    return requests.post(f"{login.get_db()}/manual-labels/{issue}", json=classifications, verify=False, headers=common._auth_header())

def get_comments_for(issue):
    # todo proper error handling/reporting, see auth_reqs
    try:
        x = requests.get(f"{login.get_db()}/manual-labels/{issue}/comments", verify=False).json()
        if "comments" in x:
            return x["comments"]
        print("Comments not in response")
        return []
    except Exception:
        print("Error fetching comments")
        return []

@login.auth_req
def add_comment_for(issue, comment):
    return requests.post(f"{login.get_db()}/manual-labels/{issue}/comments", verify=False, headers=common._auth_header(), json={"comment": comment})

@login.auth_req
def delete_comment(issue, comment_id):
    return requests.delete(f"{login.get_db()}/manual-labels/{issue}/comments/{comment_id}", verify=False, headers=common._auth_header())

@login.auth_req
def edit_comment(issue, comment_id, json):
    return requests.patch(f"{login.get_db()}/manual-labels/{issue}/comments/{comment_id}", verify=False, headers=common._auth_header(), json=json)