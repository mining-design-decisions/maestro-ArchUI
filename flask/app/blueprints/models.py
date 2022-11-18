from flask import render_template
from flask import Blueprint
# from app.ml_link import get_cli_json, get_models_strlist, get_hyper_param_options
import app.ml_link as lib
from flask import request
from flask import redirect
from flask import url_for
import json

bp = Blueprint("models", __name__, url_prefix="/models")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all models
    models = [{
        'name': 'Foo Bar'
    }]

    return render_template("models/viewall.html", models=models)

@bp.route('/create', methods=["GET"])
def createModel():
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
    ]

    args = []
    for arg in run_args:
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

        args.append(arg)

    return render_template("models/create.html", args=args)

@bp.route('/create', methods=["POST"])
def postModel():
    # print(request.form)
    for element in request.form:
        print(f"{element}: {request.form[element]}")

    # todo validity checking
    # - including does this name already exist?

    model_obj = {}
    for element in request.form:
        if element != "modelname":
            model_obj[element] = request.form[element]
    
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