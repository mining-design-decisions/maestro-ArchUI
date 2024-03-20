import React from "react";

export default function Root() {
  return (
    <>
      <div className="container mx-auto pb-4 pl-4 pr-4">
        {/* Home page info */}
        <div>
          <p className="text-4xl font-bold pb-4">Home Page</p>
          <p>
            ArchUI aims to combine various approaches to detecting architectural
            knowledge in Jira and Github repositories.
          </p>
          <p className="pt-4">
            Use the tabs in the navbar to view currently available ML models,
            create new ones, or run them on a project. Use the classify Issues
            tab to manually label issues. More detailed information on each tab
            is available under the divider and in the project readme.
          </p>
        </div>
        {/* Divider */}
        <hr className="mt-4 mb-4" />
        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto">
          {/* Left column */}
          <div>
            {/* ML Models: Word Embeddings */}
            <div>
              <p className="text-xl font-bold">ML Models: Word Embeddings</p>
              <p>
                Several machine learning model types require a word embedding to
                accurately generate features. Word embeddings can be managed:
                created, trained, deleted. Word embeddings fit with specific
                feature generators:
              </p>
              <ul className="list-disc pl-4">
                <li>
                  <em>Word2VecGenerator</em> embedding fits with{" "}
                  <em>Word2Vec</em> feature generator
                </li>
                <li>
                  <em>Doc2VecGenerator</em> embedding fits with <em>Doc2Vec</em>{" "}
                  feature generator
                </li>
                <li>
                  <em>DictionaryGenerator</em> embedding fits with{" "}
                  <em>BOWFrequency</em> and <em>BOWNormalized</em> feature
                  generators
                </li>
                <li>
                  <em>IDFGenerator</em> embedding fits with{" "}
                  <em>TfidfGenerator</em> feature generator
                </li>
              </ul>
              <p>Note that not all feature generators require an embedding.</p>
            </div>
            {/* Managing ML Models */}
            <div>
              <p className="text-xl pt-4 font-bold">Managing ML Models</p>
              <p>
                In this application, the term 'model' can refer to two things:
                either the model configuration, which is used by the ML
                pipeline, or the trained model data files. In the "ML Models"
                page, accessible from the navbar at the top of the site, you can
                access and manage the currently available ML model
                configurations.
              </p>

              <p>
                From this page, the button "Create New Model" allows you to
                create a new model configuration. Hover over the input
                fields/dropdowns/checkboxes to see a tooltip.{" "}
                <em>
                  Note that your choice of classifier will impact which input
                  modes are available to use! First choose a classifier, then an
                  input mode.
                </em>{" "}
                Once you are done, click the "Save Configuration" button at the
                bottom to save the configuration. This will create the config
                and redirect you to the view page for your new config. There,
                you can see all available model configs, and select one for more
                detailed action.
              </p>

              <p>
                Available actions on model configurations are currently to{" "}
                <b>train the model</b> and to <b>edit the configuration</b>.
                Training a model uses the CLI's `run` command, saving the
                trained model files in the database to be used for prediction
                later on. While editing the configuration, you can change any of
                the previously entered options, except for the model config's
                name.
              </p>
            </div>
            {/* Login */}
            <div>
              <p className="text-xl pt-4 font-bold">Login</p>
              <p>
                In the Login view, you can log in with your username and
                password, which is required to have to change any data (you can
                read data without being logged in with a valid account). You can
                also set the database and pipeline URLs, that the UI will send
                its data requests to. It is worth noting that you are
                essentially logging in to the database, so if you change the
                database URL, you will need to log in again.
              </p>
            </div>
            {/* ML Models: Ontologies */}
            <div>
              <p className="text-xl pt-4 font-bold">ML Models: Ontologies</p>
              <p>
                You can upload ontology files for use in word embeddings and ML
                models on the Ontologies page under ML models.{" "}
                <em>
                  Note that, for a model and the feature generator(s) it
                  includes, you must use the same ontology for each relevant
                  component: word embeddings and the general ontology training
                  parameter should all be using the same ontology file.
                </em>
              </p>
            </div>
          </div>
          {/* Right column */}
          <div>
            {/* ML Models: Predicting */}
            <div>
              <p className="text-xl font-bold">ML Models: Predicting</p>
              <p>
                In the "Predict With ML Models" tab, you will see options to
                select any number of models, and select the project(s) they will
                be run on. Running these models means that they will be used to
                predict the design decision content of all issues in the target
                project(s). In this prediction form, you also have the option to
                create a <b>"query"</b> for this prediction. A query allows you
                to select and group issues and machine predictions into a view,
                so that not all data is displayed at once, and you can focus on
                what you're interested in.
              </p>
            </div>
            {/* Classify Issues */}
            <div>
              <p className="text-xl pt-4 font-bold">Classify Issues</p>
              <p>
                In the "classify Issues" page accessible from the site's navbar,
                you will find a list of available queries, as described above,
                and the option to create a new one. Clicking on any available
                query will lead you to the data table view of all issues and
                predictions as described by the query.
              </p>

              <p>
                The issue key in the first column doubles as a link to the issue
                online, automatically opening in a new window. Clicking the
                "classify" button in the second column opens a model, allowing
                you to change the manual classification of an issue or mark it
                for review. Also in this modal, you can view and place comments
                on this issue's manual classification. The current manual label
                of the issue is displayed in the third column (empty for no
                manual label currently existing). The fourth column allows you
                to view the summary and description of the issue in a popover,
                without having to leave the UI. All other columns are machine
                predictions.
              </p>

              <p>
                If an issue is classified and not in review, it will be used in
                the training dataset for machine learning models. Changing an
                issue's classification or commenting on the manual label will
                add you as author to the manual label, so you can find back
                which issues you have already looked at. Clicking the "Mark for
                review" in the UI will flag the issue as needing review in the
                table view and take it out of the ML training set.
              </p>

              <p>
                You can sort the table view by (shift-)clicking the arrows next
                to the column headers. Also note the search bar and pagination
                at the bottom.
              </p>
            </div>
            {/* Statistics */}
            <div>
              <p className="text-xl pt-4 font-bold">Statistics</p>
              <p>
                In the statistics overview, generate a set of graphics to get an
                overview of the issue characteristics per project software
                domain, divided per label type.
              </p>
            </div>
            {/* Tags */}
            <div>
              <p className="text-xl pt-4 font-bold">Tags</p>
              <p>
                Tags are applied to issues and are used in queries to group
                issues which all have a certain (set of) tags together, for
                easier classification. In the tags overview, you can add and
                delete tags. Edit functionality is coming soon. In the query
                view, per issue, you can add tags to or remove tags from
                individual issues. Tags have a title and a description. In the
                query view, hover over the tag name to see the description in a
                tooltip.
              </p>
            </div>
            {/* Search */}
            <div>
              <p className="text-xl pt-4 font-bold">Search</p>
              <p>In the search tab, find relevant issues based on keywords.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
