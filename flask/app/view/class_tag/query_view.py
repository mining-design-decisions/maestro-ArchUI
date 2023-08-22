from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.controller.class_tag import query_view as contr
from app.data.class_tag import query_view as data
from app.data.ml import models as m_data

from app.data import common

import json

bp = Blueprint('classify', __name__, url_prefix="/classify")

@bp.route('/', methods=["GET"])
def viewall():
    failed_models = contr.pop_failed_models()
    query_names = data.get_query_names()
    return render_template("classify/viewall.html", queries=query_names, failed_models=failed_models)



@bp.route('/view/<query>/<page>', methods=["GET"])
def view(query, page):
    pageLimit = request.args.get('page_limit', default=common.get_cache('page_limit', 10), type=int)
    sort = request.args.get('sort', default=None)
    sort_asc = request.args.get('sort_asc', default='true')
    sort_asc = sort_asc == 'true'
    search_issue_id = request.args.get('search', default=None)

    issue_data, manual, headers, id_to_name, thisuser, totalPages, man_tags, issue_text, websocket = contr.view_query_data(query, page, pageLimit, sort, sort_asc, search_issue_id)

    return render_template('classify/view.html', issue_data=issue_data, manual=manual, headers=headers, id_to_name=id_to_name, thisuser=thisuser, totalPages=totalPages, pageLimit=pageLimit, thisPage=int(page), query=query, sort=sort, sort_asc=sort_asc, man_tags=man_tags, issue_text=issue_text, websocket=websocket, search_issue_id=search_issue_id)

@bp.route('/create', methods=["GET"])
def viewform():
    # todo add in list of tags as dropdown?
    models = m_data.get_model_ids_names()
    return render_template("classify/form.html", models=models)

@bp.route('/create', methods=["POST"])
def create():
    contr.create_query(request.form)
    return redirect(url_for('classify.viewall'))

@bp.route('get_model_versions/<model_id>', methods=['GET'])
def get_model_versions(model_id):
    return json.dumps(m_data.get_model_versions_by_id(model_id))
