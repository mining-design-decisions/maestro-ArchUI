import { useEffect, useState } from "react";
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
import { GenerateForms, getInitialConfig, getParsedConfig } from "./components";
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
import { Modal } from "../../components/modal";
import { FileForm, TextForm } from "../../components/forms";

function Embedding({ embedding, fetchEmbeddings }) {
  let [showEmbedding, setShowEmbedding] = useState(false);
  let [file, setFile] = useState<File | null>(null);

  function onFileChange(event) {
    setFile(event.target.files[0]);
  }

  return (
    <div className="space-y-1">
      <button
        className="flex items-center justify-between space-x-4 bg-gray-500 p-2 rounded-lg w-full"
        onClick={() => setShowEmbedding((prevState) => !prevState)}
      >
        <span>{`${embedding["name"]} (${embedding["embedding_id"]})`}</span>
        {showEmbedding ? <ChevronUp /> : <ChevronDown />}
      </button>

      {showEmbedding ? (
        <div className="space-y-4 bg-gray-600 p-4 rounded-lg">
          <div className="flex justify-between">
            <Button
              label={"Train Embedding"}
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
              icon={<RocketLaunchIcon />}
            />
            <UpdateEmbeddingConfig
              embeddingId={embedding["embedding_id"]}
              fetchEmbeddings={fetchEmbeddings}
            />
            <Button
              label={"Delete Embedding"}
              onClick={() => {
                deleteRequest(
                  "/embeddings/" + embedding["embedding_id"],
                  () => {
                    fetchEmbeddings();
                    alert("Embedding deleted");
                  }
                );
              }}
              color="red"
              icon={<TrashIcon />}
            />
          </div>
          <div className="flex space-x-2 items-center">
            <div className="w-full">
              <FileForm label={""} onChange={onFileChange} accept="" />
            </div>
            <Button
              label={"Replace file"}
              onClick={() => {
                uploadFile(
                  "/embeddings/" + embedding["embedding_id"] + "/file",
                  "POST",
                  file,
                  () => {
                    fetchEmbeddings();
                    alert("File uploaded");
                  }
                );
              }}
              icon={<ArrowUpTray />}
            />
            {embedding["has_file"] ? (
              <a
                href={downloadFileLink(
                  `/embeddings/${embedding["embedding_id"]}/file`
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
            ) : (
              <span className="whitespace-nowrap">Embedding not trained</span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmbeddingList({ embeddingList, fetchEmbeddings }) {
  return (
    <>
      {embeddingList.length === 0 ? (
        <p>No embeddings available</p>
      ) : (
        <div className="space-y-4">
          {embeddingList.map((embedding) => {
            return (
              <Embedding
                key={embedding["embedding_id"]}
                embedding={embedding}
                fetchEmbeddings={fetchEmbeddings}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

function EmbeddingForms({ endpoint, prevData, fetchEmbeddings }) {
  if (endpoint === undefined) {
    return <>Loading data</>;
  }

  let [config, setConfig] = useState(
    getInitialConfig(endpoint, prevData, "embedding")
  );
  let [embeddingName, setEmbeddingName] = useState(
    prevData === undefined ? "" : prevData["name"]
  );
  let [openModal, setOpenModal] = useState(false);

  function postEmbedding(embeddingId: string | null, message: string) {
    let url =
      embeddingId === null ? "/embeddings" : `/embeddings/${embeddingId}`;
    postRequest(
      url,
      {
        config: getParsedConfig(config, endpoint),
        name: embeddingName,
      },
      () => {
        alert(message);
        fetchEmbeddings();
      }
    );
  }

  return (
    <div>
      <Button
        label={prevData === undefined ? "Create Embedding" : "Update Config"}
        onClick={() => setOpenModal(true)}
        icon={prevData === undefined ? <PlusIcon /> : <PencilIcon />}
      />
      <Modal
        title={
          prevData === undefined
            ? "Create Embedding"
            : `Update Config (${prevData["embedding_id"]})`
        }
        body={
          <div>
            <TextForm
              label={"embedding-name"}
              value={embeddingName}
              onChange={(event) => setEmbeddingName(event.target.value)}
            />
            <GenerateForms
              endpoint={endpoint}
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
                  label={"Edit Embedding"}
                  onClick={() => {
                    postEmbedding(
                      prevData["embedding_id"],
                      "Embedding updated"
                    );
                  }}
                  icon={<PencilIcon />}
                />
              )}
              <Button
                label={"Create New Embedding"}
                onClick={() => {
                  postEmbedding(null, "Embedding created");
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

function ConfigForms({ prevData, fetchEmbeddings }) {
  let [endpoint, setEndpoint] = useState(undefined);

  useEffect(() => {
    getRequestDlManager("/endpoints").then((data) => {
      let tmp = { ...data["commands"]["generate-embedding-internal"]["args"] };
      tmp["params"] = tmp["embedding-config"];
      delete tmp["embedding-config"];
      tmp["generator"] = tmp["embedding-generator"];
      delete tmp["embedding-generator"];
      setEndpoint(tmp);
    });
  }, []);

  return (
    <EmbeddingForms
      endpoint={endpoint}
      prevData={prevData}
      fetchEmbeddings={fetchEmbeddings}
    />
  );
}

function UpdateEmbeddingConfig({ embeddingId, fetchEmbeddings }) {
  let [prevData, setPrevData] = useState(undefined);

  useEffect(() => {
    getRequest("/embeddings/" + embeddingId).then((data) => setPrevData(data));
  }, []);

  if (prevData !== undefined) {
    return (
      <ConfigForms prevData={prevData} fetchEmbeddings={fetchEmbeddings} />
    );
  }
  return <></>;
}

function CreateNewEmbedding({ fetchEmbeddings }) {
  return <ConfigForms prevData={undefined} fetchEmbeddings={fetchEmbeddings} />;
}

export default function Embeddings() {
  let [embeddingList, setEmbeddingList] = useState([]);

  function fetchEmbeddings() {
    getRequest("/embeddings").then((data) =>
      setEmbeddingList(data["embeddings"])
    );
  }

  useEffect(() => {
    fetchEmbeddings();
  }, []);

  return (
    <div className="container mx-auto space-y-4">
      <CreateNewEmbedding fetchEmbeddings={fetchEmbeddings} />
      <EmbeddingList
        embeddingList={embeddingList}
        fetchEmbeddings={fetchEmbeddings}
      />
    </div>
  );
}
