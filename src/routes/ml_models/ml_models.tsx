import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
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

function ModelForms({ endpoints, prevData, setCurrentView }) {
  if (endpoints === undefined) {
    return <>Loading data</>;
  }

  // Initialize config
  function getDefaultParamValue(param) {
    switch (param["argument_type"]) {
      case "list": {
        if (Array.isArray(param["default"])) {
          return param["default"];
        } else {
          return [];
        }
      }
      case "nested": {
        return {};
      }
      case "enum": {
        return param["options"][0];
      }
      case "dynamic-enum": {
        return param["options"][0];
      }
      case "string": {
        return param["default"] === null ? "" : param["default"];
      }
      case "query": {
        return param["default"] === null ? "" : param["default"];
      }
      case "int": {
        return param["default"] === null ? 1 : param["default"];
      }
      default: {
        return param["default"];
      }
    }
  }

  let tmp = {};
  for (const [key, value] of Object.entries(endpoints["run"]["args"])) {
    if (prevData !== undefined && key in prevData["model_config"]) {
      tmp[key] = prevData["model_config"][key];
      if (value["argument_type"] === "nested" && tmp[key] === null) {
        tmp[key] = {};
      }
    } else {
      tmp[key] = getDefaultParamValue(value);
    }
  }
  let [config, setConfig] = useState(tmp);
  let [modelName, setModelName] = useState(
    prevData === undefined ? "" : prevData["model_name"]
  );

  console.log(config);

  function getNestedValue(object, path) {
    if (path.length === 0) {
      return object;
    }
    if (path.length > 1) {
      return getNestedValue(object[path[0]], path.slice(1));
    }
    return object[path[0]];
  }

  function generateForms(endpointPath, configPath) {
    let params = getNestedValue({ ...endpoints["run"]["args"] }, endpointPath);

    return (
      <div>
        {Object.entries(params).map(([key, value]) => {
          let form;
          if (
            value["argument_type"] === "string" ||
            value["argument_type"] === "query"
          ) {
            form = (
              <input
                className="p-1 rounded-lg bg-gray-700"
                value={getNestedValue(config, configPath.concat([key]))}
                onChange={(event) => {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[key] = event.target.value;
                  setConfig(tmp);
                }}
              />
            );
          } else if (value["argument_type"] === "int") {
            form = (
              <input
                className="p-1 rounded-lg bg-gray-700"
                value={getNestedValue(config, configPath.concat([key]))}
                onChange={(event) => {
                  let value = Number(event.target.value);
                  if (Number.isInteger(value)) {
                    let tmp = { ...config };
                    getNestedValue(tmp, configPath)[key] = value;
                    setConfig(tmp);
                  }
                }}
              />
            );
          } else if (value["argument_type"] === "float") {
            form = (
              <input
                className="p-1 rounded-lg bg-gray-700"
                value={getNestedValue(config, configPath.concat([key]))}
                onChange={(event) => {
                  let value = Number(event.target.value);
                  if (!Number.isNaN(value)) {
                    let tmp = { ...config };
                    getNestedValue(tmp, configPath)[key] = value;
                    setConfig(tmp);
                  }
                }}
              />
            );
          } else if (
            value["argument_type"] === "enum" ||
            value["argument_type"] === "dynamic-enum"
          ) {
            form = (
              <select
                className="p-1 rounded-lg bg-gray-700"
                value={getNestedValue(config, configPath.concat([key]))}
                onChange={(event) => {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[key] = event.target.value;
                  setConfig(tmp);
                }}
              >
                {value["options"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            );
          } else if (value["argument_type"] === "bool") {
            form = (
              <input
                type="checkbox"
                checked={getNestedValue(config, configPath)[key]}
                onChange={(event) => {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[key] = event.target.checked;
                  setConfig(tmp);
                }}
              />
            );
          } else if (value["argument_type"] === "list") {
            form = (
              <div>
                {getNestedValue(config, configPath.concat([key])).map(
                  (item, idx) => (
                    <div key={idx} className="mb-2 flex items-center space-x-4">
                      {Array.isArray(value["readable-options"]) ? (
                        <select
                          className="p-1 rounded-lg bg-gray-700"
                          value={item}
                          onChange={(event) => {
                            let tmp = { ...config };
                            getNestedValue(tmp, configPath)[key][idx] =
                              event.target.value;
                            setConfig(tmp);
                          }}
                        >
                          {value["readable-options"].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="p-1 rounded-lg bg-gray-700"
                          value={item}
                          onChange={(event) => {
                            let tmp = { ...config };
                            getNestedValue(tmp, configPath)[key][idx] =
                              event.target.value;
                            setConfig(tmp);
                          }}
                        />
                      )}
                      <button
                        className="flex bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => {
                          let tmp = { ...config };
                          getNestedValue(tmp, configPath)[key].splice(idx, 1);
                          setConfig(tmp);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  )
                )}
                <button
                  className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => {
                    let tmp = { ...config };
                    getNestedValue(tmp, configPath)[key].push(
                      value["readable-options"][0]
                    );
                    setConfig(tmp);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>
            );
          } else if (value["argument_type"] === "nested") {
            form = (
              <>
                <div className="flex items-center">
                  <select
                    id={"select" + key}
                    className="p-1 rounded-lg bg-gray-700"
                  >
                    {Object.keys(value["spec"]).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <button
                    className="flex ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => {
                      let tmp = { ...config };
                      let selected = document.getElementById(
                        "select" + key
                      ).value;
                      let defaultConfig = {};
                      for (const [innerParam, innerValue] of Object.entries(
                        value["spec"][selected]
                      )) {
                        defaultConfig[innerParam] =
                          getDefaultParamValue(innerValue);
                      }
                      let nestedValue = getNestedValue(tmp, configPath)[key];
                      let idx = 0;
                      while (selected + "." + idx in nestedValue) {
                        idx++;
                      }
                      nestedValue[selected + "." + idx] = defaultConfig;
                      setConfig(tmp);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </div>
                <div className="ml-8">
                  {Object.entries(
                    getNestedValue(config, configPath.concat([key]))
                  ).map(([innerName, innerValue]) => (
                    <div key={innerName} className="border-2 rounded-lg mt-4">
                      <div className="m-2">
                        <div className="flex items-center">
                          <span className="text-xl font-bold">{innerName}</span>
                          <button
                            className="flex ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={() => {
                              let tmp = { ...config };
                              let nestedValue = getNestedValue(tmp, configPath)[
                                key
                              ];
                              delete nestedValue[innerName];
                              let idx = Number(innerName.split(".")[1]) + 1;
                              while (
                                innerName.split(".")[0] + "." + idx in
                                nestedValue
                              ) {
                                nestedValue[
                                  innerName.split(".")[0] + "." + (idx - 1)
                                ] =
                                  nestedValue[
                                    innerName.split(".")[0] + "." + idx
                                  ];
                                delete nestedValue[
                                  innerName.split(".")[0] + "." + idx
                                ];
                                idx++;
                              }
                              setConfig(tmp);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                        {generateForms(
                          endpointPath.concat([
                            key,
                            "spec",
                            innerName.split(".")[0],
                          ]),
                          configPath.concat([key, innerName])
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          } else {
            form = "";
            console.log("unsupported", key, value["argument_type"]);
          }
          return (
            <div key={key} className="mt-8">
              <div className="flex items-start">
                <span>
                  {key} ({value["argument_type"]})
                </span>
                <div className="group relative w-max">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                    />
                  </svg>
                  <span className="absolute w-40 pointer-events-none -top-7 left-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gray-500 rounded-lg p-1">
                    {value["description"]}
                  </span>
                </div>
              </div>
              <div>{form}</div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-4">
        {prevData === undefined ? (
          <>
            <button
              onClick={() => setCurrentView("model-list")}
              className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Exit
            </button>
            <p className="text-2xl font-bold">Create Model</p>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentView("model")}
              className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Exit
            </button>
            <p className="text-2xl font-bold">
              Edit Model ({prevData["model_id"]})
            </p>
          </>
        )}
      </div>

      <p className="mt-4">model-name</p>
      <input
        className="p-1 rounded-lg bg-gray-700"
        value={modelName}
        onChange={(event) => setModelName(event.target.value)}
      />
      {generateForms([], [])}

      <div className="flex">
        <button
          className="flex mt-8 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => {
            postRequest("/models", {
              model_config: config,
              model_name: modelName,
            });
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          Create Model
        </button>
        {prevData === undefined ? (
          ""
        ) : (
          <button
            className="flex mt-8 ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => {
              postRequest("/models/" + prevData["model_id"], {
                model_config: config,
                model_name: modelName,
              });
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Edit Model
          </button>
        )}
      </div>
    </div>
  );
}

function CreateOrUpdateModel({ currentModelId, setCurrentView }) {
  let [endpoints, setEndpoints] = useState(undefined);
  let [prevData, setPrevData] = useState(undefined);

  function fetchEndpoints() {
    getRequestDlManager("/endpoints").then((data) =>
      setEndpoints(data["commands"])
    );
  }

  function fetchModel() {
    if (currentModelId !== undefined) {
      getRequest("/models/" + currentModelId).then((data) => setPrevData(data));
    }
  }

  useEffect(() => {
    fetchEndpoints();
    fetchModel();
  }, []);

  return (
    <ModelForms
      endpoints={endpoints}
      prevData={prevData}
      setCurrentView={setCurrentView}
    />
  );
}

function ModelList({ setCurrentModelId, setCurrentView }) {
  let [modelsList, setModelsList] = useState([]);

  function fetchModels() {
    getRequest("/models").then((data) => setModelsList(data["models"]));
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
        <ul className="list-disc pl-4 space-y-4">
          {modelsList.map((model) => {
            return (
              <li key={model["model_id"]}>
                <div className="flex items-center space-x-4">
                  <button
                    className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => {
                      setCurrentModelId(model["model_id"]);
                      setCurrentView("model");
                    }}
                  >
                    {model["model_name"]} ({model["model_id"]})
                  </button>
                  <button
                    className="flex bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() => {
                      deleteRequest(
                        "/models/" + model["model_id"],
                        fetchModels
                      );
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Delete Model
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function EditVersion({ modelId, versionId, description, fetchVersions }) {
  let [openModal, setOpenModal] = useState(false);
  let [descriptionInput, setDescriptionInput] = useState(description);

  let [file, setFile] = useState<File | null>(null);
  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  console.log(descriptionInput);

  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => setOpenModal(true)}
        >
          {description} ({versionId})
        </button>
      </div>

      <Transition appear show={openModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 text-white"
          onClose={() => setOpenModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="m-4 w-fill transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-white"
                  >
                    Edit version
                  </Dialog.Title>

                  {/* Body */}
                  <div className="flex items-center space-x-4 mt-2">
                    <input
                      onChange={onFileChange}
                      type="file"
                      className="p-1 rounded-lg bg-gray-500"
                    />
                    <button
                      onClick={() => {
                        uploadFile(
                          "/models/" + modelId + "/versions/" + versionId,
                          "PUT",
                          file
                        );
                      }}
                      className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Replace file
                    </button>
                  </div>
                  <a
                    href={downloadFileLink(
                      "/models/" + modelId + "/versions/" + versionId
                    )}
                    target="_blank"
                  >
                    <button className="flex mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">
                      Download file
                    </button>
                  </a>
                  <button
                    onClick={() =>
                      deleteRequest(
                        "/models/" + modelId + "/versions/" + versionId
                      )
                    }
                    className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                  >
                    Delete file
                  </button>
                  <div className="flex items-center space-x-4 mt-2">
                    <input
                      value={descriptionInput}
                      onChange={(event) =>
                        setDescriptionInput(event.target.value)
                      }
                      className="p-1 rounded-lg bg-gray-500"
                    />
                    <button
                      onClick={() => {
                        putRequest(
                          "/models/" +
                            modelId +
                            "/versions/" +
                            versionId +
                            "/description",
                          { description: descriptionInput },
                          fetchVersions
                        );
                      }}
                      className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Edit description
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function PredictWithVersion({
  modelId,
  versionId,
  description,
  fetchVersions,
}) {
  let [openModal, setOpenModal] = useState(false);
  let [queryInput, setQueryInput] = useState("");

  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => setOpenModal(true)}
        >
          Predict with Version
        </button>
      </div>

      <Transition appear show={openModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 text-white"
          onClose={() => setOpenModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="m-4 w-fill transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-white"
                  >
                    Predict with Version
                  </Dialog.Title>

                  {/* Body */}
                  <div className="flex items-center space-x-4 mt-2">
                    <textarea
                      value={queryInput}
                      onChange={(event) => setQueryInput(event.target.value)}
                      className="p-1 rounded-lg bg-gray-500"
                    />
                    <button
                      onClick={() => {
                        postRequestDlManager("/predict", {
                          model: modelId,
                          version: versionId,
                          "data-query": queryInput,
                        });
                      }}
                      className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Predict
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function Model({ currentModelId, setCurrentView, setCurrentModelId }) {
  let [modelInfo, setModelInfo] = useState({});
  let [versions, setVersions] = useState([]);
  let [performances, setPerformances] = useState([]);

  function fetchModelData() {
    getRequest("/models/" + currentModelId).then((data) =>
      setModelInfo({ ...data })
    );
  }

  function fetchVersions() {
    getRequest("/models/" + currentModelId + "/versions").then((data) =>
      setVersions([...data["versions"]])
    );
  }

  function fetchPerformances() {
    getRequest("/models/" + currentModelId + "/performances").then((data) =>
      setPerformances([...data["performances"]])
    );
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
            <ul className="list-disc pl-4 pt-4">
              {versions.map((version) => (
                <li>
                  <div className="flex items-center space-x-4">
                    <EditVersion
                      modelId={currentModelId}
                      versionId={version["version_id"]}
                      description={version["description"]}
                      fetchVersions={fetchVersions}
                    />
                    <PredictWithVersion />
                    <button
                      className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                      onClick={() =>
                        deleteRequest(
                          "/models/" +
                            currentModelId +
                            "/versions/" +
                            performance["performance_id"],
                          fetchVersions
                        )
                      }
                    >
                      Delete Version
                    </button>
                  </div>
                </li>
              ))}
            </ul>
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
                <div className="flex items-center space-x-4">
                  {performance["description"]} ({performance["performance_id"]})
                  <button
                    className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={() =>
                      deleteRequest(
                        "/models/" +
                          currentModelId +
                          "/performances/" +
                          performance["performance_id"],
                        fetchPerformances
                      )
                    }
                  >
                    Delete Performance
                  </button>
                </div>
              </li>;
            })}
          </>
        )}
      </div>
    );
  }

  if (currentModelId !== undefined) {
    useEffect(() => {
      fetchModelData();
      fetchVersions();
      fetchPerformances();
    }, []);
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => {
            setCurrentView("model-list");
            setCurrentModelId(undefined);
          }}
        >
          Exit
        </button>
        <span className="text-xl font-bold">
          {modelInfo["model_name"]} ({modelInfo["model_id"]})
        </span>
      </div>
      <button
        className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => {
          setCurrentView("model-forms");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
        Edit Config
      </button>

      <button
        className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => {
          postRequestDlManager("/train", { "model-id": currentModelId });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Train New Version
      </button>

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
    <div className="mx-4 pb-8">
      {currentView === "model-forms" ? (
        <CreateOrUpdateModel
          currentModelId={currentModelId}
          setCurrentView={setCurrentView}
        />
      ) : (
        ""
      )}
      {currentView === "model-list" ? (
        <>
          <button
            className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => setCurrentView("model-forms")}
          >
            Create New Model
          </button>
          <ModelList
            setCurrentModelId={setCurrentModelId}
            setCurrentView={setCurrentView}
          />
        </>
      ) : (
        ""
      )}
      {currentView === "model" ? (
        <Model
          currentModelId={currentModelId}
          setCurrentView={setCurrentView}
          setCurrentModelId={setCurrentModelId}
        />
      ) : (
        ""
      )}
    </div>
  );
}
