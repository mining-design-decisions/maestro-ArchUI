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

@bp.route('/view/<query>/<page>', methods=["GET"])
def view(query, page):
    pageLimit = request.args.get('page_limit', default=10, type=int)
    sort = request.args.get('sort', default=None)
    sort_asc = request.args.get('sort_asc', default='true')
    sort_asc = sort_asc == 'true'
    issue_data, manual, headers, totalPages, models = dbapi.get_paginated_data(query, page, pageLimit, sort, sort_asc)

    model_id_names = dbapi.get_model_ids_names()
    model_name_dic = {}
    for m in model_id_names:
        model_name_dic[m['model_id']] = m['model_name']
    id_to_name = {}
    for m_id in models:
        id_to_name[f"{m_id}-{models[m_id]}"] = model_name_dic[m_id]

    thisuser = dbapi.get_username()

    return render_template('classify/view.html', issue_data=issue_data, manual=manual, headers=headers, id_to_name=id_to_name, thisuser=thisuser, totalPages=totalPages, pageLimit=pageLimit, thisPage=int(page), query=query, sort=sort, sort_asc=sort_asc)
    

@bp.route('/create', methods=["GET"])
def viewform():
    # todo add in list of tags as dropdown?
    models = dbapi.get_model_ids_names()
    return render_template("classify/form.html", models=models)

@bp.route('/create', methods=["POST"])
def create():
    models = [request.form.get(x) for x in request.form if x.startswith('model_')]
    data_q = ""
    if request.form.get('query_type', False):
        # complex
        projects = [request.form.get(x) for x in request.form if x.startswith('target_project_')]
        data_q = dbapi.get_proj_query(projects)
    else:
        # simple
        data_q = request.form.get("target_tag_query")
        
    q_name = request.form.get('query_name')
    dbapi.create_query(models, data_q, q_name)
    return redirect(url_for('classify.viewall'))

@bp.route('/label/<issue>')
def manual_label(issue):
    # manual label, multiple label, comment discussion
    # todo
    return "under construction"