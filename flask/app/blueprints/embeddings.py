from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

import json

from app.services import dbapi

bp = Blueprint('embeddings', __name__, url_prefix="/embed")

default_q = {
    "$or": [
        {"tags": {"$eq": "Apache-TAJO"}},
        {"tags": {"$eq": "Apache-HDFS"}},
        {"tags": {"$eq": "Apache-HADOOP"}},
        {"tags": {"$eq": "Apache-YARN"}},
        {"tags": {"$eq": "Apache-MAPREDUCE"}},
        {"tags": {"$eq": "Apache-HADOOP"}}
    ]
}

@bp.route('/', methods=["GET"])
def viewall():
    embeddings = dbapi.get_embeddings()
    return render_template('embeddings/viewall.html', embeddings=embeddings)

@bp.route('/create', methods=["GET"])
def viewform():
    args = dbapi.get_args_wordembed()
    if args is None:
        return render_template('embeddings/error.html')
    return render_template('embeddings/form.html', args=args, default_q=json.dumps(default_q))

@bp.route('/create', methods=["POST"])
def create():
    name = request.form.get('name')
    type = request.form.get('type')
    this_config = dbapi.get_args_wordembed()[type]

    training_q = request.form.get('training_q', default=json.dumps(default_q))
    try:
        training_q_json = json.loads(training_q)
    except:
        training_q_json = default_q

    params = {}
    
    for setting in this_config:
        if setting['name'] in request.form and request.form.get(setting['name']):
            match(setting['type']):
                case 'bool':
                    params[setting['name']] = True
                case 'int':
                    params[setting['name']] = int(request.form.get(setting['name']))
                case _:
                    params[setting['name']] = request.form.get(setting['name'])
        elif setting['type'] == 'bool':
            params[setting['name']] = False
        else:
            # not a bool. not present in the form.
            match(setting['type']):
                case 'int':
                    # grab the min.
                    params[setting['name']] = setting['minimum']
                case _:
                    print(f"WARNING: Unhandled Embedding Param {setting['name']} of type {setting['type']}")

    config = {
        "generator": type,
        "training-data-query": training_q_json,
        "params": { f"{type}.0": params}
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