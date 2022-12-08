import React from "react";
import { WorkflowDataTypes } from "./constants";

export default () => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: WorkflowDataTypes
  ) => {
    event.dataTransfer.setData("workflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="border border-r-gray-600 py-3 w-[25%] px-2 text-base bg-slate-200">
      <div className="mb-[10px]">
        You can drag these nodes to the pane on the right.
      </div>
      <div className="border border-b-gray-600"></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg text-gray-500">Eingang</h1>
          <div
            className="flex border border-gray-600 cursor-grab justify-center items-center p-2 rounded"
            onDragStart={(event) => onDragStart(event, "input")}
            draggable
          >
            Input Node
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-lg text-gray-500">Normal</h1>
          <div
            className="flex border border-gray-400 cursor-grab justify-center items-center p-2 rounded"
            onDragStart={(event) => onDragStart(event, "antwort")}
            draggable
          >
            Antwort Node
          </div>
          <div
            className="flex border border-gray-400 cursor-grab justify-center items-center p-2 rounded"
            onDragStart={(event) => onDragStart(event, "frage")}
            draggable
          >
            Frage Node
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg text-gray-500">Ausgang</h1>
          <div
            className="flex border border-green-400 cursor-grab justify-center items-center p-2 rounded"
            onDragStart={(event) => onDragStart(event, "lösung")}
            draggable
          >
            Lösung Node
          </div>
          <div
            className="flex border border-blue-400 cursor-grab justify-center items-center p-2 rounded"
            onDragStart={(event) => onDragStart(event, "link")}
            draggable
          >
            Link Node
          </div>
        </div>
        <div className="border border-b-gray-600"></div>
        <div>
          <h1 className="text-lg text-gray-500">Hilfe</h1>
          <div className="flex flex-col">
            Mehrfachauswahl:
            <span className="text-sm text-gray-600">
              "Strg" ("command") + linke Maustaste
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
