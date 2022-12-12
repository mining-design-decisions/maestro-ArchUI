import json
import os
from os import path
import sys
from app.util import rec_del_safe

ml_path = path.abspath('../../mining-design-decisions')
sys.path.append(ml_path)

from deep_learning.dl_manager import cli
from deep_learning.dl_manager import feature_generators
from deep_learning.dl_manager import classifiers
from deep_learning.issuedata_extractor.text_cleaner import remove_formatting, fix_punctuation, FormattingHandling


def get_cli_json():
    file_path = path.abspath('../../mining-design-decisions/deep_learning/dl_manager/cli.json')
    with open(file_path, 'r') as f:
        return json.load(f)

def get_cli_json_tooltips():
    tips = {}
    options = get_cli_json()
    run_args = None
    make_features_args = None
    for cmd in options['commands']:
        if cmd['name'] == "run":
            run_args = cmd['args']
        if cmd['name'] == 'make-features':
            make_features_args = cmd['args']

    if run_args is None or make_features_args is None:
        return None

    # append make-features args
    run_args.extend(make_features_args)

    def rem_last_sentence(string):
        return string.split('.')[0] + '.'

    for arg in run_args:
        match arg['name']:
            case 'stacking-meta-classifier':
                arg['help'] = rem_last_sentence(arg['help'])
            case 'classifier':
                arg['help'] = rem_last_sentence(arg['help'])
            case 'input-mode':
                arg['help'] = rem_last_sentence(arg['help'])
            case 'output-mode':
                arg['help'] = rem_last_sentence(arg['help'])
            case 'combination-strategy':
                arg['help'] = rem_last_sentence(arg['help']) + ' Please find the Combination Strategy Help page in the navbar for more information about this section.'
            case 'ensemble-strategy':
                arg['help'] = rem_last_sentence(arg['help']) + ' Please find the Combination Strategy Help page in the navbar for more information about this section.'
            case _:
                pass

        if 'default' in arg:
            arg['help'] += f" Default: {arg['default']}."

        tips[arg['name']] = arg['help']

    return tips

def get_cli_json_bools():
    bools = []
    options = get_cli_json()
    run_args = None
    make_features_args = None
    for cmd in options['commands']:
        if cmd['name'] == "run":
            run_args = cmd['args']
        if cmd['name'] == 'make-features':
            make_features_args = cmd['args']

    if run_args is None or make_features_args is None:
        return None

    # append make-features args
    run_args.extend(make_features_args)

    for arg in run_args:
        if arg['style'] == 'flag':
            bools.append(arg['name'])
    return bools

def get_models_strlist():
    return list(classifiers.models)

def get_hyper_param_options():
    cla = classifiers.models
    results = {}

    for c in cla:
        results[c] = []
        classifier = cla[c]
        for name, param in classifier.get_hyper_parameters().items():
            results[c].append((f'{name} -- '
                               f'[min, max] = [{param.minimum}, {param.maximum}] -- '
                               f'default = {param.default}'))

    return results

def get_hyper_params():
    cla = classifiers.models
    results = {}
    for c in cla:
        results[c] = []
        classifier = cla[c]
        for name, param in classifier.get_hyper_parameters().items():
            results[c].append({
                'name': name,
                'min': param.minimum,
                'max': param.maximum,
                'default': param.default,
                'type': type(param.default).__name__
            })
    return results

def get_input_modes():
    return list(feature_generators.generators)

def get_input_mode_params():
    inmodes = feature_generators.generators
    results = {}
    for inmode in inmodes:
        params = inmodes[inmode].get_parameters()
        results[inmode] = []
        for name, param in params.items():
            results[inmode].append(f'{name} -- {param.description}')
    return results

def get_input_mode_params_raw():
    inmodes = feature_generators.generators
    results = {}
    for inmode in inmodes:
        params = inmodes[inmode].get_parameters()
        results[inmode] = []
        for name, param in params.items():
            results[inmode].append({
                'name': name,
                'desc': param.description,
                'type': param.type
            })
    return results

def get_output_modes():
    result = []
    for key in vars(feature_generators.OutputMode):
        if '_' not in key: # todo this is a small bug that still needs to be solved in the CLI
            result.append(key)
    return result

# deprecated for now - maybe for the ontology edit page later
def get_possible_ontologies():
    result = []
    dir = os.fsencode('../../mining-design-decisions/datasets/ontologies')
    for file in os.listdir(dir):
        filename = os.fsdecode(file)
        if filename.endswith('.txt'):
            result.append(filename[:-4])
    return result

def get_combination_strategies():
    return cli.STRATEGIES


def train_model(model_name):
    # todo: generate the training.json directly from working db

    print(f"Training {model_name}...")

    target_model_path = f"app/data/models/{model_name}"

    rec_del_safe(target_model_path)

    with open(f'app/models/{model_name}.json', 'r') as f:
        model_params = json.load(f)

    additional_params = {
        "file": "app/data/training.json",
        "force-regenerate-data": True,
        "store-model": True,
        "target-model-path": target_model_path
    }

    if 'apply-ontology-classes' in model_params:
        additional_params['ontology-classes'] = 'app/data/ontologies.json'

    args = ['__main__.py', 'run', model_params['classifier']]

    ignore = ['classifier', 'last-trained']

    for param in model_params:
        if param in ignore:
            continue

        args.append('--' + param)

        if param in ['params', 'hyper-params']:
            param_options = []
            for name in model_params[param]:
                param_options.append(f"{name}={model_params[param][name]}")
            args.extend(param_options)
        elif type(model_params[param]) != bool:
            args.extend(str(model_params[param]).split())

    for param in additional_params:
        args.append('--' + param)
        if type(additional_params[param]) != bool:
            args.append(str(additional_params[param]))

    import sys
    sys.argv = args

    cli.main()

    # clean up features
    rec_del_safe('./features')

def predict_with(model_name):
    # step 1: verify that trained exists
    with open(f'app/models/{model_name}.json', 'r') as f:
        model_params = json.load(f)
    if not 'last-trained' in model_params:
        train_model(model_name)

    # step 2: test
    print(f"Predicting with {model_name}...")

    args = ['__main__.py', 'predict', '--model', 
        f'app/data/models/{model_name}', '--data', 
        'app/data/testing.json']

    import sys
    sys.argv = args

    cli.main()
