import React, { useEffect, useState } from "react";
import { getDatabaseURL, postRequest } from "./util";
import { TextForm } from "../components/forms";
import { Button } from "../components/button";
import {
  ConnectionSettings,
  getConnectionSettings,
} from "../components/connectionSettings";

function LoginOrCreateAccount({ label, onClick }) {
  let [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  let forms = [
    {
      label: "username",
      password: false,
    },
    {
      label: "password",
      password: true,
    },
  ].map((form) => (
    <TextForm
      key={form["label"]}
      label={form["label"]}
      value={credentials[form["label"]]}
      onChange={(e) =>
        setCredentials((prevState) => ({
          ...prevState,
          [form["label"]]: e.target.value,
        }))
      }
      password={form["password"]}
    />
  ));

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold">{label}</p>
      {forms}
      <div className="flex justify-end">
        <Button label={label} onClick={() => onClick(credentials)} />
      </div>
    </div>
  );
}

function LoginForm() {
  let [loginInfo, setLoginInfo] = useState("Not logged in");

  function getLoginInfo() {
    let request = {
      method: "POST",
      headers: {
        "Access-Control-Allow-Credentials": "true",
      },
      credentials: "include",
    };
    fetch(`${getDatabaseURL()}/refresh-token`, request).then((response) => {
      if (!response.ok) {
        setLoginInfo("Not logged in");
      } else {
        response
          .json()
          .then((data) => setLoginInfo(`Logged in as: ${data["username"]}`));
      }
    });
  }

  function login(credentials) {
    let body = new FormData();
    body.append("username", credentials["username"]);
    body.append("password", credentials["password"]);
    postRequest(
      "/token",
      body,
      (data) => {
        setLoginInfo(`Logged in as: ${data["username"]}`);
        alert("Login successful");
      },
      true
    );
  }

  useEffect(() => getLoginInfo(), []);

  return (
    <>
      <p className="text-2xl justify-center flex mb-4">{loginInfo}</p>
      <LoginOrCreateAccount label="Login" onClick={login} />
    </>
  );
}

function CreateAccountForm() {
  function createAccount(credentials) {
    let body = {
      username: credentials["username"],
      password: credentials["password"],
    };
    postRequest("/create-account", body, () => alert("Account Created"));
  }

  return (
    <>
      <LoginOrCreateAccount label="Create Account" onClick={createAccount} />
      <p className="text-sm flex justify-end">*requires login</p>
    </>
  );
}

function URLForms() {
  let [connectionSettings, setConnectionSettings] =
    useState<ConnectionSettings>(getConnectionSettings());

  function onChange(id: string, value: string) {
    let tmp = {
      ...connectionSettings,
      [id]: value,
    };
    localStorage.setItem("connectionSettings", JSON.stringify(tmp));
    setConnectionSettings(tmp);
  }

  return (
    <div className="space-y-2">
      {" "}
      <p className="font-bold text-2xl">Set URLs</p>
      {[
        {
          id: "databaseURL",
          label: "Database URL",
        },
        {
          id: "dlManagerURL",
          label: "DLManager URL",
        },
        {
          id: "searchEngineURL",
          label: "Search Engine URL",
        },
      ].map((item) => {
        return (
          <TextForm
            key={item["id"]}
            label={`Set ${item["label"]}`}
            value={connectionSettings[item["id"]]}
            onChange={(e) => {
              onChange(item["id"], e.target.value);
            }}
          />
        );
      })}
    </div>
  );
}

export default function Settings() {
  return (
    <div className="container mx-auto w-fit">
      <p className="text-4xl font-bold justify-center flex mb-4">Settings</p>
      <LoginForm />
      <CreateAccountForm />
      <URLForms />
    </div>
  );
}
