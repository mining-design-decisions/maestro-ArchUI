import requests
import json

from bson.objectid import ObjectId

from app.data import login, common
from app.data.ml import ontologies as o_data

inmode_per_classifier = {
    "FullyConnectedModel": ["Doc2Vec","BOWFrequency","BOWNormalized","TfidfGenerator","Metadata","OntologyFeatures"],
    "LinearConv1Model": ["Word2Vec"],
    "LinearRNNModel": ["Word2Vec"],
    "Bert": ["Bert"]
}

def get_model_ids_names():
    # todo adequate error reporting in case of no models?
    try:
        model_ids = requests.get(f"{login.get_db()}/models", verify=False)
        return model_ids.json()['models']
    except:
        return {}
    
def get_field_configs():
    with open('app/cache/field_configs.json', 'r') as f:
        data = json.load(f)
        
    ontologies = [x['file_id'] for x in o_data.get_ontologies()]
    data['train_ontology_classes']['options'] = ontologies
    return data

# returns false if failed to create (due to no auth)
# returns new model ID if succeeded
def create_model_config(config, name):
    # todo auth error reporting
    if not login.is_logged_in():
        return False
    
    postbody = {
        "model_config": config,
        "model_name": name
    }

    x = requests.post(f"{login.get_db()}/models", json=postbody, headers=common._auth_header(), verify=False)

    if x.status_code != 200 or 'model_id' not in x.json():
        print(x.json())

    return x.json()['model_id']

def get_model_data(id):
    # todo error handling
    data = requests.get(f"{login.get_db()}/models/{id}", verify=False)
    return data.json()

def get_model_performance(model_id):
    # todo error handling & reporting
    performances = requests.get(f"{login.get_db()}/models/{model_id}/performances", verify=False).json()["performances"]
    latest_performance = None
    macro = None
    classes = None
    classes_names = None
    if len(performances) > 0:
        # get newest
        ids = [x['performance_id'] for x in performances]
        latest_performance = ids[0]
        for i in range(1, len(ids)):
            id = ids[i]
            if ObjectId(id).generation_time > ObjectId(latest_performance).generation_time:
                latest_performance = id

        metrics = requests.post(f"{login.get_cli()}/metrics", verify=False, json={
            "auth": common._auth_body(),
            "config": {
                "model-id": model_id,
                "database-url": login.get_db(),
                "epoch": "last",
                "version-id": latest_performance,
                "include-non-arch": True,
                "metrics": [
                    {
                        "dataset": "testing",
                        "metric": "f_1_score",
                        "variant": "macro"
                    },
                    {
                        "dataset": "validation",
                        "metric": "f_1_score",
                        "variant": "macro"
                    },
                    {
                        "dataset": "training",
                        "metric": "f_1_score",
                        "variant": "macro"
                    },
                    {
                        "dataset": "testing",
                        "metric": "precision",
                        "variant": "macro"
                    },
                    {
                        "dataset": "validation",
                        "metric": "precision",
                        "variant": "macro"
                    },
                    {
                        "dataset": "training",
                        "metric": "precision",
                        "variant": "macro"
                    },
                    {
                        "dataset": "testing",
                        "metric": "recall",
                        "variant": "macro"
                    },
                    {
                        "dataset": "validation",
                        "metric": "recall",
                        "variant": "macro"
                    },
                    {
                        "dataset": "training",
                        "metric": "recall",
                        "variant": "macro"
                    },
                    {
                        "dataset": "testing",
                        "metric": "f_1_score",
                        "variant": "class"
                    },
                    {
                        "dataset": "validation",
                        "metric": "f_1_score",
                        "variant": "class"
                    },
                    {
                        "dataset": "training",
                        "metric": "f_1_score",
                        "variant": "class"
                    },
                    {
                        "dataset": "testing",
                        "metric": "precision",
                        "variant": "class"
                    },
                    {
                        "dataset": "validation",
                        "metric": "precision",
                        "variant": "class"
                    },
                    {
                        "dataset": "training",
                        "metric": "precision",
                        "variant": "class"
                    },
                    {
                        "dataset": "testing",
                        "metric": "recall",
                        "variant": "class"
                    },
                    {
                        "dataset": "validation",
                        "metric": "recall",
                        "variant": "class"
                    },
                    {
                        "dataset": "training",
                        "metric": "recall",
                        "variant": "class"
                    }
                ]
            }
        }).json()

        try:
            metrics = metrics['folds'][0][0]
        except:
            print(metrics)

        macro = {
            "training": {
                "f1": metrics['training']['f_1_score[macro]'],
                "precision": metrics['training']['precision[macro]'],
                "recall": metrics['training']['recall[macro]']
            },
            "validation": {
                "f1": metrics['validation']['f_1_score[macro]'],
                "precision": metrics['validation']['precision[macro]'],
                "recall": metrics['validation']['recall[macro]']
            },
            "testing": {
                "f1": metrics['testing']['f_1_score[macro]'],
                "precision": metrics['testing']['precision[macro]'],
                "recall": metrics['testing']['recall[macro]']
            }
        }

        classes_names = list(metrics['training']['f_1_score[class]'].keys())

        classes = {}
        for cname in classes_names:
            classes[cname] = {
            "training": {
                "f1": metrics['training']['f_1_score[class]'][cname],
                "precision": metrics['training']['precision[class]'][cname],
                "recall": metrics['training']['recall[class]'][cname]
            },
            "validation": {
                "f1": metrics['validation']['f_1_score[class]'][cname],
                "precision": metrics['validation']['precision[class]'][cname],
                "recall": metrics['validation']['recall[class]'][cname]
            },
            "testing": {
                "f1": metrics['testing']['f_1_score[class]'][cname],
                "precision": metrics['testing']['precision[class]'][cname],
                "recall": metrics['testing']['recall[class]'][cname]
            }
        }

    return (len(performances), ObjectId(latest_performance).generation_time if latest_performance else "Never", macro, classes, classes_names)

def train_model(id):
    # todo auth error handling & reporting
    config = {}
    config['model-id'] = id
    config['database-url'] = login.get_db()
    postbody = {
        "auth": common._auth_body(),
        "config": config
    }

    print(postbody)

    x = requests.post(f"{login.get_cli()}/train", json=postbody, verify=False)
    try:
        data = x.json()
        if data is None:
            data = {"msg": "empty response"}
    except:
        data = {'msg': "Error retrieving response data"}
    return data, x.status_code

def edit_model(id, name, config):
    # todo auth error reporting & handling
    requests.post(f"{login.get_db()}/models/{id}", headers=common._auth_header(), verify=False, json={"model_name": name, "model_config": config})

@login.auth_req
def delete_model(model):
    return requests.delete(f"{login.get_db()}/models/{model}", verify=False, headers=common._auth_header())