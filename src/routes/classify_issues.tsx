import React, { useEffect, useState } from "react";

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
              <option key={x["value"]} value={x["value"]}>
                {x["name"]} ({x["value"]})
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
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function IssueTable({ uiData, view, setView, page, limit, modelData }) {
  let [currentIssueId, setCurrentIssueId] = useState(undefined);
  let [label, setLabel] = useState({});
  let [tags, setTags] = useState([]);

  useEffect(() => {
    fetch("https://localhost:8000/tags")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let tmp = [];
        data["tags"].map((tag) => {
          if (tag["type"] === "manual-tag") {
            tmp.push(tag["name"]);
          }
        });
        setTags(tmp);
      });
  }, []);

  function updateLabel(className) {
    if (className === "non-architectural") {
      if (label["existence"] || label["executive"] || label["property"]) {
        setLabel({
          existence: false,
          property: false,
          executive: false,
        });
      }
    } else {
      let tmp = { ...label };
      tmp[className] = !tmp[className];
      setLabel(tmp);
    }
  }

  let currentIndex = -1;
  let currentIssue = undefined;
  uiData["data"].map((item, index) => {
    if (item["issue_id"] === currentIssueId) {
      currentIndex = index;
      currentIssue = uiData["data"][index];
    }
  });

  function renderLabel(label) {
    if (label["existence"] === null) {
      return "";
    }
    let classNames: string[] = [];
    for (let className of ["existence", "executive", "property"]) {
      if (label[className]) {
        classNames.push(className);
      }
    }
    if (classNames.length === 0) {
      return "non-architectural";
    }
    return classNames.join(", ");
  }
  let predictions = uiData["data"][0]["predictions"];
  return (
    <>
      {view === "table" ? (
        <div className="relative overflow-x-auto p-4">
          <table className="table-auto text-left text-gray-200 dark:text-gray-100">
            <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th>Row</th>
                <th>Issue Key</th>
                <th>Classify</th>
                <th>Manual Label</th>
                <th>Tags</th>
                {Object.keys(predictions).map((modelId) => {
                  return Object.keys(predictions[modelId]).map((className) => {
                    return (
                      <th>
                        {modelData.map((model) => {
                          if (model["value"] === modelId.split("-")[0]) {
                            return model["name"];
                          }
                        })}{" "}
                        - {className}
                      </th>
                    );
                  });
                })}
              </tr>
            </thead>
            <tbody>
              {uiData["data"].map((item, index) => {
                return (
                  <tr
                    className={
                      item["tags"].includes("needs-review")
                        ? "bg-white border-b dark:bg-yellow-800 dark:border-yellow-700"
                        : "bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    }
                  >
                    <td>{index + 1 + limit * (page - 1)}</td>
                    <td>
                      <a href={item["issue_link"]} target="_blank">
                        {item["issue_key"]}
                      </a>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => {
                          setCurrentIssueId(item["issue_id"]);
                          setLabel(item["manual_label"]);
                          setView("issue");
                        }}
                        className="blockappearance-none w-full bg-blue-500 border border-blue-500 text-white py-1 px-4 pr-8 rounded leading-tight focus:outline-none hover:bg-blue-700 hover:border-blue-700"
                      >
                        Classify
                      </button>
                    </td>
                    <td>{renderLabel(item["manual_label"])}</td>
                    <td>
                      {item["tags"].map((tag) => {
                        if (tags.includes(tag)) {
                          return <p>{tag}</p>;
                        }
                      })}
                    </td>
                    {Object.keys(item["predictions"]).map((modelId) => {
                      return Object.keys(item["predictions"][modelId]).map(
                        (className) => {
                          let prediction =
                            item["predictions"][modelId][className][
                              "prediction"
                            ];
                          let confidence =
                            item["predictions"][modelId][className][
                              "confidence"
                            ];
                          return (
                            <td>
                              {String(prediction)} ({confidence})
                            </td>
                          );
                        }
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {currentIssue === undefined ? (
            ""
          ) : (
            <div className="p-4 space-y-4">
              <button
                className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => setView("table")}
              >
                Exit
              </button>
              <p className="text-4xl font-bold">
                <a href={currentIssue["issue_link"]} target="_blank">
                  {currentIssue["issue_key"]}
                </a>{" "}
                ({currentIssue["issue_id"]})
              </p>
              <p className="text-2xl font-bold">Summary</p>
              <p className="text-base">{currentIssue["summary"]}</p>

              <p className="text-2xl font-bold">Description</p>
              <p className="text-base">{currentIssue["description"]}</p>

              {/* Manual Label */}
              <p className="text-2xl font-bold">Manual Label</p>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <label>Existence</label>
                    </td>
                    <td>
                      <input
                        className="ml-4"
                        type="checkbox"
                        checked={label["existence"]}
                        onChange={() => {
                          updateLabel("existence");
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Executive</label>
                    </td>
                    <td>
                      <input
                        className="ml-4"
                        type="checkbox"
                        checked={label["executive"]}
                        onChange={() => {
                          updateLabel("executive");
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Property</label>
                    </td>
                    <td>
                      <input
                        className="ml-4"
                        type="checkbox"
                        checked={label["property"]}
                        onChange={() => {
                          updateLabel("property");
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Non-Architectural</label>
                    </td>
                    <td>
                      <input
                        className="ml-4"
                        type="checkbox"
                        checked={
                          !label["existence"] &&
                          !label["executive"] &&
                          !label["property"]
                        }
                        onChange={() => {
                          updateLabel("non-architectural");
                        }}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => {
                  let token = "";
                  let request = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: "bearer " + token,
                    },
                    body: JSON.stringify(label),
                  };
                  fetch(
                    "https://localhost:8000/manual-labels/" +
                      currentIssue["issue_id"],
                    request
                  );
                }}
              >
                Set Manual Label
              </button>

              <hr />

              {currentIssue["tags"].includes("needs-review") ? (
                <button
                  className="flex items-center space-x-4 mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => {
                    let token = "";
                    let request = {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "bearer " + token,
                      },
                    };
                    fetch(
                      "https://localhost:8000/issues/" +
                        currentIssue["issue_id"] +
                        "/finish-review",
                      request
                    );
                  }}
                >
                  Mark for training
                </button>
              ) : (
                <button
                  className="flex items-center space-x-4 mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={() => {
                    let token = "";
                    let request = {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "bearer " + token,
                      },
                    };
                    fetch(
                      "https://localhost:8000/issues/" +
                        currentIssue["issue_id"] +
                        "/mark-review",
                      request
                    );
                  }}
                >
                  Mark for review
                </button>
              )}

              {/* Comments */}
              <p className="text-2xl font-bold">Comments</p>
              {Object.keys(currentIssue["comments"]).map((key) => {
                console.log(
                  "comment",
                  currentIssue["comments"][key]["comment"]
                );
                return (
                  <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                      <p>
                        {currentIssue["comments"][key]["author"]} ({key})
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id={key}
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                        placeholder={currentIssue["comments"][key]["comment"]}
                      ></textarea>
                    </div>
                    {currentIssue["comments"][key]["author"] === "arjan" ? (
                      <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                        <button
                          type="submit"
                          className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                          onClick={() => {
                            let comment = document.getElementById(key).value;
                            let token = "";
                            let request = {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: "bearer " + token,
                              },
                              body: JSON.stringify({
                                comment: comment,
                              }),
                            };
                            fetch(
                              "https://localhost:8000/manual-labels/" +
                                currentIssue["issue_id"] +
                                "/comments/" +
                                key,
                              request
                            );
                          }}
                        >
                          Edit comment
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-red-700 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-800"
                          onClick={() => {
                            let token = "";
                            let request = {
                              method: "DELETE",
                              headers: {
                                Authorization: "bearer " + token,
                              },
                            };
                            fetch(
                              "https://localhost:8000/manual-labels/" +
                                currentIssue["issue_id"] +
                                "/comments/" +
                                key,
                              request
                            );
                          }}
                        >
                          Delete comment
                        </button>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}

              {/* Add comment */}
              <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                  <textarea
                    id="comment"
                    rows={4}
                    className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                    placeholder="Write a comment..."
                    required
                  ></textarea>
                </div>
                <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                  <button
                    type="submit"
                    className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 hover:bg-green-800"
                    onClick={() => {
                      let comment = document.getElementById("comment").value;
                      let token = "";
                      let request = {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: "bearer " + token,
                        },
                        body: JSON.stringify({
                          comment: comment,
                        }),
                      };
                      fetch(
                        "https://localhost:8000/manual-labels/" +
                          currentIssue["issue_id"] +
                          "/comments",
                        request
                      );
                    }}
                  >
                    Post comment
                  </button>
                </div>
              </div>

              {/* Tags */}
              <p className="text-2xl font-bold">Tags</p>
              <div className="text-base">
                {uiData["data"][currentIndex]["tags"].map((tag) => {
                  return (
                    <div className="m-2 flex items-center">
                      <button
                        onClick={() => {
                          let token = "";
                          let request = {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: "bearer " + token,
                            },
                          };
                          fetch(
                            "https://localhost:8000/issues/" +
                              currentIssue["issue_id"] +
                              "/tags/" +
                              tag,
                            request
                          );
                        }}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                      <p className="ml-2">{tag}</p>
                    </div>
                  );
                })}
              </div>

              {/* Add tag */}
              <div className="text-white flex items-center space-x-4 mt-3">
                <div className="flex relative">
                  <select
                    id="add-tag-dropdown"
                    className="block appearance-none w-full bg-gray-700 border border-gray-700 text-white py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-700 focus:border-gray-700"
                  >
                    {tags.map((tag) => {
                      if (!currentIssue["tags"].includes(tag)) {
                        return (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        );
                      }
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => {
                    let token = "";
                    let request = {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "bearer " + token,
                      },
                      body: JSON.stringify({
                        tag: document.getElementById("add-tag-dropdown").value,
                      }),
                    };
                    fetch(
                      "https://localhost:8000/issues/" +
                        currentIssue["issue_id"] +
                        "/tags",
                      request
                    );
                  }}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded inline-flex items-center"
                >
                  Add Tag
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function OverView({ socket }) {
  let [uiData, setUiData] = useState(undefined);
  let [modelData, setModelData] = useState(undefined);
  let [models, setModels] = useState({
    numModels: 0,
    selectedModels: {},
  });
  let [versions, setVersions] = useState({});
  let [currentPage, setCurrentPage] = useState(1);
  let [limit, setLimit] = useState(10);
  let [view, setView] = useState<"table" | "issue">("table");
  let [sort, setSort] = useState({
    enabled: false,
    model: 0,
    ascending: false,
    class: "existence",
  });
  let query = {};

  socket.onopen = () => {
    console.log("socket opened");
  };

  socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    if (uiData === undefined) {
      return;
    }
    let idx = -1;
    uiData["data"].map((item, index) => {
      if (item["issue_id"] === data["issue_id"]) {
        idx = index;
      }
    });
    if (idx !== -1) {
      let tmp = { ...uiData };
      if ("comments" in data) {
        tmp["data"][idx]["comments"] = data["comments"];
      }
      if ("tags" in data) {
        tmp["data"][idx]["tags"] = data["tags"];
      }
      if ("manual_label" in data) {
        tmp["data"][idx]["manual_label"]["existence"] =
          data["manual_label"]["existence"];
        tmp["data"][idx]["manual_label"]["property"] =
          data["manual_label"]["property"];
        tmp["data"][idx]["manual_label"]["executive"] =
          data["manual_label"]["executive"];
      }
      setUiData(tmp);
    }
  };

  function fetchUiData(page, limit) {
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(query),
    };
    fetch("https://localhost:8000/ui", request)
      .then((response) => response.json())
      .then((data) => {
        setUiData(data);
      });
  }

  function fetchModels() {
    fetch("https://localhost:8000/models")
      .then((response) => response.json())
      .then((data) => {
        setModelData(
          data["models"].map((item) => {
            return { name: item["model_name"], value: item["model_id"] };
          })
        );
      });
  }

  function fetchVersions(modelId) {
    fetch("https://localhost:8000/models/" + modelId + "/versions")
      .then((response) => response.json())
      .then((data) => {
        let tmp = { ...versions };
        tmp[modelId] = data["versions"].map((item) => {
          return { name: item["description"], value: item["version_id"] };
        });
        setVersions(tmp);
      });
  }

  useEffect(() => {
    fetchModels();
  }, []);

  console.log("models", models);
  function ModelDropDowns() {
    let dropDowns: React.JSX.Element[] = [];
    for (let i = 0; i < models["numModels"]; i++) {
      if (!(i in models["selectedModels"])) {
        let tmp = { ...models };
        tmp["selectedModels"][i] = { modelId: modelData[0]["value"] };
        setModels(tmp);
        if (!(modelData[0]["value"] in versions)) {
          fetchVersions(modelData[0]["value"]);
        }
      }
      if (models["selectedModels"][i]["version"] === undefined) {
        if (models["selectedModels"][i]["modelId"] in versions) {
          if (versions[models["selectedModels"][i]["modelId"]].length > 0) {
            let tmp = { ...models };
            tmp["selectedModels"][i]["version"] =
              versions[models["selectedModels"][i]["modelId"]][0]["value"];
            setModels(tmp);
          }
        }
      }
      // check for versions
      dropDowns.push(
        <>
          <hr />
          <DropDown
            name={"model " + i}
            options={modelData}
            value={models["selectedModels"][i]["modelId"]}
            onChange={(value) => {
              let tmp = { ...models };
              tmp["selectedModels"][i] = { modelId: value };
              setModels(tmp);
              if (!(value in versions)) {
                fetchVersions(value);
              }
            }}
          />
          {models["selectedModels"][i]["modelId"] in versions ? (
            <DropDown
              name="version"
              options={versions[models["selectedModels"][i]["modelId"]]}
              value={models["selectedModels"][i]["version"]}
              onChange={(value) => {
                let tmp = { ...models };
                tmp["selectedModels"][i]["version"] = value;
                setModels(tmp);
              }}
            />
          ) : (
            ""
          )}
        </>
      );
    }
    return dropDowns;
  }

  function changePage(value) {
    if (!Number.isInteger(value)) {
      return;
    }
    if (value < 1) {
      value = 1;
    } else if (value > uiData["total_pages"]) {
      value = uiData["total_pages"];
    }
    setCurrentPage(value);
    fetchUiData(value, limit);
  }

  return (
    <>
      {view === "table" ? (
        <>
          {/* Query */}
          <div className="flex items-start space-x-2">
            <span>Import query:</span>
            <input
              type="file"
              className="bg-gray-700 text-white"
              accept="application/json"
              onChange={(event) => {
                if (event.target.files) {
                  let fileReader = new FileReader();
                  fileReader.addEventListener("load", (event) => {
                    if (event.target?.result) {
                      query = JSON.parse(String(event.target.result));
                      fetchUiData(currentPage, limit);
                    }
                  });
                  fileReader.readAsText(event.target.files[0]);
                }
              }}
            />
          </div>
          <div className="flex items-start space-x-2">
            <span>Query:</span>
            <textarea
              id="textarea-query"
              className="bg-gray-700 text-white w-full"
            />
          </div>
          <div>
            <p className="text-2xl font-bold">Select Models</p>
            <InputNumber
              name="Number of models"
              value={models["numModels"]}
              onChange={(value) => {
                if (value <= 0) {
                  value = 0;
                }
                let tmp = { ...models };
                tmp["numModels"] = value;
                setModels(tmp);

                let tmpSort = { ...sort };
                tmpSort["model"] = Math.max(
                  Math.min(tmpSort["model"], value - 1),
                  0
                );
                if (value === 0) {
                  tmpSort["enabled"] = false;
                }
                setSort(tmpSort);
              }}
            />
            {ModelDropDowns()}

            {/* Sorting */}
            <hr />
            <p className="text-2xl font-bold">Sort</p>
            <div className="flex items-center space-x-2">
              <label>Enable sorting?</label>
              <input
                className=""
                type="checkbox"
                checked={sort["enabled"]}
                onChange={() => {
                  let tmp = { ...sort };
                  tmp["enabled"] = !tmp["enabled"];
                  if (models["numModels"] === 0) {
                    tmp["enabled"] = false;
                  }
                  setSort(tmp);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Sort by model</label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={sort["model"]}
                onChange={(event) => {
                  let value = Number(event.target.value);
                  if (value < 0) {
                    value = 0;
                  } else if (value >= models["numModels"]) {
                    value = Math.max(models["numModels"] - 1, 0);
                  }
                  let tmp = { ...sort };
                  tmp["model"] = value;
                  setSort(tmp);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Ascending?</label>
              <input
                type="checkbox"
                checked={sort["ascending"]}
                onChange={() => {
                  let tmp = { ...sort };
                  tmp["ascending"] = !tmp["ascending"];
                  setSort(tmp);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Class:</label>
              <select
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={sort["class"]}
                onChange={(event) => {
                  let tmp = { ...sort };
                  tmp["class"] = event.target.value;
                  setSort(tmp);
                }}
              >
                {["existence", "executive", "property"].map((className) => {
                  return (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              let sortValue = null;
              if (sort["enabled"]) {
                sortValue =
                  "predictions." +
                  models["selectedModels"][sort["model"]]["modelId"] +
                  "-" +
                  models["selectedModels"][sort["model"]]["version"] +
                  "." +
                  sort["class"];
              }
              const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify({
                  filter: JSON.parse(
                    document.getElementById("textarea-query").value
                  ),
                  sort: sortValue,
                  sort_ascending: sort["ascending"],
                  models: Object.keys(models["selectedModels"])
                    .slice(0, models["numModels"])
                    .map((key, index) => {
                      if (index < models["numModels"]) {
                        return (
                          models["selectedModels"][key]["modelId"] +
                          "-" +
                          models["selectedModels"][key]["version"]
                        );
                      }
                    }),
                  page: currentPage,
                  limit: limit,
                })
              )}`;
              const link = document.createElement("a");
              link.href = jsonString;
              link.download = "data.json";

              link.click();
            }}
          >
            Download Query
          </button>
          <div>
            <button
              onClick={() => {
                let sortValue = null;
                if (sort["enabled"]) {
                  sortValue =
                    "predictions." +
                    models["selectedModels"][sort["model"]]["modelId"] +
                    "-" +
                    models["selectedModels"][sort["model"]]["version"] +
                    "." +
                    sort["class"];
                }
                query = {
                  filter: JSON.parse(
                    document.getElementById("textarea-query").value
                  ),
                  sort: sortValue,
                  sort_ascending: sort["ascending"],
                  models: Object.keys(models["selectedModels"])
                    .slice(0, models["numModels"])
                    .map((key, index) => {
                      if (index < models["numModels"]) {
                        return (
                          models["selectedModels"][key]["modelId"] +
                          "-" +
                          models["selectedModels"][key]["version"]
                        );
                      }
                    }),
                  page: currentPage,
                  limit: limit,
                };
                fetchUiData(currentPage, limit);
              }}
            >
              Submit Query
            </button>
          </div>
        </>
      ) : (
        ""
      )}
      {uiData === undefined ? (
        ""
      ) : (
        <>
          <hr />
          <IssueTable
            uiData={uiData}
            view={view}
            setView={setView}
            page={currentPage}
            limit={limit}
            modelData={modelData}
          />
          {/* Pagination */}
          {view === "table" ? (
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-700 dark:text-gray-400">
                Showing page{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {currentPage}
                </span>{" "}
                out of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {uiData["total_pages"]}
                </span>
              </span>
              <div className="inline-flex mt-2 xs:mt-0">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Prev
                </button>
                <input
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  type="text"
                  value={currentPage}
                  onChange={(event) => {
                    changePage(Number(event.target.value));
                  }}
                />
                <button
                  onClick={() => changePage(currentPage + 1)}
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Next
                </button>
              </div>
              <div className="inline-flex mt-2 xs:mt-0 items-center space-x-2">
                <p className="text-sm text-gray-700 dark:text-gray-400">
                  Items per page:
                </p>
                <input
                  className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  type="text"
                  value={limit}
                  onChange={(event) => {
                    let value = Number(event.target.value);
                    if (!Number.isInteger(value)) {
                      return;
                    }
                    if (value < 1) {
                      value = 1;
                    }
                    setLimit(value);
                    setCurrentPage(1);
                    fetchUiData(1, value);
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </>
      )}
    </>
  );
}

export default function ClassifyIssues() {
  // Websocket
  const socket = new WebSocket("wss://localhost:8000/ws");

  return (
    <>
      <OverView socket={socket} />
    </>
  );
}
