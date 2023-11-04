import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import React from "react";
import {
  deleteRequest,
  downloadFileLink,
  getDatabaseURL,
  getRequest,
  getRequestDlManager,
  postRequest,
  postRequestDlManager,
  uploadFile,
} from "../util";

// Render list with embeddings from the database
function EmbeddingList({
  embeddings,
  setOpenModal,
  setEmbedding,
  fetchEmbeddings,
}) {
  return (
    <ul className="list-disc pl-4 pt-4">
      {embeddings.map((embedding) => {
        return (
          <li key={embedding["embedding_id"]}>
            <div className="flex space-x-4 mt-4 items-center">
              <span>
                {embedding["name"]} ({embedding["embedding_id"]})
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpenModal(true);
                  setEmbedding(embedding);
                }}
                className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
              >
                View Embedding
              </button>
              <button
                onClick={() => {
                  deleteRequest(
                    "/embeddings/" + embedding["embedding_id"],
                    () => {
                      fetchEmbeddings();
                      alert("Embedding deleted");
                    }
                  );
                }}
                className="flex bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
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
          </li>
        );
      })}
    </ul>
  );
}

function getNestedValue(object, path) {
  if (path.length === 0) {
    return object;
  }
  if (path.length > 1) {
    return getNestedValue(object[path[0]], path.slice(1));
  }
  return object[path[0]];
}

function generateForms(endpoint, endpointPath, config, configPath, setConfig) {
  let params = getNestedValue({ ...endpoint }, endpointPath);

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
                        endpoint,
                        endpointPath.concat([
                          key,
                          "spec",
                          innerName.split(".")[0],
                        ]),
                        config,
                        configPath.concat([key, innerName]),
                        setConfig
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

function getParsedConfig(config, endpoint) {
  let tmp = { ...config };
  for (const [key, value] of Object.entries(endpoint)) {
    if (value["argument_type"] === "query") {
      tmp[key] = JSON.parse(tmp[key]);
    }
  }
  return tmp;
}

function ConfigModal({
  openModal,
  setOpenModal,
  endpoint,
  embedding,
  setEmbedding,
  fetchEmbeddings,
}) {
  if (endpoint === undefined) {
    return <p>Loading data...</p>;
  }

  let tmp = {};
  for (const [key, value] of Object.entries(endpoint)) {
    if (embedding !== undefined && key in embedding["config"]) {
      tmp[key] = embedding["config"][key];
      if (value["argument_type"] === "nested" && tmp[key] === null) {
        tmp[key] = {};
      }
      if (value["argument_type"] === "query" && typeof tmp[key] === "object") {
        tmp[key] = JSON.stringify(tmp[key]);
      }
    } else {
      tmp[key] = getDefaultParamValue(value);
    }
  }
  let [config, setConfig] = useState(tmp);
  let [embeddingName, setEmbeddingName] = useState(
    embedding === undefined ? "" : embedding["name"]
  );

  let [file, setFile] = useState<File | null>(null);
  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  return (
    <Transition appear show={openModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          setOpenModal(false);
          setEmbedding(undefined);
        }}
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
              <Dialog.Panel className=" w-fill transform overflow-hidden rounded-2xl bg-slate-600 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-white"
                >
                  {embedding === undefined
                    ? "Create Embedding"
                    : "Edit Embedding"}
                </Dialog.Title>

                {embedding === undefined ? (
                  ""
                ) : (
                  <div className="mt-4 text-white border-2 rounded-lg p-2">
                    <button
                      className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                      onClick={() => {
                        postRequestDlManager(
                          "/generate-embedding",
                          {
                            "database-url": getDatabaseURL(),
                            "embedding-id": embedding["embedding_id"],
                          },
                          () => {
                            fetchEmbeddings();
                            alert("Embedding generated");
                          }
                        );
                      }}
                    >
                      Train Embedding
                    </button>

                    <div className="flex items-center space-x-4 mt-4">
                      <input
                        className="p-1 rounded-lg bg-gray-700"
                        type="file"
                        onChange={onFileChange}
                      />
                      <button
                        className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                        onClick={() => {
                          uploadFile(
                            "/embeddings/" +
                              embedding["embedding_id"] +
                              "/file",
                            "POST",
                            file,
                            () => {
                              fetchEmbeddings();
                              alert("File uploaded");
                            }
                          );
                        }}
                      >
                        Upload File
                      </button>
                    </div>
                    {embedding["has_file"] ? (
                      <>
                        <a
                          href={downloadFileLink(
                            "/embeddings/" + embedding["embedding_id"] + "/file"
                          )}
                          target="_blank"
                        >
                          <button className="flex mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full">
                            Download File
                          </button>
                        </a>
                        <button
                          onClick={() => {
                            deleteRequest(
                              "/embeddings/" +
                                embedding["embedding_id"] +
                                "/file",
                              () => {
                                fetchEmbeddings();
                                alert("Embedding file deleted");
                              }
                            );
                          }}
                          className="flex mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                        >
                          Delete File
                        </button>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                )}

                <div className="mt-4 text-white border-2 p-2 rounded-lg">
                  <p className="text-2xl font-bold">Config</p>
                  {generateForms(endpoint, [], config, [], setConfig)}
                  <div className="mt-8">
                    <p>embedding name:</p>
                    <input
                      value={embeddingName}
                      onChange={(event) => setEmbeddingName(event.target.value)}
                      className="p-1 rounded-lg bg-gray-700"
                    />
                  </div>
                  {embedding === undefined ? (
                    <button
                      onClick={() => {
                        postRequest(
                          "/embeddings",
                          {
                            name: embeddingName,
                            config: getParsedConfig(config, endpoint),
                          },
                          () => {
                            fetchEmbeddings();
                            alert("Embedding created");
                          }
                        );
                      }}
                      className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Create Embedding
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        postRequest(
                          "/embeddings/" + embedding["embedding_id"],
                          {
                            name: embeddingName,
                            config: getParsedConfig(config, endpoint),
                          },
                          () => {
                            fetchEmbeddings();
                            alert("Updated embedding");
                          }
                        );
                      }}
                      className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Update Embedding Config
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default function Embeddings() {
  // Modal
  let [openModal, setOpenModal] = useState(false);
  let [embedding, setEmbedding] = useState(undefined);
  let [endpoint, setEndpoint] = useState(undefined);
  let [embeddings, setEmbeddings] = useState([]);

  function fetchEmbeddings() {
    getRequest("/embeddings").then((data) => {
      setEmbeddings(data["embeddings"]);
      if (embedding !== undefined) {
        data["embeddings"].map((item) => {
          if (item["embedding_id"] === embedding["embedding_id"]) {
            setEmbedding(item);
          }
        });
      }
    });
  }

  useEffect(() => {
    getRequestDlManager("/endpoints").then((data) => {
      let tmp = { ...data["commands"]["generate-embedding-internal"]["args"] };
      tmp["params"] = tmp["embedding-config"];
      delete tmp["embedding-config"];
      tmp["generator"] = tmp["embedding-generator"];
      delete tmp["embedding-generator"];
      setEndpoint(tmp);
    });
    fetchEmbeddings();
  }, []);

  return (
    <div className="container mx-auto pb-4 pl-4 pr-4">
      <p className="text-4xl font-bold">Embeddings for ML Models</p>
      <button
        onClick={() => {
          setOpenModal(true);
        }}
        className="flex mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 mr-2 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Create New Embedding
      </button>

      <EmbeddingList
        embeddings={embeddings}
        setOpenModal={setOpenModal}
        setEmbedding={setEmbedding}
        fetchEmbeddings={fetchEmbeddings}
      />

      {openModal ? (
        <ConfigModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          endpoint={endpoint}
          embedding={embedding}
          setEmbedding={setEmbedding}
          fetchEmbeddings={fetchEmbeddings}
        />
      ) : (
        ""
      )}
    </div>
  );
}
