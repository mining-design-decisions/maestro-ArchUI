# Using this project
Launching the web server needs to be done through commandline. Open a command terminal in the root directory of this project.

## First time running

First, ensure that you have a suitable Python version installed: as noted below in this document, the only version that will be able to run this project correctly is 3.10.

You can check your current Python version with `python -V`.


```
cd flask
pip install -r requirements.txt
```
Run the above in the `flask` subdirectory to make sure you have installed all required dependencies of the project. If the requirements.txt is not complete, please notify the developer.

Ensure that the `mining-design-decisions` project is installed in the same parent directory as this project:
```
cd ..
cd ..
git clone https://github.com/mining-design-decisions/mining-design-decisions
```
In order for ArchUI to work correctly, it needs the `mining-design-decisions` project to be on the `model-saving` branch.

You also need to run `pip install -r requirements.txt` in the `mining-design-decisions` project's `deep_learning` folder, as well as `git clone https://github.com/jmaarleveld/visualkeras`, as in its own readme.

## Running

Run this command in the `archui/flask` directory, the same as this Readme.
```
flask run
```
The above command will run the app. The `--app` parameter is not required, because the flask app is already called `app`, which is the default.

## Accessing the now-running web server
By default, the webserver is available at http://127.0.0.1:5000.

## Web Server Usage
todo

# Adapting this project
The project is designed to be easy to extend for developers new to the project. This section describes details about the project and various ways to improve/grow it. If you make changes to the project that have an impact on how it can be used, such as adding, changing or removing functionality, please keep the first section of this readme up to date as well.

## Project Details
This project is a webserver GUI wrapper around the machine learning CLI built by other students. It is written in Python, using the Flask web framework, and uses Bootstrap for CSS. Basic familiarity with Python and theory behind web servers, such as endpoints, is assumed.

### Short Introduction to Flask
This section will introduce Flask as it is currently used in this project. If you change the structure, please also change this documentation.

The structure of the project is centered around Flask. The `__init__.py` file initializes the app and endpoints. At the end of the `create_app` function, the app's endpoints, either through directly stating them (`@app.route(...)`) or through Flask's Blueprints (`app.register_blueprint(...)`).

In Flask, Blueprints function as endpoint categories. See the `models.py` file as example. At the top of the file, the Blueprint object is created, which is imported by `__init__.py`. This object is used to register endpoints within the `models.py` file. Note the `url_prefix` parameter in the Blueprint object creation, and note that this parameter is optional, in case you want a category of index-based endpoints without additional prefixes.

Each endpoint defined in blueprint files or in the `create_app` function itself will have a name, defined by the endpoint's function's name and if applicable the endpoint's blueprint's name, like so:

- If not in a blueprint: just the endpoint's function's name.
- If in a blueprint, or a nested blueprint, it will be the blueprint's name(s), followed by the endpoint's function's name, all separated by periods.

These endpoint names are used to generate the page links in e.g. the navbar. See the `base.html` file for the navbar.

Flask serves webpages based on templates, which are html files which may or may not take parameters to generate content. The html files can be found in the templates directory. For an example of a template taking parameters to generate content, please see the `viewall()` endpoint in the `models.py` file.

Flask template files can inherit from each other with a system called blocks: parent files will define blocks, and files which extend blocks can overwrite entirely, overwrite partially (by calling `super()` within the overwriting block) or leave blocks as-is. This project uses the Bootstrap base, the documentation of which provides more information, so please see the CSS link under the More Resources tab to learn more about this.

## Adding a new endpoint in an existing category

- Locate the category you want to put the new endpoint in
- Define the decorator (if in a blueprint, the `bp.route(...)`; if in `__init__.py`, the `app.route(...)`) with all necessary parameters. If the blueprint is hooked up correctly, the endpoint will automatically be accessible within the web app. **Do not forget the @ at the beginning of the decorator.**
- Define the function for what the endpoint must return/handle. Render a template or return something else.
	+ If you are rendering a template, you may need to create a new one in the `templates` directory. See the other templates for a format, or the documentation for more options.
- Does e.g. the navbar need to link to this new endpoint? Edit the `base.html` template.

## Creating a new endpoint category (Flask Blueprint)

- Create a new file according to the blueprint structure: either in the `blueprints` directory or in its own subdirectory. 
- Add the `bp = Blueprint(...)` at the top of the file, or use whatever other name you like, and create routes as in other files.
- `register_blueprint` the newly created Blueprint wherever you need it, be it in another blueprint (nested blueprints) or straight in the `__init__.py` file.

# More resources
## External Documentation Links

- Bootstrap with Flask: https://pythonhosted.org/Flask-Bootstrap/basic-usage.html
- Bootstrap Components: https://getbootstrap.com/docs/3.3/components
	+ Note the 3.3: at time of writing, the Bootstrap version bundled with Flask-Bootstrap is 3.3.7, which is not the latest.
- Bootstrap Padding in 3.3: https://stackoverflow.com/questions/32233489/does-bootstrap-have-builtin-padding-and-margin-classes

## Notes on Python Version

- At time of writing, `flask-nav` is incompatible with Python 3.10 and up. This is unfortunate, because the CLI on which this interface builds is only available with Python 3.10. Several of the CLI's dependencies are incompatible with Python 3.11. 