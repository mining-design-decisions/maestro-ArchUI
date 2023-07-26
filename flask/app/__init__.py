import os
# fix windows registry stuff
import mimetypes
mimetypes.add_type('application/javascript', '.js')
from flask import Flask
from flask import render_template
from flask_session import Session
import secrets

ALLOWED_EXTENSIONS = ['json']

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY = "dev",
        # i don't think this will need a db
    )

    if test_config is None:
        app.config.from_pyfile("config.py", silent=True)
    else:
        app.config.update(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    app.secret_key = secrets.token_hex(16)
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['UPLOAD_FOLDER'] = '/data/uploads'

    Session(app)

    app.debug = True

    from app.view import search, statistics
    app.register_blueprint(search.bp)
    app.register_blueprint(statistics.bp)

    from app.view.class_tag import query_view
    app.register_blueprint(query_view.bp)

    from app.view.ml import embeddings, models, ontologies, predict
    app.register_blueprint(embeddings.bp)
    app.register_blueprint(models.bp)
    app.register_blueprint(ontologies.bp)
    app.register_blueprint(predict.bp)

    from app.controller.class_tag import labeling as c_labeling
    app.register_blueprint(c_labeling.bp)

    from app.view import login
    app.register_blueprint(login.contr.bp)
    from app.view.class_tag import tags
    app.register_blueprint(tags.contr.bp)

    @app.route('/')
    def index():
        return render_template('home.html')

    return app
    
# https://github.com/pallets/flask/blob/main/examples/tutorial/flaskr/__init__.py