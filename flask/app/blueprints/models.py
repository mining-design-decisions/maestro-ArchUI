from flask import render_template
from flask import Blueprint
# from app.ml_link import get_cli_json, get_models_strlist, get_hyper_param_options
import app.ml_link as lib
from flask import request
from flask import redirect
from flask import url_for
import json
import os

from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, IntegerField, DecimalField, BooleanField
from wtforms.validators import DataRequired, NumberRange

tooltips = lib.get_cli_json_tooltips()

class CreateModelForm(FlaskForm):
    # todo put tooltips back

    # no tab - general?
    model_name_field = StringField('Model Name', validators=[DataRequired()], description='Name by which to identify this model configuration.')
    output_mode_field = SelectField('Output-Mode', validators=[DataRequired()], description=tooltips['output-mode'], choices=lib.get_output_modes())

    # tab: preprocessing
    input_mode_field = SelectField('Input-Mode', validators=[DataRequired()], description=tooltips['input-mode'], choices=lib.get_input_modes())
    params_field = StringField('Params') # todo generate table input-mode-specific
    apply_ontology_classes_field = BooleanField('Apply-Ontology-Classes', description=tooltips['apply-ontology-classes'])
    # todo: other preprocessor things that are currently hardcoded in jira_link
    # todo (stretch goal): target language (current is configured for java)

    # tab: classifier
    classifier_field = SelectField('Classifier', validators=[DataRequired()], description=tooltips['classifier'], id='classifier_select', choices=lib.get_models_strlist())
    # hyper_params_field = StringField('Hyper-Params') # todo generate table input-mode-specific
    # hyper_params_field = FieldList(FormField(HyperParameterForm), min_entries=2, max_entries=18)
    # todo look into above

    # tab: training
    epochs_field = IntegerField('Epochs', validators=[DataRequired(), NumberRange(min=1)], description=tooltips['epochs'], default=1000)
    split_size_field = DecimalField('Split-Size', validators=[NumberRange(min=0.01, max=0.5)], description=tooltips['split-size'])
    max_train_field = IntegerField('Max-Train', validators=[NumberRange(min=-1)], description=tooltips['max-train'])
    quick_cross_field = BooleanField('Quick Cross', description=tooltips['quick-cross'])
    # cross_project_field = BooleanField('Cross-Project')
    project_mode_field = SelectField('Project Mode', choices=['Default','Cross-Project', 'Test-Project'], description='Run cross project validation, use a specific project as test set, or neither.')
    test_project_field = StringField('Test-Project', description=tooltips['test-project'])

    architectural_only_field = BooleanField('Architectural-Only', description=tooltips['architectural-only'])
    class_balancer_field = StringField('Class-Balancer', description=tooltips['class-balancer'])
    batch_size_field = IntegerField('Batch-Size', validators=[NumberRange(min=1)], description=tooltips['batch-size'])
    use_early_stopping_field = BooleanField('Use-Early-Stopping', description=tooltips['use-early-stopping'])
    early_stopping_patience_field = IntegerField('Early-Stopping-Patience', validators=[NumberRange(min=1)], description=tooltips['early-stopping-patience'])
    early_stopping_min_delta_field = DecimalField('Early-Stopping-Min-Delta', validators=[NumberRange(min=0.001)], description=tooltips['early-stopping-min-delta'])
    early_stopping_attribute_field = StringField('Early-Stopping-Attribute', description=tooltips['early-stopping-attribute']) # todo possible values? selectfield?

    # tab: ensemble
    combination_strategy_field = SelectField('Combination-Strategy', choices = [''] + [], description=tooltips['combination-strategy']) # todo
    ensemble_strategy_field = SelectField('Ensemble-Strategy', choices = [''] + [], description=tooltips['ensemble-strategy']) # todo
    stacking_meta_classifier_field = SelectField('Stacking-Meta-Classifier', choices = [''] + lib.get_models_strlist(), description=tooltips['stacking-meta-classifier'])
    stacking_meta_classifier_hyper_params_field = StringField('Stacking-Meta-Classifier-Hyper-Parameters', description=tooltips['stacking-meta-classifier-hyper-parameters']) # todo see other hyper param field
    stacking_use_concat_field = BooleanField('Stacking-Use-Concat', description=tooltips['stacking-use-concat'])
    stacking_no_matrix_field = BooleanField('Stacking-No-Matrix', description=tooltips['stacking-no-matrix'])
    boosting_rounds_field = IntegerField('Boosting Rounds', validators=[NumberRange(min=1)], description=tooltips['boosting-rounds'])


bp = Blueprint("models", __name__, url_prefix="/models")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all models
    models = []
    dir = os.fsencode('app/models')
    for file in os.listdir(dir):
        filename = os.fsdecode(file)
        if filename.endswith('.json'):
            modelname = filename[:-5]
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
    
    return render_template('models/view.html', name=model, params=model_obj)

@bp.route('/create', methods=["GET"])
def createModel():
    """
    options = lib.get_cli_json()

    run_args = None
    make_features_args = None
    for cmd in options['commands']:
        if cmd['name'] == "run":
            run_args = cmd['args']
        if cmd['name'] == 'make-features':
            make_features_args = cmd['args']

    if run_args is None or make_features_args is None:
        return render_template('error.html')

    # append make-features args
    run_args.extend(make_features_args)

    to_ignore = [
        'test-study', # no need in this GUI
        'store-model', # will be on by default
        'target-model-path', # will be set JIT
        'file', # will be set JIT
        'peregrine', # not in scope
        'save-trained-generator', # will probably override anyway
        'ontology-classes', # preset. maybe change later to allow editing. for now set JIT
        'force-regenerate-data', # forced on for model saving
    ]

    args = []
    for arg in run_args:
        if arg['style'] == 'positional':
            arg['required'] = True

        if arg['name'] in to_ignore:
            continue

        if arg['name'] in ['stacking-meta-classifier','classifier']:
            arg['type'] = 'enum'
            arg['options'] = lib.get_models_strlist()
            arg['help'] = arg['help'].split('.')[0] + '.'

        if arg['name'] == 'input-mode':
            arg['type'] = 'enum'
            arg['options'] = lib.get_input_modes()
            arg['help'] = arg['help'].split('.')[0] + '.'
        
        if arg['name'] == 'output-mode':
            arg['type'] = 'enum'
            arg['options'] = lib.get_output_modes()
            arg['help'] = arg['help'].split('.')[0] + '.'

        if arg['name'] == 'params':
            arg['help'] += " Please find the Parameter Help page in the navbar to correctly format this section."

        if arg['name'] == 'combination-strategy':
            arg['help'] = arg['help'].split('.')[0] + ". Please find the Combination Strategy Help page in the navbar for more information about this section."

        if 'hyper-param' in arg['name']:
            arg['help'] += ' Please find the Hyper Parameter Help page in the navbar to correctly format this section.'

        if 'default' in arg:
            arg['help'] += f" Default: {arg['default']}."
        else:
            arg['default'] = ''

        if 'required' not in arg:
            arg['required'] = False

        args.append(arg)

    return render_template("models/create.html", args=args)
    """
    
    form = CreateModelForm()
    hyper_params = lib.get_hyper_params()
    inmode_params = lib.get_input_mode_params_raw()
    return render_template('models/create.html', form=form, hyper_params=hyper_params, inmode_params=inmode_params)

@bp.route('/create', methods=["POST"])
def postModel():
    # todo validity checking
    # - including does this name already exist?

    model_obj = {}
    for element in request.form:
        if element != "modelname":
            if request.form[element]:
                model_obj[element] = request.form[element]
                if model_obj[element] == 'on':
                    model_obj[element] = True
    
    # save
    with open(f'app/models/{request.form["modelname"]}.json', 'w') as f:
        json.dump(model_obj, f)

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