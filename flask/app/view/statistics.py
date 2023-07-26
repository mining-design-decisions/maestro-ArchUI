from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.data import statistics as data
from app.controller import statistics as contr

bp = Blueprint('statistics', __name__, url_prefix="/statistics")

@bp.route('/', methods=["GET"])
def viewall():
    statistics = data.get_all_stats()
    return render_template('statistics/viewall.html', stats=statistics)

@bp.route('/view/<statistics>', methods=["GET"])
def view(statistics):
    stats = data.get_stat_collection(statistics)
    # format for these: {
    #   "timestamp": "...",
    #   "name": "...",
    #   "graphs": [
    #       {
    #           "file_id": "...",
    #           "label": "..."
    #       }
    #   ]
    # }
    graphs = data.get_stat_graphs(stats['graphs'])

    # [{location, label}]
    return render_template('statistics/view.html', data=stats, figs=graphs)

@bp.route('/create', methods=["GET"])
def viewform():
    return render_template("statistics/form.html")

@bp.route('/create', methods=["POST"])
def create():
    split_nonarch = request.form.get('split_nonarch') == 'on'
    include_format = request.form.get('include_format') == 'on'
    show_outliers = request.form.get('show_outliers') == 'on'
    domains = request.form.getlist('domains')
    labeling = request.form.get('labeling')
    name = request.form.get('name')

    s_id = contr.generate_statistics(labeling, domains, split_nonarch, include_format, show_outliers, name)

    return redirect(url_for('statistics.view', statistics=s_id))