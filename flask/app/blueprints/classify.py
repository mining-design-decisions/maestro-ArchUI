from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('classify', __name__, url_prefix="/classify")

@bp.route('/', methods=["GET"])
def viewall():
    failed_models = dbapi.get_cache('failed_models', [])
    dbapi.set_cache('failed_models', [])
    print(failed_models)
    query_names = dbapi.get_query_names()
    return render_template("classify/viewall.html", queries=query_names, failed_models=failed_models)

def fixtext_html(str):
    return str.strip().replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br />')

@bp.route('/view/<query>/<page>', methods=["GET"])
def view(query, page):
    pageLimit = request.args.get('page_limit', default=dbapi.get_cache('page_limit', 10), type=int)
    dbapi.set_cache('page_limit', pageLimit)
    sort = request.args.get('sort', default=None)
    sort_asc = request.args.get('sort_asc', default='true')
    sort_asc = sort_asc == 'true'
    issue_data, manual, headers, totalPages, models = dbapi.get_paginated_data(query, page, pageLimit, sort, sort_asc)
    man_tags = dbapi.get_manual_tags()

    model_id_names = dbapi.get_model_ids_names()
    model_name_dic = {}
    for m in model_id_names:
        model_name_dic[m['model_id']] = m['model_name']
    id_to_name = {}
    for m_id in models:
        id_to_name[f"{m_id}-{models[m_id]}"] = model_name_dic[m_id]

    thisuser = dbapi.get_username()

    issue_text = {}
    row = 1
    for issue in issue_data:
        issue_text[issue['issue_id']] = {
            'summary': fixtext_html(issue['summary']) if 'summary' in issue and issue['summary'] else 'None', 
            'description': fixtext_html(issue['description']) if 'description' in issue and issue['description'] else 'None',
            'row': (int(page) - 1) * pageLimit + row
            }
        row+=1

    url = dbapi.get_db()
    websocket = f"wss{url[url.find('://'):]}/ws"

    return render_template('classify/view.html', issue_data=issue_data, manual=manual, headers=headers, id_to_name=id_to_name, thisuser=thisuser, totalPages=totalPages, pageLimit=pageLimit, thisPage=int(page), query=query, sort=sort, sort_asc=sort_asc, man_tags=man_tags, issue_text=issue_text, websocket=websocket)
    

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
    failed_models = dbapi.create_query(models, data_q, q_name)
    print(failed_models)
    dbapi.set_cache('failed_models', failed_models)
    return redirect(url_for('classify.viewall'))

@bp.route('/label/<issue>')
def manual_label(issue):
    # manual label, multiple label, comment discussion
    # todo
    return "under construction"