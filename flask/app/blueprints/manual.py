from flask import render_template
from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('manual', __name__, url_prefix="/manual")

@bp.route('/review/<issue>', methods=["POST"])
def mark_review(issue):
    print(f"marking {issue} as review")
    dbapi.mark_review(issue)
    return "ok"

@bp.route("/training/<issue>", methods=["POST"])
def mark_training(issue):
    print(f"marking {issue} as training")
    dbapi.mark_training(issue)
    return "ok"

@bp.route('/classify/<issue>', methods=["POST"])
def classify(issue):
    json = request.json
    dbapi.set_manual_label(issue, json)
    return "ok"