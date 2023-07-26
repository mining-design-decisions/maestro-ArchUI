import requests

from app.data import login, common

default_q = {
    "$or": 
    [
        {"tags": {"$eq": "Apache-TAJO"}}, 
        {"tags": {"$eq": "Apache-HDFS"}}, 
        {"tags": {"$eq": "Apache-HADOOP"}}, 
        {"tags": {"$eq": "Apache-YARN"}}, 
        {"tags": {"$eq": "Apache-MAPREDUCE"}}, 
        {"tags": {"$eq": "Apache-CASSANDRA"}}
    ]
}

def get_embeddings():
    return requests.get(f"{login.get_db()}/embeddings", verify=False).json()['embeddings']

def get_embedding(embedding):
    return requests.get(f"{login.get_db()}/embeddings/{embedding}", verify=False).json()

def get_args_wordembed():
    try:
        return requests.get(f"{login.get_cli()}/arglists/generate-embedding-internal/embedding-config", verify=False).json()
    except:
        return None
    
@login.auth_req
def save_embedding(name, config):
    return requests.post(f"{login.get_db()}/embeddings", verify=False, headers=common._auth_header(), json={"name": name, "config": config})

@login.auth_req
def delete_embedding(id):
    return requests.delete(f"{login.get_db()}/embeddings/{id}", verify=False, headers=common._auth_header())

@login.auth_req
def train_embedding(embedding):
    return requests.post(f"{login.get_cli()}/generate-embedding", verify=False, json={
        "auth": common._auth_body(),
        "config": {
            "database-url": login.get_db(),
            "embedding-id": embedding
        }
    })