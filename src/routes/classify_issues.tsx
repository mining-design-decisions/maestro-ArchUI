import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { getRequest, patchRequest, postRequest } from "./util";

function DropDown({ name, options, value, onChange }) {
  return (
    <div className="text-white flex items-center space-x-4 mt-3 justify-between">
      <label>{name}</label>
      <select
        className="p-1 rounded-lg bg-gray-700"
        value={value === null ? "null" : value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option className="disabled hidden" key="empty"></option>
        {options.map((x) => {
          return (
            <option key={x["value"]} value={x["value"]}>
              {x["name"]} ({x["value"]})
            </option>
          );
        })}
      </select>
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

function IssueTable({
  uiData,
  issueModalIsOpen,
  setIssueModalIsOpen,
  modelData,
  query,
  setQuery,
  fetchUiData,
}) {
  let [currentIssueId, setCurrentIssueId] = useState(undefined);
  let [label, setLabel] = useState({});
  let [tags, setTags] = useState([]);

  useEffect(() => {
    getRequest("/tags").then((data) => {
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

  if (uiData["data"] === undefined) {
    return <></>;
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
  let [focusRow, setFocusRow] = useState<number>(-1);
  return (
    <>
      <div className="relative overflow-x-auto rounded-lg m-4 mb-0">
        <table className="table-auto text-left text-gray-200 dark:text-gray-100">
          <thead className="uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-4">Row</th>
              <th className="p-4">Issue Key</th>
              <th className="p-4">Classify</th>
              <th className="p-4">Manual Label</th>
              <th className="p-4">Tags</th>
              {Object.keys(predictions).map((modelId) => {
                return Object.keys(predictions[modelId]).map((className) => {
                  return (
                    <th
                      className="p-4"
                      onClick={() => {
                        let newSort =
                          "predictions." + modelId + "." + className;
                        let tmp = { ...query };
                        if (newSort === tmp["sort"]) {
                          if (!tmp["sort_ascending"]) {
                            tmp["sort_ascending"] = true;
                          } else {
                            tmp["sort"] = null;
                          }
                        } else {
                          tmp["sort"] = newSort;
                          tmp["sort_ascending"] = false;
                        }
                        setQuery(tmp);
                        fetchUiData(tmp);
                      }}
                    >
                      <div className="flex items-center">
                        {modelData.map((model) => {
                          if (model["value"] === modelId.split("-")[0]) {
                            return model["name"];
                          }
                        })}{" "}
                        - {className}
                        {query["sort"] ===
                        "predictions." + modelId + "." + className ? (
                          <>
                            {query["sort_ascending"] ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-10 h-10"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-10 h-10"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                                />
                              </svg>
                            )}
                          </>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-10 h-10"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                            />
                          </svg>
                        )}
                      </div>
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
                    (item["tags"].includes("needs-review")
                      ? " bg-yellow-900"
                      : " bg-gray-800") +
                    (focusRow === index
                      ? " border-4 border-l-8 border-white"
                      : "")
                  }
                  onClick={() => setFocusRow(index)}
                >
                  <td className="p-4">
                    {index + 1 + query["limit"] * (query["page"] - 1)}
                  </td>
                  <td className="p-4">
                    <a
                      href={item["issue_link"]}
                      target="_blank"
                      className="text-blue-500 underline hover:no-underline"
                    >
                      {item["issue_key"]}
                    </a>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setCurrentIssueId(item["issue_id"]);
                        setLabel(item["manual_label"]);
                        setIssueModalIsOpen(true);
                      }}
                      className="blockappearance-none w-full bg-blue-500 border border-blue-500 text-white py-1 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring focus:ring-white hover:bg-blue-700 hover:border-blue-700"
                    >
                      Classify
                    </button>
                  </td>
                  <td className="p-4">{renderLabel(item["manual_label"])}</td>
                  <td className="p-4">
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
                          item["predictions"][modelId][className]["prediction"];
                        let confidence =
                          item["predictions"][modelId][className]["confidence"];
                        return (
                          <td className="p-4">
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
      {issueModalIsOpen ? (
        <>
          {currentIssue === undefined ? (
            ""
          ) : (
            <Transition appear show={currentIssue !== undefined} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-10 text-white"
                onClose={() => setIssueModalIsOpen(false)}
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
                          <p className="text-4xl font-bold">
                            <a
                              href={currentIssue["issue_link"]}
                              target="_blank"
                              className="text-blue-500 underline hover:no-underline"
                            >
                              {currentIssue["issue_key"]}
                            </a>{" "}
                            ({currentIssue["issue_id"]})
                          </p>
                        </Dialog.Title>

                        {/* Body */}
                        <div className="mt-4 space-y-4">
                          <p className="text-2xl font-bold">Summary</p>
                          <p className="text-base">{currentIssue["summary"]}</p>

                          <p className="text-2xl font-bold">Description</p>
                          <div className="px-4 py-2 bg-white rounded-lg dark:bg-gray-800">
                            <textarea
                              value={currentIssue["description"]}
                              rows={8}
                              className="text-base w-full px-0 text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                            />
                          </div>

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
                              postRequest(
                                "/manual-labels/" + currentIssue["issue_id"],
                                label
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
                                postRequest(
                                  "/issues/" +
                                    currentIssue["issue_id"] +
                                    "/finish-review",
                                  null
                                );
                              }}
                            >
                              Mark for training
                            </button>
                          ) : (
                            <button
                              className="flex items-center space-x-4 mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                              onClick={() => {
                                postRequest(
                                  "/issues/" +
                                    currentIssue["issue_id"] +
                                    "/mark-review",
                                  null
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
                                    {currentIssue["comments"][key]["author"]} (
                                    {key})
                                  </p>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                                  <textarea
                                    id={key}
                                    className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                                    placeholder={
                                      currentIssue["comments"][key]["comment"]
                                    }
                                  ></textarea>
                                </div>
                                {currentIssue["comments"][key]["author"] ===
                                localStorage.getItem("username") ? (
                                  <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                                    <button
                                      type="submit"
                                      className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                                      onClick={() => {
                                        patchRequest(
                                          "/manual-labels/" +
                                            currentIssue["issue_id"] +
                                            "/comments/" +
                                            key,
                                          {
                                            comment:
                                              document.getElementById(key)
                                                .value,
                                          }
                                        );
                                        let comment =
                                          document.getElementById(key).value;
                                        let request = {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                            "Access-Control-Allow-Credentials":
                                              "true",
                                          },
                                          body: JSON.stringify({
                                            comment: comment,
                                          }),
                                          credentials: "include",
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
                                        let request = {
                                          method: "DELETE",
                                          headers: {
                                            "Access-Control-Allow-Credentials":
                                              "true",
                                          },
                                          credentials: "include",
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
                                  let comment =
                                    document.getElementById("comment").value;
                                  let request = {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      "Access-Control-Allow-Credentials":
                                        "true",
                                    },
                                    body: JSON.stringify({
                                      comment: comment,
                                    }),
                                    credentials: "include",
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
                                      let request = {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                          "Access-Control-Allow-Credentials":
                                            "true",
                                        },
                                        credentials: "include",
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
                                className="appearance-none w-full bg-gray-600 border border-gray-600 text-white py-1 px-4 pr-8 rounded leading-tight"
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
                                let request = {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Access-Control-Allow-Credentials": "true",
                                  },
                                  body: JSON.stringify({
                                    tag: document.getElementById(
                                      "add-tag-dropdown"
                                    ).value,
                                  }),
                                  credentials: "include",
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
                        {/* End Body */}
                      </Dialog.Panel>
                    </Transition.Child>
                  </div>
                </div>
              </Dialog>
            </Transition>
          )}
        </>
      ) : (
        ""
      )}
    </>
  );
}

function OverView({ socket }) {
  let [uiData, setUiData] = useState(undefined);
  let [modelData, setModelData] = useState(undefined);
  let [versions, setVersions] = useState({});
  let [issueModalIsOpen, setIssueModalIsOpen] = useState<bool>(false);
  let [query, setQuery] = useState({
    filter: "",
    sort: null,
    sort_ascending: false,
    models: [],
    page: 1,
    limit: 10,
  });

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

  function getParsedQuery(newQuery) {
    let parsedQuery = { ...newQuery };
    parsedQuery["filter"] = JSON.parse(parsedQuery["filter"]);
    parsedQuery["models"] = parsedQuery["models"].map(
      (item) => item["modelId"] + "-" + item["versionId"]
    );
    return parsedQuery;
  }

  function fetchUiData(newQuery) {
    let parsedQuery = getParsedQuery(newQuery);
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsedQuery),
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

  function ModelDropDowns() {
    let dropDowns: React.JSX.Element[] = [];
    for (let i = 0; i < query["models"].length; i++) {
      dropDowns.push(
        <div key={"model " + i} className="mt-8">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">{"Model " + i}</span>
            <button
              onClick={() => {
                let tmp = { ...query };
                tmp["models"].splice(i, 1);
                setQuery(tmp);
              }}
              className="flex items-center space-x-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              Delete model
            </button>
          </div>
          <DropDown
            name="model id"
            options={modelData}
            value={query["models"][i]["modelId"]}
            onChange={(value) => {
              let tmp = { ...query };
              tmp["models"][i]["modelId"] = value;
              setQuery(tmp);
              if (!(value in versions)) {
                fetchVersions(value);
              }
            }}
          />
          {query["models"][i]["modelId"] in versions ? (
            <DropDown
              name="version id"
              options={versions[query["models"][i]["modelId"]]}
              value={query["models"][i]["versionId"]}
              onChange={(value) => {
                let tmp = { ...query };
                tmp["models"][i]["versionId"] = value;
                setQuery(tmp);
              }}
            />
          ) : (
            ""
          )}
        </div>
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
    let tmp = { ...query };
    tmp["page"] = value;
    setQuery(tmp);
    fetchUiData(tmp);
  }

  return (
    <>
      {/* Query */}
      <div className="ml-4 mr-4">
        <div className="flex items-start">
          <div className="flex items-center space-x-2">
            <span>Import query:</span>
            <input
              type="file"
              className="bg-gray-700 text-white rounded"
              accept="application/json"
              onChange={(event) => {
                if (event.target.files) {
                  let fileReader = new FileReader();
                  fileReader.addEventListener("load", (event) => {
                    if (event.target?.result) {
                      let newQuery = JSON.parse(event.target.result);
                      setQuery(newQuery);
                      fetchUiData(newQuery);
                      newQuery["models"].map((item) => {
                        fetchVersions(item["modelId"]);
                      });
                    }
                  });
                  fileReader.readAsText(event.target.files[0]);
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-start space-x-2 mt-2">
          <span>Filter:</span>
          <textarea
            className="bg-gray-700 text-white w-full rounded"
            value={query["filter"]}
            onChange={(event) => {
              setQuery((prevState) => ({
                ...prevState,
                filter: event.target.value,
              }));
            }}
          />
        </div>
        {ModelDropDowns()}
        <button
          onClick={() => {
            let tmp = { ...query };
            tmp["models"].push({ modelId: null, versionId: null });
            setQuery(tmp);
          }}
          className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add model
        </button>

        <hr className="m-4" />

        <div className="flex justify-between">
          <button
            onClick={() => {
              fetchUiData(query);
            }}
            className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Submit Query
          </button>
          <button
            onClick={() => {
              const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify(query)
              )}`;
              const link = document.createElement("a");
              link.href = jsonString;
              link.download = "data.json";

              link.click();
            }}
            className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download Query
          </button>
        </div>
      </div>
      {uiData === undefined ? (
        ""
      ) : (
        <>
          <hr className="m-4" />
          {/* Pagination */}
          <div className="flex flex-col items-center mt-4">
            <span className="text-gray-700 dark:text-gray-400">
              Showing page{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {query["page"]}
              </span>{" "}
              out of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {uiData["total_pages"]}
              </span>
            </span>
            <div className="inline-flex mt-2 xs:mt-0">
              <button
                onClick={() => changePage(query["page"] - 1)}
                className="flex items-center justify-center px-3 h-8 font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Prev
              </button>
              <input
                className="flex items-center justify-center px-3 h-8 font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                type="text"
                value={query["page"]}
                onChange={(event) => {
                  changePage(Number(event.target.value));
                }}
              />
              <button
                onClick={() => changePage(query["page"] + 1)}
                className="flex items-center justify-center px-3 h-8 font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                Next
              </button>
            </div>
            <div className="inline-flex mt-2 xs:mt-0 items-center space-x-2">
              <p className="text-gray-700 dark:text-gray-400">
                Items per page:
              </p>
              <input
                className="flex items-center justify-center px-3 h-8font-medium text-white bg-gray-800 border-0 border-l border-gray-700 rounded-r hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                type="text"
                value={query["limit"]}
                onChange={(event) => {
                  let value = Number(event.target.value);
                  if (!Number.isInteger(value)) {
                    return;
                  }
                  if (value < 1) {
                    value = 1;
                  }
                  let tmp = { ...query };
                  tmp["limit"] = value;
                  tmp["page"] = 1;
                  setQuery(tmp);
                  fetchUiData(tmp);
                }}
              />
            </div>
          </div>
          <IssueTable
            uiData={uiData}
            issueModalIsOpen={issueModalIsOpen}
            setIssueModalIsOpen={setIssueModalIsOpen}
            modelData={modelData}
            query={query}
            setQuery={setQuery}
            fetchUiData={fetchUiData}
          />
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
