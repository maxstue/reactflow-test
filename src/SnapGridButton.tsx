import React from "react";

export default function SnapGridButton({
  setSnapGrid,
}: {
  setSnapGrid: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const onClick = () => {
    setSnapGrid((c) => !c);
  };

  return (
    <button className="p-2 bg-gray-400" onClick={onClick}>
      SnapGrid
    </button>
  );
}
