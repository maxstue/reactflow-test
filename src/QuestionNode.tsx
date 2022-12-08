import React, { memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";

interface Props extends NodeProps<{ label: string }> {}

function QuestionNode({ data, id, isConnectable }: Props) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log("handle onConnect", params)}
        isConnectable={isConnectable}
      />
      <div>{data.label}</div>
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
