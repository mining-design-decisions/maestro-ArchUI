from flask import render_template
from flask import Blueprint

bp = Blueprint('classify', __name__, url_prefix="/classify")

@bp.route('/', methods=["GET"])
def viewall():
    # todo
    query_names = ["query1", "query2"]
    return render_template("classify/viewall.html", queries=query_names)

@bp.route('/view/<query>', methods=["GET"])
def view(query):
    # todo
    return render_template("classify/view.html") # todo

@bp.route('/create', methods=["GET"])
def viewform():
    # todo
    models = ["testmodel", "model1", "model2"]
    projects = ["testproj", "test", "proj"]
    return render_template("classify/form.html", models=models, projects=projects)

@bp.route('/create', methods=["POST"])
def create():
    # todo
    return 'under construction'