import React, { useEffect, useState } from "react";
import WindowedSelect from "react-windowed-select";

export default function Search() {
  let [projects, setProjects] = useState<
    {
      value: { repo: string; project: string };
      label: string;
    }[]
  >([]);
  let [selectedProjects, setSelectedProjects] = useState([])
  let [projectsByRepo, setProjectsByRepo] = useState({})

  let connectionSettings = JSON.parse(
    localStorage.getItem("connectionSettings")
  );

  function fetchProjects() {
    fetch(connectionSettings["databaseURL"] + "/repos")
      .then((response) => response.json())
      .then((data) => {
        let repos: string[] = [];
        data["repos"].sort();
        Promise.all(
          data["repos"].map((repo: string) => {
            repos.push(repo);
            return fetch(
              connectionSettings["databaseURL"] + "/repos/" + repo + "/projects"
            );
          })
        ).then((responses) => {
          Promise.all(responses.map((response) => response.json())).then(
            (results) => {
              let tmp: {
                value: { repo: string; project: string };
                label: string;
              }[] = [];
              let tmpProjectsByRepo = {}
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
                tmpProjectsByRepo[repos[idx]] = [...result["projects"]]
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
              setProjectsByRepo(tmpProjectsByRepo)
            }
          );
        });
      });
  }

  function generateIndex() {
    let projects_by_repo = {}
    for (let item of selectedProjects) {
      if (item["repo"] === "All") {
        projects_by_repo = {...projectsByRepo}
        break
      }
      if (item["project"] === "All") {
        projects_by_repo[item["repo"]] = 
      }
    }
    
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "database_url": connectionSettings["databaseURL"],
        "model_id": "",
        "version_id": "",
        "projects_by_repo": []
      })
    }
    fetch(connectionSettings["searchEngineURL"] + "/create-index", request)
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <div>
        <span>Projects</span>
        <WindowedSelect
          className="text-black"
          isMulti
          options={projects}
          windowThreshold={20}
          onChange={(choice) => setSelectedProjects(choice)}
        />
      </div>
      <div>
        <span>Model id:</span>
        <select>
          <option>1</option>
        </select>
      </div>
      <div>
        <span>Version id:</span>
        <select>
          <option>1</option>
        </select>
      </div>
      <button onClick={generateIndex}>Generate Index</button>
      <hr />
      <div>
        <span>Filter:</span>
        <textarea />
      </div>
      <div>
        <span>Number of results:</span>
        <input type="number" />
      </div>
      <p>Model</p>

      <div>
        <span>Existence:</span>
        <select>
          <option>1</option>
        </select>
      </div>
      <div>
        <span>Executive:</span>
        <select>
          <option>1</option>
        </select>
      </div>
      <div>
        <span>Property:</span>
        <select>
          <option>1</option>
        </select>
      </div>
      <button>Search</button>
    </>
  );
}
