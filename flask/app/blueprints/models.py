from flask import render_template
from flask import Blueprint

bp = Blueprint('models', __name__, url_prefix="/models")

@bp.route('/', methods=["GET"])
def viewall():
    # todo
    
    return 'under construction'