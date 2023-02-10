import json
import os
from os import path
import sys

from app.services.util import rec_del_safe
from app.services.modelconfig import config_to_cli

ml_path = path.abspath('../../mining-design-decisions')
sys.path.append(ml_path)

from deep_learning.dl_manager import cli
from deep_learning.dl_manager import feature_generators
from deep_learning.dl_manager import classifiers
from deep_learning.issuedata_extractor.text_cleaner import remove_formatting, fix_punctuation, FormattingHandling
from deep_learning.dl_manager.config import conf


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

def _clean_directories():
    rec_del_safe('./features')
    rec_del_safe('./raw_words')

    # root dir files
    for file in os.listdir('.'):
        if os.path.isdir(file):
            continue
        if file not in ['README.md', 'requirements.txt']:
            os.remove(file)

def train_model(model_name):
    # todo: generate the training.json directly from working db

    print(f"Training {model_name}...")

    target_model_path = f"app/data/models/{model_name}"

    # clean up previous iteration if exists
    rec_del_safe(target_model_path)

    # generate the args
    with open(f'app/models/{model_name}.json', 'r') as f:
        model_config = json.load(f)
    args = config_to_cli(model_config, target_model_path)

    # use the CLI
    sys.argv = args
    conf.reset()
    cli.main()

    # grab performance
    with open('most_recent_run.txt', 'r') as f:
        latest_run_filename = f.read()
    with open(latest_run_filename, 'r') as f:
        latest_run_data = json.load(f)[0]
        performance = latest_run_data['f-score'][-1]

    # clean up features
    _clean_directories()

    return performance

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

    """
    match model_params["pre-processing"]["input-mode"].lower():
        case "ontologyfeatures":
            args.append("--ontology-classes")
            args.append("app/data/ontologies.json")
        case "doc2vec":
            args.append("vector-length")
            args.append(model_params["pre-processing"]["params"]["vector-length"])
    """
    
    print(' '.join(args))

    import sys
    sys.argv = args

    conf.reset()
    cli.main()

    with open('predictions.csv', 'r') as f:
        predictions_raw = f.readlines()

    _clean_directories()

    return predictions_raw