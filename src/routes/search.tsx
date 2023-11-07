import React, { useEffect, useState } from "react";
import {
  getDatabaseURL,
  getRequest,
  getSearchEngineURL,
  postRequestSearchEngine,
} from "./util";
import {
  MultiSelectForm,
  Select,
  TextAreaForm,
  TextForm,
} from "../components/forms";
import { MagnifyingGlassIcon, RocketLaunchIcon } from "../icons";
import { Button } from "../components/button";

function ProjectsForm({ setSelectedProjects, setProjectsByRepo }) {
  let [projects, setProjects] = useState<
    {
      value: { repo: string; project: string };
      label: string;
    }[]
  >([]);

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

  useEffect(() => fetchProjects(), []);

  return (
    <div className="flex items-center space-x-4">
      <span>Projects</span>
      <MultiSelectForm
        options={projects}
        onChange={(choice) => setSelectedProjects(choice)}
      />
    </div>
  );
}

function ModelForm({ selectedModel, setSelectedModel }) {
  let [models, setModels] = useState([]);
  let [versions, setVersions] = useState({});

  function fetchModels() {
    getRequest("/models").then((data) => setModels([...data["models"]]));
  }

  function fetchVersions(modelId) {
    getRequest("/models/" + modelId + "/versions").then((data) =>
      setVersions((prevState) => ({
        ...prevState,
        [modelId]: [...data["versions"]],
      }))
    );
  }

  function onChange(event) {
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
  }

  useEffect(() => fetchModels(), []);

  return (
    <div className="mt-4 space-y-4">
      <Select
        label="Model id"
        options={models.map((model) => ({
          label: `${model["model_name"]} (${model["model_id"]})`,
          value: model["model_id"],
        }))}
        onChange={onChange}
        includeNull={true}
      />
      <VersionForm
        versions={versions}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}

function VersionForm({ versions, selectedModel, setSelectedModel }) {
  if (selectedModel["modelId"] === null) {
    return;
  }
  if (!(selectedModel["modelId"] in versions)) {
    return;
  }

  function onChange(event) {
    let value = event.target.value;
    if (value === "null") {
      setSelectedModel((prevState) => ({
        ...prevState,
        versionId: null,
      }));
    } else {
      setSelectedModel((prevState) => ({
        ...prevState,
        versionId: value,
      }));
    }
  }

  return (
    <Select
      label="Version id"
      options={versions[selectedModel["modelId"]].map((version) => ({
        label: `${version["description"]} (${version["version_id"]})`,
        value: version["version_id"],
      }))}
      onChange={onChange}
      includeNull={true}
    />
  );
}

function GenerateIndex({ selectedModel, getProjectsByRepo }) {
  function generateIndex() {
    if (checkModel(selectedModel)) {
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

  return (
    <div className="flex justify-center mt-4">
      <Button
        label="Generate Index"
        onClick={generateIndex}
        icon={<RocketLaunchIcon />}
      />
    </div>
  );
}

function ClassForms({ setFilterClasses, selectedModel }) {
  if (selectedModel["versionId"] === null) {
    return <></>;
  }
  return (
    <div className="flex justify-between space-x-4">
      {["Existence", "Executive", "Property"].map((className) => (
        <Select
          key={className}
          label={className}
          options={[
            { label: "Either", value: "null" },
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ]}
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
        />
      ))}
    </div>
  );
}

function SearchResults({ searchResults }) {
  return (
    <div className=" border-gray-500 rounded-lg p-4 mt-4 space-y-4">
      <p className="flex justify-center text-2xl font-bold">Search results</p>
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
            className="rounded-lg border border-gray-500 p-2"
            key={result["issue_id"]}
          >
            <p className="text-lg font-bold">
              {idx + 1}. {result["issue_key"]}: {result["summary"]}
            </p>
            <p className="italic mt-2 text-green-500">
              Issue ID: {result["issue_id"]}
            </p>
            <p className="italic text-green-500">Label: {label.join(", ")}</p>
            <p className="italic text-green-500">
              Score: {result["hit_score"]}
            </p>
            <p className="mt-2">{result["description"]}</p>
          </div>
        );
      })}
    </div>
  );
}

function checkModel(selectedModel) {
  if (
    selectedModel["modelId"] !== null &&
    selectedModel["versionId"] === null
  ) {
    alert("Please select a model version");
    return false;
  }
  return true;
}

export default function Search() {
  let [selectedProjects, setSelectedProjects] = useState([]);
  let [projectsByRepo, setProjectsByRepo] = useState({});
  let [selectedModel, setSelectedModel] = useState({
    modelId: null,
    versionId: null,
  });
  let [query, setQuery] = useState("");
  let [numResults, setNumResults] = useState(10);
  let [filterClasses, setFilterClasses] = useState({
    existence: null,
    executive: null,
    property: null,
  });
  let [searchResults, setSearchResults] = useState([]);

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

  function search() {
    if (checkModel(selectedModel)) {
      let tmp = { ...filterClasses };
      if (selectedModel["modelId"] === null) {
        tmp = {
          existence: null,
          executive: null,
          property: null,
        };
      }
      postRequestSearchEngine(
        "/search",
        {
          database_url: getDatabaseURL(),
          model_id: selectedModel["modelId"],
          version_id: selectedModel["versionId"],
          repos_and_projects: getProjectsByRepo(),
          query: query,
          num_results: numResults,
          predictions: tmp,
        },
        (data) => setSearchResults([...data["payload"]])
      );
    }
  }

  return (
    <div className="mx-auto container pb-4">
      <p className="text-4xl font-bold justify-center flex mb-4">Search</p>
      <div className="border border-gray-500 rounded-lg p-4">
        <ProjectsForm
          setSelectedProjects={setSelectedProjects}
          setProjectsByRepo={setProjectsByRepo}
        />
        <ModelForm
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        <GenerateIndex
          selectedModel={selectedModel}
          getProjectsByRepo={getProjectsByRepo}
        />
      </div>

      <div className="border border-gray-500 rounded-lg p-4 mt-4 space-y-4">
        <TextAreaForm
          label="Query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ClassForms
          setFilterClasses={setFilterClasses}
          selectedModel={selectedModel}
        />
        <div className="flex justify-between space-x-4">
          <TextForm
            label="Number of results"
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
          <Button
            label="Search"
            onClick={search}
            icon={<MagnifyingGlassIcon />}
          />
        </div>
      </div>

      <SearchResults searchResults={searchResults} />
    </div>
  );
}
