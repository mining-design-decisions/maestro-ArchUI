import os
# fix windows registry stuff
import mimetypes
mimetypes.add_type('application/javascript', '.js')
from flask import Flask
from flask import render_template
from flask_session import Session
import secrets

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

    Session(app)

    app.debug = True

    from .blueprints import models, predict, classify, statistics, login

    app.register_blueprint(models.bp)
    app.register_blueprint(predict.bp)
    app.register_blueprint(classify.bp)
    app.register_blueprint(statistics.bp)
    app.register_blueprint(login.bp)

    @app.route("/hello")
    def hello():
        return "Hello, world!"

    @app.route('/')
    def index():
        return render_template('home.html')

    return app
    
# https://github.com/pallets/flask/blob/main/examples/tutorial/flaskr/__init__.py