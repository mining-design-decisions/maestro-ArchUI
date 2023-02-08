# Using this project
Launching the web server needs to be done through commandline. Open a command terminal in the root directory of this project.

*Note: If you have multiple versions of Python installed on your system, or `pip` and `flask` are not on your path, you can use `py -3.10 -m` before these commands.*

## First time running - Install

First, ensure that you have a suitable Python version installed: as noted below in this document, the only version that will be able to run this project correctly is 3.10. The developer used 3.10.0 to be exact.

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

In order for ArchUI to work correctly at this stage, it needs the `mining-design-decisions` project to be on the `model-saving` branch.

```
git checkout model-saving
```

The requirements for the mining-design-decisions' deep-learning code are included in the requirements for ArchUI, so normally, you already installed them previously. In mining-design-decisions, a `visualkeras` repository is mentionoing to take advantage of visualization, but since ArchUI does not use it, it is not required if you do not want to make use of the CLI itself to visualize some data.

In addition to python modules, the ML code also requires a few `nltk` packages. In order to ensure these are all installed on your system, please run the script `setup_dependencies.py` found in the `setup` folder in the project root.

## Running

Run this command in the `archui/flask` directory, the same as this Readme.
```
flask run
```
The above command will run the app. The `--app` parameter is not required, because the flask app is already called `app`, which is the default.

## Accessing the now-running web server
By default, the webserver is available at http://127.0.0.1:5000.

## Web Server Usage
The homepage of the web application will display the same information as is available in this section.

### Managing Models
In this application, the term 'model' can refer to two things: either the model configuration, which is used to generate the CLI command, or the trained model data files.

The page 'Create a new model' allows you to create a new model configuration. Hover over the input fields/dropdowns/checkboxes to see a tooltip. Once you are done, click the button at the bottom to save the configuration.

Clicking this button will create the config and redirect you to the view page for your new config. There, you can see all available model configs, and select one for more detailed action.

Available actions on model configurations are currently to train and to edit the configuration. Training a model uses the CLI's `run` command, saving the trained model to be used for prediction later on. While editing the configuration, you can change any of the previously entered options, except for the model config's name.

In this repository, all models from the `mining-design-decisions` report table 17 are pre-made and pre-trained.

### Predicting with Models
In the 'Predict With Models' tab, you will see options to select any number of models, and select the project they will be run on. Running these models means that they will be used to predict the design decision content of all issues in the target project. This action will create a file called a 'run'. Upon completion of the prediction, you will be redirected to the table view of the freshly-completed run. Additionally, in the 'View Runs' tab, you can also see all previously saved runs.

In the table view, every issue has its own row. In this row, you will find first a link to the issue which automatically opens in a new tab, the current classification of this issue in the training data, and the predictions of all selected models regarding this issue.

Classifying an issue in this view will put relevant information into the `training_labels.json` file. In order to formalize these changes into the `training.json` data, you must go to the Training Data tab.

### Managing Training Data
Currently, in the Training Data tab, you can only generate a new `training.json` from the `training_labels.json` file. More functions, including insights about the training data, are planned.

# Adapting or Extending this project
The project is designed to be easy to extend for developers new to the project. This section describes details about the project and various ways to improve and grow it. When making changes to how the project is interacted with by users and developers, please keep this readme up to date as well.

## Project Details
This project is a webserver GUI wrapper around the machine learning CLI built by other students in the aforementioned `mining-design-decisions` repository. It is written in Python, using the Flask web framework, and uses Bootstrap for CSS. Basic familiarity with Python and theory behind web applications, such as endpoints, is assumed.

### Short Introduction to Flask
This section will introduce Flask as it is currently used in this project. If you change the structure, please also change this documentation.

The structure of the project is centered around Flask's approach to web servers. The `app/__init__.py` file initializes the app and endpoints. At the end of the `create_app` function in this file, the app's endpoints are registered, either through directly defining them (`@app.route(...)`) or through Flask's Blueprints (`app.register_blueprint(...)`). This is where you will add new blueprints or change existing ones.

In Flask, Blueprints function as endpoint categories. See the `app/blueprints/models.py` file as example. At the top of the file, the Blueprint object is created, which is imported by `app/__init__.py`. This object is used to register endpoints within the `app/blueprints/models.py` file. Note the `url_prefix` parameter in the Blueprint object creation, and note that this parameter is optional, in case you want a category of index-based endpoints without additional prefixes.

Each endpoint defined in blueprint files or in the `__init__.py::create_app` function itself will have a name, defined by the endpoint's function's name and if applicable the endpoint's blueprint's name, like so:

- If not in a blueprint: just the endpoint's function's name.
- If in a blueprint, or a nested blueprint, it will be the blueprint's name(s), followed by the endpoint's function's name, all separated by periods. (e.g. `foo.bar.function`)

These endpoint names are used to generate the page links in e.g. the navbar. See the navbar code in the `app/templates/base.html` file for examples.

Flask serves webpages based on Jinja templates, which are html files which may or may not take parameters to generate content. The html files can be found in the templates directory. For an example of a template taking parameters to generate content, please see the `viewall()` endpoint in the `app/blueprints/models.py` file.

Flask template files can inherit from each other with a system called blocks: parent files will define blocks, and their child files can overwrite blocks entirely, overwrite partially (by calling `super()` within the overwriting block) or leave blocks as-is (by not stating the block in the child file). This project uses the Bootstrap base, the documentation of which provides more information, so please see the CSS link under the More Resources tab to learn more about this. For examples of this system, please see the templates within the `app/templates` directory.

Finally, Jinja provides several functionalities in template files other than blocks. An example of macros is used in the `app/templates/models/editable_form.html` file.

## Adding a new endpoint in an existing blueprint

- Locate the blueprint you want to put the new endpoint in
- Define the decorator (if in a blueprint, the `@bp.route(...)`; if in `__init__.py`, the `@app.route(...)`) with all necessary parameters. If the blueprint is hooked up correctly, the endpoint will automatically be accessible on the web server, either to browse to or through JS `fetch` commands in `scripts` blocks. **Do not forget the @ at the beginning of the decorator.**
- Define the function for what the endpoint must return/handle. Render a template or return something else.
	+ If you are rendering a template, you may need to create a new one in the `templates` directory. See the other templates for a format, or the documentation for more options.
- Does e.g. the navbar need to link to this new endpoint? Edit the `base.html` template.

## Creating a new endpoint category (Flask Blueprint)

- Create a new file according to the blueprint structure: either in the `app/blueprints` directory or in its own subdirectory. 
- Add the `bp = Blueprint(...)` at the top of the file, or use whatever other name you like, and create routes as in other files.
- `register_blueprint` the newly created Blueprint wherever you need it, be it in another blueprint (nested blueprints) or straight in the `__init__.py` file.

## Custom CSS
There is a custom CSS file at `app/static/archui.css`. It is automatically included in the `base.html` template. Here, you can create custom CSS classes for use in your templates, should Bootstrap or in-line style not be sufficient.

# More resources
## External Documentation Links

- Flask: https://flask.palletsprojects.com/en/2.2.x/
- Bootstrap 5 (note the version - there are newer versions, but this project uses 5.0): https://getbootstrap.com/docs/5.0/getting-started/introduction/

## Notes on Python Version and Compatible Packages

- At time of writing, `flask-nav` is incompatible with Python 3.10 and up. This is unfortunate, because the CLI on which this interface builds is only available with Python 3.10 and up, while several of the CLI's dependencies are incompatible with Python 3.11. 
- There *is* a `flask-bootstrap` package, but because it uses Bootstrap 3.7, which does not have all required functionality for the project, so the author has manually included Bootstrap in the `base.html` template.