from flask import Blueprint
from flask import request

from app.services import dbapi

bp = Blueprint('manual', __name__, url_prefix="/manual")

@bp.route('/review/<issue>', methods=["POST"])
def mark_review(issue):
    return dbapi.mark_review(issue)

@bp.route("/training/<issue>", methods=["POST"])
def mark_training(issue):
    return dbapi.mark_training(issue)

@bp.route('/classify/<issue>', methods=["POST"])
def classify(issue):
    json = request.json
    return dbapi.set_manual_label(issue, json)

@bp.route('/comments/<issue>', methods=["GET"])
def get_comments(issue):
    return dbapi.get_comments_for(issue)

@bp.route('/comments/<issue>', methods=["POST"])
def post_comment(issue):
    return dbapi.add_comment_for(issue, request.json['comment'])

@bp.route('/comments/<issue>/<comment_id>', methods=["DELETE"])
def delete_comment(issue, comment_id):
    return dbapi.delete_comment(issue, comment_id)

@bp.route('/comments/<issue>/<comment_id>', methods=["PATCH"])
def edit_comment(issue, comment_id):
    json = request.json
    return dbapi.edit_comment(issue, comment_id, json)

@bp.route('/tags/<issue>/<tag>', methods=["DELETE"])
def remove_tag(issue, tag):
    return dbapi.remove_tag(issue, tag)

@bp.route('/tags/<issue>/<tag>', methods=["POST"])
def add_tag(issue, tag):
    return dbapi.add_tag_to(issue, tag)

@bp.route('/tags/<issue>', methods=["GET"])
def get_tags_for(issue):
    return dbapi.get_tags_for(issue)