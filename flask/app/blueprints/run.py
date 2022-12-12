from flask import render_template
from flask import Blueprint
from flask import redirect
from flask import request
import os
from app.jira_link import load_issues_for
import json
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
    print(request.form)

    # - grab input
    target_proj = request.form['projectkey']
    models_to_run = []

    for el in request.form:
        if not el.startswith('run_'):
            continue
        models_to_run.append(el[4:])

    if len(models_to_run) == 0:
        return render_template('error.html')

    if request.form.get('regenerate_test_data', False):
        print('Regenerating testing data')
        # - download the target issues and save them in data/testing.json
        proj_issues = load_issues_for(target_proj)
        with open('app/data/testing.json', 'w+') as f:
            json.dump(proj_issues, f)
    
    # - train the models and use the predict functionality on the new project
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
    # root dir files
    for file in os.listdir('.'):
        if os.path.isdir(file):
            continue
        if file not in ['README.md', 'requirements.txt']:
            os.remove(file)

    # features
    rec_del_safe('./features')

    return 'ok - post'