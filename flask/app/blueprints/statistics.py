from flask import render_template
from flask import Blueprint

bp = Blueprint('statistics', __name__, url_prefix="/statistics")

@bp.route('/', methods=["GET"])
def view():
    # todo
    return render_template('statistics/view.html')