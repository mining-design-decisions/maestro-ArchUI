import React, { useState } from "react";

interface IButton {
  label: string;
  onClick: () => void;
  icon?: null | React.JSX.Element;
  color?: "blue" | "red" | "green" | "orange";
}

export function Button({
  label,
  onClick,
  icon = null,
  color = "blue",
}: IButton) {
  let classNames = "";
  switch (color) {
    case "blue": {
      classNames = "bg-blue-500 hover:bg-blue-700";
      break;
    }
    case "red": {
      classNames = "bg-red-500 hover:bg-red-700";
      break;
    }
    case "green": {
      classNames = "bg-green-500 hover:bg-green-700";
      break;
    }
    case "orange": {
      classNames = "bg-orange-500 hover:bg-orange-700";
      break;
    }
  }
  return (
    <button
      className={
        "flex items-center text-white font-bold py-1 px-2 rounded-lg " +
        classNames
      }
      onClick={onClick}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
