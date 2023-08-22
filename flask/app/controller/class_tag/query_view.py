from app.data import common, login

from app.data.class_tag import query_view as q_data
from app.data.class_tag import tags as t_data
from app.data.ml import models as m_data

def pop_failed_models():
    failed_models = common.get_cache('failed_models', [])
    common.set_cache('failed_models', [])
    return failed_models

def fixtext_html(str):
    return str.strip().replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br />')

def view_query_data(query, page, pageLimit, sort, sort_asc, search_issue_id):
    common.set_cache('page_limit', pageLimit)

    issue_data, manual, headers, totalPages, models = q_data.get_paginated_data(query, page, pageLimit, sort, sort_asc, search_issue_id)
    man_tags = t_data.get_manual_tags()

    model_id_names = m_data.get_model_ids_names()
    model_name_dic = {}
    for m in model_id_names:
        model_name_dic[m['model_id']] = m['model_name']
    id_to_name = {}
    for m_id in models:
        id_to_name[f"{m_id}-{models[m_id]}"] = model_name_dic[m_id]

    thisuser = login.get_username()

    issue_text = {}
    row = 1
    for issue in issue_data:
        issue_text[issue['issue_id']] = {
            'summary': fixtext_html(issue['summary']) if 'summary' in issue and issue['summary'] else 'None', 
            'description': fixtext_html(issue['description']) if 'description' in issue and issue['description'] else 'None',
            'row': (int(page) - 1) * pageLimit + row
            }
        row+=1

    url = login.get_db()
    websocket = f"wss{url[url.find('://'):]}/ws"

    return issue_data, manual, headers, id_to_name, thisuser, totalPages, man_tags, issue_text, websocket

def create_query(requestform):
    models = [requestform.get(x) for x in requestform if x.startswith('model_')]
    versions = [requestform.get(x) for x in requestform if x.startswith('modelversion')]
    print(models, versions)
    query_type = requestform.get('query_type', False)
    data_q = ""
    if query_type:
        # simple
        projects = [requestform.get(x) for x in requestform if x.startswith('target_project_')]
        data_q = q_data.get_p_query(projects)
    else:
        # complex
        import json
        data_q = requestform.get("target_tag_query")
        try:
            data_q = json.loads(data_q)
        except:
            print("Failed to parse advanced query: " + data_q)
            data_q = {}
        
    q_name = requestform.get('query_name')
    failed_models = q_data.create_query(models, versions, data_q, q_name)
    common.set_cache('failed_models', failed_models)