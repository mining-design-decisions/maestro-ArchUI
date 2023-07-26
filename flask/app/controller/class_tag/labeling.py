from flask import Blueprint
from flask import request

from app.data.class_tag import labeling as data
from app.data.class_tag import tags as t_data

bp = Blueprint('manual', __name__, url_prefix="/manual")

@bp.route('/review/<issue>', methods=["POST"])
def mark_review(issue):
    return data.mark_review(issue)

@bp.route("/training/<issue>", methods=["POST"])
def mark_training(issue):
    return data.mark_training(issue)

@bp.route('/classify/<issue>', methods=["POST"])
def classify(issue):
    json = request.json
    return data.set_manual_label(issue, json)

@bp.route('/comments/<issue>', methods=["GET"])
def get_comments(issue):
    return data.get_comments_for(issue)

@bp.route('/comments/<issue>', methods=["POST"])
def post_comment(issue):
    return data.add_comment_for(issue, request.json['comment'])

@bp.route('/comments/<issue>/<comment_id>', methods=["DELETE"])
def delete_comment(issue, comment_id):
    return data.delete_comment(issue, comment_id)

@bp.route('/comments/<issue>/<comment_id>', methods=["PATCH"])
def edit_comment(issue, comment_id):
    json = request.json
    return data.edit_comment(issue, comment_id, json)

@bp.route('/tags/<issue>/<tag>', methods=["DELETE"])
def remove_tag(issue, tag):
    return t_data.remove_tag(issue, tag)

@bp.route('/tags/<issue>/<tag>', methods=["POST"])
def add_tag(issue, tag):
    return t_data.add_tag_to(issue, tag)

@bp.route('/tags/<issue>', methods=["GET"])
def get_tags_for(issue):
    return t_data.get_tags_for(issue)