import { useCallback, useRef } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Edge,
  Connection,
  addEdge,
  MiniMap,
  Controls,
  ControlButton,
  Background,
  Panel,
  useReactFlow,
  XYPosition,
} from "reactflow";
import { WorkflowDataTypes } from "./constants";
import Sidebar from "./Sidebar";

const initialNodes = [
  { id: "1", position: { x: 100, y: 10 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
  { id: "3", position: { x: 0, y: 200 }, data: { label: "3" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

let id = 0;
const getId = () => `dndnode_${id++}`;

const flowTypeToApptype: Record<WorkflowDataTypes, string> = {
  input: "input",
  frage: "default",
  antwort: "default",
  link: "output",
  lösung: "output",
};

export function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      console.log(params);

      return setEdges((els) => addEdge(params, els));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("workflow") as WorkflowDataTypes;

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }
      let position: XYPosition;
      if (!reactFlowBounds) {
        position = {
          x: event.clientX - 0,
          y: event.clientY - 0,
        };
      } else {
        position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left ?? 0,
          y: event.clientY - reactFlowBounds.top ?? 0,
        });
      }

      const newNode = {
        id: getId(),
        type: flowTypeToApptype[type],
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <>
      <Sidebar />
      <div className="h-full flex-grow" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <MiniMap zoomable pannable />
          <Controls>
            <ControlButton onClick={() => console.log("action")}>
              <div>1</div>
            </ControlButton>
            <ControlButton onClick={() => console.log("another action")}>
              <div>2</div>
            </ControlButton>
          </Controls>
          <Background />
          <Panel position="top-left" className="!m-0">
            <div className="bg-dbCoolGray-300 p-4">top-left</div>
          </Panel>
          <Panel position="top-center">top-center</Panel>
          <Panel position="top-right">top-right</Panel>
          <Panel position="bottom-center">bottom-center</Panel>
          <Panel position="bottom-right">bottom-right</Panel>
        </ReactFlow>
      </div>
    </>
  );
}
