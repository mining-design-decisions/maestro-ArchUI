from flask import render_template
from flask import Blueprint

bp = Blueprint('models', __name__, url_prefix="/models")

@bp.route('/', methods=["GET"])
def viewall():
    # todo
    models = ["model1", "model2", "testmodel"]
    return render_template("models/viewall.html", models=models)

@bp.route('/create', methods=["GET"])
def viewform():
    # todo
    return "under construction"

@bp.route('/view/<model>', methods=["GET"])
def view(model):
    # todo
    return "under construction"