import { Flow } from "./Flow";
import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";

function App() {
  return (
    <div className="flex flex-grow h-full dndflow">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
