from flask import render_template
from flask import Blueprint
from flask import redirect
from flask import request
import os

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
    return 'ok - post'