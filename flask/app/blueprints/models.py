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
    models = dbapi.get_model_ids_names()
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

    return render_template('models/form_create.html',
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
    data = dbapi.get_model_data(model)
    name = data['name']
    config = modelconfig.config_to_display(data['config'])
    return render_template('models/view.html', name=name, model=config, id=model, last_trained="Never")

@bp.route('/train/<model>', methods=["POST"])
def train(model):
    # todo
    return "under construction"

@bp.route('/edit/<model>', methods=["GET"])
def editform(model):
    inmode_per_classifier = {
        "FullyConnectedModel": ["Doc2Vec","BOWFrequency","BOWNormalized","TfidfGenerator","Metadata","OntologyFeatures"],
        "LinearConv1Model": ["Word2Vec1D"],
        "LinearRNNModel": ["Word2Vec1D"],
        "Bert": ["Bert"]
    }
    field_configs = data.get_field_configs()

    model_data = dbapi.get_model_data(model)
    name = model_data["name"]
    model_defaults = modelconfig.config_to_form(model_data['config'])
    model_defaults["gen_model_name"] = name
    print(model_defaults)

    return render_template('models/form.html',
        defaults=model_defaults,
        name=name,
        inmode_per_classifier=inmode_per_classifier,
        field_configs=field_configs)

@bp.route('/edit/<model>', methods=["POST"])
def edit(model):
    model_name = request.form.get('gen_model_name', '')
    model_data = modelconfig.raw_to_config(request.form)
    dbapi.edit_model(model, model_name, model_data)
    return redirect(url_for('models.view', model=model))