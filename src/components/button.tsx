import React from "react";

export function Button({ label, onClick, icon = null }) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
