from flask import render_template
from flask import Blueprint
from flask import request

from app.services import search_api, dbapi

bp = Blueprint('search', __name__, url_prefix="/search")

@bp.route('/', methods=["GET"])
def view():
    return render_template('search/view.html')

@bp.route('/search', methods=["POST"])
def search():
    return search_api.search(request.json)

@bp.route('/index', methods=["POST"])
def index():
    return 'todo'

@bp.route('/issue/<issue_id>', methods=["GET"])
def view_issue(issue_id):
    data = dbapi.get_single_issue_data(issue_id)
    labels = []
    unclassified = False
    for label in ['existence', 'executive', 'property']:
        if data['manual_label'][label] is None:
            unclassified = True
            break
        if data['manual_label'][label]:
            labels.append(label.title())
    if unclassified:
        labels=["Not Manually Classified"]
    if len(labels) == 0:
        labels=["Non-Architectural"]
    return render_template('search/view_issue.html', data=data, labels=labels)