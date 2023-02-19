from flask import Blueprint
from flask import render_template
from flask import request

from app.services import data

bp = Blueprint("runs", __name__, url_prefix="/runs")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all
    issue_lists = data.get_all_run_names()
    return render_template("runs/viewall.html", lists=issue_lists)

def _format_label(label):
    if label['is-design'] == "False":
        return 'Non-Arch.'
    tags = [f"is-cat{i+1}" for i in range(3)]
    result = []
    for tag in tags:
        if label[tag]['value'] == "True":
            result.append(label[tag]['name'])
    return ', '.join(result)

@bp.route('/view/<list_name>', methods=["GET"])
def view(list_name):
    issues = data.get_run_data(list_name)
    headers = list((list(issues.values())[0]).keys())
    labels = data.get_known_labels()
    key_to_label = {}
    for label in labels:
        key_to_label[label['key']] = _format_label(label)
    
    classifications = {}
    for issue in issues:
        if issue not in key_to_label:
            classifications[issue] = ""
        else:
            classifications[issue] = key_to_label[issue]

    return render_template("runs/view.html", issues=issues, headers=headers, classifications=classifications)

@bp.route('/classify', methods=["POST"])
def classify():
    print(request.get_json())
    reqbody = request.get_json()
    issue_key = reqbody['issue']
    labels = [x.lower() for x in reqbody['classification'] if x != "non-architectural"]
    data.set_label(issue_key, labels)
    
    return 'ok' # todo expand to stream for updates?