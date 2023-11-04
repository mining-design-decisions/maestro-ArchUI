import { Transition, Dialog } from "@headlessui/react";
import React, { Fragment, useEffect, useState } from "react";
import { deleteRequest, getRequest, postRequest } from "./util";

function CreateTag({ showCreateTag, setShowCreateTag, fetchTags }) {
  let [tag, setTag] = useState({ tag: "", description: "" });

  return (
    <>
      <Transition appear show={showCreateTag} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 text-white"
          onClose={() => setShowCreateTag(false)}
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
                <Dialog.Panel className="m-4 w-2/3 w-fill transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                  {/* Body */}
                  <div className="flex items-center justify-between">
                    <span>Name:</span>
                    <input
                      className="w-3/4 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={tag["tag"]}
                      onChange={(event) => {
                        setTag((prevState) => ({
                          ...prevState,
                          tag: event.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-4 space-x-4">
                    <span>Description:</span>
                    <textarea
                      className="w-3/4 p-1 rounded-lg text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                      value={tag["description"]}
                      onChange={(event) => {
                        setTag((prevState) => ({
                          ...prevState,
                          description: event.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      className="flex items-center space-x-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                      onClick={() => {
                        postRequest("/tags", tag, () => {
                          alert("Tag created");
                          setShowCreateTag(false);
                          fetchTags();
                        });
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
                      Create Tag
                    </button>
                  </div>
                  {/* End Body */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function EditTag({ tag, description, fetchTags }) {
  let [newDescription, setNewDescription] = useState({
    description: description,
  });
  let [modalOpen, setModalOpen] = useState<boolean>(false);

  return (
    <>
      <button
        className="flex items-center space-x-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => setModalOpen(true)}
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
        Edit
      </button>
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 text-white"
          onClose={() => setModalOpen(false)}
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
                <Dialog.Panel className="w-2/3 m-4 w-fill transform overflow-hidden rounded-2xl bg-slate-700 p-6 text-left align-middle shadow-xl transition-all">
                  {/* Body */}
                  <div className="flex items-center justify-between mt-4 space-x-4">
                    <span>Description</span>
                    <textarea
                      className="w-3/4 p-1 rounded-lg text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                      value={newDescription["description"]}
                      onChange={(event) => {
                        setNewDescription((prevState) => ({
                          ...prevState,
                          description: event.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      className="flex items-center space-x-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                      onClick={() => {
                        postRequest("/tags/" + tag, newDescription, () => {
                          alert("Tag upated");
                          setModalOpen(false);
                          fetchTags();
                        });
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                      Edit Tag: {tag}
                    </button>
                  </div>
                  {/* End Body */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default function Tags() {
  let [showCreateTag, setShowCreateTag] = useState<boolean>(false);
  let [tags, setTags] = useState([]);

  function fetchTags() {
    getRequest("/tags").then((data) => setTags(data["tags"]));
  }

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <div className="pb-4 ml-4 mr-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <p className="text-4xl font-bold">Tags</p>

        <button
          className="flex items-center space-x-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => setShowCreateTag(true)}
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
          Create Tag
        </button>
        <CreateTag
          showCreateTag={showCreateTag}
          setShowCreateTag={setShowCreateTag}
          fetchTags={fetchTags}
        />
      </div>

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
                <tr className="bg-gray-800">
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
                    <button
                      className="flex items-center space-x-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                      onClick={() => {
                        deleteRequest("/tags/" + item["name"], () => {
                          alert("Tag " + item["name"] + " deleted");
                          setShowCreateTag(false);
                          fetchTags();
                        });
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
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
