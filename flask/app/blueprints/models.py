from flask import render_template
from flask import Blueprint
# from app.ml_link import get_cli_json, get_models_strlist, get_hyper_param_options
import app.ml_link as lib
from flask import request
from flask import redirect
from flask import url_for
import json
import os
import datetime

from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, DecimalField, BooleanField
from wtforms.validators import DataRequired, NumberRange

from app.services.modelconfig import raw_to_config


tooltips = lib.get_cli_json_tooltips()

class CreateModelForm(FlaskForm):

    # tab: general
    model_name_field = StringField('Model Name', validators=[DataRequired()], description='Name by which to identify this model configuration.')
    output_mode_field = SelectField('Output-Mode', validators=[DataRequired()], description=tooltips['output-mode'], choices=lib.get_output_modes())
    model_mode_field = SelectField('Model Mode', validators=[DataRequired()], description='Is this a single model or does it use ensemble learning?', choices=['Single', 'Ensemble'])
    combination_strategies = {
        "Simple Strategies": # combination-strategy
        ["concat","add","subtract","multiply","max","min","dot"],
        "Complex Strategies": # ensemble-strategy
        ["stacking","voting"]
    }
    combination_strategy_field = SelectField('Combination Strategy', choices=combination_strategies, description="Strategy used to combine models. Please find the Combination Strategy Help page in the navbar for more information.")
    
    # tab: preprocessing
    input_mode_field = SelectField('Input-Mode', validators=[DataRequired()], description=tooltips['input-mode'], choices=lib.get_input_modes())
    # todo: other preprocessor things that are currently hardcoded in jira_link
    # todo (stretch goal): target language (current is configured for java)

    # tab: classifier
    classifier_options = lib.get_models_strlist()
    classifier_options.remove('NonlinearConv2Model')
    classifier_options.remove('Bert')
    classifier_field = SelectField('Classifier', validators=[DataRequired()], description=tooltips['classifier'], id='classifier_select', choices=classifier_options)

    # tab: training
    epochs_field = IntegerField('Epochs', validators=[DataRequired(), NumberRange(min=1)], description=tooltips['epochs'], default=1000)
    split_size_field = DecimalField('Split-Size', validators=[NumberRange(min=0.01, max=0.5)], description=tooltips['split-size'])
    max_train_field = IntegerField('Max-Train', validators=[NumberRange(min=-1)], description=tooltips['max-train'])
    project_mode_field = SelectField('Project Mode', choices=['','Cross-Project', 'Test-Project'], description='Run cross project validation, use a specific project as test set, or neither.')
    test_project_field = StringField('Test-Project', description=tooltips['test-project'])
    apply_ontology_classes_field = BooleanField('Apply-Ontology-Classes', description=tooltips['apply-ontology-classes'])
    architectural_only_field = BooleanField('Architectural-Only', description=tooltips['architectural-only'])
    class_balancer_field = SelectField('Class-Balancer', choices=['', 'class-weight', 'upsample'], description=tooltips['class-balancer'])
    batch_size_field = IntegerField('Batch-Size', validators=[NumberRange(min=1)], description=tooltips['batch-size'])
    use_early_stopping_field = BooleanField('Use-Early-Stopping', description=tooltips['use-early-stopping'])
    early_stopping_patience_field = IntegerField('Early-Stopping-Patience', validators=[NumberRange(min=1)], description=tooltips['early-stopping-patience'])
    early_stopping_min_delta_field = DecimalField('Early-Stopping-Min-Delta', validators=[NumberRange(min=0.001)], description=tooltips['early-stopping-min-delta'])
    early_stopping_attribute_field = StringField('Early-Stopping-Attribute', description=tooltips['early-stopping-attribute']) # todo possible values? selectfield?

    # tab: classifiers (ensemble)
    ensemble_classifier_count_field = IntegerField('Amount of Classifiers', validators=[DataRequired()], default=2, description="How many classifiers should there be in this ensemble model?")

    # tab: meta-classifier
    # stacking_meta_classifier_field = SelectField('Stacking-Meta-Classifier', choices=classifier_options, description=tooltips['stacking-meta-classifier'])
    stacking_meta_classifier_field = SelectField('Stacking Meta Classifier', choices=['FullyConnectedModel'], description=tooltips['stacking-meta-classifier'])

bp = Blueprint("models", __name__, url_prefix="/models")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all models
    models = []
    for file in os.listdir('app/models'):
        if file.endswith('.json'):
            modelname = file[:-5]
            models.append(modelname)

    return render_template("models/viewall.html", models=models)

@bp.route('/view/<model>', methods=['GET'])
def view(model):
    # is model name valid?
    models = os.listdir('app/models')
    if model+'.json' not in models:
        return render_template('error.html')
        
    with open(f'app/models/{model}.json', 'r') as f:
        model_obj = json.load(f)

    last_trained = 'Never'
    if 'last-trained' in model_obj:
        last_trained = model_obj['last-trained']
        del model_obj['last-trained'] # don't need to display this

    valid_tabs = [
        'general',
        'pre-processing',
        'classifier',
        'ensemble classifiers',
        'ensemble stacking classifier',
        'training'
    ]
    
    return render_template('models/view.html', tabs=valid_tabs, name=model, model=model_obj, last_trained=last_trained)

@bp.route('/view/<model>', methods=["POST"])
def trainModel(model):
    performance = lib.train_model(model)

    with open(f'app/models/{model}.json', 'r') as f:
        model_obj = json.load(f)
    model_obj['last-trained'] = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    model_obj['performance'] = performance
    with open(f'app/models/{model}.json', 'w') as f:
        json.dump(model_obj, f)

    return redirect(url_for('models.view', model=model))

inmode_per_classifier = {
    "FullyConnectedModel": ["Doc2Vec","BOWFrequency","BOWNormalized","TfidfGenerator","Metadata","OntologyFeatures"],
    "LinearConv1Model": ["Word2Vec1D"],
    "LinearRNNModel": ["Word2Vec1D"],
    "Bert": ["Bert"]
}

@bp.route('/create', methods=["GET"])
def createNewModel():
    form = CreateModelForm()
    hyper_params = lib.get_hyper_params()
    inmode_params = lib.get_input_mode_params_raw()

    return render_template('models/editable_form.html',
        action='create',
        form=form, 
        hyper_params=hyper_params, 
        inmode_params=inmode_params,
        inmode_per_classifier=inmode_per_classifier)

@bp.route('/create', methods=["POST"])
def createModel():
    # todo validity checking
    # - including does this name already exist?
    model_name = request.form.get('model_name_field')
    bools = lib.get_cli_json_bools()
    model_data = raw_to_config(request.form, bools)
    with open(f'app/models/{model_name}.json', 'w') as f:
        json.dump(model_data, f)

    return redirect(url_for('models.viewall'))

@bp.route('/edit/<model>', methods=["GET"])
def editExistingModel(model):
    form = CreateModelForm()
    hyper_params = lib.get_hyper_params()
    inmode_params = lib.get_input_mode_params_raw()

    with open(f'app/models/{model}.json', 'r') as f:
        existing_config = json.load(f)
    
    return render_template('models/editable_form.html',
        action='edit',
        form=form, 
        defaults=existing_config,
        hyper_params=hyper_params, 
        inmode_params=inmode_params,
        inmode_per_classifier=inmode_per_classifier)

@bp.route('/edit', methods=["POST"])
def editModel():
    model_name = request.form.get('model_name_field')
    bools = lib.get_cli_json_bools()
    model_data = raw_to_config(request.form, bools)
    with open(f'app/models/{model_name}.json', 'w') as f:
        json.dump(model_data, f)

    return redirect(url_for('models.viewall'))


@bp.route('/hyperparams', methods=['GET'])
def hyperParamHelp():
    options = lib.get_hyper_param_options()
    return render_template('models/hyperhelp.html', options=options)

@bp.route('/params', methods=['GET'])
def paramHelp():
    options = lib.get_input_mode_params()
    return render_template('models/paramhelp.html', inmodes=options)

@bp.route('/combination-strategies', methods=['GET'])
def comboStrat():
    strats = lib.get_combination_strategies()
    return render_template('models/comboStrats.html', strats=strats)