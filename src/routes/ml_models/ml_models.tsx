import React, { useEffect, useState } from "react";

function CheckBox({ name, value, onChange }) {
  return (
    <div className="flex mt-4 text-white justify-between">
      <label className="md:w-2/3 block">{name}</label>
      <input
        className="mr-2 leading-tight"
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(!value)}
      />
    </div>
  );
}

function DropDown({ name, options, value, onChange }) {
  return (
    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
      <label>{name}</label>
      <div className="flex relative">
        <select
          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={value === null ? "null" : value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((x) => {
            return (
              <option key={x} value={x}>
                {x}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function InputNumber({ name, value, onChange }) {
  return (
    <div key={name} className="flex mt-4 text-white justify-between">
      <label className="md:w-2/3 block">{name}</label>
      <input
        key={name}
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
        type="number"
        value={value === null ? 0 : value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function InputText({ name, value, onChange }) {
  return (
    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
      <label>{name}</label>
      <div className="flex relative">
        <input
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          value={value === null ? "" : value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function ModelForms({ arglists }) {
  let [modelName, setModelName] = useState("");
  let [numModels, setNumModels] = useState(1);
  let [modelConfigs, setModelConfigs] = useState<any[]>([]);
  let [ensembleMethod, setEnsembleMethod] = useState<
    "stacking" | "combination"
  >("combination");
  let [ensembleConfig, setEnsembleConfig] = useState(undefined);
  let [stackingModel, setStackingModel] = useState<string | undefined>(
    undefined
  );
  let [combinationModel, setCombinationModel] = useState<string | undefined>(
    undefined
  );

  let [upSampler, setUpSampler] = useState<string | undefined>(undefined);
  let [upSamplerConfig, setUpSamplerConfig] = useState(undefined);

  let [showEnsembleForm, setShowEnsembleForm] = useState<"visible" | "hidden">(
    "hidden"
  );
  let [showModelForms, setShowModelForms] = useState<("visible" | "hidden")[]>(
    []
  );
  let [showUpSamplerForm, setShowUpSamplerForm] = useState<
    "visible" | "hidden"
  >("hidden");

  let [showRunForm, setShowRunForm] = useState<"visible" | "hidden">("hidden");
  let [runConfig, setRunConfig] = useState(undefined);

  function postModel() {
    let request = {
      method: "POST",
      headers: {
        Authorization: "bearer " + token,
        "Content-Type": "application/json",
      },
    };

    let body = {
      model_name: modelName,
      model_config: {},
    };
    Object.keys(runConfig).map((key) => {
      body["model_config"][key] = runConfig[key];
    });
    request["body"] = body;
    console.log(request);

    // fetch("https://localhost:8000/models/", request)
    //   .then((response) => response.json())
    //   .then((result) => {
    //     console.log(result);
    //   });
  }
  function updateNumModels(value) {
    let defaultConfigs = [];
    let tmpShowModelForms: ("visible" | "hidden")[] = [];
    for (let i = 0; i < value - modelConfigs.length; i++) {
      defaultConfigs.push({ ...arglists["default-config"] });
      tmpShowModelForms.push("hidden");
    }
    setModelConfigs(modelConfigs.concat(defaultConfigs));
    setNumModels(value);
    setShowModelForms(showModelForms.concat(tmpShowModelForms));
  }
  function Form(type, name, value, onChange, readableOptions) {
    if (type === "int" || type === "float") {
      return (
        <InputNumber key={name} name={name} value={value} onChange={onChange} />
      );
    }
    if (
      (type === "str" || type === "enum") &&
      Array.isArray(readableOptions) &&
      readableOptions.length > 0
    ) {
      return (
        <DropDown
          key={name}
          name={name}
          options={readableOptions}
          value={value}
          onChange={onChange}
        />
      );
    }
    if (type === "str" || type === "query") {
      return (
        <InputText key={name} name={name} value={value} onChange={onChange} />
      );
    }
    if (type === "bool") {
      return (
        <CheckBox key={name} name={name} value={value} onChange={onChange} />
      );
    }
    if (type === "arglist" || type === "hyper_arglist") {
      return;
    }
    if (type === "dynamic_enum") {
      return;
    }
    console.log("unsuppported type", type, name);
  }
  function Forms(config, index, currentParam, header) {
    let selected = config["selected"][currentParam];
    return (
      <>
        {arglists[currentParam][selected].map((item) => {
          if (item["name"] === "optimizer-params") {
            return Object.keys(item["spec"]).map((optimizer) => {
              return Object.keys(item["spec"][optimizer]).map((param) => {
                return Form(
                  item["spec"][optimizer][param]["type"],
                  optimizer + "-" + item["spec"][optimizer][param]["name"],
                  config[currentParam][selected][item["name"]][optimizer][0][
                    param
                  ],
                  (value) => {
                    let tmp = [...modelConfigs];
                    tmp[index][currentParam][selected][item["name"]][
                      optimizer
                    ][0][param] = value;
                    setModelConfigs(tmp);
                  },
                  item["spec"][optimizer][param]["readable-options"]
                );
              });
            });
          }
          return Form(
            item["type"],
            item["name"],
            modelConfigs[index][currentParam][selected][item["name"]],
            (value) => {
              let tmp = [...modelConfigs];
              tmp[index][currentParam][selected][item["name"]] = value;
              setModelConfigs(tmp);
            },
            item["readable-options"]
          );
        })}
      </>
    );
  }
  function EnsembleForm(selected, config, currentParam, header) {
    return (
      <>
        {arglists[currentParam][selected].map((item) => {
          if (item["name"] === "optimizer-params") {
            return Object.keys(item["spec"]).map((optimizer) => {
              return Object.keys(item["spec"][optimizer]).map((param) => {
                return Form(
                  item["spec"][optimizer][param]["type"],
                  optimizer + "-" + item["spec"][optimizer][param]["name"],
                  config[currentParam][selected][item["name"]][optimizer][0][
                    param
                  ],
                  (value) => {
                    let tmp = { ...ensembleConfig };
                    tmp[currentParam][selected][item["name"]][optimizer][0][
                      param
                    ] = value;
                    setEnsembleConfig(tmp);
                  },
                  item["spec"][optimizer][param]["readable-options"]
                );
              });
            });
          }
          return Form(
            item["type"],
            item["name"],
            config[currentParam][selected][item["name"]],
            (value) => {
              let tmp = { ...ensembleConfig };
              tmp[currentParam][selected][item["name"]] = value;
              setEnsembleConfig(tmp);
            },
            item["readable-options"]
          );
        })}
      </>
    );
  }
  function UpSamplerForm(selected, config, header) {
    return (
      <>
        {arglists["upsampler-params"][selected].map((item) => {
          return Form(
            item["type"],
            item["name"],
            config[selected][item["name"]],
            (value) => {
              let tmp = { ...upSamplerConfig };
              tmp[selected][item["name"]] = value;
              setUpSamplerConfig(tmp);
            },
            item["readable-options"]
          );
        })}
      </>
    );
  }
  function RunForm(config) {
    return (
      <>
        {arglists["commands"][0]["args"].map((item) => {
          let type = item["type"];
          let options = item["options"];
          return (
            <div key={item["name"]}>
              {Form(
                type,
                item["name"],
                config[item["name"]],
                (value) => {
                  let tmp = { ...runConfig };
                  tmp[item["name"]] = value;
                  setRunConfig(tmp);
                },
                options
              )}
              {config[item["name"]] !== "upsample" ? (
                ""
              ) : (
                <div>
                  <button
                    className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => {
                      setShowUpSamplerForm(
                        showUpSamplerForm === "visible" ? "hidden" : "visible"
                      );
                    }}
                  >
                    <span className="text-2xl font-bold">UpSampler</span>
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </button>
                  <div className={showUpSamplerForm}>
                    <DropDown
                      name="upsampler"
                      options={Object.keys(upSamplerConfig)}
                      value={upSampler}
                      onChange={(value) => setUpSampler(value)}
                    />
                    {UpSamplerForm(
                      upSampler,
                      upSamplerConfig,
                      "Upsampler Parameters"
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  }
  if (arglists === undefined) {
    return <p>Loading form from the DL Manager</p>;
  } else if (ensembleConfig === undefined) {
    setEnsembleConfig({
      ...arglists["default-ensemble-config"],
    });
    setCombinationModel(
      Object.keys(arglists["default-ensemble-config"]["combination"])[0]
    );
    setStackingModel(
      Object.keys(arglists["default-ensemble-config"]["stacking"])[0]
    );

    // upsampler
    setUpSamplerConfig({
      ...arglists["default-upsampler-config"],
    });
    setUpSampler(Object.keys(arglists["default-upsampler-config"])[0]);

    // run config
    setRunConfig({
      ...arglists["default-run-config"],
    });
  }
  if (modelConfigs.length < numModels) {
    updateNumModels(numModels);
  }
  return (
    <>
      <InputText
        name="model-name"
        value={modelName}
        onChange={(value) => setModelName(value)}
      />
      <InputNumber
        name="number-of-classifiers"
        value={numModels}
        onChange={(value) => {
          updateNumModels(value);
        }}
      />

      {runConfig === undefined ? (
        ""
      ) : (
        <div>
          <button
            className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              setShowRunForm(showRunForm === "visible" ? "hidden" : "visible");
            }}
          >
            <span className="text-2xl font-bold">Run Parameters</span>
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </button>
          <div className={showRunForm}>{RunForm(runConfig)}</div>
        </div>
      )}

      {modelConfigs.map((config, index) => {
        if (index < numModels) {
          return (
            <div key={index}>
              <button
                className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => {
                  let tmp = [...showModelForms];
                  tmp[index] = tmp[index] === "visible" ? "hidden" : "visible";
                  setShowModelForms(tmp);
                }}
              >
                <span className="text-2xl font-bold">Model {index}</span>
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </button>
              <div className={showModelForms[index]}>
                <DropDown
                  name="feature-generator"
                  options={Object.keys(config["params"])}
                  value={config["selected"]["params"]}
                  onChange={(value) => {
                    let tmp = [...modelConfigs];
                    tmp[index]["selected"]["params"] = value;
                    setModelConfigs(tmp);
                  }}
                />
                {Forms(config, index, "params", "Feature Generator Parameters")}
                <DropDown
                  name="classifier"
                  options={Object.keys(config["hyper-params"])}
                  value={config["selected"]["hyper-params"]}
                  onChange={(value) => {
                    let tmp = [...modelConfigs];
                    tmp[index]["selected"]["hyper-params"] = value;
                    setModelConfigs(tmp);
                  }}
                />
                {Forms(config, index, "hyper-params", "Hyperparameters")}
              </div>
            </div>
          );
        }
      })}

      {numModels > 1 ? (
        <>
          <div>
            <button
              className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={() =>
                setShowEnsembleForm(
                  showEnsembleForm === "visible" ? "hidden" : "visible"
                )
              }
            >
              <span className="text-2xl font-bold">Ensemble Model</span>
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </button>
            <div className={"border " + showEnsembleForm}>
              <DropDown
                name="ensemble-method"
                options={["stacking", "combination"]}
                value={ensembleMethod}
                onChange={(value) => setEnsembleMethod(value)}
              />
              {ensembleMethod === "combination" ? (
                <DropDown
                  name="combination-model"
                  options={Object.keys(ensembleConfig[ensembleMethod])}
                  value={combinationModel}
                  onChange={(value) => setCombinationModel(value)}
                />
              ) : (
                <DropDown
                  name="stacking-model"
                  options={Object.keys(ensembleConfig[ensembleMethod])}
                  value={stackingModel}
                  onChange={(value) => setStackingModel(value)}
                />
              )}
              {ensembleMethod === "combination"
                ? EnsembleForm(
                    combinationModel,
                    ensembleConfig,
                    "combination",
                    "Combination Parameters"
                  )
                : EnsembleForm(
                    stackingModel,
                    ensembleConfig,
                    "stacking",
                    "Stacking Parameters"
                  )}
            </div>
          </div>
        </>
      ) : (
        ""
      )}

      <button
        className="flex items-center space-x-4 mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={postModel}
      >
        <span className="text-2xl font-bold">Create Model</span>
      </button>
    </>
  );
}

function CreateOrUpdateModel() {
  let [arglists, setArglists] = useState<undefined | Object>(undefined);

  function fetchArglists() {
    let url = "https://localhost:9011";
    Promise.all([
      fetch(url + "/arglists/run/params"),
      fetch(url + "/arglists/run/hyper-params"),
      fetch(url + "/arglists/run/upsampler-params"),
      fetch(url + "/arglists/run/combination-model-hyper-params"),
      fetch(url + "/arglists/run/stacking-meta-classifier-hyper-parameters"),
      fetch(url + "/endpoints"),
      fetch(url + "/run/dynamic-enums"),
    ])
      .then((results) => Promise.all(results.map((result) => result.json())))
      .then((results) => {
        let defaultConfig = {
          selected: {
            params: Object.keys(results[0])[0],
            "hyper-params": Object.keys(results[1])[0],
            // training: Object.keys(arglists["training"])[0],
          },
          params: {},
          "hyper-params": {},
          training: {},
        };
        function createDefaultConfig(type, index) {
          for (let key in results[index]) {
            let settings = {};
            for (let item of results[index][key]) {
              settings[item["name"]] = item["default"];
            }
            defaultConfig[type][key] = { ...settings };
          }
        }
        createDefaultConfig("params", 0);
        createDefaultConfig("hyper-params", 1);

        // Upsampler default config
        let defaultUpsamplerConfig = {};
        for (let key in results[2]) {
          let settings = {};
          for (let item of results[2][key]) {
            settings[item["name"]] = item["default"];
          }
          defaultUpsamplerConfig[key] = { ...settings };
        }

        // Ensemble default config
        let defaultEnsembleConfig = {
          combination: {},
          stacking: {},
        };
        // combination
        for (let key in results[3]) {
          let settings = {};
          for (let item of results[3][key]) {
            settings[item["name"]] = item["default"];
          }
          defaultEnsembleConfig["combination"][key] = { ...settings };
        }
        // stacking
        for (let key in results[4]) {
          let settings = {};
          for (let item of results[4][key]) {
            settings[item["name"]] = item["default"];
          }
          defaultEnsembleConfig["stacking"][key] = { ...settings };
        }

        // Run default config
        let defaultRunConfig = {};
        results[5]["commands"][0]["args"].map((item, index) => {
          if (item["name"] === "model-id") {
            // model-id not needed
            results[5]["commands"][0]["args"].splice(index, 1);
          }
          if (item["type"] === "dynamic_enum") {
            return;
            // defaultRunConfig[item["name"]] = results[6][item["name"]][0];
          } else if (
            item["type"] === "arglist" ||
            item["type"] === "hyper_arglist"
          ) {
            defaultRunConfig[item["name"]] = {};
          } else if (item["type"] === "query") {
            defaultRunConfig[item["name"]] = "";
          } else {
            defaultRunConfig[item["name"]] =
              item["default"] === undefined ? null : item["default"];
          }
        });

        setArglists({
          params: results[0],
          "hyper-params": results[1],
          "upsampler-params": results[2],
          combination: results[3],
          stacking: results[4],
          commands: results[5]["commands"],
          "run-dynamic-enums": results[6],
          "default-config": defaultConfig,
          "default-upsampler-config": defaultUpsamplerConfig,
          "default-ensemble-config": defaultEnsembleConfig,
          "default-run-config": defaultRunConfig,
        });
      });
  }

  useEffect(() => {
    fetchArglists();
  }, []);

  return <ModelForms arglists={arglists} />;
}

function ModelList({ setCurrentModelId, setCurrentView }) {
  let [modelsList, setModelsList] = useState([]);

  function fetchModels() {
    fetch("https://localhost:8000/models", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setModelsList(data["models"]);
      });
  }

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <>
      <p className="text-2xl font-bold pt-4">Existing Models</p>
      {modelsList.length === 0 ? (
        <p>No ML Models available</p>
      ) : (
        <ul className="list-disc pl-4">
          {modelsList.map((model) => {
            return (
              <li key={model["model_id"]}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentModelId(model["model_id"]);
                    setCurrentView("model");
                  }}
                >
                  {model["model_name"]} - {model["model_id"]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function Model({ currentModelId }) {
  let [modelInfo, setModelInfo] = useState({});
  let [versions, setVersions] = useState([]);
  let [performances, setPerformances] = useState([]);

  function fetchModel() {
    fetch("https://localhost:8000/models/" + currentModelId, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setModelInfo({ ...data });
      });
  }
  function Versions() {
    return (
      <div className="mt-4">
        <p className="text-3xl font-bold">Versions</p>
        {/* Create version button */}
        {versions.length === 0 ? (
          <p>No versions available</p>
        ) : (
          <>
            {versions.map((version) => {
              <li>
                {version["version_id"]} - {version["description"]}
                {/* Download version file */}
                {/* Delete version */}
                {/* Delete version predictions */}
              </li>;
            })}
          </>
        )}
      </div>
    );
  }
  function Performances() {
    return (
      <div className="mt-4">
        <p className="text-3xl font-bold">Performances</p>
        {/* Create performance */}
        {performances.length === 0 ? (
          <p>No performances available</p>
        ) : (
          <>
            {performances.map((performance) => {
              <li>
                {performance["performance_id"]} - {performance["description"]}
                {/* Download performance */}
                {/* Delete performance */}
              </li>;
            })}
          </>
        )}
      </div>
    );
  }

  if (currentModelId !== undefined) {
    useEffect(() => {
      fetchModel();
    }, []);
  }

  return (
    <>
      <ul className="list-disc pl-4 pt-4">
        <li key="1">{modelInfo["model_id"]}</li>
        <li key="2">{modelInfo["model_name"]}</li>
        <li key="3">{JSON.stringify(modelInfo["model_config"])}</li>
      </ul>
      {/* Update model */}
      {/* delete model */}

      <Versions />
      <Performances />
    </>
  );
}

export default function MLModels() {
  let [currentView, setCurrentView] = useState<
    "model-list" | "model" | "model-forms"
  >("model-list");
  let [currentModelId, setCurrentModelId] = useState<string | undefined>(
    undefined
  );
  return (
    <>
      {currentView === "model-forms" ? (
        ""
      ) : (
        <button
          className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => setCurrentView("model-forms")}
        >
          Create New Model
        </button>
      )}
      {currentView === "model-forms" ? <CreateOrUpdateModel /> : ""}
      {currentView === "model-list" ? (
        <ModelList
          setCurrentModelId={setCurrentModelId}
          setCurrentView={setCurrentView}
        />
      ) : (
        ""
      )}
      {currentView === "model" ? (
        <>
          <button
            className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              setCurrentView("model-list");
            }}
          >
            Return
          </button>
          <Model currentModelId={currentModelId} />
        </>
      ) : (
        ""
      )}
    </>
  );
}
