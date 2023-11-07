import React from "react";

interface IButton {
  label: string;
  onClick: () => void;
  icon?: null | React.JSX.Element;
  color?: string;
}

export function Button({
  label,
  onClick,
  icon = null,
  color = "blue",
}: IButton) {
  return (
    <button
      className={`flex bg-${color}-500 hover:bg-${color}-700 text-white font-bold py-1 px-2 rounded-lg`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
