from flask import render_template_string
from flask import Blueprint

bp = Blueprint('predict', __name__, url_prefix="/predict")

@bp.route('/', methods=["GET"])
def viewform():
    # todo
    return 'under construction'