import { useState } from "react";

const dataStructures = [
  { id: "array", label: "Array" },
  { id: "tree", label: "Tree" },
  { id: "graph", label: "Graph" },
  { id: "stack", label: "Stack" },
  { id: "queue", label: "Queue" },
  { id: "linkedlist", label: "Linked List" },
];

export function VisualizationArea() {
  const [selectedDS, setSelectedDS] = useState("array");

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
      <h3 className="text-sm text-white mb-4">Data Structure Visualization</h3>

      <div className="flex gap-2 mb-4 flex-wrap">
        {dataStructures.map((ds) => (
          <button
            key={ds.id}
            onClick={() => setSelectedDS(ds.id)}
            className={`px-3 py-1.5 rounded-md text-xs ${
              selectedDS === ds.id
                ? "bg-primary text-white"
                : "bg-[#334155] text-slate-300 hover:bg-[#475569]"
            }`}
          >
            {ds.label}
          </button>
        ))}
      </div>

      <div className="h-64 rounded-md bg-[#0F172A] border border-[#334155] flex items-center justify-center overflow-hidden relative">
        {selectedDS === "array" && <ArrayVisualization />}
        {selectedDS === "tree" && <TreeVisualization />}
        {selectedDS === "stack" && <StackVisualization />}
        {selectedDS === "graph" && <GraphVisualization />}
        {selectedDS === "queue" && <QueueVisualization />}
        {selectedDS === "linkedlist" && <LinkedListVisualization />}
      </div>
    </div>
  );
}

function ArrayVisualization() {
  const array = [23, 45, 67, 12, 89, 34, 56];
  return (
    <div className="flex gap-2 items-end">
      {array.map((value, index) => (
        <div
          key={index}
          style={{ height: value * 1.5 }}
          className="w-12 bg-primary rounded-t relative"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white">
            {value}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400">
            {index}
          </div>
        </div>
      ))}
    </div>
  );
}

function TreeVisualization() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="size-12 rounded-full bg-primary flex items-center justify-center text-white text-sm">
        50
      </div>
      <div className="flex gap-16">
        <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-white text-sm">
          30
        </div>
        <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-white text-sm">
          70
        </div>
      </div>
      <div className="flex gap-6">
        <div className="size-8 rounded-full bg-accent flex items-center justify-center text-white text-xs">
          20
        </div>
        <div className="size-8 rounded-full bg-accent flex items-center justify-center text-white text-xs">
          40
        </div>
        <div className="size-8 rounded-full bg-accent flex items-center justify-center text-white text-xs">
          60
        </div>
        <div className="size-8 rounded-full bg-accent flex items-center justify-center text-white text-xs">
          80
        </div>
      </div>
    </div>
  );
}

function StackVisualization() {
  const stack = [10, 20, 30, 40, 50];
  return (
    <div className="flex flex-col-reverse gap-0">
      {stack.map((value, index) => (
        <div
          key={index}
          className="w-32 h-10 bg-primary border border-[#334155] flex items-center justify-center text-white text-sm"
        >
          {value}
        </div>
      ))}
    </div>
  );
}

function GraphVisualization() {
  return (
    <div className="relative w-full h-full">
      {[
        { x: 50, y: 30, label: "A" },
        { x: 150, y: 30, label: "B" },
        { x: 100, y: 100, label: "C" },
        { x: 200, y: 100, label: "D" },
        { x: 50, y: 170, label: "E" },
      ].map((node, i) => (
        <div
          key={i}
          className="absolute size-12 rounded-full bg-primary flex items-center justify-center text-white"
          style={{ left: `${node.x}px`, top: `${node.y}px` }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}

function QueueVisualization() {
  const queue = [5, 10, 15, 20, 25];
  return (
    <div className="flex gap-2 items-center">
      {queue.map((value, index) => (
        <div
          key={index}
          className="w-14 h-14 bg-secondary rounded flex items-center justify-center text-white text-sm"
        >
          {value}
        </div>
      ))}
      <div className="text-2xl text-slate-400">→</div>
    </div>
  );
}

function LinkedListVisualization() {
  const nodes = [12, 25, 37, 49];
  return (
    <div className="flex items-center gap-3">
      {nodes.map((value, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-14 h-14 bg-primary rounded flex items-center justify-center text-white text-sm">
            {value}
          </div>
          {index < nodes.length - 1 && (
            <div className="text-xl text-accent">→</div>
          )}
        </div>
      ))}
    </div>
  );
}
