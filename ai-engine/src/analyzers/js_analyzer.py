import re


class JSAnalyzer:
    def __init__(self, code: str):
        self.code = code
        self.lines = code.splitlines()

    def analyze(self) -> dict:
        stats = self._stats()
        patterns = self._patterns(stats)
        complexity = self._complexity(stats, patterns)
        return {
            "complexity": complexity, "stats": stats, "patterns": patterns,
            "explanations": self._explanations(), "dry_run": self._dry_run(),
            "complexity_breakdown": self._breakdown(patterns),
        }

    def _stats(self) -> dict:
        code = self.code
        for_loops = len(re.findall(r'\bfor\s*\(', code))
        while_loops = len(re.findall(r'\bwhile\s*\(', code))
        for_of = len(re.findall(r'\bfor\s+(const|let|var)\b', code))
        loops = for_loops + while_loops + for_of
        funcs = len(re.findall(r'\bfunction\b|=>\s*[{(]|\.forEach\(|\.map\(|\.reduce\(', code))
        fn_names = re.findall(r'(?:function\s+(\w+)|const\s+(\w+)\s*=)', code)
        fn_flat = [n for pair in fn_names for n in pair if n]
        recursive = sum(1 for name in fn_flat if len(re.findall(r'\b' + re.escape(name) + r'\s*\(', code)) > 1)
        variables = len(re.findall(r'\b(const|let|var)\b', code))
        conditionals = len(re.findall(r'\bif\s*\(|\?\s*\w', code))
        depth = self._nesting()
        loc = len([l for l in self.lines if l.strip() and not l.strip().startswith("//")])
        return {"linesOfCode": loc, "loops": loops, "recursiveCalls": recursive, "variables": variables, "functions": funcs, "nestedDepth": depth, "conditionals": conditionals}

    def _nesting(self) -> int:
        depth = md = 0
        for ch in self.code:
            if ch == "{": depth += 1; md = max(md, depth)
            elif ch == "}": depth = max(0, depth - 1)
        return md

    def _patterns(self, stats: dict) -> dict:
        c = self.code.lower()
        nested = stats["nestedDepth"] >= 2 and stats["loops"] >= 2
        hashmap = bool(re.search(r'\bnew\s+Map\b|\{\}|new\s+Set\b', self.code))
        dp = bool(re.search(r'\bdp\b|\bmemo\b|cache|memoize', c))
        dc = stats["recursiveCalls"] > 0 and ("mid" in c or "merge" in c or "left" in c)
        return {
            "hasLoops": stats["loops"] > 0, "hasRecursion": stats["recursiveCalls"] > 0,
            "hasNestedLoops": nested, "hasDivideAndConquer": dc,
            "hasDynamicProgramming": dp, "hasHashMap": hashmap,
            "detectedAlgorithm": self._algo(stats, nested, dc, hashmap, c),
        }

    def _algo(self, stats, nested, dc, hashmap, c) -> str:
        if "binary" in c and "search" in c: return "Binary Search"
        if "merge" in c and stats["recursiveCalls"] > 0: return "Merge Sort"
        if "quick" in c and stats["recursiveCalls"] > 0: return "Quick Sort"
        if dc: return "Divide and Conquer"
        if hashmap and stats["loops"] <= 1: return "Hash Map Lookup"
        if nested: return "Nested Iteration"
        if stats["loops"] == 1: return "Linear Scan"
        return "General Algorithm"

    def _complexity(self, stats: dict, patterns: dict) -> dict:
        loops, depth = stats["loops"], stats["nestedDepth"]
        recursive, dc, dp = stats["recursiveCalls"] > 0, patterns["hasDivideAndConquer"], patterns["hasDynamicProgramming"]
        if dc: tc = "O(n log n)"
        elif dp: tc = "O(n^2)"
        elif depth >= 4 or (loops >= 3 and patterns["hasNestedLoops"]): tc = "O(n^3)"
        elif patterns["hasNestedLoops"] and depth >= 2: tc = "O(n^2)"
        elif recursive and not dc: tc = "O(2^n)"
        elif loops == 1: tc = "O(n)"
        elif loops == 0:
            tc = "O(log n)" if ">> 1" in self.code or "Math.floor" in self.code else "O(1)"
        else: tc = "O(n)"
        sc = "O(n)" if (patterns["hasHashMap"] or recursive or dp) else "O(1)"
        return {"time": tc, "space": sc, "bestCase": "O(1)" if loops > 0 else tc, "averageCase": tc, "worstCase": tc}

    def _explanations(self) -> list:
        result = []
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if not line or line.startswith("//"): continue
            text = ""
            if re.match(r'^function\s+\w+|^const\s+\w+\s*=\s*\(|^const\s+\w+\s*=\s*async', line):
                m = re.search(r'function\s+(\w+)|const\s+(\w+)', line)
                name = (m.group(1) or m.group(2)) if m else "fn"
                text = "Function '" + name + "' definition"
            elif re.match(r'^for\s*\(', line): text = "For loop — O(n) iteration"
            elif re.match(r'^while\s*\(', line): text = "While loop — conditional O(n)"
            elif "new Map()" in line or "new Map (" in line: text = "HashMap created — O(1) lookups"
            elif re.match(r'^if\s*\(', line): text = "Conditional branch — O(1)"
            elif re.match(r'^return\b', line): text = "Return statement"
            elif re.match(r'^(const|let|var)\s', line): text = "Variable: " + line[:60]
            if text:
                highlight = any(k in line for k in ["for","while","return","Map"])
                result.append({"line": i, "text": text, "highlight": highlight})
        return result[:20]

    def _dry_run(self) -> list:
        steps, n = [], 1
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if re.match(r'^function\s+\w+|^const\s+\w+\s*=\s*(async\s*)?\(', line):
                m = re.search(r'function\s+(\w+)|const\s+(\w+)', line)
                name = (m.group(1) or m.group(2)) if m else "fn"
                steps.append({"step": n, "description": "Enter '" + name + "'", "variables": {}, "lineNumber": i})
                n += 1
            elif re.match(r'^for\s*\(', line):
                steps.append({"step": n, "description": "Start loop iteration", "variables": {"i": 0}, "lineNumber": i})
                n += 1
            elif re.match(r'^return\b', line):
                steps.append({"step": n, "description": "Return result", "variables": {}, "lineNumber": i})
                n += 1
            if n > 10: break
        return steps

    def _breakdown(self, patterns: dict) -> list:
        result = []
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if re.match(r'^for\s*\(', line):
                result.append({"section": "For Loop (L" + str(i) + ")", "complexity": "O(n)", "reason": "Iterates over n elements", "lineStart": i, "lineEnd": i + 5})
            elif re.match(r'^while\s*\(', line):
                result.append({"section": "While Loop (L" + str(i) + ")", "complexity": "O(n)", "reason": "Conditional iteration", "lineStart": i, "lineEnd": i + 5})
        return result[:8]
