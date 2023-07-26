from flask import render_template
from flask import request

from app.controller import login as contr
from app.data import login as data

@contr.bp.route('/', methods=["GET"])
def viewform():
    db = data.get_db()
    cli = data.get_cli()
    if data.is_logged_in():
        un = data.get_username()
        return render_template("login/loggedin.html", un=un, db=db, cli=cli)
    return render_template("login/form.html", db=db, cli=cli)

@contr.bp.route('/login', methods=["POST"])
def login():
    un = request.form.get('username', '')
    pw = request.form.get('password', '')
    db = data.get_db()
    cli = data.get_cli()
    if contr.log_in(un, pw):
        return render_template('login/loggedin.html', un=un, db=db, cli=cli)
    return render_template('login/failed.html', db=db, cli=cli)

@contr.bp.route('/logout', methods=["POST"])
def logout():
    db = data.get_db()
    cli = data.get_cli()
    data.logout()
    return render_template('login/form.html', db=db, cli=cli)
