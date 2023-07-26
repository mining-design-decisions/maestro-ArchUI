from flask import render_template
from flask import request
from flask import redirect
from flask import url_for

from app.data.class_tag import tags as data
from app.controller.class_tag import tags as contr

@contr.bp.route('/', methods=['GET'])
def viewall():
    tags = data.get_manual_tags()
    return render_template('tags/viewall.html', tags=tags)

@contr.bp.route('/create', methods=["GET"])
def viewform():
    return render_template('tags/form.html')

@contr.bp.route('/create', methods=["POST"])
def create():
    tagname = request.form.get('tag_name')
    tagdesc = request.form.get('tag_desc')
    data.create_tag(tagname, tagdesc)
    return redirect(url_for('tags.viewall'))