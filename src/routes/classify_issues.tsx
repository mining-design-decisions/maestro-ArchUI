import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useState, version } from "react";
import { deleteRequest, getRequest, patchRequest, postRequest } from "./util";
import { FileForm, Select, TextAreaForm, TextForm } from "../components/forms";
import { Button } from "../components/button";
import {
  ArrowDown,
  ArrowDownTray,
  ArrowUp,
  ArrowUpTray,
  ArrowsUpDown,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "../icons";
import { Modal } from "../components/modal";
import { getWebSocket } from "../components/connectionSettings";

function fetchVersions(modelId, versions, setVersions) {
  getRequest(`/models/${modelId}/versions`).then((data) => {
    let tmp = { ...versions };
    tmp[modelId] = data["versions"].map((item) => {
      return {
        label: `${item["description"]} (${item["version_id"]})`,
        value: item["version_id"],
      };
    });
    setVersions(tmp);
  });
}

function ModelForms({
  query,
  setQuery,
  modelData,
  setModelData,
  versions,
  setVersions,
}) {
  function fetchModels() {
    getRequest("/models").then((data) =>
      setModelData(
        data["models"].map((item) => {
          return {
            label: `${item["model_name"]} (${item["model_id"]})`,
            value: item["model_id"],
          };
        })
      )
    );
  }

  useEffect(() => {
    fetchModels();
  }, []);

  let dropDowns: React.JSX.Element[] = [];
  for (let i = 0; i < query["models"].length; i++) {
    dropDowns.push(
      <div key={"model " + i} className="space-y-2">
        {i > 0 ? <hr className="border-gray-500 m-4" /> : null}
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">{"Model " + i}</span>
          <Button
            label=""
            onClick={() => {
              let tmp = { ...query };
              tmp["models"].splice(i, 1);
              setQuery(tmp);
            }}
            icon={<TrashIcon />}
            color="red"
          />
        </div>
        <Select
          label="model id"
          value={query["models"][i]["modelId"]}
          options={modelData}
          onChange={(e) => {
            let value = e.target.value;
            let tmp = { ...query };
            tmp["models"][i]["modelId"] = value;
            setQuery(tmp);
            if (!(value in versions)) {
              fetchVersions(value, versions, setVersions);
            }
          }}
          includeNull={true}
        />
        {query["models"][i]["modelId"] in versions ? (
          <Select
            label="version id"
            value={query["models"][i]["versionId"]}
            options={versions[query["models"][i]["modelId"]]}
            onChange={(e) => {
              let tmp = { ...query };
              tmp["models"][i]["versionId"] = e.target.value;
              setQuery(tmp);
            }}
            includeNull={true}
          />
        ) : null}
      </div>
    );
  }
  return (
    <div className="border border-gray-500 rounded-lg p-2 m-2 space-y-2">
      <p className="flex justify-center text-xl font-bold">Models</p>
      {dropDowns}
      <div className="flex justify-center">
        <Button
          label="Add model"
          onClick={() => {
            let tmp = { ...query };
            tmp["models"].push({ modelId: null, versionId: null });
            setQuery(tmp);
          }}
          icon={<PlusIcon />}
        />
      </div>
    </div>
  );
}

function Pagination({ query, setQuery, uiData, setUiData }) {
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
    fetchUiData(tmp, setUiData);
  }

  if (uiData === undefined) {
    return <></>;
  }

  return (
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
        <p className="text-gray-700 dark:text-gray-400">Items per page:</p>
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
            fetchUiData(tmp, setUiData);
          }}
        />
      </div>
    </div>
  );
}

function getParsedQuery(newQuery) {
  let parsedQuery = { ...newQuery };
  parsedQuery["filter"] = JSON.parse(parsedQuery["filter"]);
  parsedQuery["models"] = parsedQuery["models"].map(
    (item) => item["modelId"] + "-" + item["versionId"]
  );
  return parsedQuery;
}

function fetchUiData(newQuery, setUiData) {
  postRequest("/ui", getParsedQuery(newQuery), (data) => {
    setUiData(data);
  });
}

function Query({
  query,
  setQuery,
  uiData,
  setUiData,
  modelData,
  setModelData,
}) {
  let [versions, setVersions] = useState({});
  let [queryName, setQueryName] = useState("");
  let [selectedQuery, setSelectedQuery] = useState("null");
  let [storedQueries, setStoredQueries] = useState(getQueries());

  function readFile(event) {
    if (event.target.files) {
      let fileReader = new FileReader();
      fileReader.addEventListener("load", (event) => {
        if (event.target?.result) {
          let newQuery = JSON.parse(event.target.result);
          setQuery(newQuery);
          newQuery["models"].map((item) => {
            fetchVersions(item["modelId"], versions, setVersions);
          });
        }
      });
      fileReader.readAsText(event.target.files[0]);
    }
  }

  function saveQuery() {
    let queries: string | null = localStorage.getItem("queries");
    let parsedQueries: Object;
    if (queries === null) {
      parsedQueries = {};
    } else {
      parsedQueries = JSON.parse(queries);
    }
    parsedQueries[queryName] = query;
    localStorage.setItem("queries", JSON.stringify(parsedQueries));
    setStoredQueries(getQueries());
  }

  function deleteQuery() {
    if (selectedQuery === "null") {
      return;
    }

    let queries: string | null = localStorage.getItem("queries");
    if (queries === null) {
      return;
    }

    let parsedQueries: Object = JSON.parse(queries);
    delete parsedQueries[selectedQuery];
    localStorage.setItem("queries", JSON.stringify(parsedQueries));
    setStoredQueries(getQueries());
  }

  function loadQuery(queryName: string) {
    if (queryName === "null") {
      return;
    }
    let queries: string | null = localStorage.getItem("queries");
    if (queries === null) {
      return;
    }
    setQuery(JSON.parse(queries)[queryName]);
  }

  function getQueries() {
    let queries: string | null = localStorage.getItem("queries");
    if (queries === null) {
      return [];
    }
    let parsedQueries = JSON.parse(queries);
    return Object.keys(parsedQueries)
      .map((key) => {
        return {
          label: key,
          value: key,
        };
      })
      .filter((x) => x !== undefined);
  }

  return (
    <div className="border rounded-lg border-gray-500 p-2 space-y-4">
      <p className="flex justify-center text-2xl font-bold mb-4">Query</p>
      <FileForm label="Import query from file" onChange={readFile} />
      <div className="flex items-center space-x-4">
        <div className="w-full">
          <Select
            label={"Import query"}
            value={selectedQuery}
            options={storedQueries}
            onChange={(e) => {
              setSelectedQuery(e.target.value);
              loadQuery(e.target.value);
            }}
            includeNull={true}
          />
        </div>
        <Button
          label={""}
          onClick={deleteQuery}
          color="red"
          icon={<TrashIcon />}
        />
      </div>
      <TextAreaForm
        label="Issue filter"
        value={query["filter"]}
        onChange={(event) => {
          setQuery((prevState) => ({
            ...prevState,
            filter: event.target.value,
          }));
        }}
      />
      <ModelForms
        query={query}
        setQuery={setQuery}
        versions={versions}
        setVersions={setVersions}
        modelData={modelData}
        setModelData={setModelData}
      />
      <div className="flex space-x-4">
        <div className="w-full">
          <TextForm
            label={"Save query as:"}
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
          />
        </div>
        <Button label={"Save"} onClick={saveQuery} />
      </div>
      <div className="flex justify-center space-x-4">
        <Button
          label="Submit Query"
          onClick={() => {
            fetchUiData(query, setUiData);
          }}
          icon={<ArrowUpTray />}
        />
        <Button
          label="Download Query"
          onClick={() => {
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
              JSON.stringify(query)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = "data.json";

            link.click();
          }}
          icon={<ArrowDownTray />}
        />
      </div>
      <Pagination
        query={query}
        setQuery={setQuery}
        uiData={uiData}
        setUiData={setUiData}
      />
    </div>
  );
}

function TableHeader({ query, setQuery, predictions, setUiData, modelData }) {
  return (
    <thead className="uppercase bg-gray-700">
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
                key={modelId + className}
                className="p-4"
                onClick={() => {
                  let newSort = "predictions." + modelId + "." + className;
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
                  fetchUiData(tmp, setUiData);
                }}
              >
                <div className="flex items-center">
                  {modelData.map((model) => {
                    if (model["value"] === modelId.split("-")[0]) {
                      return model["label"];
                    }
                  })}{" "}
                  - {className}
                  {query["sort"] ===
                  "predictions." + modelId + "." + className ? (
                    <>{query["sort_ascending"] ? <ArrowUp /> : <ArrowDown />}</>
                  ) : (
                    <ArrowsUpDown />
                  )}
                </div>
              </th>
            );
          });
        })}
      </tr>
    </thead>
  );
}

function ManualLabelForm({ issue }) {
  let [label, setLabel] = useState({ ...issue["manual_label"] });

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

  function getChecked(className: string) {
    if (className === "non-architectural") {
      return !label["existence"] && !label["executive"] && !label["property"];
    }
    return label[className];
  }

  return (
    <div>
      <p className="text-2xl font-bold">Manual Label</p>
      <div className="border rounded-lg p-2 border-gray-400 space-y-2">
        <table>
          <tbody>
            {["existence", "executive", "property", "non-architectural"].map(
              (className) => (
                <tr>
                  <td>
                    <label>{className}</label>
                  </td>
                  <td>
                    <input
                      className="ml-4"
                      type="checkbox"
                      checked={getChecked(className)}
                      onChange={() => {
                        updateLabel(className);
                      }}
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        <div className="flex space-x-4 justify-between">
          <Button
            label="Set Manual Label"
            onClick={() => {
              postRequest("/manual-labels/" + issue["issue_id"], label, () =>
                alert("Manual label set")
              );
            }}
          />
          {issue["tags"].includes("needs-review") ? (
            <Button
              label="Finish review"
              onClick={() => {
                postRequest(
                  "/issues/" + issue["issue_id"] + "/finish-review",
                  null
                );
              }}
              color="green"
            />
          ) : (
            <Button
              label="Mark for review"
              onClick={() => {
                postRequest(
                  "/issues/" + issue["issue_id"] + "/mark-review",
                  null
                );
              }}
              color="red"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EditComment({ issueId, commentKey, comment }) {
  let [editing, setEditing] = useState(false);
  let [value, setValue] = useState(comment["comment"]);

  return (
    <div className="space-y-2 mt-2">
      {editing ? (
        <TextAreaForm
          label="New comment"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : null}
      <div className="flex justify-between">
        <Button
          label="Delete Comment"
          onClick={() => {
            deleteRequest(`/manual-labels/${issueId}/comments/${commentKey}`);
          }}
          icon={<TrashIcon />}
          color="red"
        />
        <Button
          label="Edit Comment"
          onClick={() => {
            if (editing) {
              patchRequest(`/manual-labels/${issueId}/comments/${commentKey}`, {
                comment: value,
              });
              setEditing(false);
            } else {
              setEditing(true);
            }
          }}
          icon={<PencilIcon />}
        />
      </div>
    </div>
  );
}

function Comments({ issue }) {
  let [newComment, setNewComment] = useState("");

  return (
    <>
      <p className="text-2xl font-bold">Comments</p>
      {Object.entries(issue["comments"]).map(([key, comment]) => {
        return (
          <div key={key} className="border rounded-lg p-2 border-gray-400">
            <p className="bg-gray-700 rounded-t-lg p-2 font-bold">
              {issue["comments"][key]["author"]} ({key})
            </p>
            <p className="bg-gray-800 rounded-b-lg p-2">
              {issue["comments"][key]["comment"]}
            </p>
            <EditComment
              comment={comment}
              issueId={issue["issue_id"]}
              commentKey={key}
            />
          </div>
        );
      })}

      <div className="border rounded-lg p-2 border-gray-400 space-y-2">
        <TextAreaForm
          label="New comment:"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            label="Post comment"
            onClick={() => {
              postRequest("/manual-labels/" + issue["issue_id"] + "/comments", {
                comment: newComment,
              });
              setNewComment("");
            }}
            color="green"
            icon={<ArrowUpTray />}
          />
        </div>
      </div>
    </>
  );
}

function Tags({ issue, tags }) {
  let [selectedTag, setSelectedTag] = useState("null");

  return (
    <>
      <p className="text-2xl font-bold">Tags</p>
      <div className="border rounded-lg p-2 border-gray-400">
        <p className="font-bold text-xl">Manual tags</p>
        {issue["tags"].map((tag) => {
          if (tags.includes(tag)) {
            return (
              <div key={tag} className="m-2 flex items-center">
                <Button
                  label=""
                  onClick={() =>
                    deleteRequest(`/issues/${issue["issue_id"]}/tags/${tag}`)
                  }
                  color="red"
                  icon={<TrashIcon />}
                />
                <p className="ml-2">{tag}</p>
              </div>
            );
          }
        })}

        <p className="font-bold text-xl">Auto-generated tags</p>
        {issue["tags"].map((tag) => {
          if (!tags.includes(tag)) {
            return (
              <div key={tag} className="m-2 flex items-center">
                <Button
                  label=""
                  onClick={() =>
                    deleteRequest(`/issues/${issue["issue_id"]}/tags/${tag}`)
                  }
                  color="red"
                  icon={<TrashIcon />}
                />
                <p className="ml-2">{tag}</p>
              </div>
            );
          }
        })}

        <hr className="border-gray-400 m-2" />

        <div className="flex space-x-4">
          <Select
            label={"New tag:"}
            value={selectedTag}
            options={tags
              .map((tag) => {
                if (!issue["tags"].includes(tag)) {
                  return {
                    label: tag,
                    value: tag,
                  };
                }
              })
              .filter((x) => x !== undefined)}
            onChange={(e) => setSelectedTag(e.target.value)}
            includeNull={true}
          />
          <Button
            label={"Add Tag"}
            onClick={() => {
              if (selectedTag !== "null") {
                postRequest("/issues/" + issue["issue_id"] + "/tags", {
                  tag: selectedTag,
                });
              } else {
                alert("Please select a tag");
              }
            }}
          />
        </div>
      </div>
    </>
  );
}

function ClassifyModal({ issue, tags }) {
  let [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button
        label={`Classify ${
          issue["tags"].includes("needs-review") ? "(needs-review)" : ""
        }`}
        onClick={() => {
          setOpenModal(true);
        }}
        color={issue["tags"].includes("needs-review") ? "orange" : "blue"}
      />
      <Modal
        title={
          <p className="text-4xl font-bold">
            <a
              href={issue["issue_link"]}
              target="_blank"
              className="text-blue-500 underline hover:no-underline"
            >
              {issue["issue_key"]}
            </a>{" "}
            ({issue["issue_id"]})
          </p>
        }
        body={
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-2xl font-bold">Summary</p>
              <p className="text-base">{issue["summary"]}</p>
            </div>

            <div>
              <p className="text-2xl font-bold mt-4">Description</p>
              <p className="max-h-96 overflow-auto">{issue["description"]}</p>
            </div>

            <ManualLabelForm issue={issue} />

            <Comments issue={issue} />

            <Tags issue={issue} tags={tags} />
          </div>
        }
        openModal={openModal}
        setOpenModal={setOpenModal}
      />
    </>
  );
}

function sortTags(a, b) {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  return 0;
}

function IssueTable({ socket, uiData, setUiData, query, setQuery, modelData }) {
  if (uiData === undefined) {
    return <></>;
  }

  let [tags, setTags] = useState([]);

  useEffect(() => {
    getRequest("/tags").then((data) => {
      let tmp = [];
      data["tags"].map((tag) => {
        if (tag["type"] === "manual-tag") {
          tmp.push(tag["name"]);
        }
      });
      tmp.sort(sortTags);
      setTags(tmp);
    });
  }, []);

  if (uiData["data"] === undefined) {
    return <></>;
  }

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

  return (
    <>
      <div className="relative overflow-x-auto m-4 border-4 border-gray-700 rounded-lg">
        <table className="table-auto text-left text-white">
          <TableHeader
            query={query}
            setQuery={setQuery}
            predictions={predictions}
            setUiData={setUiData}
            modelData={modelData}
          />
          <tbody>
            {uiData["data"].map((item, index) => {
              item["tags"].sort(sortTags);
              return (
                <tr
                  key={index}
                  className={
                    (index % 2 === 0 ? " bg-gray-600" : " bg-gray-700") +
                    (focusRow === index ? " bg-gray-400" : " ")
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
                    <ClassifyModal issue={item} tags={tags} />
                  </td>
                  <td className="p-4">{renderLabel(item["manual_label"])}</td>
                  <td className="p-4">
                    <ul className="list-disc">
                      {item["tags"].map((tag) => {
                        if (tags.includes(tag)) {
                          return <li key={tag}>{tag}</li>;
                        }
                      })}
                    </ul>
                  </td>
                  {Object.keys(item["predictions"]).map((modelId) => {
                    return Object.keys(item["predictions"][modelId]).map(
                      (className) => {
                        let prediction =
                          item["predictions"][modelId][className]["prediction"];
                        let confidence =
                          item["predictions"][modelId][className]["confidence"];
                        return (
                          <td key={modelId + className} className="p-4">
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
    </>
  );
}

export default function ClassifyIssues() {
  // Websocket
  const socket = getWebSocket();

  let [query, setQuery] = useState({
    filter: "",
    sort: null,
    sort_ascending: false,
    models: [],
    page: 1,
    limit: 10,
  });
  let [modelData, setModelData] = useState(undefined);
  let [uiData, setUiData] = useState(undefined);

  return (
    <div className="container mx-auto w-fit pb-4">
      <p className="text-4xl font-bold justify-center flex mb-4">
        Classify Issues
      </p>
      <Query
        uiData={uiData}
        setUiData={setUiData}
        query={query}
        setQuery={setQuery}
        modelData={modelData}
        setModelData={setModelData}
      />
      <IssueTable
        socket={socket}
        uiData={uiData}
        setUiData={setUiData}
        query={query}
        setQuery={setQuery}
        modelData={modelData}
      />
    </div>
  );
}
