import React from "react";
import WindowedSelect from "react-windowed-select";

export function TextForm({ label, value, onChange, password = false }) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <label>{label} </label>
      <input
        value={value}
        onChange={onChange}
        type={password ? "password" : "text"}
        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
    </div>
  );
}

export function TextAreaForm({ label, value, onChange }) {
  let rows = 1;
  for (let char of value) {
    if (char === "\n") {
      rows += 1;
    }
  }

  return (
    <div className="flex justify-between items-center space-x-4">
      <span>{label}</span>
      <textarea
        wrap="off"
        className="p-1 rounded-lg rounded-br-none bg-gray-700 w-full resize-y"
        value={value}
        onChange={onChange}
        rows={rows}
      />
    </div>
  );
}

export function CheckBox() {
  return <></>;
}

export function Select({ label, options, onChange, includeNull = false }) {
  if (includeNull) {
    options = [{ label: "None", value: "null" }].concat(options);
  }

  let parsedOptions = options.map((option) => (
    <option key={option["value"]} value={option["value"]}>
      {option["label"]}
    </option>
  ));

  return (
    <div className="flex items-center justify-between space-x-4">
      <label>{label}</label>
      <select className="p-1 rounded-lg bg-gray-700 w-full" onChange={onChange}>
        {parsedOptions}
      </select>
    </div>
  );
}

export function MultiSelectForm({ options, onChange }) {
  return (
    <WindowedSelect
      unstyled
      className="w-full"
      classNames={{
        control: ({ isFocused }) =>
          "border rounded-lg bg-gray-700 hover:cursor-pointer border-gray-700",
        valueContainer: () => "p-1 gap-1",
        dropdownIndicator: () => "bg-gray-700 text-white",
        indicatorSeparator: () => "bg-gray-700",
        clearIndicator: () =>
          "text-white p-1 rounded-md hover:bg-gray-600 hover:text-red-700",
        multiValue: () =>
          "bg-blue-600 rounded items-center py-0.5 pl-2 pr-1 gap-1.5",
        multiValueLabel: () => "leading-6 py-0.5",
        multiValueRemove: () =>
          "bg-gray-700 text-white hover:bg-gray-500 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md",
        option: ({ isFocused, isSelected }) => {
          let base = "hover:cursor-pointer px-3 py-2 rounded";
          if (isFocused) {
            base += " bg-gray-600 active:bg-gray-600";
          }
          if (isSelected) {
            base +=
              " after:content-['✔'] after:ml-2 after:text-green-500 text-gray-500";
          }
          return base;
        },
        menu: () => "p-1 mt-2 bg-gray-700 rounded-lg",
      }}
      isMulti
      options={options}
      windowThreshold={20}
      onChange={onChange}
    />
  );
}
