from flask import render_template
from flask import Blueprint
from flask import request

from app.data import login as l_data
from app.data import search as data
from app.data.ml import models as m_data
from app.controller import search as contr

bp = Blueprint('search', __name__, url_prefix="/search")

@bp.route('/', methods=["GET"])
def view():
    models = m_data.get_model_ids_names()
    return render_template('search/view.html', models=models, db_url=l_data.get_db())

@bp.route('/search', methods=["POST"])
def search():
    resp =  data.get_search_data(request.json)
    return resp

@bp.route('/index', methods=['POST'])
def index():
    resp = data.index_search_data(request.json)
    return resp

@bp.route('/issue/<issue_id>', methods=["GET"])
def view_issue(issue_id):
    data, labels = contr.get_issue_data_label(issue_id)
    return render_template('search/view_issue.html', data=data, labels=labels)

@bp.route('/get_projects_by_repo', methods=['GET'])
def get_projects_by_repo():
    return data.get_projects_by_repo()