import React, { useEffect, useState } from "react";
import {
  deleteRequest,
  downloadFileLink,
  getRequest,
  getRequestDlManager,
  postRequest,
  postRequestDlManager,
  putRequest,
  uploadFile,
} from "../util";
import { Modal } from "../../components/modal";
import { Button } from "../../components/button";
import {
  ArrowDownTray,
  ArrowUpTray,
  ChevronDown,
  ChevronUp,
  PencilIcon,
  PlusIcon,
  RocketLaunchIcon,
  TrashIcon,
} from "../../icons";
import {
  CheckBox,
  FileForm,
  Select,
  TextAreaForm,
  TextForm,
} from "../../components/forms";
import { GenerateForms, getInitialConfig, getParsedConfig } from "./components";

function ModelForms({ endpoints, prevData, fetchModels }) {
  if (endpoints === undefined) {
    return <>Loading data</>;
  }

  let [config, setConfig] = useState(
    getInitialConfig(endpoints["run"]["args"], prevData)
  );
  let [modelName, setModelName] = useState(
    prevData === undefined ? "" : prevData["model_name"]
  );
  let [openModal, setOpenModal] = useState(false);

  function postModel(modelId: string | null, message: string) {
    let url = modelId === null ? "/models" : `/models/${modelId}`;
    postRequest(
      url,
      {
        model_config: getParsedConfig(config, endpoints["run"]["args"]),
        model_name: modelName,
      },
      () => {
        fetchModels();
        alert(message);
      }
    );
  }

  return (
    <div>
      <Button
        label={prevData === undefined ? "Create Model" : "Update Config"}
        onClick={() => setOpenModal(true)}
        icon={prevData === undefined ? <PlusIcon /> : <PencilIcon />}
      />
      <Modal
        title={
          prevData === undefined
            ? "Create Model"
            : `Update Config (${prevData["model_id"]})`
        }
        body={
          <div>
            <TextForm
              label={"model-name"}
              value={modelName}
              onChange={(event) => setModelName(event.target.value)}
            />
            <GenerateForms
              endpoint={endpoints["run"]["args"]}
              endpointPath={[]}
              config={config}
              configPath={[]}
              setConfig={setConfig}
            />

            <div className="flex justify-between mt-2">
              {prevData === undefined ? (
                ""
              ) : (
                <Button
                  label={"Edit Model"}
                  onClick={() => {
                    postModel(prevData["model_id"], "Model updated");
                  }}
                  icon={<PencilIcon />}
                />
              )}
              <Button
                label={"Create New Model"}
                onClick={() => {
                  postModel(null, "Model created");
                }}
                color="green"
                icon={<ArrowUpTray />}
              />
            </div>
          </div>
        }
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </div>
  );
}

function ModelList({ modelsList, fetchModels }) {
  return (
    <>
      {modelsList.length === 0 ? (
        <p>No ML Models available</p>
      ) : (
        <div className="space-y-4">
          {modelsList.map((model) => {
            return (
              <Model
                key={model["model_id"]}
                modelId={model["model_id"]}
                modelName={model["model_name"]}
                fetchModels={fetchModels}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function ViewVersionOrPerformance({
  modelId,
  versionId,
  description,
  fetchVersions,
  name,
}) {
  let [openModal, setOpenModal] = useState(false);
  let [descriptionInput, setDescriptionInput] = useState(description);

  let [file, setFile] = useState<File | null>(null);
  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button label={"View"} onClick={() => setOpenModal(true)} />
      </div>

      <Modal
        title={"View " + name}
        body={
          <div className="space-y-4">
            <p className="text-sm italic">
              *Editing a {name} file is highly specialised and may render the
              {name} unusable. Proceed only if you know what you are doing.
            </p>
            <div className="flex space-x-2">
              <div className="w-full">
                <FileForm label={""} onChange={onFileChange} accept="" />
              </div>
              <Button
                label={"Replace file"}
                onClick={() => {
                  uploadFile(
                    "/models/" + modelId + "/" + name + "s/" + versionId,
                    "PUT",
                    file
                  );
                  fetchVersions();
                }}
                icon={<ArrowUpTray />}
              />
              <a
                href={downloadFileLink(
                  "/models/" + modelId + "/" + name + "s/" + versionId
                )}
                target="_blank"
              >
                <Button
                  label="Download file"
                  onClick={() => {}}
                  color="green"
                  icon={<ArrowDownTray />}
                />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-full">
                <TextForm
                  label={"description:"}
                  onChange={(event) => setDescriptionInput(event.target.value)}
                  value={descriptionInput}
                />
              </div>
              <Button
                label={"Edit description"}
                onClick={() => {
                  putRequest(
                    "/models/" +
                      modelId +
                      "/" +
                      name +
                      "s/" +
                      versionId +
                      "/description",
                    { description: descriptionInput },
                    () => {
                      fetchVersions();
                      alert("Description updated");
                    }
                  );
                }}
                icon={<PencilIcon />}
              />
            </div>
          </div>
        }
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </>
  );
}

function PredictWithVersion({ modelId, versionId }) {
  let [openModal, setOpenModal] = useState(false);
  let [queryInput, setQueryInput] = useState("");

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button label={"Predict"} onClick={() => setOpenModal(true)} />
      </div>

      <Modal
        title={"Predict issues"}
        body={
          <div className="flex items-center space-x-4 mt-2">
            <div className="w-full">
              <TextAreaForm
                label={"Issue query:"}
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
              />
            </div>
            <Button
              label="Predict issues"
              onClick={() => {
                postRequestDlManager(
                  "/predict",
                  {
                    model: modelId,
                    version: versionId,
                    "data-query": JSON.parse(queryInput),
                  },
                  () => alert("Predictions completed")
                );
              }}
            />
          </div>
        }
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </>
  );
}

function Metrics({ modelId, versionId }) {
  let [openModal, setOpenModal] = useState(false);
  let [config, setConfig] = useState({
    "classification-as-detection": false,
    epoch: "stopping-point",
    "include-non-arch": true,
    metrics: [],
  });

  let availableMetrics = {
    dataset: ["training", "validation", "testing"],
    metric: [
      "accuracy",
      "true_positives",
      "true_negatives",
      "false_positives",
      "false_negatives",
      "precision",
      "recall",
      "f_1_score",
      "f_beta_score",
      "specifity",
    ],
    variant: ["macro", "micro", "weighted", "class"],
  };

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button label={"Metrics"} onClick={() => setOpenModal(true)} />
      </div>

      <Modal
        title={"Get Metrics"}
        body={
          <div className="space-y-2">
            {["classification-as-detection", "include-non-arch"].map((key) => (
              <CheckBox
                key={key}
                label={key}
                checked={config[key]}
                onChange={() => {
                  let tmp = { ...config };
                  tmp[key] = !tmp[key];
                  setConfig(tmp);
                }}
              />
            ))}
            <TextForm
              label={"epoch"}
              value={config["epoch"]}
              onChange={(event) => {
                let tmp = { ...config };
                tmp["epoch"] = event.target.value;
                setConfig(tmp);
              }}
            />
            <div className="flex items-start space-x-2">
              <label>metrics</label>
              <div className="space-y-2 w-full">
                {config["metrics"].map((metric, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-500 rounded-lg p-2 space-y-2"
                  >
                    {Object.entries(availableMetrics).map(([key, values]) => (
                      <Select
                        key={key}
                        label={key}
                        value={config["metrics"][idx][key]}
                        options={values.map((value) => {
                          return {
                            label: value,
                            value: value,
                          };
                        })}
                        onChange={(event) => {
                          let tmp = { ...config };
                          tmp["metrics"][idx][key] = event.target.value;
                          setConfig(tmp);
                        }}
                      />
                    ))}
                    <div className="flex justify-center">
                      <Button
                        label={""}
                        onClick={() => {
                          let tmp = { ...config };
                          tmp["metrics"].splice(idx, 1);
                          setConfig(tmp);
                        }}
                        color="red"
                        icon={<TrashIcon />}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-center">
                  <Button
                    label={"Add Metric"}
                    onClick={() => {
                      let tmp = { ...config };
                      tmp["metrics"].push({
                        dataset: "training",
                        metric: "f_1_score",
                        variant: "macro",
                      });
                      setConfig(tmp);
                    }}
                    icon={<PlusIcon />}
                  />
                </div>
              </div>
            </div>
            <Button
              label={"Calculate Metrics"}
              onClick={() => {
                let tmp = { ...config };
                tmp["model-id"] = modelId;
                tmp["version-id"] = versionId;
                postRequestDlManager("/metrics", tmp, (data) => {
                  alert("Predictions completed");
                  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                    JSON.stringify(data)
                  )}`;
                  const link = document.createElement("a");
                  link.href = jsonString;
                  link.download = "metrics.json";
                  link.click();
                });
              }}
              icon={<RocketLaunchIcon />}
            />
          </div>
        }
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </>
  );
}

function VersionsOrPerformances({
  modelId,
  type,
}: {
  modelId: string;
  type: "version" | "performance";
}) {
  let [items, setItems] = useState([]);

  function fetchItems() {
    getRequest(`/models/${modelId}/${type}s`).then((data) =>
      setItems([...data[`${type}s`]])
    );
  }

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="">
      <div className="flex items-center space-x-4">
        <span className="text-3xl font-bold">
          {type === "version" ? "Versions" : "Performances"}
        </span>
        {type === "version" ? (
          <Button
            label={"Train New Version"}
            onClick={() => {
              postRequestDlManager("/train", { "model-id": modelId }, () => {
                fetchItems();
                alert("Model trained");
              });
            }}
            icon={<PlusIcon />}
          />
        ) : null}
      </div>

      {items.length === 0 ? (
        <p>No {type} available</p>
      ) : (
        <>
          <ul className="list-disc pl-4 pt-4 space-y-4">
            {items.map((item) => (
              <li key={item[`${type}_id`]}>
                <div className="flex items-center space-x-4">
                  <span>
                    {item["description"]} ({item[`${type}_id`]})
                  </span>
                  <ViewVersionOrPerformance
                    modelId={modelId}
                    versionId={item[`${type}_id`]}
                    description={item["description"]}
                    fetchVersions={fetchItems}
                    name={type}
                  />
                  {type === "version" ? (
                    <PredictWithVersion
                      modelId={modelId}
                      versionId={item[`${type}_id`]}
                    />
                  ) : (
                    <Metrics
                      modelId={modelId}
                      versionId={performance["performance_id"]}
                    />
                  )}
                  <Button
                    label={""}
                    onClick={() =>
                      deleteRequest(
                        "/models/" +
                          modelId +
                          "/versions/" +
                          item[`${type}_id`],
                        () => {
                          fetchItems();
                          alert("Version deleted");
                        }
                      )
                    }
                    color="red"
                    icon={<TrashIcon />}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Model({ modelId, modelName, fetchModels }) {
  let [showModel, setShowModel] = useState(false);

  return (
    <div className="space-y-1">
      <button
        className="flex items-center justify-between space-x-4 bg-gray-500 p-2 rounded-lg w-full"
        onClick={() => setShowModel((prevState) => !prevState)}
      >
        <span>{`${modelName} (${modelId})`}</span>
        {showModel ? <ChevronUp /> : <ChevronDown />}
      </button>

      {showModel ? (
        <div className="space-y-4 bg-gray-600 p-4 rounded-lg">
          <div className="flex justify-between">
            <UpdateModelConfig modelId={modelId} fetchModels={fetchModels} />
            <Button
              label={"Delete Model"}
              onClick={() => {
                deleteRequest("/models/" + modelId, () => {
                  fetchModels();
                  alert("Model deleted");
                });
              }}
              color="red"
              icon={<TrashIcon />}
            />
          </div>

          <div className="border border-gray-500 rounded-lg p-2">
            <VersionsOrPerformances modelId={modelId} type={"version"} />
          </div>

          <div className="border border-gray-500 rounded-lg p-2">
            <VersionsOrPerformances modelId={modelId} type={"performance"} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConfigForms({ prevData, fetchModels }) {
  let [endpoints, setEndpoints] = useState(undefined);

  useEffect(() => {
    getRequestDlManager("/endpoints").then((data) =>
      setEndpoints(data["commands"])
    );
  }, []);

  return (
    <ModelForms
      endpoints={endpoints}
      prevData={prevData}
      fetchModels={fetchModels}
    />
  );
}

function UpdateModelConfig({ modelId, fetchModels }) {
  let [prevData, setPrevData] = useState(undefined);

  useEffect(() => {
    getRequest("/models/" + modelId).then((data) => setPrevData(data));
  }, []);

  if (prevData !== undefined) {
    return <ConfigForms prevData={prevData} fetchModels={fetchModels} />;
  }
  return <></>;
}

function CreateNewModel({ fetchModels }) {
  return <ConfigForms prevData={undefined} fetchModels={fetchModels} />;
}

export default function MLModels() {
  let [modelsList, setModelsList] = useState([]);

  function fetchModels() {
    getRequest("/models").then((data) => setModelsList(data["models"]));
  }

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="container mx-auto space-y-4">
      <CreateNewModel fetchModels={fetchModels} />
      <ModelList modelsList={modelsList} fetchModels={fetchModels} />
    </div>
  );
}
