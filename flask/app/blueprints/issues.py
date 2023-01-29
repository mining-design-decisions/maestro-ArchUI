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

def _format_label(label):
    if not label['is-design']:
        return 'Non-Arch.'
    tags = [f"is-cat{i+1}" for i in range(3)]
    result = []
    for tag in tags:
        if label[tag]['value'] == "True":
            result.append(label[tag]['name'])
    return ', '.join(result)

@bp.route('/view/<list_name>', methods=["GET"])
def view(list_name):
    with open(f'app/data/runs/{list_name}.json', 'r') as f:
        issues = json.load(f)
    headers = list((list(issues.values())[0]).keys())
    with open('app/data/training_labels.json', 'r') as f:
        labels = json.load(f)
    key_to_label = {}
    for label in labels:
        key_to_label[label['key']] = _format_label(label)
    
    classifications = {}
    for issue in issues:
        if issue not in key_to_label:
            classifications[issue] = ""
        else:
            classifications[issue] = key_to_label[issue]

    return render_template("issues/view.html", issues=issues, headers=headers, classifications=classifications)

@bp.route('/classify', methods=["POST"])
def classify():
    print(request.get_json())
    reqbody = request.get_json()
    issue_key = reqbody['issue']
    labels = [x for x in reqbody['classification'] if x != "non-architectural"]
    print(labels)
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
    for i in range(len(label_data)):
        this_label = label_data[i]
        if this_label['key'] == issue_key:
            del label_data[i]
            break
            
    label_data.append(label_obj)
    with open('app/data/training_labels.json', 'w') as f:
        json.dump(label_data, f, indent=4)
    
    return 'ok'