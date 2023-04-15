# Using this project

Launching the ArchUI web server needs to be done through commandline. Open a command terminal in the root directory of this project.

*Note: If you have multiple versions of Python installed on your system, or `pip` and `flask` are not on your path, you can use `py -3.10 -m` before all python module commands (pip, flask) to ensure you are running them with the correct version.*

## Prerequisite Software

There are two other webservers used by ArchUI: the [database API](https://github.com/GWNLekkah/issue-labels) and the [machine learning pipeline](https://github.com/mining-design-decisions/mining-design-decisions). These can be hosted locally or on the Web. You will be able to specify the URLs for both of these connections in the UI. Their default values are localhost, with their respective default ports.

## First time running - Install

First, ensure that you have a suitable Python version installed: as noted below in this document, the only version that will be able to run this project correctly is 3.10. The developer used 3.10.0 to be exact.

You can check your current Python version with `python -V`.

Next, run the below to install all required dependencies of the project in the `flask` subdirectory. If the `requirements.txt` is not complete, please notify the developer.

```
cd flask
pip install -r requirements.txt
```

## Running

Run this command in the `archui/flask` directory, the same as this Readme:
```
flask run
```
The above command will run the app. The `--app` parameter is not required, because the flask app is already called `app`, which is the default.

## Accessing the now-running web server
By default, the webserver is available at http://localhost:5000.

## Web Server Usage
The homepage of the web application will display the same information as is available in this subsection.

### ML Models
In this application, the term 'model' can refer to two things: either the model configuration, which is used by the ML pipeline, or the trained model data files. In the "ML Models" page, accessible from the navbar at the top of the site, you can access and manage the currently available ML model configurations.

From this page, the button "Create New Model" allows you to create a new model configuration. Hover over the input fields/dropdowns/checkboxes to see a tooltip. **Note that your choice of classifier will impact which input modes are available to use! First choose a classifier, then an input mode.** Once you are done, click the "Save Configuration" button at the bottom to save the configuration. This will create the config and redirect you to the view page for your new config. There, you can see all available model configs, and select one for more detailed action.

Available actions on model configurations are currently to **train the model** and to **edit the configuration**. Training a model uses the CLI's `run` command, saving the trained model files in the database to be used for prediction later on. While editing the configuration, you can change any of the previously entered options, except for the model config's name.

### Predicting with Models
In the "Predict With ML Models" tab, you will see options to select any number of models, and select the project(s) they will be run on. Running these models means that they will be used to predict the design decision content of all issues in the target project(s). In this prediction form, you also have the option to create a **"query"** for this prediction. A query allows you to select and group issues and machine predictions into a view, so that not all data is displayed at once, and you can focus on what you're interested in.

### Classify Issues

In the "Classify Issues" page accessible from the site's navbar, you will find a list of available queries, as described above, and the option to create a new one. Clicking on any available query will lead you to the data table view of all issues and predictions as described by the query.

The issue key in the first column doubles as a link to the issue online, automatically opening in a new window. Clicking the "Classify" button in the second column opens a model, allowing you to change the manual classification of an issue or mark it for review. Also in this modal, you can view and place comments on this issue's manual classification. The current manual label of the issue is displayed in the third column (empty for no manual label currently existing). The fourth column allows you to view the summary and description of the issue in a popover, without having to leave the UI. All other columns are machine predictions.

If an issue is classified and not in review, it will be used in the training dataset for machine learning models. Changing an issue's classification or commenting on the manual label will add you as author to the manual label, so you can find back which issues you have already looked at. Clicking the "Mark for review" in the UI will flag the issue as needing review in the table view and take it out of the ML training set.

You can sort the table view by (shift-)clicking the arrows next to the column headers. Also note the search bar and pagination at the bottom.

### Statistics
The contents of this page will be the subject of the author's bachelor project.

### Login
In the Login view, you can log in with your username and password, which is required to have to change any data (you can read data without being logged in with a valid account). You can also set the database and pipeline URLs, that the UI will send its data requests to. It is worth noting that you are essentially logging in to the database, so if you change the database URL, you will need to log in again.

# Adapting or Extending this project
The project will be designed to be easy to extend for developers new to the project. This section describes details about the project and various ways to improve and grow it. When making changes to how the project is interacted with by users and developers, please keep this readme up to date as well.

## Project Details
This project is a webserver UI built to combine and display the results from various approaches to detect architectural knowledge in repositories. It is written in Python, using the Flask web framework, and uses Bootstrap for CSS. Basic familiarity with Python and theory behind web applications, such as endpoints, is assumed.

### Short Introduction to Flask
This section will introduce Flask as it is currently used in this project. If you change the structure, please also change this documentation.

The structure of the project is centered around Flask's approach to web servers. The `app/__init__.py` file initializes the app and endpoints. At the end of the `create_app` function in this file, the app's endpoints are registered, either through directly defining them (`@app.route(...)`) or through Flask's Blueprints (`app.register_blueprint(...)`). This is where you will add new blueprints or change existing ones.

In Flask, Blueprints function as endpoint categories. See the `app/blueprints/models.py` file as example. At the top of the file, the Blueprint object is created, which is imported by `app/__init__.py`. This object is used to register endpoints within the `app/blueprints/models.py` file. Note the `url_prefix` parameter in the Blueprint object creation, and note that this parameter is optional, in case you want a category of index-based endpoints without additional prefixes.

Each endpoint defined in blueprint files or in the `__init__.py::create_app` function itself will have a name, defined by the endpoint's function's name and if applicable the endpoint's blueprint's name, like so:

- If not in a blueprint: just the endpoint's function's name.
- If in a blueprint, or a nested blueprint, it will be the blueprint's name(s), followed by the endpoint's function's name, all separated by periods. (e.g. `foo.bar.function`)

These endpoint names are used to generate the page links in e.g. the navbar. See the navbar code in the `app/templates/base.html` file for examples.

Flask serves webpages based on Jinja templates, which are html files which can take parameters to generate content. The html files can be found in the templates directory. For an example of a template taking parameters to generate content, please see the `viewall()` endpoint in the `app/blueprints/models.py` file.

Flask template files can inherit from each other with a system called blocks: parent files will define blocks, and their child files can overwrite blocks entirely, overwrite partially (by calling `super()` within the overwriting block) or leave blocks as-is (by not stating the block in the child file). This project uses the Bootstrap base, the documentation of which provides more information, so please see the CSS link under the More Resources tab to learn more about this. For examples of this system, please see the templates within the `app/templates` directory.

Finally, Jinja provides several functionalities in template files other than blocks. For example usage of macros, see the `app/templates/models/form.html` file.

## Adding a new endpoint in an existing blueprint

- Locate the blueprint you want to put the new endpoint in
- Define the decorator (if in a blueprint, the `@bp.route(...)`; if in `__init__.py`, the `@app.route(...)`) with all necessary parameters. If the blueprint is hooked up correctly, the endpoint will automatically be accessible on the web server, either to browse to or through JS `fetch` commands in `scripts` blocks. **Do not forget the @ at the beginning of the decorator.**
- Define the function for what the endpoint must return/handle. Render a template or return something else.
	+ If you are rendering a template, you may need to create a new one in the `templates` directory. See the other templates for a format, or the documentation for more options.
- Does e.g. the navbar need to link to this new endpoint? Edit the `base.html` template.

## Creating a new endpoint category (Flask Blueprint)

- Create a new file according to the blueprint structure: either in the `app/blueprints` directory or in its own subdirectory. At the top, add the line `from flask import Blueprint`.
- Add the line `bp = Blueprint(...)`, or use whatever other name you like, and create routes as in other files.
- `register_blueprint` the newly created Blueprint wherever you need it, be it in another blueprint (nested blueprints) or straight in the `__init__.py` file.

## Custom CSS
There is a custom CSS file at `app/static/archui.css`. It is automatically included in the `base.html` template. Here, you can create custom CSS classes for use in your templates, should Bootstrap or in-line style not be sufficient.

Additionally, if you are building a script-heavy page, you can separate out the Javascript into its own `.js` file in the `app/static` folder. See the `scripts` block at the bottom of the `app/templates/mmodels/form.html` for usage examples.

# More resources
## External Documentation Links

- Flask: https://flask.palletsprojects.com/en/2.2.x/
- Bootstrap 5 (note the version - there are newer versions, but this project uses 5.0): https://getbootstrap.com/docs/5.0/getting-started/introduction/
- Bootstrap Icons: https://github.com/twbs/icons/releases/tag/v1.10.4 (in templates/classify/view.html)

## Notes on Python Version and Compatible Packages

- At time of writing, `flask-nav` is incompatible with Python 3.10 and up. This is unfortunate, because the CLI on which this interface builds is only available with Python 3.10 and up, while several of the CLI's dependencies are incompatible with Python 3.11. 
- There *is* a `flask-bootstrap` package, but it uses Bootstrap 3.7, which does not have all required functionality for the project. As such, the author has manually included Bootstrap in the `base.html` template.