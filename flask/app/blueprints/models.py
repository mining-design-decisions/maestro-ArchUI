from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import data
from app.services import modelconfig
from app.services import dbapi

bp = Blueprint('models', __name__, url_prefix="/models")

inmode_per_classifier = {
    "FullyConnectedModel": ["Doc2Vec","BOWFrequency","BOWNormalized","TfidfGenerator","Metadata","OntologyFeatures"],
    "LinearConv1Model": ["Word2Vec"],
    "LinearRNNModel": ["Word2Vec"],
    "Bert": ["Bert"]
}

@bp.route('/', methods=["GET"])
def viewall():
    models = dbapi.get_model_ids_names()
    return render_template("models/viewall.html", models=models)

@bp.route('/create', methods=["GET"])
def viewform():
    field_configs = data.get_field_configs()
    embeds_raw = dbapi.get_embeddings()
    embeds_dic = {}
    for e in embeds_raw:
        e_type = e['config']['generator']
        if e_type not in embeds_dic:
            embeds_dic[e_type] = []
        embeds_dic[e_type].append({
            'name': e['name'],
            'id': e['embedding_id']
        })

    return render_template('models/form_create.html',
        defaults={},
        inmode_per_classifier=inmode_per_classifier,
        field_configs=field_configs,
        embeds_dic=embeds_dic)

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
    name = data['model_name']
    config = modelconfig.config_to_display(data['model_config'])
    version_count, latest_version, macro, class_prec, classes = dbapi.get_model_performance(model) 

    return render_template(
        'models/view.html', 
        name=name, 
        model=config, 
        id=model, 
        last_trained=latest_version,
        version_count=version_count,
        macro=macro,
        class_prec=class_prec,
        classes=classes)

@bp.route('/train/<model>', methods=["POST"])
def train(model):
    return dbapi.train_model(model)

@bp.route('/edit/<model>', methods=["GET"])
def editform(model):
    field_configs = data.get_field_configs()

    model_data = dbapi.get_model_data(model)
    name = model_data["model_name"]
    model_defaults = modelconfig.config_to_form(model_data['model_config'])
    model_defaults["gen_model_name"] = name
    print(model_defaults)

    return render_template('models/form_edit.html',
        id=model,
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

@bp.route('/delete/<model>', methods=["DELETE"])
def delete(model):
    return dbapi.delete_model(model)