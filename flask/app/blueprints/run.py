from flask import render_template
from flask import Blueprint
from flask import redirect
from flask import request
import os
import json

from app.jira_link import load_issues_for
from app.ml_link import predict_with
from app.util import rec_del_safe

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

    # - grab input
    target_proj = request.form['projectkey']
    models_to_run = []

    for el in request.form:
        prefix = 'run_classifier_'
        if not el.startswith(prefix):
            continue
        models_to_run.append(request.form[el])

    if len(models_to_run) == 0:
        return render_template('error.html')

    # - download the target issues and save them in data/testing.json
    # (if the user indicated this is desirable)
    if request.form.get('regenerate_test_data', False):
        print('Regenerating testing data')
        proj_issues = load_issues_for(target_proj)
        with open('app/data/testing.json', 'w+') as f:
            json.dump(proj_issues, f)
    
    # - use the predict functionality on the new project
    for model in models_to_run:
        predict_with(model)

        # - save the results
        with open('predictions.csv', 'r') as f:
            predictions_raw = f.readlines()
        header = predictions_raw.pop(0).strip()
        predictions = []
        for line in predictions_raw:
            if line.strip():
                predictions.append(line.strip())

        with open('app/data/testing.json', 'r') as f:
            issues = json.load(f)
        
        results = []

        for issue in issues:
            results.append({
                'key': issue['key'],
                'result': predictions.pop(0)
            })

        with open(f'app/data/results/{model}.json', 'w+') as f:
            json.dump({
                'header': header,
                'results': results,
            }, f)

    # todo: combine separate results files into one? for list view purposes?

    # - cleanup

    # features
    rec_del_safe('./features')

    # todo: change below into displaying the results
    return 'ok - post'