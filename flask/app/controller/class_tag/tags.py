from flask import Blueprint

from app.data.class_tag import tags as data

bp = Blueprint('tags', __name__, url_prefix='/tags')

@bp.route('/delete/<tag>', methods=["DELETE"])
def delete(tag):
    return data.delete_tag(tag)