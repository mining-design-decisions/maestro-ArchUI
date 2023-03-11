from flask import render_template
from flask import Blueprint

# from app.services.jira_link import regenerate_training_data
from app.services import data

bp = Blueprint('training', __name__, url_prefix="/training")

@bp.route('/', methods=["GET"])
def view():
    amt_data = data.get_amt_in_training()
    amt_labels = len(data.get_known_labels())
    return render_template('training/view.html', amt_labels=amt_labels, amt_data=amt_data)

@bp.route('/regenerate', methods=["POST"])
def regenerate():
    # labels = data.get_known_labels()
    # new_training_data = regenerate_training_data(labels)
    # data.save_training_data(new_training_data)
    return "under construction!"