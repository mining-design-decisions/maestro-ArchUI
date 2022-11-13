from flask import render_template
from flask import Blueprint
from app.ml_link import get_cli_json

bp = Blueprint("models", __name__, url_prefix="/models")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all models
    models = [{
        'name': 'Foo Bar'
    }]

    return render_template("models/viewall.html", models=models)

@bp.route('/create', methods=["GET"])
def createModel():
    options = get_cli_json()
    print(options)
    return render_template("models/create.html")

@bp.route('/create', methods=["POST"])
def postModel(param):
    print(param)