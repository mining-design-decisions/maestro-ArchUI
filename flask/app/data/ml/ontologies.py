import requests

from app.data import login, common

def get_ontologies():
    x = requests.get(f"{login.get_db()}/files", verify=False, json={"category": "ontologies"})
    return x.json()

@login.auth_req
def upload_ontology(desc, file):
    return requests.post(f"{login.get_db()}/files", files={
        "file": ("ontologyFile", file),
        "description": (None, desc),
        "category": (None, "ontologies")
    }, verify=False, headers=common._auth_header())

@login.auth_req
def delete_ontology(ontology):
    return requests.delete(f"{login.get_db()}/files/{ontology}", verify=False, headers=common._auth_header())