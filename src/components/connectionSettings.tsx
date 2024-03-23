import { getDatabaseURL } from "../routes/util";

export interface ConnectionSettings {
  databaseURL: string;
  dlManagerURL: string;
  searchEngineURL: string;
}

const defaultSettings: ConnectionSettings = {
  databaseURL: "https://maestro.localhost/issues-db-api",
  dlManagerURL: "https://maestro.localhost/dl-manager",
  searchEngineURL: "https://maestro.localhost/search-engine",
};

export function initConnectionSettings() {
  let connectionSettings = localStorage.getItem("connectionSettings");
  if (connectionSettings === null) {
    localStorage.setItem("connectionSettings", JSON.stringify(defaultSettings));
  } else {
    try {
      let parsedSettings = JSON.parse(connectionSettings);
      for (const urlName of [
        "databaseURL",
        "dlManagerURL",
        "searchEngineURL",
      ]) {
        if (
          !(urlName in parsedSettings) ||
          typeof parsedSettings[urlName] !== "string"
        ) {
          localStorage.setItem(
            "connectionSettings",
            JSON.stringify(defaultSettings)
          );
        }
      }
    } catch (error) {
      localStorage.setItem(
        "connectionSettings",
        JSON.stringify(defaultSettings)
      );
    }
  }
}

export function getConnectionSettings(): ConnectionSettings {
  initConnectionSettings();
  let connectionSettings = localStorage.getItem("connectionSettings");
  if (connectionSettings === null) {
    return { ...defaultSettings };
  }
  return JSON.parse(connectionSettings);
}

export function getWebSocket() {
  if (getDatabaseURL().includes("https")) {
    return new WebSocket(`${getDatabaseURL().replace("https", "wss")}/ws`);
  }
  return new WebSocket(`${getDatabaseURL().replace("http", "ws")}/ws`);
}
