import { nanoid } from "nanoid";
import { useCallback, useRef, useState } from "react";
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
  useStore,
  Position,
} from "reactflow";
import AnswerNode from "./AnswerNode";
import { WorkflowDataTypes } from "./constants";
import { EditModal } from "./EditModal";
import QuestionNode from "./QuestionNode";
import Sidebar from "./Sidebar";
import SnapGridButton from "./SnapGridButton";
import SolutionNode from "./SolutionNode";

const getId = () => `dndnode_${nanoid()}`;

const initialNodes: Node[] = [
  {
    id: getId(),
    type: "input",
    position: { x: 0, y: 0 },
    data: { label: "Start" },
  },
];

const initialEdges: Edge[] = [];

const flowTypeToApptype: Record<WorkflowDataTypes, string> = {
  input: "input",
  question: "question",
  answer: "answer",
  link: "output",
  solution: "solution",
};

const fitViewOptions: FitViewOptions = {
  padding: 3,
};

const customNodeTypes = {
  question: QuestionNode,
  answer: AnswerNode,
  solution: SolutionNode,
};

export function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const connectingNodeId = useRef<string | null>(null);
  const [snapGrid, setSnapGrid] = useState(false);
  const [editModal, setEditModal] = useState<
    { id: string; label: string } | undefined
  >(undefined);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { project, setViewport, toObject } = useReactFlow();

  const handleEditNode = useCallback(() => {
    if (editModal) {
      const { id, label } = editModal;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== id) {
            return node;
          }

          return {
            ...node,
            data: {
              ...node.data,
              label: `${label.split("_")[0]}_${nanoid(4)}`,
            },
          };
        })
      );
    }
    setEditModal(undefined);
  }, [nodes, editModal]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    []
  );

  const onConnectStart = useCallback(
    (
      _: React.MouseEvent<Element, MouseEvent>,
      { nodeId }: OnConnectStartParams
    ) => {
      connectingNodeId.current = nodeId;
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
        const sourceNode = nodes.find((x) => x.id === connectingNodeId.current);
        let newType = "default";

        if (sourceNode) {
          const sourceType = sourceNode.type as WorkflowDataTypes;
          if (sourceType === "question") {
            newType = "answer";
          } else {
            newType = "question";
          }
        }
        // we need to remove the wrapper bounds, in order to get the correct position
        const { top, left } = reactFlowWrapper.current.getBoundingClientRect();
        const id = getId();
        const newNode = {
          id,
          type: newType,
          // we are removing the half of the node width (75) to center the new node
          position: project({
            x: event.clientX - left - 75,
            y: event.clientY - top,
          }),
          data: {
            label: `${newType} node`,
            toolbarPosition: Position.Top,
            openModal: setEditModal,
          },
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
    [project, nodes]
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
        data: {
          label: `${type} node`,
          toolbarPosition: Position.Top,
          openModal: setEditModal,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project]
  );

  const onMiniMapNodeClick = () => {
    // TODO zoom into view
    console.log("click");
  };

  const onSave = useCallback(() => {
    const flow = toObject();
    localStorage.setItem("flowchart", JSON.stringify(flow));
  }, [toObject]);

  const onRestore = useCallback(async () => {
    const localStore = localStorage.getItem("flowchart");
    if (localStore) {
      const flow = JSON.parse(localStore);

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    } else {
      console.log("Es befindet sich nichts im localstorage");
    }
  }, [setNodes, setViewport]);

  const onReset = useCallback(async () => {
    localStorage.removeItem("flowchart");
    setNodes(initialNodes);
    setEdges(initialEdges);
    setViewport({ x: 250, y: 250, zoom: 1 });
  }, [setNodes, setEdges, setViewport]);

  // TODO workflowbuilder
  // TODO horizontal /vertical flow toggle https://reactflow.dev/docs/examples/layout/dagre/
  // TODO add validation
  return (
    <>
      <Sidebar />
      <div
        className="realative h-full flex-grow bg-white"
        ref={reactFlowWrapper}
      >
        {editModal && (
          <EditModal
            isOpen={!!editModal}
            data={editModal}
            close={() => setEditModal(undefined)}
            onSave={handleEditNode}
          />
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={customNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          snapToGrid={snapGrid}
          fitView
          fitViewOptions={fitViewOptions}
        >
          <MiniMap
            zoomable
            pannable
            nodeStrokeColor={(n) => {
              if (n.type === "input") return "#475569";
              if (n.type === "default") return "#94a3b8";
              if (n.type === "answer") return "#94a3b8";
              if (n.type === "question") return "#94a3b8";
              if (n.type === "solution") return "#94a3b8";
              if (n.type === "output") return "#4ade80";
              return "";
            }}
            nodeColor={(n) => {
              if (n.type === "input") return "#475569";
              if (n.type === "default") return "#94a3b8";
              if (n.type === "answer") return "#94a3b8";
              if (n.type === "question") return "#94a3b8";
              if (n.type === "solution") return "#4ade80";
              if (n.type === "output") return "#4ade80";
              return "";
            }}
            onNodeClick={onMiniMapNodeClick}
          />
          <Controls>
            <ControlButton onClick={onSave}>
              <div>1</div>
            </ControlButton>
          </Controls>
          <Background />
          <Panel position="top-left" className="!m-0">
            <div className="bg-white border border-b-black border-r-black p-4">
              <SnapGridButton setSnapGrid={setSnapGrid} />
            </div>
          </Panel>
          <Panel position="top-center">
            <div className=" border bg-gray-300 p-4 hover:bg-gray-400">
              <button onClick={onRestore}>Restore</button>
            </div>
          </Panel>
          <Panel position="top-right">
            {" "}
            <div className="border bg-gray-300 p-4 hover:bg-gray-400">
              <button onClick={onReset}>Reset</button>
            </div>
          </Panel>
          <Panel position="bottom-center">bottom-center</Panel>
        </ReactFlow>
      </div>
    </>
  );
}
