import json
import os
from os import path
import sys

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

def train_and_run(model_name):

    # step 1: train
    print(f"Training {model_name}...")

    with open(f'app/models/{model_name}.json', 'r') as f:
        model_params = json.load(f)

    additional_params = {
        "file": "app/data/training.json", # todo load from db
        "force-regenerate-data": True,
        "store-model": True,
        "target-model-path": f"app/data/models/{model_name}"
    }

    args = ['__main__.py', 'run']

    for param in model_params:
        if param != 'classifier':
            args.append('--' + param)
        if type(model_params[param]) != bool:
            args.extend(str(model_params[param]).split())

    for param in additional_params:
        args.append('--' + param)
        if type(additional_params[param]) != bool:
            args.append(str(additional_params[param]))

    import sys
    sys.argv = args

    cli.main()

    # step 2: test
    print(f"Predicting with {model_name}...")

    args = ['__main__.py', 'predict', '--model', 
        f'app/data/models/{model_name}', '--data', 
        'app/data/testing.json']
    sys.argv = args

    cli.main()