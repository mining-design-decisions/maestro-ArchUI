from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('classify', __name__, url_prefix="/classify")

@bp.route('/', methods=["GET"])
def viewall():
    query_names = dbapi.get_query_names()
    return render_template("classify/viewall.html", queries=query_names)

@bp.route('/view/<query>', methods=["GET"])
def view(query):
    issue_data, manual, predictions, headers = dbapi.get_query_data(query)
    model_id_names = dbapi.get_model_ids_names()
    id_to_name = {}
    for model in model_id_names:
        id_to_name[model['id']] = model['name']
    return render_template("classify/view.html", issue_data=issue_data, manual=manual, predictions=predictions, id_to_name=id_to_name, headers=headers)

@bp.route('/create', methods=["GET"])
def viewform():
    # todo
    models = dbapi.get_model_ids_names()
    # projects = ["testproj", "test", "proj"]
    return render_template("classify/form.html", models=models)

@bp.route('/create', methods=["POST"])
def create():
    models = [request.form.get(x) for x in request.form if x.startswith('model_')]
    projects = [request.form.get(x) for x in request.form if x.startswith('target_project_')]
    q_name = request.form.get('query_name')
    dbapi.create_query(models, projects, q_name)
    return redirect(url_for('classify.viewall'))

@bp.route('/label/<issue>')
def manual_label(issue):
    return "under construction"