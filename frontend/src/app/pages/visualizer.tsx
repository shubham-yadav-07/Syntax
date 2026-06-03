import { Layout } from "../components/syntax/layout";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useState } from "react";

const dataStructures = [
  "Array",
  "Linked List",
  "Tree",
  "Graph",
  "Stack",
  "Queue",
  "Recursion Tree",
];

export function VisualizerPage() {
  const [selected, setSelected] = useState("Recursion Tree");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);

  return (
    <Layout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-56 bg-[#1E293B] border-r border-[#475569] p-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            Data Structures
          </h3>

          <div className="space-y-2">
            {dataStructures.map((ds) => (
              <button
                key={ds}
                onClick={() => setSelected(ds)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selected === ds
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-300 hover:bg-[#334155] hover:text-white"
                }`}
              >
                {ds}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-semibold text-white mb-6">
              {selected} Visualization
            </h1>

            <div className="h-[500px] bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-lg">
              {selected === "Recursion Tree" && <RecursionTreeViz />}
              {selected === "Array" && <ArrayViz />}
              {selected === "Linked List" && <LinkedListViz />}
              {selected === "Tree" && <TreeViz />}
              {selected === "Stack" && <StackViz />}
              {selected === "Queue" && <QueueViz />}
              {selected === "Graph" && <GraphViz />}
            </div>
          </div>

          <div className="border-t border-[#475569] p-4 bg-[#1E293B]">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button className="p-2 bg-[#334155] hover:bg-[#475569] rounded-lg transition">
                <SkipBack className="size-4 text-white" />
              </button>

              <button
                onClick={() => setPlaying(!playing)}
                className="p-3 bg-primary hover:bg-primary/90 rounded-full transition"
              >
                {playing ? (
                  <Pause className="size-5 text-white" />
                ) : (
                  <Play className="size-5 text-white" />
                )}
              </button>

              <button className="p-2 bg-[#334155] hover:bg-[#475569] rounded-lg transition">
                <SkipForward className="size-4 text-white" />
              </button>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-400">Animation Speed</span>
                <span className="text-white">{speed}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function RecursionTreeViz() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="size-16 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg">
        f(5)
      </div>

      <div className="flex gap-20">
        <div className="size-14 rounded-full bg-cyan-500 flex items-center justify-center text-white">
          f(4)
        </div>

        <div className="size-14 rounded-full bg-cyan-500 flex items-center justify-center text-white">
          f(3)
        </div>
      </div>

      <div className="flex gap-8">
        {["f(3)", "f(2)", "f(2)", "f(1)"].map((v, i) => (
          <div
            key={i}
            className="size-12 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs"
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrayViz() {
  const arr = [23, 45, 67, 12, 89, 34, 56];

  return (
    <div className="flex gap-3 items-end">
      {arr.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-300">{val}</span>

          <div
            style={{ height: `${val * 2}px` }}
            className="w-14 bg-purple-600 rounded-t-lg"
          />

          <span className="text-xs text-slate-500">[{i}]</span>
        </div>
      ))}
    </div>
  );
}

function LinkedListViz() {
  const nodes = [12, 25, 37, 49];

  return (
    <div className="flex items-center gap-3">
      {nodes.map((val, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-white">
            {val}
          </div>

          {i < nodes.length - 1 && (
            <div className="text-2xl text-cyan-400">→</div>
          )}
        </div>
      ))}
    </div>
  );
}

function TreeViz() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="size-14 rounded-full bg-purple-600 flex items-center justify-center text-white">
        50
      </div>

      <div className="flex gap-24">
        <div className="size-12 rounded-full bg-cyan-500 flex items-center justify-center text-white">
          30
        </div>

        <div className="size-12 rounded-full bg-cyan-500 flex items-center justify-center text-white">
          70
        </div>
      </div>

      <div className="flex gap-10">
        {[20, 40, 60, 80].map((v) => (
          <div
            key={v}
            className="size-10 rounded-full bg-sky-500 flex items-center justify-center text-white text-sm"
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

function StackViz() {
  const stack = [10, 20, 30, 40, 50];

  return (
    <div className="flex flex-col-reverse">
      {stack.map((val, i) => (
        <div
          key={i}
          className="w-32 h-12 bg-purple-600 border border-slate-700 flex items-center justify-center text-white"
        >
          {val}
        </div>
      ))}
    </div>
  );
}

function QueueViz() {
  const queue = [5, 10, 15, 20, 25];

  return (
    <div className="flex items-center gap-3">
      {queue.map((val, i) => (
        <div
          key={i}
          className="w-16 h-16 bg-cyan-500 rounded-lg flex items-center justify-center text-white"
        >
          {val}
        </div>
      ))}

      <div className="text-3xl text-slate-400">→</div>
    </div>
  );
}

function GraphViz() {
  const nodes = [
    { x: 80, y: 50, label: "A" },
    { x: 220, y: 50, label: "B" },
    { x: 150, y: 150, label: "C" },
    { x: 300, y: 150, label: "D" },
    { x: 80, y: 250, label: "E" },
  ];

  return (
    <div className="relative w-full h-full">
      {nodes.map((node, i) => (
        <div
          key={i}
          className="absolute size-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-md"
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}