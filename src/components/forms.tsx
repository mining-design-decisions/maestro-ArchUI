import React from "react";

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
