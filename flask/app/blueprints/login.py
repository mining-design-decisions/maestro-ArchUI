from flask import render_template
from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('login', __name__, url_prefix="/login")

@bp.route('/', methods=["GET"])
def viewform():
    if dbapi.is_logged_in():
        un = dbapi.get_username()
        return render_template("login/loggedin.html", un=un)
    else:
        return render_template("login/form.html")

@bp.route('/login', methods=["POST"])
def login():
    un = request.form.get('username', '')
    pw = request.form.get('password', '')
    if dbapi.login(un, pw):
        return render_template('login/loggedin.html', un=un)
    else:
        return render_template('login/failed.html')

@bp.route('/logout', methods=["POST"])
def logout():
    dbapi.logout()
    return render_template('login/form.html')