import requests
from flask import session
import json

def get_db():
    return session.get("db_url", 'https://localhost:8000')
def set_db(new_url):
    session["db_url"] = new_url

def get_cli():
    return session.get("cli_url", 'https://localhost:9011')
def set_cli(new_url):
    session["cli_url"] = new_url

# todo what's with the verify=false that's required?
def _auth_header():
    return {"Authorization": f"bearer {session['token']}"}

# auth
def login(un: str, pw: str):
    x = requests.post(f"{get_db()}/token", files={
        "username": (None, un), 
        "password": (None, pw)
    }, verify=False)

    if x.status_code == 200:
        session['un'] = un
        session['token'] = x.json()['access_token']
        return True
    else:
        return False

def logout():
    session.pop('un', None)
    session.pop('token', None)

def is_logged_in():
    return ('un' in session) and (session['un'] is not None)

def get_username():
    return session['un']

# models

# returns false if failed to create (due to no auth)
# returns new model ID if succeeded
def create_model_config(config, name):
    if not is_logged_in():
        return False
    postbody = {
        "config": config,
        "name": name
    }

    x = requests.post(f"{get_db()}/models", json=postbody, headers=_auth_header(), verify=False)

    return x.json()['id']

def get_model_ids_names():
    try:
        model_ids = requests.get(f"{get_db()}/models", verify=False)
        return model_ids.json()['models']
    except:
        return {}

def get_model_data(id):
    data = requests.get(f"{get_db()}/models/{id}", verify=False)
    return data.json()

def edit_model(id, name, config):
    x = requests.post(f"{get_db()}/models/{id}", headers=_auth_header(), verify=False, json={"name": name, "config": config})

def train_model(id):
    data = requests.get(f"{get_db()}/models/{id}", verify=False)
    config = data.json()['config']
    config['subcommand_name_0'] = 'run'
    config['model-id'] = id
    config['database-url'] = get_db()
    config['num-threads'] = 1
    config['training_data_query'] = "{\"tags\":{\"$eq\":\"has-label\"}}"
    config['test_with_training_data'] = True
    postbody = {
        "auth":{"token": session['token']},
        "config": config
    }

    requests.post(f"{get_cli()}/invoke", json=postbody, verify=False)

def get_model_performance(id):
    performances = requests.get(f"{get_db()}/models/{id}/performances", verify=False).json()["performances"]
    latest_version = "Never"
    latest_performance = None
    if len(performances)>0:
        latest_version = max(performances)
        latest_performance = requests.get(f"{get_db()}/models/{id}/performances/{latest_version}", verify=False).json()[f"{latest_version}"][0]["f-score"][0]

    return (len(performances), latest_version, latest_performance)

def get_proj_query(projects):
    projects = [f"{{\"tags\": {{\"$eq\": \"{project}\"}} }}" for project in projects]
    return f"{{ \"$or\": [ {','.join(projects)} ] }}"

def predict_models_projects(models, projects):
    for model in models:
        # data = requests.get(f"{DB_WRAPPER_URL}/models/{model}", verify=False)
        # config = data.json()['config']
        config = {}
        config['subcommand_name_0'] = 'predict'
        config['model'] = model
        config['version'] = 'most-recent'
        config['data-query'] = get_proj_query(projects)
        config['database-url'] = get_db()
        config['num-threads'] = 1

        postbody = {
            "auth":{"token": session['token']},
            "config": config
        }

        requests.post(f"{get_cli()}/invoke", json=postbody, verify=False)

# queries
# temp
def _query_dir():
    import os
    os.makedirs("app/data/queries", exist_ok=True)

def create_query(models, data_query, name):
    # todo put these in the db eventually?
    modelversions = {}
    for model in models:
        modelversions[model] = requests.get(f"{get_db()}/models/{model}/versions", verify=False).json()["versions"][0]["id"]
    
    _query_dir()
    with open(f'app/data/queries/{name}.json', 'w') as f:
        json.dump({
            "models": modelversions,
            "query": data_query
        }, f)

def get_query_names():
    from os import walk
    results = []
    _query_dir()
    for (dirpath, dirnames, filenames) in walk('app/data/queries'):
        for file in filenames:
            results.append(file[:-5])
    return results

def get_query_data(query_name):
    # things needed for each issue
    # key/link. summary. description.
    # manual labels.
    # and automatic predictions. per model if possible.
    _query_dir()
    with open(f'app/data/queries/{query_name}.json', 'r') as f:
        qdata = json.load(f)
        models = qdata['models']
        query = qdata['query']

    # first: regular issue data!
    # postbody = {"filter": {
    #     "$or": [{"tags": {"$eq": project}} for project in projects]
    # }}
    postbody = {"filter":json.loads(query)}
    x = requests.get(f"{get_db()}/issue-ids", json=postbody, verify=False).json()
    issue_ids = x["ids"]

    issue_data = requests.get(f"{get_db()}/issue-data", json={"ids": issue_ids, "attributes": ["key", "summary", "description", "link"]}, verify=False).json()
    if "data" in issue_data:
        issue_data = issue_data["data"]
    else:
        issue_data = {}

    # next, manual labels.
    # these are more complicated. we need both has-label (in training)
    # and needs-review (in review)

    # first the in-training ones
    labelbody = {
        "filter": {
            "$and": [
                postbody["filter"],
                {"tags": {"$eq": "has-label"}}
            ]
        }
    }
    manual_issue_ids = requests.get(f"{get_db()}/issue-ids", json=labelbody, verify=False).json()["ids"]
    manual_labels_raw = requests.get(f"{get_db()}/manual-labels", json={"ids": manual_issue_ids}, verify=False).json()
    manual_labels = {}


    labels = ["existence", "property", "executive"]
    if "labels" in manual_labels_raw:
        for key in manual_labels_raw['labels']:
            classifications = []
            for label in labels:
                if manual_labels_raw["labels"][key][label]:
                    classifications.append(label.title())
            if len(classifications) == 0:
                classifications.append("Non-Arch.")
            
            manual_labels[key] = ", ".join(classifications)

    # then the in-review ones
    reviewbody = {
        "filter": {
            "$and": [
                postbody["filter"],
                {"tags": {"$eq": "needs-review"}}
            ]
        }
    }
    manual_issue_ids = requests.get(f"{get_db()}/issue-ids", json=reviewbody, verify=False).json()["ids"]
    manual_labels_raw = requests.get(f"{get_db()}/manual-labels", json={"ids": manual_issue_ids}, verify=False).json()

    if "labels" in manual_labels_raw:
        for key in manual_labels_raw['labels']:
            classifications = []
            for label in labels:
                if manual_labels_raw["labels"][key][label]:
                    classifications.append(label.title())
            if len(classifications) == 0:
                classifications.append("Non-Arch.")
            
            # will override
            manual_labels[key] = ", ".join(classifications) + " (In Review)"
    
    
    # finally: predictions!
    predictions = {} # key -> { model -> predictions }
    headers = {} # model -> [header]
    # header format for detection-output:
    """
    "Apache-12639558": {
        "architectural": {
            "prediction": false,
            "probability": 0.0
        }
    }
    """
    # header format for classification3simplified-output:
    """
    "Apache-12639558": {
        "executive": {
            "prediction": false,
            "probability": 0.024279268458485603
        },
        "existence": {
            "prediction": false,
            "probability": 0.07352140545845032
        },
        "non-architectural": {
            "prediction": false,
            "probability": 0.8794219493865967
        },
        "property": {
            "prediction": false,
            "probability": 0.022777432575821877
        }
    }
    """
    for model in models:
        version = models[model]
        pred = requests.get(f"{get_db()}/models/{model}/versions/{version}/predictions", json={"ids": issue_ids}, verify=False).json()
        if "predictions" in pred:
            # add headers
            # first_issue = list(pred["predictions"].keys())[0]
            # print(pred["predictions"])
            # first_issue = pred["predictions"][first_issue]
            first_issue = None
            for prediction in pred["predictions"]:
                if pred["predictions"][prediction]:
                    first_issue = pred["predictions"][prediction]
            if first_issue is None:
                continue
            headers[model] = list(first_issue.keys())
            # add issue predictions
            for key in pred["predictions"]:
                if not key in predictions:
                    predictions[key] = {}
                if pred["predictions"][key]:
                    predictions[key][model] = pred["predictions"][key]
        # don't really care otherwise
    
    
    with open("temp.json", "w") as f:
        json.dump(predictions, f)

    return (issue_data, manual_labels, predictions, headers)

# labels

def mark_review(id):
    requests.post(f"{get_db()}/issues/{id}/mark-review", verify=False, headers=_auth_header())

def mark_training(id):
    requests.post(f"{get_db()}/issues/{id}/finish-review", verify=False, headers=_auth_header())

def set_manual_label(issue, classifications):
    requests.post(f"{get_db()}/manual-labels/{issue}", json=classifications, verify=False, headers=_auth_header())

def get_comments_for(issue):
    try:
        x = requests.get(f"{get_db()}/manual-labels/{issue}/comments", verify=False)
        if "comments" in x:
            return x["comments"]
        return []
    except Exception:
        print("Error fetching comments")
        return []

def add_comment_for(issue, comment):
    requests.post(f"{get_db()}/manual-labels/{issue}/comments", verify=False, headers=_auth_header(), json={"comment": comment})