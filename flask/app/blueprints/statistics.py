from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

import datetime

from app.services import dbapi
from app.services import statistics as stat_lib

bp = Blueprint('statistics', __name__, url_prefix="/statistics")

@bp.route('/', methods=["GET"])
def viewall():
    statistics = dbapi.get_all_stats()
    return render_template('statistics/viewall.html', stats=statistics)

@bp.route('/view/<statistics>', methods=["GET"])
def view(statistics):
    stats = dbapi.get_stat_collection(statistics)
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
    graphs = dbapi.get_stat_graphs(stats['graphs'])

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

    figure_paths = stat_lib.plot(labeling, domains, split_nonarch, include_format, show_outliers)

    file_ids = dbapi.post_stat_graphs(figure_paths)
    graphs = [{"file_id": file_id, "label": "temp"} for file_id in file_ids]

    name = request.form.get('name')

    obj = {
        "timestamp": str(datetime.datetime.now()),
        "name": name,
        "graphs": graphs
    }

    s_id = dbapi.post_stat_obj(name, obj)
    print(s_id)

    return redirect(url_for('statistics.view', statistics=s_id))