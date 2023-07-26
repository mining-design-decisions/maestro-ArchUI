import requests

from app.data import common, login
from app.data.class_tag import query_view as q_data

def predict_models_projects(models, projects):
    # todo error handling/reporting
    # continuously open socket status reports?
    for model in models:
        config = {
            "auth": common._auth_body(),
            "config": {
                "data-query": q_data.get_p_query(projects),
                "database-url": login.get_db(),
                "model": model
            }
        }
        x = requests.post(f"{login.get_cli()}/predict", json=config, verify=False)
        if x.status_code != 200:
            print(x.json())