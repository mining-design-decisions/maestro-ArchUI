from flask import render_template
from flask import Blueprint
from flask import request
from flask import redirect
from flask import url_for

from app.services import dbapi

bp = Blueprint('tags', __name__, url_prefix='/tags')

@bp.route('/', methods=['GET'])
def viewall():
    tags = dbapi.get_manual_tags()
    return render_template('tags/viewall.html', tags=tags)

@bp.route('/create', methods=["GET"])
def viewform():
    return render_template('tags/form.html')

@bp.route('/create', methods=["POST"])
def create():
    tagname = request.form.get('tag_name')
    tagdesc = request.form.get('tag_desc')
    dbapi.create_tag(tagname, tagdesc)
    return redirect(url_for('tags.viewall'))

@bp.route('/delete/<tag>', methods=["DELETE"])
def delete(tag):
    return dbapi.delete_tag(tag)
    