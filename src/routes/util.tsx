export function getDatabaseURL() {
  return JSON.parse(localStorage.getItem("connectionSettings"))["databaseURL"];
}

function getDlManagerURL() {
  return JSON.parse(localStorage.getItem("connectionSettings"))["dlManagerURL"];
}

export function getSearchEngineURL() {
  return JSON.parse(localStorage.getItem("connectionSettings"))[
    "searchEngineURL"
  ];
}

export function uploadFile(
  url,
  method,
  file,
  thenFunction: null | ((data) => void) = null
) {
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

  fetch(getDatabaseURL() + url, request).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
      });
    } else {
      response.json().then((data) => {
        if (thenFunction !== null) {
          thenFunction(data);
        }
      });
    }
  });
}

export function downloadFileLink(url) {
  return getDatabaseURL() + url;
}

export function getRequest(url) {
  return fetch(getDatabaseURL() + url).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
        return data;
      });
    } else {
      return response.json();
    }
  });
}

export function deleteRequest(url, thenFunction: null | (() => void) = null) {
  let request = {
    method: "DELETE",
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: "include",
  };

  fetch(getDatabaseURL() + url, request).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
      });
    } else {
      response.json().then(() => {
        if (thenFunction !== null) {
          thenFunction();
        }
      });
    }
  });
}

export function request(
  method,
  url,
  body,
  thenFunction: null | ((data) => void) = null,
  formData = false
) {
  let request = {
    method: method,
    headers: {
      "Access-Control-Allow-Credentials": "true",
    },
    credentials: "include",
  };

  if (body !== null) {
    if (formData) {
      request["body"] = body;
    } else {
      request["body"] = JSON.stringify(body);
      request["headers"]["COntent-Type"] = "application/json";
    }
  }

  fetch(getDatabaseURL() + url, request).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
      });
    } else {
      response.json().then((data) => {
        if (thenFunction !== null) {
          thenFunction(data);
        }
      });
    }
  });
}

export function postRequest(
  url,
  body,
  thenFunction: null | ((data) => void) = null,
  formData = false
) {
  request("POST", url, body, thenFunction, formData);
}

export function putRequest(
  url,
  body,
  thenFunction: null | ((data) => void) = null,
  formData = false
) {
  request("PUT", url, body, thenFunction, formData);
}

export function patchRequest(
  url,
  body,
  thenFunction: null | ((data) => void) = null,
  formData = false
) {
  request("PATCH", url, body, thenFunction, formData);
}

export function postRequestDlManager(
  url,
  body,
  thenFunction: null | ((data) => void) = null
) {
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
      fetch(getDlManagerURL() + url, request).then((response) => {
        if (!response.ok) {
          response.json().then((data) => {
            alert(
              response.status +
                ": " +
                response.statusText +
                "\n\n" +
                JSON.stringify(data)
            );
          });
        } else {
          response.json().then((data) => {
            if (thenFunction !== null) {
              thenFunction(data);
            }
          });
        }
      });
    });
}

export function getRequestDlManager(url) {
  return fetch(getDlManagerURL() + url).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
        return data;
      });
    } else {
      return response.json();
    }
  });
}

export function postRequestSearchEngine(
  url,
  body,
  thenFunction: null | ((data) => void) = null
) {
  let request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(body),
  };

  fetch(getSearchEngineURL() + url, request).then((response) => {
    if (!response.ok) {
      response.json().then((data) => {
        alert(
          response.status +
            ": " +
            response.statusText +
            "\n\n" +
            JSON.stringify(data)
        );
      });
    } else {
      response.json().then((data) => {
        if (thenFunction !== null) {
          thenFunction(data);
        }
      });
    }
  });
}
