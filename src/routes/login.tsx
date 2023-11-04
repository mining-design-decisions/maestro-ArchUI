import React, { useContext } from "react";
import { postRequest } from "./util";

export default function Login() {
  let connectionSettings = JSON.parse(
    localStorage.getItem("connectionSettings")
  );
  return (
    <>
      {/* Login */}
      <p className="p-2 font-bold text-2xl">Account</p>
      <div className="flex items-center space-x-2 m-2">
        <span>Username:</span>
        <input
          id="username"
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div className="flex items-center space-x-2 m-2">
        <span>Password: </span>
        <input
          id="password"
          type="password"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
      <div className="space-x-2 m-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-full"
          onClick={() => {
            localStorage.setItem(
              "username",
              document.getElementById("username")?.value
            );
            let body = new FormData();
            body.append("username", document.getElementById("username")?.value);
            body.append("password", document.getElementById("password")?.value);
            postRequest(
              "/token",
              body,
              () => {
                alert("Login successful");
              },
              true
            );
          }}
        >
          Login
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-full"
          onClick={() => {
            let body = {
              username: document.getElementById("username")?.value,
              password: document.getElementById("password")?.value,
            };
            postRequest("/create-account", body);
          }}
        >
          Create Account
        </button>
      </div>

      <p className="p-2 font-bold text-2xl">Set URLs</p>

      {/* Set URLs */}
      {[
        ["databaseURL", "Database URL"],
        ["dlManagerURL", "DLManager URL"],
        ["searchEngineURL", "Search Engine URL"],
      ].map((item) => {
        return (
          <div className="flex items-center space-x-2 m-2" key={item[0]}>
            <input
              id={item[0]}
              type="text"
              defaultValue={connectionSettings[item[0]]}
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-full"
              onClick={() => {
                connectionSettings[item[0]] = document.getElementById(
                  item[0]
                )?.value;
                localStorage.setItem(
                  "connectionSettings",
                  JSON.stringify(connectionSettings)
                );
                alert(item[1] + " set");
              }}
            >
              Set {item[1]}
            </button>
          </div>
        );
      })}
    </>
  );
}
