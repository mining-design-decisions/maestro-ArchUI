from flask import render_template
from flask import Blueprint
from flask import redirect
from flask import request
from flask import url_for

# from app.services.jira_link import load_issues_for
from app.services.ml_link import predict_with
from app.services.util import rec_del_safe, get_default_run_name
from app.services import data

bp = Blueprint('predict', __name__, url_prefix='/predict')

@bp.route('/select', methods=['GET'])
def select():
    models = data.get_all_model_config_names()

    return render_template('predict/select.html', models=models)

@bp.route('/select', methods=['POST'])
def postSelect():

    # database overhaul temporarily disabled
    """
    # - grab input
    target_proj = request.form['projectkey']
    models_to_run = []
    run_name = get_default_run_name()
    if '_run_name' in request.form and len(request.form['_run_name']) > 0:
        run_name = request.form['_run_name']

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
        data.save_test_data(proj_issues)
    
    # - use the predict functionality on the new project and format/save the results

    results_all = {}
    for model in models_to_run:
        predictions_raw = predict_with(model)

        # - format and save the results
        header = predictions_raw.pop(0).strip()
        predictions = []
        for line in predictions_raw:
            if line.strip():
                predictions.append(line.strip())

        issues = data.load_test_data()
        
        results = []

        for issue in issues:
            results.append({
                'key': issue['key'],
                'result': predictions.pop(0)
            })

        results_obj = {
            'header': header,
            'results': results,
        }
        results_all[model] = results_obj

    # combine separate results files into one for list view purposes
    # save in file: run_name.json
    final_results = {}
    for model in results_all:
        headers = results_all[model]['header'].split(',')
        for issue in results_all[model]['results']:
            key = issue['key']
            if not key in final_results:
                final_results[key] = {}
            verdict = issue['result'].split(',')
            for i in range(len(headers)):
                final_results[key][f'{model}: {headers[i]}'] = verdict[i]
    
    data.save_run(run_name, final_results)
    """
    
    return "under construction!" # todo
    # return redirect(url_for('runs.view', list_name=run_name))