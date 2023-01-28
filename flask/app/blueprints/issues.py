from flask import Blueprint
from flask import render_template
import os
import json
from flask import request

bp = Blueprint("issues", __name__, url_prefix="/issues")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all
    issue_lists = [x[:-5] for x in os.listdir('app/data/runs')]
    return render_template("issues/viewall.html", lists=issue_lists)

@bp.route('/view/<list_name>', methods=["GET"])
def view(list_name):
    with open(f'app/data/runs/{list_name}.json', 'r') as f:
        issues = json.load(f)
    first_issue = list(issues.values())[0]
    headers = list(first_issue.keys())
    return render_template("issues/view.html", issues=issues, headers=headers)

@bp.route('/classify', methods=["POST"])
def classify():
    print(request.get_json())
    reqbody = request.get_json()
    issue_key = reqbody['issue']
    labels = [x for x in reqbody['classification'] if x is not "non-architectural"]
    label_obj = {
        "key": issue_key,
        "is-design": str(len(labels)>0),
        "is-cat1": {
            "name": "Existence",
            "value": str("existence" in labels)
        },
        "is-cat2": {
            "name": "Executive",
            "value": str("executive" in labels)
        },
        "is-cat3": {
            "name": "Property",
            "value": str("property" in labels)
        }
    }

    
    with open('app/data/training_labels.json', 'r') as f:
        label_data = json.load(f)
    label_data.append(label_obj)
    with open('app/data/training_labels.json', 'w') as f:
        json.dump(label_data, f)
    
    return 'ok'