from flask import Blueprint
from flask import render_template
import os
import json

bp = Blueprint("issues", __name__, url_prefix="/issues")

@bp.route('/viewall', methods=["GET"])
def viewall():
    # show all
    issue_lists = [x[:-5] for x in os.listdir('app/data/runs')]
    return render_template("issues/viewall.html", lists=issue_lists)

@bp.route('/view/<list_name>', methods=["GET"])
def view(list_name):
    # BIG TODO WITH THE WHOLE TABLE
    # AND THE PAGINATION
    issues = { # temp test data
        "TAJO-3": {
            "Example Model: Prediction Name": "Architectural",
            "Example Model: Probability Architectural": "1.00000"
        },
        "TAJO-2": {
            "Example Model: Prediction Name": "Architectural",
            "Example Model: Probability Architectural": "1.00000"
        },
        "TAJO-1": {
            "Example Model: Prediction Name": "Non-Architectural",
            "Example Model: Probability Architectural": "0.00000"
        }
    }
    with open(f'app/data/runs/{list_name}.json', 'r') as f:
        issues = json.load(f)
    first_issue = list(issues.values())[0]
    headers = list(first_issue.keys())
    return render_template("issues/view.html", issues=issues, headers=headers)