from flask import render_template
from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('embeddings', __name__, url_prefix="/embed")

@bp.route('/', methods=["GET"])
def viewall():
    embeddings = dbapi.get_embeddings()
    return render_template('embeddings/viewall.html', embeddings=embeddings)

@bp.route('/create', methods=["GET"])
def viewform():
    args = dbapi.get_args_wordembed()
    if args is None:
        return render_template('embeddings/error.html')
    return render_template('embeddings/form.html', args=args)

@bp.route('/create', methods=["POST"])
def create():
    return 'todo'

@bp.route('/view/<embedding>', methods=["GET"])
def view(embedding):
    e = dbapi.get_embedding(embedding)
    return render_template('embeddings/view.html', e=e)