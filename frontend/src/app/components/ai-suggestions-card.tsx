import { Lightbulb, ArrowRight } from "lucide-react";

interface Suggestion {
  id: number;
  text: string;
  impact: "high" | "medium" | "low";
}

const mockSuggestions: Suggestion[] = [
  { id: 1, text: "Use HashMap for O(1) lookups", impact: "high" },
  { id: 2, text: "Reduce nested loops to O(n)", impact: "high" },
  { id: 3, text: "Consider binary search approach", impact: "medium" },
  { id: 4, text: "Use memoization for recursion", impact: "medium" },
];

export function AISuggestionsCard() {
  const impactColors = {
    high: "bg-red-500/10 text-red-400",
    medium: "bg-yellow-500/10 text-yellow-400",
    low: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="size-4 text-primary" />
        <h3 className="text-sm text-white">AI Suggestions</h3>
      </div>

      <div className="space-y-2">
        {mockSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 bg-[#0F172A] border border-[#334155] rounded-md hover:border-primary cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-200 flex-1">{suggestion.text}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  impactColors[suggestion.impact]
                }`}
              >
                {suggestion.impact}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 px-4 bg-primary hover:bg-primary/90 rounded-md text-sm text-white flex items-center justify-center gap-2">
        Apply All
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
