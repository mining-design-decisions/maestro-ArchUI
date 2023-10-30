function getDatabaseURL() {
  return JSON.parse(localStorage.getItem("connectionSettings"))["databaseURL"];
}

function getDlManagerURL() {
  return JSON.parse(localStorage.getItem("connectionSettings"))["dlManagerURL"];
}

export function uploadFile(url, method, file) {
  let body = new FormData();
  body.append("file", file);
  let request = {
    method: method,
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: "include",
    body: body,
  };

  fetch(getDatabaseURL() + url, request)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}

export function downloadFileLink(url) {
  return getDatabaseURL() + url;
}

export function getRequest(url) {
  return fetch(getDatabaseURL() + url).then((response) => response.json());
}

export function deleteRequest(url, thenFunction: null | (() => void) = null) {
  let request = {
    method: "DELETE",
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: "include",
  };

  fetch(getDatabaseURL() + url, request)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (thenFunction !== null) {
        thenFunction();
      }
    });
}

export function request(
  method,
  url,
  body,
  thenFunction: null | (() => void) = null
) {
  let request = {
    method: method,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body !== null) {
    request["body"] = JSON.stringify(body);
  }

  fetch(getDatabaseURL() + url, request)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (thenFunction !== null) {
        thenFunction();
      }
    });
}

export function postRequest(
  url,
  body,
  thenFunction: null | (() => void) = null
) {
  request("POST", url, body, thenFunction);
}

export function putRequest(
  url,
  body,
  thenFunction: null | (() => void) = null
) {
  request("PUT", url, body, thenFunction);
}

export function patchRequest(
  url,
  body,
  thenFunction: null | (() => void) = null
) {
  request("PATCH", url, body, thenFunction);
}

export function postRequestDlManager(url, body) {
  let request = {
    method: "POST",
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: "include",
  };
  fetch(getDatabaseURL() + "/refresh-token", request)
    .then((response) => response.json())
    .then((data) => {
      let token = data["access_token"];
      body["database-url"] = getDatabaseURL();
      let request = {
        method: "POST",
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          auth: { token: token },
          config: body,
        }),
      };
      fetch(getDlManagerURL() + url, request)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
        });
    });
}

export function getRequestDlManager(url) {
  return fetch(getDlManagerURL() + url).then((response) => response.json());
}
