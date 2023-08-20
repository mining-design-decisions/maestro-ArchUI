from flask import render_template
from flask import Blueprint
from flask import request

from app.data import search as data
from app.controller import search as contr

bp = Blueprint('search', __name__, url_prefix="/search")

@bp.route('/', methods=["GET"])
def view():
    return render_template('search/view.html')

@bp.route('/search', methods=["POST"])
def search():
    print(request.json)
    return data.get_search_data(request.json)

@bp.route('/issue/<issue_id>', methods=["GET"])
def view_issue(issue_id):
    data, labels = contr.get_issue_data_label(issue_id)
    return render_template('search/view_issue.html', data=data, labels=labels)