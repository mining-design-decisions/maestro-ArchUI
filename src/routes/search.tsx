import React, { useEffect, useState } from "react";
import WindowedSelect from "react-windowed-select";
import {
  getDatabaseURL,
  getRequest,
  getSearchEngineURL,
  postRequestSearchEngine,
} from "./util";

function SearchResults({ searchResults }) {
  return (
    <>
      {searchResults.map((result, idx) => {
        let label: string[] = [];
        for (let className of ["existence", "executive", "property"]) {
          if (result[className] === "true") {
            label.push(className);
          }
        }
        if (label.length === 0) {
          label.push("non-architectural");
        }
        return (
          <div
            className="my-4 rounded-lg bg-gray-700 p-2"
            key={result["issue_id"]}
          >
            <p className="text-2xl font-bold">
              {idx + 1}: {result["issue_key"]}: {result["summary"]}
            </p>
            <p className="italic mt-2 text-green-500">
              Issue ID: {result["issue_id"]}
            </p>
            <p className="italic text-green-500">Label: {label.join(", ")}</p>
            <p className="italic text-green-500">
              Score: {result["hit_score"]}
            </p>
            <p className="text-lg mt-2">{result["description"]}</p>
          </div>
        );
      })}
    </>
  );
}

export default function Search() {
  let [projects, setProjects] = useState<
    {
      value: { repo: string; project: string };
      label: string;
    }[]
  >([]);
  let [selectedProjects, setSelectedProjects] = useState([]);
  let [projectsByRepo, setProjectsByRepo] = useState({});

  function fetchProjects() {
    getRequest("/repos").then((data) => {
      let repos: string[] = [];
      data["repos"].sort();
      Promise.all(
        data["repos"].map((repo: string) => {
          repos.push(repo);
          return fetch(getDatabaseURL() + "/repos/" + repo + "/projects");
        })
      ).then((responses) => {
        Promise.all(responses.map((response) => response.json())).then(
          (results) => {
            let tmp: {
              value: { repo: string; project: string };
              label: string;
            }[] = [];
            let tmpProjectsByRepo = {};
            tmp.push({
              value: {
                repo: "All",
                project: "All",
              },
              label: "All",
            });
            results.map((result, idx) => {
              tmp.push({
                value: {
                  repo: repos[idx],
                  project: "All",
                },
                label: "All " + repos[idx],
              });
            });
            results.map((result, idx) => {
              tmpProjectsByRepo[repos[idx]] = [...result["projects"]];
              for (let project of result["projects"]) {
                tmp.push({
                  value: {
                    repo: repos[idx],
                    project: project,
                  },
                  label: repos[idx] + " " + project,
                });
              }
            });
            setProjects(tmp);
            setProjectsByRepo(tmpProjectsByRepo);
          }
        );
      });
    });
  }

  let [selectedModel, setSelectedModel] = useState({
    modelId: null,
    versionId: null,
  });
  let [models, setModels] = useState([]);
  function fetchModels() {
    getRequest("/models").then((data) => setModels([...data["models"]]));
  }

  let [versions, setVersions] = useState({});
  function fetchVersions(modelId) {
    getRequest("/models/" + modelId + "/versions").then((data) =>
      setVersions((prevState) => ({
        ...prevState,
        [modelId]: [...data["versions"]],
      }))
    );
  }

  function checkModel() {
    if (
      selectedModel["modelId"] !== null &&
      selectedModel["versionId"] === null
    ) {
      alert("Please select a model version");
      return false;
    }
    return true;
  }

  function getProjectsByRepo() {
    let projects_by_repo = {};
    for (let item of selectedProjects) {
      item = item["value"];
      if (item["repo"] === "All") {
        for (let [key, value] of Object.entries(projectsByRepo)) {
          projects_by_repo[key] = new Set(value);
        }
        break;
      }
      if (item["project"] === "All") {
        projects_by_repo[item["repo"]] = new Set(projectsByRepo[item["repo"]]);
      } else {
        if (!(item["repo"] in projects_by_repo)) {
          projects_by_repo[item["repo"]] = new Set();
        }
        projects_by_repo[item["repo"]].add(item["project"]);
      }
    }

    // Convert sets to arrays
    for (let [key, value] of Object.entries(projects_by_repo)) {
      projects_by_repo[key] = Array.from(value);
    }

    return projects_by_repo;
  }

  function generateIndex() {
    if (checkModel()) {
      postRequestSearchEngine(
        "/create-index",
        {
          database_url: getDatabaseURL(),
          model_id: selectedModel["modelId"],
          version_id: selectedModel["versionId"],
          repos_and_projects: getProjectsByRepo(),
        },
        (data) => {
          alert(JSON.stringify(data));
        }
      );
      alert("Generating index...");
    }
  }

  let [query, setQuery] = useState("");
  let [numResults, setNumResults] = useState(10);
  let [filterClasses, setFilterClasses] = useState({
    existence: null,
    executive: null,
    property: null,
  });
  let [searchResults, setSearchResults] = useState([]);

  function search() {
    if (checkModel()) {
      postRequestSearchEngine(
        "/search",
        {
          database_url: getDatabaseURL(),
          model_id: selectedModel["modelId"],
          version_id: selectedModel["versionId"],
          repos_and_projects: getProjectsByRepo(),
          query: query,
          num_results: numResults,
          predictions: filterClasses,
        },
        (data) => setSearchResults([...data["payload"]])
      );
    }
  }

  useEffect(() => {
    fetchProjects();
    fetchModels();
  }, []);

  return (
    <div className="mx-4 pb-4">
      <div className="flex items-center space-x-4">
        <span>Projects</span>
        <WindowedSelect
          unstyled
          className="w-full"
          classNames={{
            control: ({ isFocused }) =>
              "border rounded-lg bg-gray-700 hover:cursor-pointer border-gray-700",
            valueContainer: () => "p-1 gap-1",
            dropdownIndicator: () => "bg-gray-700 text-white",
            indicatorSeparator: () => "bg-gray-700",
            clearIndicator: () =>
              "text-white p-1 rounded-md hover:bg-gray-600 hover:text-red-700",
            multiValue: () =>
              "bg-blue-600 rounded items-center py-0.5 pl-2 pr-1 gap-1.5",
            multiValueLabel: () => "leading-6 py-0.5",
            multiValueRemove: () =>
              "bg-gray-700 text-white hover:bg-gray-500 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md",
            option: ({ isFocused, isSelected }) => {
              let base = "hover:cursor-pointer px-3 py-2 rounded";
              if (isFocused) {
                base += " bg-gray-600 active:bg-gray-600";
              }
              if (isSelected) {
                base +=
                  " after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500";
              }
              return base;
            },
            menu: () => "p-1 mt-2 bg-gray-700 rounded-lg",
          }}
          isMulti
          options={projects}
          windowThreshold={20}
          onChange={(choice) => setSelectedProjects(choice)}
        />
      </div>
      <div className="mt-4 space-x-4">
        <span>Model id:</span>
        <select
          className="p-1 rounded-lg bg-gray-700"
          onChange={(event) => {
            let value = event.target.value;
            if (value === "null") {
              setSelectedModel({
                modelId: null,
                versionId: null,
              });
            } else {
              setSelectedModel({
                modelId: value,
                versionId: null,
              });
              fetchVersions(value);
            }
          }}
        >
          <option key="null" value={"null"}>
            None
          </option>
          {models.map((model) => (
            <option key={model["model_id"]} value={model["model_id"]}>
              {model["model_name"]} ({model["model_id"]})
            </option>
          ))}
        </select>
      </div>
      {selectedModel["modelId"] !== null &&
      selectedModel["modelId"] in versions ? (
        <div className="mt-4 space-x-4">
          <span>Version id:</span>
          <select
            className="p-1 rounded-lg bg-gray-700"
            onChange={(event) => {
              let value = event.target.value;
              if (value === "null") {
                selectedModel["versionId"] = null;
              } else {
                selectedModel["versionId"] = value;
              }
            }}
          >
            <option key="null" value={"null"}>
              None
            </option>
            {versions[selectedModel["modelId"]].map((version) => (
              <option key={version["version_id"]} value={version["version_id"]}>
                {version["description"]} ({version["version_id"]})
              </option>
            ))}
          </select>
        </div>
      ) : (
        ""
      )}
      <button
        className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={generateIndex}
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
            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
          />
        </svg>
        Generate Index
      </button>
      <hr className="m-4" />
      <div className="flex mt-4 space-x-4">
        <span>Query:</span>
        <textarea
          className="p-1 rounded-lg bg-gray-700"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mt-4 space-x-4">
        <span>Number of results:</span>
        <input
          className="p-1 rounded-lg bg-gray-700"
          value={numResults}
          onChange={(event) => {
            let value = Number(event.target.value);
            if (Number.isInteger(value)) {
              if (value > 0) {
                setNumResults(value);
              }
            }
          }}
        />
      </div>
      {["Existence", "Executive", "Property"].map((className) => (
        <div key={className} className="mt-4 space-x-4">
          <span>{className}:</span>
          <select
            className="p-1 rounded-lg bg-gray-700"
            onChange={(event) => {
              let value = event.target.value;
              if (value === "null") {
                setFilterClasses((prevState) => ({
                  ...prevState,
                  [className.toLowerCase()]: null,
                }));
              }
              if (value === "true") {
                setFilterClasses((prevState) => ({
                  ...prevState,
                  [className.toLowerCase()]: true,
                }));
              }
              if (value === "false") {
                setFilterClasses((prevState) => ({
                  ...prevState,
                  [className.toLowerCase()]: false,
                }));
              }
            }}
          >
            <option value="null">Either</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      ))}
      <button
        className="flex items-center space-x-4 mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={search}
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
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        Search
      </button>
      <SearchResults searchResults={searchResults} />
    </div>
  );
}
