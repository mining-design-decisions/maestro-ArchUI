from flask import render_template
from flask import Blueprint

bp = Blueprint('predict', __name__, url_prefix="/predict")

@bp.route('/', methods=["GET"])
def viewform():
    # todo
    models = ["testmodel", "model1", "model2"]
    projects = ["testproj", "test", "proj"]
    return render_template("predict/form.html", models=models, projects=projects)

@bp.route('/', methods=["POST"])
def predict():
    # todo
    return 'under construction'