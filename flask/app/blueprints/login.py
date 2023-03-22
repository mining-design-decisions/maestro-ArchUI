from flask import render_template
from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('login', __name__, url_prefix="/login")

@bp.route('/', methods=["GET"])
def viewform():
    if dbapi.is_logged_in():
        un = dbapi.get_username()
        db = dbapi.get_db()
        cli = dbapi.get_cli()
        return render_template("login/loggedin.html", un=un, db=db, cli=cli)
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

@bp.route('/setdb', methods=["POST"])
def setdb():
    dbapi.set_db(request.json['new_url'])

@bp.route('/setcli', methods=["POST"])
def setcli():
    dbapi.set_cli(request.json['new_url'])