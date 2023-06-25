from flask import render_template
from flask import Blueprint
from flask import request

bp = Blueprint('search', __name__, url_prefix="/search")

@bp.route('/', methods=["GET"])
def view():
    return render_template('search/view.html')

@bp.route('/search', methods=["GET"])
def search():
    
    return 'todo'

@bp.route('/index', methods=["POST"])
def index():
    return 'todo'