import Editor from "@monaco-editor/react";
import { Upload, Play, Download } from "lucide-react";
import { useState } from "react";

const languages = [
  "javascript",
  "python",
  "java",
  "cpp",
  "typescript",
  "go",
  "rust",
];

const sampleCode = `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}`;

export function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(sampleCode);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
        <h3 className="text-sm text-white">Code Editor</h3>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 bg-[#0F172A] border border-[#334155] rounded-md text-sm text-white focus:outline-none focus:border-primary"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <button className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded-md text-sm text-white flex items-center gap-1.5">
            <Upload className="size-3.5" />
            Upload
          </button>

          <button className="px-3 py-1.5 bg-[#334155] hover:bg-[#475569] rounded-md text-sm text-white flex items-center gap-1.5">
            <Download className="size-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      <div className="px-4 py-3 border-t border-[#334155]">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-2 px-4 bg-primary hover:bg-primary/90 rounded-md text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
