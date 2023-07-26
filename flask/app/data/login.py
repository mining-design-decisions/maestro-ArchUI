import requests

from app.data import common

def get_db():
    return common.get_cache('db_url', "https://localhost:8000")
def set_db(new_url):
    common.set_cache('db_url', new_url)
    logout()

def get_cli():
    return common.get_cache('cli_url', "https://localhost:9011")
def set_cli(new_url):
    common.set_cache('cli_url', new_url)

def get_search():
    return common.get_cache('search_url', "https://localhost:8042")
def set_search(new_url):
    common.set_cache('search_url', new_url)

def get_username():
    return common.get_cache('un', '')
def set_username(un):
    common.set_cache('un', un)
def set_token(token):
    common.set_cache('token', token)

def is_logged_in():
    return common.get_cache('un', '') != ''
def logout():
    common.set_cache('un', '')
    common.set_cache('pw', '')

def get_file(file_id):
    x = requests.get(f"{get_db()}/files/{file_id}", verify=False)
    if not x.status_code == 200:
        print(x.json())
    return x.json()

def auth_req(func):
    def inner(*args, **kwargs):
        if not is_logged_in():
            return {'msg': "Not logged in in UI"}, 401
        
        x = func(*args, **kwargs)
        try:
            data = x.json()
            if data is None:
                data = {"msg": "empty response"}
        except:
            data = {'msg': "Error retrieving response data"}

        return data, x.status_code

    return inner