from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('embeddings', __name__, url_prefix="/embed")

@bp.route('/', methods=["GET"])
def viewall():
    embeddings = dbapi.get_embeddings()
    return render_template('embeddings/viewall.html', embeddings=embeddings)

@bp.route('/create', methods=["GET"])
def viewform():
    args = dbapi.get_args_wordembed()
    default_q = {
        "$or": [
            {"tags": {"$eq": "TAJO"}},
            {"tags": {"$eq": "HDFS"}},
            {"tags": {"$eq": "HADOOP"}},
            {"tags": {"$eq": "YARN"}},
            {"tags": {"$eq": "MAPREDUCE"}},
            {"tags": {"$eq": "HADOOP"}}
        ]
    }
    if args is None:
        return render_template('embeddings/error.html')
    return render_template('embeddings/form.html', args=args, default_q=str(default_q))

@bp.route('/create', methods=["POST"])
def create():
    name = request.form.get('name')
    type = request.form.get('type')
    this_config = dbapi.get_args_wordembed()[type]

    params = {}
    
    for setting in this_config:
        if setting['name'] in request.form:
            params[setting['name']] = request.form.get(setting['name'])
        elif not setting['has-default']: # html forms don't give you values that didn't get filled in
            match(setting['type']):
                case 'bool':
                    params[setting['name']] = False
                case 'int':
                    params[setting['name']] = None
                case 'str':
                    params[setting['name']] = ''
                case _:
                    print(f"WARNING: Unhandled Case in Embedding create: arg was of type {setting['type']}")

        pass

    config = {
        "generator": type,
        "training_data_query": {
            "$or": [
                {"tags": {"$eq": "TAJO"}},
                {"tags": {"$eq": "HDFS"}},
                {"tags": {"$eq": "HADOOP"}},
                {"tags": {"$eq": "YARN"}},
                {"tags": {"$eq": "MAPREDUCE"}},
                {"tags": {"$eq": "HADOOP"}}
            ]
        },
        "params": params
    }

    data, status = dbapi.save_embedding(name, config)
    if status != 200:
        return render_template('embeddings/error.html')
    return redirect(url_for('embeddings.view', embedding=data['embedding_id']))

@bp.route('/view/<embedding>', methods=["GET"])
def view(embedding):
    e = dbapi.get_embedding(embedding)
    return render_template('embeddings/view.html', e=e)

@bp.route('/delete/<embedding>', methods=["DELETE"])
def delete(embedding):
    return dbapi.delete_embedding(embedding)

@bp.route('/train/<embedding>', methods=["POST"])
def train(embedding):
    return dbapi.train_embedding(embedding)