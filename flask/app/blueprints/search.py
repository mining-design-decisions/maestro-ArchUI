from flask import render_template
from flask import Blueprint
from flask import request

from app.services import search_api

bp = Blueprint('search', __name__, url_prefix="/search")

@bp.route('/', methods=["GET"])
def view():
    return render_template('search/view.html')

@bp.route('/search', methods=["POST"])
def search():
    
    return search_api.search(request.json)

@bp.route('/index', methods=["POST"])
def index():
    return 'todo'