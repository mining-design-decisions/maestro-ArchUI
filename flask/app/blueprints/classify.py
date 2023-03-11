from flask import render_template_string
from flask import Blueprint

bp = Blueprint('classify', __name__, url_prefix="/classify")

@bp.route('/', methods=["GET"])
def viewall():
    # todo
    return 'under construction'