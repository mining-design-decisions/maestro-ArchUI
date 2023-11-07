import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { deleteRequest, getRequest, postRequest } from "./util";
import { Button } from "../components/button";
import { PencilIcon, PlusIcon, TrashIcon } from "../icons";
import { Modal } from "../components/modal";
import { TextAreaForm, TextForm } from "../components/forms";

function CreateTag({ fetchTags }) {
  let [tag, setTag] = useState({ tag: "", description: "" });
  let [openModal, setOpenModal] = useState(false);

  function onChange(event, key) {
    setTag((prevState) => ({
      ...prevState,
      [key]: event.target.value,
    }));
  }

  return (
    <div className="flex justify-center">
      <Button
        label="Create Tag"
        onClick={() => setOpenModal(true)}
        icon={<PlusIcon />}
      />
      <Modal
        title="Create Tag"
        openModal={openModal}
        setOpenModal={setOpenModal}
        body={
          <div className="space-y-2">
            <TextForm
              label="Name"
              value={tag["tag"]}
              onChange={(event) => {
                onChange(event, "tag");
              }}
            />
            <TextAreaForm
              label="Description"
              value={tag["description"]}
              onChange={(event) => {
                onChange(event, "description");
              }}
            />
            <div className="flex justify-center pt-4">
              <Button
                label="Create Tag"
                onClick={() => {
                  postRequest("/tags", tag, () => {
                    alert("Tag created");
                    setOpenModal(false);
                    fetchTags();
                  });
                }}
                icon={<PlusIcon />}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}

function EditTag({ tag, description, fetchTags }) {
  let [newDescription, setNewDescription] = useState({
    description: description,
  });
  let [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      <Button
        label="Edit"
        onClick={() => setOpenModal(true)}
        icon={<PencilIcon />}
      />
      <Modal
        title={`Edit tag: ${tag}`}
        openModal={openModal}
        setOpenModal={setOpenModal}
        body={
          <div className="space-y-4">
            <TextAreaForm
              label="Description"
              value={newDescription["description"]}
              onChange={(event) => {
                setNewDescription((prevState) => ({
                  ...prevState,
                  description: event.target.value,
                }));
              }}
            />
            <div className="flex justify-center">
              <Button
                label={`Edit Tag: ${tag}`}
                onClick={() => {
                  postRequest("/tags/" + tag, newDescription, () => {
                    alert("Tag upated");
                    setOpenModal(false);
                    fetchTags();
                  });
                }}
                icon={<PencilIcon />}
              />
            </div>
          </div>
        }
      />
    </>
  );
}

function TagsTable({ tags, fetchTags }) {
  if (tags.length === 0) {
    return (
      <p className="text-2xl font-bold flex justify-center mt-4">
        No tags available for display
      </p>
    );
  }
  return (
    <div className="rounded-lg overflow-hidden mt-4">
      <table className="table-auto text-left text-gray-200 dark:text-gray-100">
        <thead className="uppercase bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Description</th>
            <th className="p-4">Edit</th>
            <th className="p-4">Delete</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((item) => {
            if (item["type"] !== "manual-tag") {
              return;
            }
            return (
              <tr key={item["name"]} className="bg-gray-800">
                <td className="p-4 font-bold">{item["name"]}</td>
                <td className="p-4">{item["description"]}</td>
                <td className="p-4">
                  <EditTag
                    tag={item["name"]}
                    description={item["description"]}
                    fetchTags={fetchTags}
                  />
                </td>
                <td className="p-4">
                  <Button
                    label="Delete"
                    onClick={() => {
                      deleteRequest("/tags/" + item["name"], () => {
                        alert("Tag " + item["name"] + " deleted");
                        fetchTags();
                      });
                    }}
                    icon={<TrashIcon />}
                    color="red"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Tags() {
  let [tags, setTags] = useState([]);

  function fetchTags() {
    getRequest("/tags").then((data) => {
      data["tags"].sort((a, b) => {
        if (a["name"].toLowerCase() < b["name"].toLowerCase()) {
          return -1;
        }
        if (a["name"].toLowerCase() > b["name"].toLowerCase()) {
          return 1;
        }
        return 0;
      });
      setTags(data["tags"]);
    });
  }

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="container mx-auto w-fit pb-4">
      <p className="text-4xl font-bold justify-center flex mb-4">Tags</p>
      <CreateTag fetchTags={fetchTags} />
      <TagsTable tags={tags} fetchTags={fetchTags} />
    </div>
  );
}
