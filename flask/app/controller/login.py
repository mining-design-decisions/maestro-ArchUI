from flask import request
from flask import Blueprint

import requests

from app.data import login as data

def log_in(un, pw):
    x = requests.post(f"{data.get_db()}/token", files={
        "username": (None, un),
        "password": (None, pw)
    }, verify=False)

    if x.status_code == 200:
        data.set_username(un)
        data.set_token(x.json()['access_token'])
        return True
    return False

bp = Blueprint('login', __name__, url_prefix="/login")

@bp.route('/setdb', methods=["POST"])
def setDB():
    data.set_db(request.json['new_url'])
    return "ok", 200

@bp.route('/setcli', methods=["POST"])
def setCLI():
    data.set_cli(request.json['new_url'])
    return "ok", 200

@bp.route('/setsearch', methods=["POST"])
def setSearch():
    data.set_search(request.json('new_url'))

@bp.route('/isloggedin', methods=["GET"])
def isLoggedIn():
    return {'is logged in': data.is_logged_in()}, 200