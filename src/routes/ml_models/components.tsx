import React, { useState } from "react";
import { PlusIcon, QuestionMarkCircleIcon, TrashIcon } from "../../icons";
import { CheckBox, Select, TextForm } from "../../components/forms";
import { Button } from "../../components/button";

export function getInitialConfig(
  endpoint,
  prevData,
  type: "model" | "embedding" = "model"
) {
  let tmp = {};
  for (const [key, value] of Object.entries(endpoint)) {
    let configKey = type === "model" ? "model_config" : "config";
    if (prevData !== undefined && key in prevData[configKey]) {
      tmp[key] = prevData[configKey][key];
      if (value["argument_type"] === "nested" && tmp[key] === null) {
        tmp[key] = {};
      }
      if (value["argument_type"] === "query" && typeof tmp[key] === "object") {
        tmp[key] = JSON.stringify(tmp[key]);
      }
    } else {
      tmp[key] = getDefaultParamValue(value);
    }
  }
  return tmp;
}

export function getParsedConfig(config, endpoint) {
  let tmp = { ...config };
  for (const [key, value] of Object.entries(endpoint)) {
    if (value["enabled-if"] !== null) {
      // Check for constraint
      let payload = value["enabled-if"]["payload"];
      let lhs = payload["lhs"]["payload"]["name"];
      lhs = config[lhs];
      let rhs = payload["rhs"]["payload"]["value"];
      if (payload["operation"] === "equal") {
        if (lhs !== rhs) {
          delete tmp[key];
        }
      }
    } else if (value["argument_type"] === "query") {
      if (tmp[key] === null || tmp[key] === "") {
        tmp[key] = {};
      } else {
        tmp[key] = JSON.parse(tmp[key]);
      }
    } else if (
      value["argument_type"] === "enum" ||
      value["argument_type"] === "dynamic-enum"
    ) {
      if (tmp[key] === "") {
        delete tmp[key];
      }
    }
  }
  return tmp;
}

function getNestedValue(object, path) {
  if (path.length === 0) {
    return object;
  }
  if (path.length > 1) {
    return getNestedValue(object[path[0]], path.slice(1));
  }
  return object[path[0]];
}

function getDefaultParamValue(param) {
  switch (param["argument_type"]) {
    case "list": {
      if (Array.isArray(param["default"])) {
        return param["default"];
      } else {
        return [];
      }
    }
    case "nested": {
      return {};
    }
    case "enum": {
      if (param["default"] === null) {
        return "";
      }
      return param["options"][0];
    }
    case "dynamic-enum": {
      if (param["default"] === null) {
        return "";
      }
      return param["options"][0];
    }
    case "string": {
      return param["default"] === null ? "" : param["default"];
    }
    case "query": {
      return param["default"] === null ? "" : param["default"];
    }
    case "int": {
      return param["default"] === null ? 1 : param["default"];
    }
    default: {
      return param["default"];
    }
  }
}

function ListForm({ config, configPath, configKey, value, label, setConfig }) {
  return (
    <div className="flex items-center space-x-2">
      {label}
      <div className="w-full border border-gray-500 rounded-lg p-2">
        {getNestedValue(config, configPath.concat([configKey])).map(
          (item, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <div className="w-full">
                {Array.isArray(value["readable-options"]) ? (
                  <Select
                    label={""}
                    value={item}
                    options={value["readable-options"].map((option) => {
                      return {
                        label: option,
                        value: option,
                      };
                    })}
                    onChange={(event) => {
                      let tmp = { ...config };
                      getNestedValue(tmp, configPath)[configKey][idx] =
                        event.target.value;
                      setConfig(tmp);
                    }}
                  />
                ) : (
                  <TextForm
                    label={""}
                    value={item}
                    onChange={(event) => {
                      if (value["inner"]["argument_type"] === "float") {
                        let value = Number(event.target.value);
                        if (!Number.isNaN(value)) {
                          let tmp = { ...config };
                          getNestedValue(tmp, configPath)[configKey][idx] =
                            value;
                          setConfig(tmp);
                        }
                      } else {
                        let tmp = { ...config };
                        getNestedValue(tmp, configPath)[configKey][idx] =
                          event.target.value;
                        setConfig(tmp);
                      }
                    }}
                  />
                )}
              </div>

              <Button
                label={""}
                onClick={() => {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[configKey].splice(idx, 1);
                  setConfig(tmp);
                }}
                color="red"
                icon={<TrashIcon />}
              />
            </div>
          )
        )}
        <div className="flex justify-center mt-2">
          <Button
            label={`Add ${configKey}`}
            onClick={() => {
              let tmp = { ...config };
              getNestedValue(tmp, configPath)[configKey].push(
                value["readable-options"][0]
              );
              setConfig(tmp);
            }}
            icon={<PlusIcon />}
          />
        </div>
      </div>
    </div>
  );
}

function NestedForm({
  label,
  configKey,
  value,
  config,
  configPath,
  setConfig,
  endpoint,
  endpointPath,
}) {
  let [selected, setSelected] = useState("null");
  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="w-full">
          <Select
            label={label}
            value={selected}
            options={Object.keys(value["spec"]).map((key) => {
              return {
                label: key,
                value: key,
              };
            })}
            onChange={(e) => setSelected(e.target.value)}
          />
        </div>
        <Button
          label={`Add ${configKey}`}
          onClick={() => {
            let tmp = { ...config };
            let defaultConfig = {};
            for (const [innerParam, innerValue] of Object.entries(
              value["spec"][selected]
            )) {
              defaultConfig[innerParam] = getDefaultParamValue(innerValue);
            }
            let nestedValue = getNestedValue(tmp, configPath)[configKey];
            let idx = 0;
            while (selected + "." + idx in nestedValue) {
              idx++;
            }
            nestedValue[selected + "." + idx] = defaultConfig;
            setConfig(tmp);
          }}
          icon={<PlusIcon />}
        />
      </div>
      <div className="ml-8">
        {Object.entries(
          getNestedValue(config, configPath.concat([configKey]))
        ).map(([innerName, innerValue]) => (
          <div
            key={innerName}
            className="border border-gray-500 rounded-lg mt-4"
          >
            <div className="m-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">{innerName}</span>
                <Button
                  label={""}
                  onClick={() => {
                    let tmp = { ...config };
                    let nestedValue = getNestedValue(tmp, configPath)[
                      configKey
                    ];
                    delete nestedValue[innerName];
                    let idx = Number(innerName.split(".")[1]) + 1;
                    while (innerName.split(".")[0] + "." + idx in nestedValue) {
                      nestedValue[innerName.split(".")[0] + "." + (idx - 1)] =
                        nestedValue[innerName.split(".")[0] + "." + idx];
                      delete nestedValue[innerName.split(".")[0] + "." + idx];
                      idx++;
                    }
                    setConfig(tmp);
                  }}
                  color="red"
                  icon={<TrashIcon />}
                />
              </div>
              <GenerateForms
                endpoint={endpoint}
                endpointPath={endpointPath.concat([
                  configKey,
                  "spec",
                  innerName.split(".")[0],
                ])}
                config={config}
                configPath={configPath.concat([configKey, innerName])}
                setConfig={setConfig}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function GenerateForms({
  endpoint,
  endpointPath,
  config,
  configPath,
  setConfig,
}) {
  let params = getNestedValue({ ...endpoint }, endpointPath);

  return (
    <div>
      {Object.entries(params).map(([key, value]) => {
        let label = (
          <div className="group relative w-max flex space-x-1">
            <QuestionMarkCircleIcon />
            <span className="absolute w-40 pointer-events-none -top-7 left-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gray-500 rounded-lg p-1">
              {value["description"]}
            </span>
            <label className="whitespace-nowrap">{`${key} (${value["argument_type"]})`}</label>
          </div>
        );

        if ("enabled-if" in value && value["enabled-if"] !== null) {
          // Check for constraint
          let payload = value["enabled-if"]["payload"];
          let lhs = payload["lhs"]["payload"]["name"];
          lhs = config[lhs];
          let rhs = payload["rhs"]["payload"]["value"];
          if (payload["operation"] === "equal") {
            if (lhs !== rhs) {
              return;
            }
          }
        }
        let form;
        if (
          value["argument_type"] === "string" ||
          value["argument_type"] === "query"
        ) {
          form = (
            <TextForm
              label={label}
              value={getNestedValue(config, configPath.concat([key]))}
              onChange={(event) => {
                let tmp = { ...config };
                getNestedValue(tmp, configPath)[key] = event.target.value;
                setConfig(tmp);
              }}
            />
          );
        } else if (value["argument_type"] === "int") {
          form = (
            <TextForm
              label={label}
              value={getNestedValue(config, configPath.concat([key]))}
              onChange={(event) => {
                let value = Number(event.target.value);
                if (Number.isInteger(value)) {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[key] = value;
                  setConfig(tmp);
                }
              }}
            />
          );
        } else if (value["argument_type"] === "float") {
          form = (
            <TextForm
              label={label}
              value={getNestedValue(config, configPath.concat([key]))}
              onChange={(event) => {
                let value = Number(event.target.value);
                if (!Number.isNaN(value)) {
                  let tmp = { ...config };
                  getNestedValue(tmp, configPath)[key] = value;
                  setConfig(tmp);
                }
              }}
            />
          );
        } else if (
          value["argument_type"] === "enum" ||
          value["argument_type"] === "dynamic-enum"
        ) {
          form = (
            <Select
              label={label}
              value={getNestedValue(config, configPath.concat([key]))}
              options={value["options"].map((option) => {
                return {
                  label: option,
                  value: option,
                };
              })}
              onChange={(event) => {
                let tmp = { ...config };
                getNestedValue(tmp, configPath)[key] = event.target.value;
                setConfig(tmp);
              }}
              includeNull={value["default"] === null}
            />
          );
        } else if (value["argument_type"] === "bool") {
          form = (
            <CheckBox
              label={label}
              checked={getNestedValue(config, configPath)[key]}
              onChange={(event) => {
                let tmp = { ...config };
                getNestedValue(tmp, configPath)[key] = event.target.checked;
                setConfig(tmp);
              }}
            />
          );
        } else if (value["argument_type"] === "list") {
          form = (
            <ListForm
              configKey={key}
              label={label}
              config={{ ...config }}
              configPath={[...configPath]}
              value={value}
              setConfig={setConfig}
            />
          );
        } else if (value["argument_type"] === "nested") {
          form = (
            <NestedForm
              configKey={key}
              label={label}
              value={value}
              config={config}
              configPath={configPath}
              setConfig={setConfig}
              endpoint={endpoint}
              endpointPath={endpointPath}
            />
          );
        } else {
          form = "";
          console.log("unsupported", key, value["argument_type"]);
        }

        return (
          <div key={key} className="flex space-x-2 items-center mt-8">
            <div className="w-full">{form}</div>
          </div>
        );
      })}
    </div>
  );
}
