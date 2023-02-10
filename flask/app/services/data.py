import psycopg2
import os
import json
import datetime


# -- models
def get_model_config(name: str):
    models = os.listdir('app/models')
    if name+'.json' not in models:
        return False
        
    with open(f'app/models/{name}.json', 'r') as f:
        return json.load(f)

def get_all_model_config_names():
    models = []
    for file in os.listdir('app/models'):
        if file.endswith('.json'):
            modelname = file[:-5]
            models.append(modelname)
    return models

def mark_model_trained(name: str, performance: float):
    with open(f'app/models/{name}.json', 'r') as f:
        model_obj = json.load(f)
    model_obj['last-trained'] = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    model_obj['performance'] = performance
    with open(f'app/models/{name}.json', 'w') as f:
        json.dump(model_obj, f, indent=4)

def save_model_config(name: str, data):
    with open(f'app/models/{name}.json', 'w') as f:
        json.dump(data, f, indent=4)

# -- train/test data/runs
def save_test_data(data):
    with open('app/data/testing.json', 'w') as f:
        json.dump(data, f, indent=4)

def load_test_data():
    with open('app/data/testing.json', 'r') as f:
        issues = json.load(f)
    return issues

def save_run(run_name: str, data):
    with open(f'app/data/runs/{run_name}.json', 'w') as f:
        json.dump(data, f, indent=4)