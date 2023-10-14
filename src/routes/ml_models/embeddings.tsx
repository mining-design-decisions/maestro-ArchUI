import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import React from "react";

// Components for forms
function CheckBox({ name, currentType, config, updateConfig }) {
  return (
    <div className="flex mt-4 text-white justify-between">
      <label className="md:w-2/3 block">{name}</label>
      <input
        className="mr-2 leading-tight"
        type="checkbox"
        checked={config[currentType][name]}
        onChange={() => updateConfig(name, !config[currentType][name])}
      />
    </div>
  );
}

function InputNumber({ name, value, updateConfig }) {
  return (
    <div key={name} className="flex mt-4 text-white justify-between">
      <label className="md:w-2/3 block">{name}</label>
      <input
        key={name}
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
        type="number"
        value={value}
        onChange={(event) => updateConfig(name, event.target.value)}
      />
    </div>
  );
}

function InputText({ name, value, updateConfig }) {
  return (
    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
      <label>{name}</label>
      <div className="flex relative">
        <input
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded py-1 px-1 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          type="text"
          value={value}
          onChange={(event) => updateConfig(name, event.target.value)}
        />
      </div>
    </div>
  );
}

function DropDown({ name, readableOptions, value, updateConfig }) {
  return (
    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
      <label>{name}</label>
      <div className="flex relative">
        <select
          className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          value={value}
          onChange={(event) => updateConfig(name, event.target.value)}
        >
          {readableOptions.map((x) => {
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

// Render list with embeddings from the database
function EmbeddingList({
  setModalType,
  setArglist,
  setIsOpen,
  setEmbeddingTypeOptions,
  setCurrentType,
  setConfig,
  setEmbeddingName,
  setDataQuery,
  setSelectedEmbedding,
  dbData,
  setHasFile,
}) {
  function openModal(embedding_id) {
    fetch(
      "https://localhost:9011/arglists/generate-embedding-internal/embedding-config",
      {
        method: "GET",
      }
    )
      .then((response) => response.json())
      .then((dl_data) => {
        let typelist: string[] = [];
        let state = {};
        for (let key in dl_data) {
          typelist.push(key);
          state[key] = {};
          for (let item of dl_data[key]) {
            state[key][item["name"]] = item["default"];
          }
        }

        fetch("https://localhost:8000/embeddings/" + embedding_id, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((db_data) => {
            let key = db_data["config"]["generator"];
            for (let item of dl_data[key]) {
              let setting = item["name"];
              state[key][setting] =
                db_data["config"]["params"][key + ".0"][setting];
            }
            setArglist(() => ({ ...dl_data }));
            setIsOpen(true);
            setEmbeddingTypeOptions(typelist);
            setCurrentType(key);
            setConfig(state);
            setEmbeddingName(db_data["name"]);
            setDataQuery(
              JSON.stringify(db_data["config"]["training-data-query"])
            );
            setSelectedEmbedding(embedding_id);
            setHasFile(db_data["has_file"]);
          });
      });
  }
  return (
    <ul className="list-disc pl-4 pt-4">
      {dbData["embeddings"].map((embedding) => {
        return (
          <li key={embedding["embedding_id"]}>
            <button
              type="button"
              onClick={() => {
                openModal(embedding["embedding_id"]);
                setModalType("edit");
              }}
            >
              {embedding["name"]} - {embedding["embedding_id"]}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// Render form for text input
function TextForm(state, setState, name) {
  function onChange(key, value) {
    setState(value);
  }

  return (
    <InputText key={name} name={name} value={state} updateConfig={onChange} />
  );
}

export default function Embeddings() {
  // Modal
  let [isOpen, setIsOpen] = useState(false);
  let [modalType, setModalType] = useState<"create" | "edit">("create");

  // Arglist and embedding types
  let [embeddingTypeOptions, setEmbeddingTypeOptions] = useState<string[]>([]);
  let [arglist, setArglist] = useState({});

  // Embedding options/config
  let [embeddingName, setEmbeddingName] = useState<string>("");
  let [dataQuery, setDataQuery] = useState<string>("");
  let [config, setConfig] = useState<Object>({});
  let [selectedEmbedding, setSelectedEmbedding] = useState("");

  // Render specific forms for selected embedding type
  let [currentType, setCurrentType] = useState<string | number | undefined>(
    undefined
  );

  let [dbData, setDbData] = useState({ embeddings: [] });
  function fetchData() {
    fetch("https://localhost:8000/embeddings", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        setDbData(data);
      });
  }

  function EmbeddingOptions() {
    if (currentType === undefined) {
      return;
    }

    function onChange(key, value) {
      let state = { ...config };
      state[String(currentType)][key] = value;
      setConfig(state);
    }

    function getForm(item) {
      if (item["type"] === "bool") {
        return (
          <CheckBox
            key={item["name"]}
            name={item["name"]}
            currentType={currentType}
            config={config}
            updateConfig={onChange}
          />
        );
      }
      if (item["type"] === "int") {
        return (
          <InputNumber
            key={item["name"]}
            name={item["name"]}
            value={
              config[String(currentType)][item["name"]] === null
                ? 0
                : config[String(currentType)][item["name"]]
            }
            updateConfig={onChange}
          />
        );
      }
      if (item["type"] === "str" && Array.isArray(item["readable-options"])) {
        return (
          <DropDown
            key={item["name"]}
            name={item["name"]}
            readableOptions={item["readable-options"]}
            value={
              config[String(currentType)][item["name"]] === null
                ? ""
                : config[String(currentType)][item["name"]]
            }
            updateConfig={onChange}
          />
        );
      }
      if (item["type"] === "str" && item["readable-options"] === "Any") {
        return (
          <InputText
            key={item["name"]}
            name={item["name"]}
            value={
              config[String(currentType)][item["name"]] === null
                ? ""
                : config[String(currentType)][item["name"]]
            }
            updateConfig={onChange}
          />
        );
      }
    }
    return <div>{arglist[currentType].map((item) => getForm(item))}</div>;
  }

  function openModal() {
    useEffect(() => {
      fetch(
        "https://localhost:9011/arglists/generate-embedding-internal/embedding-config",
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          let typelist: string[] = [];
          let state = {};
          for (let key in data) {
            typelist.push(key);
            state[key] = {};
            for (let item of data[key]) {
              state[key][item["name"]] = item["default"];
            }
          }
          setArglist(() => ({ ...data }));
          setIsOpen(true);
          setEmbeddingTypeOptions(typelist);
          setCurrentType(typelist[0]);
          setConfig(state);
        });
    }, []);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function requestEmbedding(url, method) {
    let request = {
      method: method,
      headers: {
        Authorization: "bearer " + token,
        "Content-Type": "application/json",
      },
    };

    // Add body for non-DELETE requests
    if (method !== "DELETE") {
      let body = {
        name: embeddingName,
        config: {
          generator: String(currentType),
          "training-data-query": JSON.parse(dataQuery),
          params: {},
        },
      };
      body["config"]["params"][currentType + ".0"] =
        config[String(currentType)];
      request["body"] = JSON.stringify(body);
    }

    fetch(url, request)
      .then((response) => response.json())
      .then(() => fetchData());
  }

  function createEmbedding() {
    requestEmbedding("https://localhost:8000/embeddings", "POST");
  }

  function updateEmbedding() {
    requestEmbedding(
      "https://localhost:8000/embeddings/" + selectedEmbedding,
      "POST"
    );
  }

  function deleteEmbedding() {
    requestEmbedding(
      "https://localhost:8000/embeddings/" + selectedEmbedding,
      "DELETE"
    );
  }

  let [file, setFile] = useState<File | null>(null);
  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  function fileRequest(method) {
    let request = {
      method: method,
      headers: {
        Authorization: "bearer " + token,
      },
    };

    if (method !== "DELETE") {
      let body = new FormData();
      body.append("file", file);
      request["body"] = body;
    }

    fetch(
      "https://localhost:8000/embeddings/" + selectedEmbedding + "/file",
      request
    )
      .then((response) => response.json())
      .then(() => {
        fetch("https://localhost:8000/embeddings/" + selectedEmbedding)
          .then((response) => response.json())
          .then((data) => setHasFile(data["has_file"]));
      });
  }

  function uploadFile() {
    fileRequest("POST");
  }

  function deleteFile() {
    fileRequest("DELETE");
  }

  let [hasFile, setHasFile] = useState(false);

  return (
    <div className="container mx-auto pb-4 pl-4 pr-4">
      <p className="text-4xl font-bold">Embeddings for ML Models</p>
      <button
        onClick={() => {
          openModal();
          setModalType("create");
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
        setModalType={setModalType}
        setArglist={setArglist}
        setIsOpen={setIsOpen}
        setEmbeddingTypeOptions={setEmbeddingTypeOptions}
        setCurrentType={setCurrentType}
        setConfig={setConfig}
        setEmbeddingName={setEmbeddingName}
        setDataQuery={setDataQuery}
        setSelectedEmbedding={setSelectedEmbedding}
        dbData={dbData}
        setHasFile={setHasFile}
      />

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsOpen(false)}
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
                <Dialog.Panel className=" w-fill transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-white"
                  >
                    {modalType === "create"
                      ? "Create new embedding"
                      : "Edit embedding: " + selectedEmbedding}
                  </Dialog.Title>

                  <div className="mt-4">
                    {modalType === "edit" ? (
                      <div className="text-white flex items-center space-x-4 mt-3 justify-between">
                        <input type="file" onChange={onFileChange} />
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={uploadFile}
                        >
                          Upload File
                        </button>
                        {hasFile ? (
                          <>
                            <a
                              href={
                                "https://localhost:8000/embeddings/" +
                                selectedEmbedding +
                                "/file"
                              }
                            >
                              <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              >
                                Download File
                              </button>
                            </a>
                            <button
                              type="button"
                              className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                              onClick={deleteFile}
                            >
                              Delete File
                            </button>
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                    ) : (
                      ""
                    )}

                    {TextForm(
                      embeddingName,
                      setEmbeddingName,
                      "embedding-name"
                    )}
                    {TextForm(dataQuery, setDataQuery, "training-data-query")}
                    <DropDown
                      name="embedding-type"
                      readableOptions={embeddingTypeOptions}
                      value={currentType}
                      updateConfig={(name, value) => setCurrentType(value)}
                    />
                    {EmbeddingOptions()}
                    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => {
                          createEmbedding();
                          setIsOpen(false);
                        }}
                      >
                        Create embedding
                      </button>
                      {modalType === "edit" ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={() => {
                              updateEmbedding();
                              setIsOpen(false);
                            }}
                          >
                            Edit embedding
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={() => {
                              deleteEmbedding();
                              setIsOpen(false);
                            }}
                          >
                            Delete embedding
                          </button>{" "}
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
