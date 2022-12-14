import { memo } from "react";
import { Handle, NodeProps, NodeToolbar, Position } from "reactflow";

interface Props
  extends NodeProps<{
    label: string;
    toolbarVisible?: boolean;
    toolbarPosition?: Position;
    openModal: (data: any) => void;
  }> {}

function QuestionNode({ data, id, isConnectable }: Props) {
  const handleBtnClick = () => {
    console.log("toolbar click", id);
  };

  return (
    <>
      <NodeToolbar
        className="flex gap-2"
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <button
          className="rounded p-1 border border-gray-300 bg-gray-300 hover:bg-gray-400"
          onClick={handleBtnClick}
        >
          delete
        </button>
        <button
          className="rounded p-1 border border-gray-300 bg-gray-300 hover:bg-gray-400"
          onClick={() => data.openModal({ id, label: data.label })}
        >
          edit
        </button>
      </NodeToolbar>
      <div>Frage: {data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        isConnectable={isConnectable}
      />
    </>
  );
}

export default memo(QuestionNode);
