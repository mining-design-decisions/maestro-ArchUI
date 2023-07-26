from flask import session

def set_cache(name, value):
    session[name] = value
def get_cache(name, default):
    return session.get(name, default)

def _auth_header():
    return {"Authorization": f"bearer {get_cache('token', '')}"}

def _auth_body():
    return {
        "token": get_cache('token', '')
    }