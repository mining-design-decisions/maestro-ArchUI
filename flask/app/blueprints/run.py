from flask import render_template
from flask import Blueprint
from flask import redirect
from flask import request
import os
from app.jira_link import load_issues_for
import json

bp = Blueprint('run', __name__, url_prefix='/run')

@bp.route('/select', methods=['GET'])
def select():
    dir = 'app/models'
    models = []
    for file in os.listdir(dir):
        if file.endswith('.json'):
            models.append(file[:-5])

    return render_template('run/select.html', models=models)

@bp.route('/select', methods=['POST'])
def postSelect():

    # grab input
    target_proj = request.form['projectkey']
    models_to_run = []

    for el in request.form:
        if not el.startswith('run_'):
            continue
        models_to_run.append(el)

    if len(models_to_run) == 0:
        return render_template('error.html')
    
    # train the models

    # download the target issues
    proj_issues = load_issues_for(target_proj)
    with open('dump.json', 'w+') as f:
        json.dump(proj_issues, f)

    # use the predict functionality on the new project

    # save the results

    # cleanup

    return 'ok - post'