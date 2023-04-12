from flask import render_template
from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('login', __name__, url_prefix="/login")

@bp.route('/', methods=["GET"])
def viewform():
    db = dbapi.get_db()
    cli = dbapi.get_cli()
    if dbapi.is_logged_in():
        un = dbapi.get_username()
        return render_template("login/loggedin.html", un=un, db=db, cli=cli)
    else:
        return render_template("login/form.html", db=db, cli=cli)

@bp.route('/login', methods=["POST"])
def login():
    un = request.form.get('username', '')
    pw = request.form.get('password', '')
    db = dbapi.get_db()
    cli = dbapi.get_cli()
    if dbapi.login(un, pw):
        return render_template('login/loggedin.html', un=un, db=db, cli=cli)
    else:
        return render_template('login/failed.html', db=db, cli=cli)

@bp.route('/logout', methods=["POST"])
def logout():
    db = dbapi.get_db()
    cli = dbapi.get_cli()
    dbapi.logout()
    return render_template('login/form.html', db=db, cli=cli)

@bp.route('/setdb', methods=["POST"])
def setdb():
    dbapi.set_db(request.json['new_url'])
    return "ok", 200

@bp.route('/setcli', methods=["POST"])
def setcli():
    dbapi.set_cli(request.json['new_url'])
    return "ok", 200

@bp.route('/isloggedin', methods=["GET"])
def isLoggedIn():
    return {'is logged in': dbapi.is_logged_in()}, 200