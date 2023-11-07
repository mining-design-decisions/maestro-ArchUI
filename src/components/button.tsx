import React from "react";

interface IButton {
  label: string;
  onClick: () => void;
  icon: null | React.JSX.Element;
}

export function Button({ label, onClick, icon = null }: IButton) {
  return (
    <button
      className="flex bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-lg"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
