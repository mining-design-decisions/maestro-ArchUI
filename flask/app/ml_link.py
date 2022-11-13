import json
from os import path
import sys

ml_path = path.abspath('../../mining-design-decisions/deep_learning')
sys.path.append(ml_path)

from dl_manager import cli

def test():
    cli.show_combination_strategies()

def get_cli_json():
    file_path = path.abspath('../../mining-design-decisions/deep_learning/dl_manager/cli.json')
    with open(file_path, 'r') as f:
        return json.load(f)