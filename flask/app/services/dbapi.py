import requests
from flask import session

DB_WRAPPER_URL = "https://localhost:8000"

# todo what's with the verify=false that's required?
def _auth_header():
    return {"Authorization": f"bearer {session['token']}"}

# auth
def login(un: str, pw: str):
    x = requests.post(f"{DB_WRAPPER_URL}/token", files={
        "username": (None, un), 
        "password": (None, pw)
    }, verify=False)

    if x.status_code == 200:
        session['un'] = un
        session['token'] = x.json()['access_token']
        return True
    else:
        return False

def logout():
    session.pop('un', None)
    session.pop('token', None)

def is_logged_in():
    print(session)
    return ('un' in session) and (session['un'] is not None)

def get_username():
    return session['un']

# models

# returns false if failed to create (due to no auth)
# returns new model ID if succeeded
def create_model_config(config, name):
    # todo
    if not is_logged_in():
        return False
    postbody = {
        "config": config,
        "name": name
    }

    #import json
    #with open("temp.json", 'w') as f:
    #    json.dump(postbody, f)

    x = requests.post(f"{DB_WRAPPER_URL}/models", json=postbody, headers=_auth_header(), verify=False)

    return x.json()['id']

def get_model_ids_names():
    model_ids = requests.get(f"{DB_WRAPPER_URL}/models", verify=False)
    return model_ids.json()['models']

def get_model_data(id):
    data = requests.get(f"{DB_WRAPPER_URL}/models/{id}", verify=False)
    return data.json()