from flask import render_template
from flask import Blueprint

from app.services import data

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

@bp.route('/view/<model>', methods=["GET"])
def view(model):
    # todo
    return "under construction"