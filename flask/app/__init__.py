import os
from flask import Flask
from flask import render_template

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

    from .blueprints import models, run, issues, training

    app.register_blueprint(models.bp)
    app.register_blueprint(run.bp)
    app.register_blueprint(issues.bp)
    app.register_blueprint(training.bp)

    @app.route("/hello")
    def hello():
        return "Hello, world!"

    @app.route('/')
    def index():
        return render_template('home.html')

    return app
    
# https://github.com/pallets/flask/blob/main/examples/tutorial/flaskr/__init__.py