from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.data.ml import embeddings as data
from app.controller.ml import embeddings as contr

bp = Blueprint('embeddings', __name__, url_prefix="/embed")

@bp.route('/', methods=["GET"])
def viewall():
    embeddings, types = contr.get_embeddings_types()
    return render_template('embeddings/viewall.html', embeddings=embeddings, types=types)

@bp.route('/create', methods=["GET"])
def viewform():
    args, default_q_str = contr.get_form_args()
    if args is None:
        return render_template('embeddings/error.html')
    return render_template('embeddings/form.html', args=args, default_q=default_q_str)

@bp.route('/create', methods=["POST"])
def create():
    data, status = contr.create_config(request.form)
    if status != 200:
        return render_template('embeddings/error.html')
    return redirect(url_for('embeddings.view', embedding=data['embedding_id']))

@bp.route('/view/<embedding>', methods=["GET"])
def view(embedding):
    e = data.get_embedding(embedding)
    return render_template('embeddings/view.html', e=e)

@bp.route('/delete/<embedding>', methods=["DELETE"])
def delete(embedding):
    return data.delete_embedding(embedding)

@bp.route('/train/<embedding>', methods=["POST"])
def train(embedding):
    return data.train_embedding(embedding)