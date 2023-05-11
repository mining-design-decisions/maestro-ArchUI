from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('predict', __name__, url_prefix="/predict")

@bp.route('/', methods=["GET"])
def viewform():
    # todo add in projects as dropdown
    models = dbapi.get_model_ids_names()
    return render_template("predict/form.html", models=models)

@bp.route('/', methods=["POST"])
def predict():
    models = [request.form.get(x) for x in request.form if x.startswith('model_')]
    projects = [request.form.get(x) for x in request.form if x.startswith('target_project_')]
    dbapi.predict_models_projects(models, projects)
    if request.form.get('predict_generate_query', False):
        q_name = request.form.get('query_name')
        dbapi.create_query(models, projects, q_name)
        return redirect(url_for('classify.view', query=q_name, page=1))
    return 'under construction'