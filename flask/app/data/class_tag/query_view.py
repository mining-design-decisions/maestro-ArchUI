import json
import requests

from app.data import login

def get_query_names():
    from os import walk
    results = []
    _query_dir()
    for (dirpath, dirnames, filenames) in walk('app/data/queries'):
        for file in filenames:
            results.append(file[:-5])
    return results

def get_paginated_data(query_name, page, pageLimit, sort, sort_asc, issue_id):  
    # data to return in order: issue_data, manual_labels, headers, total_pages, model_versions
    with open(f'app/data/queries/{query_name}.json', 'r') as f:
        qdata = json.load(f)
        models = qdata['models']
        query = qdata['query']
    
    model_ids = [f'{m_id}-{models[m_id]}' for m_id in models]

    query_filter = query
    if type(query) == str:
        query_filter = json.loads(query)
    if issue_id is not None:
        query_filter = {
            "$and": [
                query_filter,
                {'_id': {"$eq": issue_id}}
            ]
        }

    uibody = {
        "filter": query_filter,
        "sort": sort,
        "sort_ascending": sort_asc,
        "models": model_ids,
        "page": int(page),
        "limit": pageLimit
    }

    # get issue data from UI endpoint
    x = requests.get(f'{login.get_db()}/ui', verify=False, json=uibody)
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
        output_mode = requests.get(f'{login.get_db()}/models/{m_id}', verify=False).json()['model_config']['output-mode']
        if output_mode not in output_mode_to_headers:
            print('\nERROR: Unknown Output Mode: ' + output_mode + ". Please complete output_mode_to_headers.\n\n")
        headers[f"{m_id}-{models[m_id]}"] = output_mode_to_headers[output_mode]

    # return results
    return (issue_data, manual_labels, headers, total_pages, models)

def get_p_query(projects):
    return {"$or": [{"tags": {"$eq": p}} for p in projects]}

def _query_dir():
    import os
    os.makedirs("app/data/queries", exist_ok=True)

def create_query(models, query, name):
    modelversions = {}
    failed_models = []
    for model in models:
        modelVersions_raw = requests.get(f"{login.get_db()}/models/{model}/versions", verify=False).json()["versions"]
        if len(modelVersions_raw) > 0:
            modelversions[model] = modelVersions_raw[-1]['version_id']
        else:
            failed_models.append(model)
    _query_dir()
    with open(f'app/data/queries/{name}.json', 'w') as f:
        json.dump({
            "models": modelversions,
            "query": query
        }, f)
    return failed_models