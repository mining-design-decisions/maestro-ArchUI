import requests
from flask import session
import json

def get_db():
    return session.get("db_url", 'https://localhost:8000')
def set_db(new_url):
    session["db_url"] = new_url
    logout()

def get_cli():
    return session.get("cli_url", 'https://localhost:9011')
def set_cli(new_url):
    session["cli_url"] = new_url

# todo what's with the verify=false that's required?
def _auth_header():
    return {"Authorization": f"bearer {session['token']}"}

# decorator for simple authentication-required requests
def auth_req(func):
    def inner(*args, **kwargs):
        if not is_logged_in():
            return {'msg': "Not logged in in UI"}, 401
        
        x = func(*args, **kwargs)

        if x.status_code == 200:
            return {"msg": "ok"}, x.status_code

        try:
            data = x.json()
        except:
            data = {'msg': "Error retrieving response data"}
        return data, x.status_code

    return inner

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
    return session['un'] if 'un' in session else ''

# models

# returns false if failed to create (due to no auth)
# returns new model ID if succeeded
def create_model_config(config, name):
    # todo auth error reporting
    if not is_logged_in():
        return False
    
    postbody = {
        "model_config": config,
        "model_name": name
    }

    x = requests.post(f"{get_db()}/models", json=postbody, headers=_auth_header(), verify=False)

    return x.json()['model_id']

def get_model_ids_names():
    # todo adequate error reporting in case of no models?
    try:
        model_ids = requests.get(f"{get_db()}/models", verify=False)
        return model_ids.json()['models']
    except:
        return {}

def get_model_data(id):
    # todo error handling
    data = requests.get(f"{get_db()}/models/{id}", verify=False)
    return data.json()

def edit_model(id, name, config):
    # todo auth error reporting & handling
    requests.post(f"{get_db()}/models/{id}", headers=_auth_header(), verify=False, json={"model_name": name, "model_config": config})

def train_model(id):
    # todo auth error handling & reporting
    data = get_model_data(id)
    config = data.json()['model_config']
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

# todo metrics 2.0
def get_model_performance(id):
    # todo error handling & reporting
    performances = requests.get(f"{get_db()}/models/{id}/performances", verify=False).json()["performances"]
    latest_version = "Never"
    latest_performance = None
    if len(performances) > 0:
        latest_version = max(performances)
        latest_performance = requests.get(f"{get_db()}/models/{id}/performances/{latest_version}", verify=False).json()[f"{latest_version}"][0]["f-score"][0]

    return (len(performances), latest_version, latest_performance)

def get_proj_query(projects):
    projects = [f"{{\"tags\": {{\"$eq\": \"{project}\"}} }}" for project in projects]
    return f"{{ \"$or\": [ {','.join(projects)} ] }}"

def predict_models_projects(models, projects):
    # todo error handling/reporting
    # continuously open socket status reports?
    for model in models:
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
# todo save the query data in the db eventually?
def _query_dir():
    import os
    os.makedirs("app/data/queries", exist_ok=True)

def create_query(models, data_query, name):
    modelversions = {}
    for model in models:
        modelVersions = requests.get(f"{get_db()}/models/{model}/versions", verify=False).json()["versions"]
        latest = modelVersions[0]
        for i in range(1, len(modelVersions)):
            if modelVersions[i]['time'] > latest['time']:
                latest = modelVersions[i]
        modelversions[model] = latest["version_id"]
    
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

# todo pagination rework
def get_paginated_data(query_name, page, pageLimit, sort, sort_asc):  
    # data to return in order: issue_data, manual_labels, headers, total_pages, model_versions
    with open(f'app/data/queries/{query_name}.json', 'r') as f:
        qdata = json.load(f)
        models = qdata['models']
        query = qdata['query']
    
    model_ids = [f'{m_id}-{models[m_id]}' for m_id in models]

    uibody = {
        "filter": json.loads(query),
        "sort": sort,
        "sort_ascending": sort_asc,
        "models": model_ids,
        "page": int(page),
        "limit": pageLimit
    }

    # get issue data from UI endpoint
    x = requests.get(f'{get_db()}/ui', verify=False, json=uibody)
    try:
        issue_data = x.json()['data']
        total_pages = x.json()['total_pages']
    except:
        print(x.json())

    # parse manual labels (issue id -> str)
    manual_labels = {}
    for issue in issue_data:
        if issue['manual_label']['existence'] is not None:
            labels = []
            for label in issue['manual_label']:
                if issue['manual_label'][label]:
                    labels.append(label.title())

            if len(labels) > 0:
                manual_labels[issue['issue_id']] = ', '.join(labels)
            else:
                manual_labels[issue['issue_id']] = 'Non-Arch.' 

            if 'needs-review' in issue['tags']:
                manual_labels[issue['issue_id']] += ' (In Review)'

    # get headers from model configs
    headers = {} # model_id-version_id -> [headers] 
    output_mode_to_headers = {
        'Classification3': ['existence', 'executive', 'property']
    }
    for m_id in models:
        output_mode = requests.get(f'{get_db()}/models/{m_id}').json()['model_config']['output_mode']
        if output_mode not in output_mode_to_headers:
            print('\nERROR: Unknown Output Mode: ' + output_mode + ". Please complete output_mode_to_headers.\n\n")
        headers[f"{m_id}-{models[m_id]}"] = output_mode_to_headers[output_mode]

    # return results
    return (issue_data, manual_labels, headers, total_pages, models)

def get_query_data(query_name):
    # todo: error handling & reporting. do not let the db fail silently

    # things needed for each issue
    # key/link. summary. description.
    # manual labels.
    # and automatic predictions per model
    # plus various auxiliary data structures that will make displaying easier
    _query_dir()
    with open(f'app/data/queries/{query_name}.json', 'r') as f:
        qdata = json.load(f)
        models = qdata['models']
        query = qdata['query']

    # first: regular issue data!
    postbody = {"filter":json.loads(query)}
    x = requests.get(f"{get_db()}/issue-ids", json=postbody, verify=False).json()
    issue_ids = x["issue_ids"]

    issue_data = requests.get(f"{get_db()}/issue-data", json={"issue_ids": issue_ids, "attributes": ["key", "summary", "description", "link"]}, verify=False)
    issue_data = issue_data.json()
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
    manual_issue_ids = requests.get(f"{get_db()}/issue-ids", json=labelbody, verify=False).json()["issue_ids"]
    manual_labels_raw = requests.get(f"{get_db()}/manual-labels", json={"issue_ids": manual_issue_ids}, verify=False).json()
    manual_labels = {}


    labels = ["existence", "property", "executive"]
    if "manual_labels" in manual_labels_raw:
        for issue_id in manual_labels_raw['manual_labels']:
            classifications = []
            for label in labels:
                if manual_labels_raw["manual_labels"][issue_id][label]:
                    classifications.append(label.title())
            if len(classifications) == 0:
                classifications.append("Non-Arch.")
            
            manual_labels[issue_id] = ", ".join(classifications)

    # then the in-review ones
    reviewbody = {
        "filter": {
            "$and": [
                postbody["filter"],
                {"tags": {"$eq": "needs-review"}}
            ]
        }
    }
    manual_issue_ids = requests.get(f"{get_db()}/issue-ids", json=reviewbody, verify=False).json()["issue_ids"]
    manual_labels_raw = requests.get(f"{get_db()}/manual-labels", json={"issue_ids": manual_issue_ids}, verify=False).json()

    if "manual_labels" in manual_labels_raw:
        for issue_id in manual_labels_raw['manual_labels']:
            classifications = []
            for label in labels:
                if manual_labels_raw["manual_labels"][issue_id][label]:
                    classifications.append(label.title())
            if len(classifications) == 0:
                classifications.append("Non-Arch.")
            
            # will override
            manual_labels[issue_id] = ", ".join(classifications) + " (In Review)"
    
    
    # finally: predictions!
    predictions = {} # key -> { model -> predictions }
    headers = {} # model -> [header]
    # header format for detection-output:
    """
    "Apache-12639558": {
        "architectural": {
            "prediction": false,
            "confidence": 0.0
        }
    }
    """
    # header format for classification3simplified-output:
    """
    "Apache-12639558": {
        "executive": {
            "prediction": false,
            "confidence": 0.024279268458485603
        },
        "existence": {
            "prediction": false,
            "confidence": 0.07352140545845032
        },
        "non-architectural": {
            "prediction": false,
            "confidence": 0.8794219493865967
        },
        "property": {
            "prediction": false,
            "confidence": 0.022777432575821877
        }
    }
    """
    for model in models:
        version = models[model]
        pred = requests.get(f"{get_db()}/models/{model}/versions/{version}/predictions", json={"issue_ids": issue_ids}, verify=False).json()
        if "predictions" in pred:
            # add headers
            first_issue = None
            for issue_id in pred["predictions"]:
                if pred["predictions"][issue_id]:
                    first_issue = pred["predictions"][issue_id]
                    break
            if first_issue is None:
                continue
            headers[model] = list(first_issue.keys())
            # add issue predictions
            for issue_id in pred["predictions"]:
                if not issue_id in predictions:
                    predictions[issue_id] = {}
                if pred["predictions"][issue_id]:
                    predictions[issue_id][model] = pred["predictions"][issue_id]
                
        # don't really care otherwise
    
    return (issue_data, manual_labels, predictions, headers)

# labels
@auth_req
def mark_review(id):
    return requests.post(f"{get_db()}/issues/{id}/mark-review", verify=False, headers=_auth_header())

@auth_req
def mark_training(id):
    return requests.post(f"{get_db()}/issues/{id}/finish-review", verify=False, headers=_auth_header())

@auth_req
def set_manual_label(issue, classifications):
    return requests.post(f"{get_db()}/manual-labels/{issue}", json=classifications, verify=False, headers=_auth_header())


def get_comments_for(issue):
    # todo proper error handling/reporting, see auth_reqs
    try:
        x = requests.get(f"{get_db()}/manual-labels/{issue}/comments", verify=False).json()
        if "comments" in x:
            return x["comments"]
        print("Comments not in response")
        return []
    except Exception:
        print("Error fetching comments")
        return []

@auth_req
def add_comment_for(issue, comment):
    return requests.post(f"{get_db()}/manual-labels/{issue}/comments", verify=False, headers=_auth_header(), json={"comment": comment})

@auth_req
def delete_comment(issue, comment_id):
    return requests.delete(f"{get_db()}/manual-labels/{issue}/comments/{comment_id}", verify=False, headers=_auth_header())

@auth_req
def edit_comment(issue, comment_id, json):
    return requests.patch(f"{get_db()}/manual-labels/{issue}/comments/{comment_id}", verify=False, headers=_auth_header(), json=json)

# tags

def get_manual_tags():
    tags = requests.get(f"{get_db()}/tags").json()['tags']
    result = {}
    for tag in tags:
        if tag['type'] != 'project' and tag['name'] != 'has-label':
            result[tag['name']] = tag['description']
    return result

def create_tag(name, desc):
    x = requests.post(f"{get_db()}/tags", verify=False, headers=_auth_header(), json={
        "tag": name,
        "description": desc
    })

    if x.status_code != 200:
        print(f"ERROR occurred in creating new tag. code: {x.status_code}")
        print(x.json())
        print('\n')

@auth_req
def delete_tag(tag):
    return requests.delete(f"{get_db()}/tags/{tag}", verify=False, headers=_auth_header())

@auth_req
def remove_tag(issue, tag):
    return requests.delete(f"{get_db()}/issues/{issue}/tags/{tag}", verify=False, headers=_auth_header())

def get_tags_for(issue):
    return requests.get(f"{get_db()}/issues/{issue}/tags", verify=False).json()['tags']

@auth_req
def add_tag_to(issue, tag):
    return requests.get(f"{get_db()}/issues/{issue}/tags", verify=False, headers=_auth_header(), json={"tag": tag})