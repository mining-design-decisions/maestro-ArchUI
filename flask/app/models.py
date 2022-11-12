from flask import render_template
from flask import Blueprint

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
    return render_template("models/create.html")

@bp.route('/create', methods=["POST"])
def postModel(param):
    print(param)