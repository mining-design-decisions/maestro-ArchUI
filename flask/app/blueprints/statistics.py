from flask import render_template_string
from flask import Blueprint

bp = Blueprint('statistics', __name__, url_prefix="/statistics")

@bp.route('/', methods=["GET"])
def view():
    # todo
    return 'under construction'