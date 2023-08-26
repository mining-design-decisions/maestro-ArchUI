from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.data.ml import models as m_data
from app.data.class_tag import query_view as q_data
from app.data.ml import predict as p_data

bp = Blueprint('predict', __name__, url_prefix="/predict")

@bp.route('/', methods=["GET"])
def viewform():
    models = m_data.get_model_ids_names()
    return render_template("predict/form.html", models=models)

@bp.route('/', methods=["POST"])
def predict():
    models = [request.form.get(x) for x in request.form if x.startswith('model_')]
    projects = [request.form.get(x) for x in request.form if x.startswith('target_project_')]
    versions = [request.form.get(x) for x in request.form if x.startswith('modelversion')]
    p_data.predict_models_projects(models, projects)
    if request.form.get('predict_generate_query', False):
        q_name = request.form.get('query_name')
        q_data.create_query(models, versions, q_data.get_p_query(projects), q_name)
        return redirect(url_for('classify.view', query=q_name, page=1))
    return 'ok'