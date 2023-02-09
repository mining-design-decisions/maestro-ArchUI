from flask import render_template
from flask import Blueprint
import json

from app.services.jira_link import regenerate_training_data

bp = Blueprint('training', __name__, url_prefix="/training")

@bp.route('/', methods=["GET"])
def view():
    with open('app/data/training.json') as f:
        amt_data = len(json.load(f))
    with open('app/data/training_labels.json') as f:
        amt_labels = len(json.load(f))
    return render_template('training/view.html', amt_labels=amt_labels, amt_data=amt_data)

@bp.route('/regenerate', methods=["POST"])
def regenerate():
    with open('app/data/training_labels.json') as f:
        labels = json.load(f)
    new_training_data = regenerate_training_data(labels)
    with open('app/data/training.json', 'w') as f:
        json.dump(new_training_data, f, indent=4)
    return "ok"