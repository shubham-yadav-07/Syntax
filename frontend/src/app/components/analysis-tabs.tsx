import { useState } from "react";
import { Code2, Play, Eye, Layers } from "lucide-react";

const tabs = [
  { id: "explanation", label: "Line by Line", icon: Code2 },
  { id: "dryrun", label: "Dry Run", icon: Play },
  { id: "visualization", label: "Visualizations", icon: Eye },
  { id: "alternatives", label: "Alternatives", icon: Layers },
];

export function AnalysisTabs() {
  const [activeTab, setActiveTab] = useState("explanation");

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg">
      <div className="flex gap-1 p-2 border-b border-[#334155]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#334155]"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-4 min-h-[300px]">
        {activeTab === "explanation" && <LineByLineExplanation />}
        {activeTab === "dryrun" && <DryRunView />}
        {activeTab === "visualization" && <VisualizationView />}
        {activeTab === "alternatives" && <AlternativeSolutions />}
      </div>
    </div>
  );
}

function LineByLineExplanation() {
  const explanations = [
    {
      line: 1,
      code: "function twoSum(nums, target) {",
      explanation: "Define function that takes array and target value",
    },
    {
      line: 2,
      code: "  const map = new Map();",
      explanation: "Create HashMap for O(1) lookup - optimal approach",
    },
    {
      line: 4,
      code: "  for (let i = 0; i < nums.length; i++) {",
      explanation: "Single loop iteration - O(n) time complexity",
    },
    {
      line: 5,
      code: "    const complement = target - nums[i];",
      explanation: "Calculate what number we need to reach target",
    },
    {
      line: 7,
      code: "    if (map.has(complement)) {",
      explanation: "Check if complement exists in map - O(1) operation",
    },
  ];

  return (
    <div className="space-y-2">
      {explanations.map((item) => (
        <div
          key={item.line}
          className="p-3 bg-[#0F172A] border border-[#334155] rounded-md"
        >
          <div className="flex items-start gap-3">
            <div className="size-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs shrink-0 mt-0.5">
              {item.line}
            </div>
            <div className="flex-1">
              <code className="text-xs text-accent block mb-1 font-mono">
                {item.code}
              </code>
              <p className="text-xs text-slate-400">{item.explanation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DryRunView() {
  const steps = [
    { step: 1, state: "nums = [2, 7, 11, 15], target = 9, i = 0", action: "map = {}" },
    { step: 2, state: "complement = 9 - 2 = 7", action: "7 not in map" },
    { step: 3, state: "i = 1", action: "map = {2: 0}" },
    { step: 4, state: "complement = 9 - 7 = 2", action: "2 found in map!" },
    { step: 5, state: "return [0, 1]", action: "Solution found ✓" },
  ];

  return (
    <div className="space-y-2">
      {steps.map((item) => (
        <div
          key={item.step}
          className="p-3 bg-[#0F172A] border border-[#334155] rounded-md"
        >
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs shrink-0">
              {item.step}
            </div>
            <div className="flex-1">
              <p className="text-xs text-white mb-1">{item.state}</p>
              <p className="text-xs text-accent">{item.action}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function VisualizationView() {
  return (
    <div className="text-center py-12">
      <div className="size-16 mx-auto rounded-lg bg-primary/20 flex items-center justify-center mb-4">
        <Eye className="size-8 text-primary" />
      </div>
      <h4 className="text-sm text-white mb-2">Interactive Execution Flow</h4>
      <p className="text-xs text-slate-400 mb-6">
        See how your algorithm executes step by step
      </p>
      <button className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-md text-sm text-white">
        Start Animation
      </button>
    </div>
  );
}

function AlternativeSolutions() {
  const alternatives = [
    {
      approach: "Brute Force",
      complexity: "O(n²)",
      space: "O(1)",
      description: "Use nested loops to check all pairs",
      recommended: false,
    },
    {
      approach: "HashMap (Current)",
      complexity: "O(n)",
      space: "O(n)",
      description: "Single pass with hash table for lookups",
      recommended: true,
    },
    {
      approach: "Two Pointers",
      complexity: "O(n log n)",
      space: "O(1)",
      description: "Sort first, then use two pointers",
      recommended: false,
    },
  ];

  return (
    <div className="space-y-2">
      {alternatives.map((alt, index) => (
        <div
          key={index}
          className={`p-3 rounded-md border ${
            alt.recommended
              ? "bg-green-500/5 border-green-500/30"
              : "bg-[#0F172A] border-[#334155]"
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm text-white">{alt.approach}</h4>
            {alt.recommended && (
              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                Best
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-2">{alt.description}</p>
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-slate-500">Time: </span>
              <span className="text-accent">{alt.complexity}</span>
            </div>
            <div>
              <span className="text-slate-500">Space: </span>
              <span className="text-accent">{alt.space}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
