from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('ontologies',  __name__, url_prefix="/ontologies")

@bp.route('/', methods=["GET"])
def viewall():
    ontologies = dbapi.get_ontologies()
    return render_template('ontologies/viewall.html', ontologies=ontologies)

@bp.route('/create', methods=["GET"])
def viewform():
    return render_template('ontologies/form.html')

@bp.route('/create', methods=["POST"])
def create():
    import json
    file_binary = json.dumps(json.load(request.files['file'])).encode('utf8')
    data, status = dbapi.upload_ontology(request.form.get('desc'), file_binary)
    if status == 200:
        return redirect(url_for('ontologies.view', ontology=data['file_id']))
    else:
        return 'error occurred'

@bp.route('/view/<ontology>', methods=["GET"])
def view(ontology):
    data = dbapi.get_file(ontology)
    return render_template('ontologies/view.html', data=data)

@bp.route('/delete/<ontology>', methods=["DELETE"])
def delete(ontology):
    return dbapi.delete_ontology(ontology)