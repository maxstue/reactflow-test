import { nanoid } from "nanoid";
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
  OnConnectStartParams,
  FitViewOptions,
  Node,
} from "reactflow";
import { WorkflowDataTypes } from "./constants";
import Sidebar from "./Sidebar";

const getId = () => `dndnode_${nanoid()}`;

const initialNodes: Node[] = [
  {
    id: getId(),
    type: "input",
    position: { x: 100, y: 10 },
    data: { label: "Start" },
  },
];

const initialEdges: Edge[] = [];

const flowTypeToApptype: Record<WorkflowDataTypes, string> = {
  input: "input",
  frage: "default",
  antwort: "default",
  link: "output",
  lösung: "output",
};

const fitViewOptions: FitViewOptions = {
  padding: 3,
};

export function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    []
  );

  const onConnectStart = useCallback(
    (
      _: React.MouseEvent<Element, MouseEvent>,
      { nodeId, handleId, handleType }: OnConnectStartParams
    ) => {
      if (nodeId && handleType == "source") {
        connectingNodeId.current = nodeId;
      } else {
        connectingNodeId.current = null;
        console.log("Error: falscher source handleType: ", handleType);
      }
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent) => {
      const targetIsPane = (event.target as Element)?.classList.contains(
        "react-flow__pane"
      );
      // anstatt direkt neue node zu erstellen kann man hier dann Modal oder popup öffnen und notwendige daten durchreichen

      if (targetIsPane && reactFlowWrapper.current) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = getId();
        const newNode = {
          id,
          // we are removing the half of the node width (75) to center the new node
          position: project({
            x: event.clientX - left - 75,
            y: event.clientY - top,
          }),
          data: { label: `Node` },
        };
        if (connectingNodeId.current) {
          const source = connectingNodeId.current;
          setNodes((nds) => nds.concat(newNode));
          setEdges((eds) =>
            eds.concat({
              id: getId(),
              source,
              target: id,
            })
          );
        } else {
          console.log("Error: keine connectionNodeId");
        }
      }
    },
    [project]
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
        position = project({
          x: event.clientX - reactFlowBounds.left ?? 0,
          y: event.clientY - reactFlowBounds.top ?? 0,
        });
      }

      // TODO anhand des types den deutschen text herausfinden. zB type: input = start
      const newNode = {
        id: getId(),
        type: flowTypeToApptype[type],
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project]
  );

  // TODO make custom 2 btn toggle snapgrid https://reactflow.dev/docs/examples/nodes/custom-node/
  // TODO minimap show colors https://reactflow.dev/docs/examples/nodes/custom-node/
  // TODO add save and restore and reset
  // TODO workflowbuilder
  // TODO horizontal /vertical flow toggle
  // TODO add validation
  return (
    <>
      <Sidebar />
      <div className="h-full flex-grow bg-white" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          fitView
          fitViewOptions={fitViewOptions}
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
