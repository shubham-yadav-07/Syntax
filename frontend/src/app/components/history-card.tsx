import { Clock } from "lucide-react";

interface HistoryItem {
  id: number;
  language: string;
  date: string;
  complexity: string;
  snippet: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: 1,
    language: "Python",
    date: "2 hours ago",
    complexity: "O(n log n)",
    snippet: "def merge_sort(arr)...",
  },
  {
    id: 2,
    language: "JavaScript",
    date: "5 hours ago",
    complexity: "O(n²)",
    snippet: "function bubbleSort(arr)...",
  },
  {
    id: 3,
    language: "Java",
    date: "1 day ago",
    complexity: "O(n)",
    snippet: "public int findMax(int[] arr)...",
  },
];

export function HistoryCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-white">Recent Analysis</h3>
        <button className="text-xs text-primary hover:text-primary/80">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockHistory.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-[#1E293B] border border-[#334155] rounded-lg hover:border-primary cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-white">{item.language}</span>
              <span className="text-xs text-primary">{item.complexity}</span>
            </div>

            <div className="mb-3">
              <code className="text-xs text-slate-400 font-mono">
                {item.snippet}
              </code>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="size-3" />
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
