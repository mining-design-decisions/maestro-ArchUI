from flask import Blueprint
from flask import redirect
from flask import request

bp = Blueprint('run', __name__, url_prefix='/run')

@bp.route('/select', methods=['GET'])
def select():
    return 'ok'

@bp.route('/select', methods=['POST'])
def postSelect():
    return 'ok - post'