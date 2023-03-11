from flask import render_template
from flask import Blueprint

bp = Blueprint('query', __name__, url_prefix="/training")

@bp.route('/', methods=["GET"])
def view_all():
    return "under construction"

@bp.route('/<query_name>', methods=["GET"])
def view(query_name):
    return "under construction"

