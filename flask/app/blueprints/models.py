from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import data
from app.services import modelconfig
from app.services import dbapi

bp = Blueprint('models', __name__, url_prefix="/models")

@bp.route('/', methods=["GET"])
def viewall():
    # todo
    models = ["model1", "model2", "testmodel"]
    return render_template("models/viewall.html", models=models)

@bp.route('/create', methods=["GET"])
def viewform():
    inmode_per_classifier = {
        "FullyConnectedModel": ["Doc2Vec","BOWFrequency","BOWNormalized","TfidfGenerator","Metadata","OntologyFeatures"],
        "LinearConv1Model": ["Word2Vec1D"],
        "LinearRNNModel": ["Word2Vec1D"],
        "Bert": ["Bert"]
    }
    field_configs = data.get_field_configs()

    return render_template('models/form.html',
        action='create',
        defaults={},
        inmode_per_classifier=inmode_per_classifier,
        field_configs=field_configs)

@bp.route('/create', methods=["POST"])
def create():
    model_name = request.form.get('gen_model_name', '')
    model_data = modelconfig.raw_to_config(request.form)
    result = dbapi.create_model_config(model_data, model_name)
    if not result:
        dbapi.logout()
        return redirect(url_for('login.viewform'))
    return redirect(url_for('models.view', model=result))

@bp.route('/view/<model>', methods=["GET"])
def view(model):
    # todo
    return "under construction - model ID is " + model