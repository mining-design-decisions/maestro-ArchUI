import psycopg2 # todo
import os
import json
import datetime


models_path = 'app/models'
runs_path = 'app/data/runs'

# -- models
def get_model_config(name: str):
    if not os.path.exists(models_path):
        return False
    models = os.listdir(models_path)
    if name+'.json' not in models:
        return False
        
    with open(f'{models_path}/{name}.json', 'r') as f:
        return json.load(f)

def get_all_model_config_names():
    models = []
    if not os.path.exists(models_path):
        return models
    for file in os.listdir(models_path):
        if file.endswith('.json'):
            modelname = file[:-5]
            models.append(modelname)
    return models

def mark_model_trained(name: str, performance: float):
    with open(f'{models_path}/{name}.json', 'r') as f:
        model_obj = json.load(f)
    model_obj['last-trained'] = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    model_obj['performance'] = performance
    with open(f'{models_path}/{name}.json', 'w') as f:
        json.dump(model_obj, f, indent=4)

def save_model_config(name: str, data):
    if not os.path.exists(models_path):
        os.mkdir()
    with open(f'{models_path}/{name}.json', 'w') as f:
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
    if not os.path.exists(runs_path):
        os.mkdir(runs_path)
    with open(f'{runs_path}/{run_name}.json', 'w') as f:
        json.dump(data, f, indent=4)

def get_all_run_names():
    if not os.path.exists(runs_path):
        os.mkdir(runs_path)
        return []
    runs = [x[:-5] for x in os.listdir(runs_path)]
    return runs

def get_run_data(run_name: str):
    with open(f'{runs_path}/{run_name}.json', 'r') as f:
        issues = json.load(f)
    return issues



# -- labels
def get_known_labels():
    with open('app/data/training_labels.json', 'r') as f:
        labels = json.load(f)
    return labels

def set_label(issue_key: str, labels): # labels is arr of str, empty if nonarch
    label_obj = {
        "key": issue_key,
        "is-design": str(len(labels)>0),
        "is-cat1": {
            "name": "Existence",
            "value": str("existence" in labels)
        },
        "is-cat2": {
            "name": "Executive",
            "value": str("executive" in labels)
        },
        "is-cat3": {
            "name": "Property",
            "value": str("property" in labels)
        }
    }
    label_data = get_known_labels()
    for i in range(len(label_data)):
        this_label = label_data[i]
        if this_label['key'] == issue_key:
            del label_data[i]
            break
    label_data.append(label_obj)
    with open('app/data/training_labels.json', 'w') as f:
        json.dump(label_data, f, indent=4)

# todo going to be deprecated soon
def get_amt_in_training():
    with open('app/data/training.json') as f:
        amt_data = len(json.load(f))
    return amt_data

# todo going to be deprecated soon
def save_training_data(new_training_data):
    with open('app/data/training.json', 'w') as f:
        json.dump(new_training_data, f, indent=4)


# other
def get_field_configs():
    with open('app/data/field_configs.json', 'r') as f:
        data = json.load(f)
    return data