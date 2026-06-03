import re


class GenericAnalyzer:
    """Regex/heuristic analyzer for C, C++, Java, and Go."""

    def __init__(self, code: str, language: str):
        self.code = code
        self.language = language
        self.lines = code.splitlines()

    def analyze(self) -> dict:
        stats = self._stats()
        patterns = self._patterns(stats)
        complexity = self._complexity(stats, patterns)
        return {
            "complexity": complexity,
            "stats": stats,
            "patterns": patterns,
            "explanations": self._explanations(),
            "dry_run": self._dry_run(),
            "complexity_breakdown": self._breakdown(),
        }

    def _stats(self) -> dict:
        # Count for/while/do loops across all supported languages
        loop_lines = [l.strip() for l in self.lines
                      if re.match(r'^(for|while|do)\s*[\(\{:=\s]', l.strip())]
        loops = len(loop_lines)

        # Function definitions
        funcs = len(re.findall(
            r'\b\w[\w\s\*]*\s+\w+\s*\([^)]*\)\s*\{', self.code
        ))

        # Variable declarations (Java/C/C++/Go)
        variables = len(re.findall(
            r'\b(int|long|double|float|string|char|bool|auto|var|let|const|'
            r'String|Integer|ArrayList|List|Map|HashMap|vector)\s+\w+', self.code
        ))

        conditionals = len(re.findall(r'\b(if|switch)\s*\(', self.code))

        # Recursive calls — return statements that call a function
        recursive = len(re.findall(r'\breturn\s+\w+\s*\(', self.code))

        # Loop nesting — count max consecutive loop lines (indentation-based)
        depth = self._loop_nesting_depth()

        loc = len([l for l in self.lines
                   if l.strip() and not l.strip().startswith("//")
                   and not l.strip().startswith("*")])

        return {
            "linesOfCode": loc,
            "loops": loops,
            "recursiveCalls": recursive,
            "variables": variables,
            "functions": max(1, funcs),
            "nestedDepth": depth,
            "conditionals": conditionals,
        }

    def _loop_nesting_depth(self) -> int:
        """
        Estimate loop nesting depth using RELATIVE indentation.
        Subtracts the base (minimum) loop indentation so top-level
        loops inside a class/function are still counted as depth 1.
        """
        loop_indents = []
        for line in self.lines:
            stripped = line.lstrip()
            if re.match(r'^(for|while|do)(\s|\(|\{)', stripped):
                indent = len(line) - len(stripped)
                loop_indents.append(indent)
        if not loop_indents:
            return 0
        base = min(loop_indents)
        max_depth = max((ind - base) // 4 + 1 for ind in loop_indents)
        return max_depth

    def _patterns(self, stats: dict) -> dict:
        c = self.code.lower()
        nested = stats["nestedDepth"] >= 2
        hashmap = bool(re.search(
            r'unordered_map|HashMap|map\[|Map<|Dictionary|new Map', self.code
        ))
        dp = bool(re.search(r'\bdp\b|\bmemo\b|memoize', c))
        dc = (stats["recursiveCalls"] > 0 and
              ("mid" in c or "merge" in c or "left" in c or "right" in c))
        return {
            "hasLoops": stats["loops"] > 0,
            "hasRecursion": stats["recursiveCalls"] > 0,
            "hasNestedLoops": nested,
            "hasDivideAndConquer": dc,
            "hasDynamicProgramming": dp,
            "hasHashMap": hashmap,
            "detectedAlgorithm": self._algo(stats, nested, dc, hashmap, c),
        }

    def _algo(self, stats, nested, dc, hashmap, c) -> str:
        if "binary" in c and "search" in c: return "Binary Search"
        if "merge" in c and stats["recursiveCalls"] > 0: return "Merge Sort"
        if "quick" in c and stats["recursiveCalls"] > 0: return "Quick Sort"
        if "bubble" in c: return "Bubble Sort"
        if dc: return "Divide and Conquer"
        if hashmap and stats["loops"] <= 1: return "Hash Map Lookup"
        if nested: return "Nested Iteration"
        if stats["loops"] == 1: return "Linear Scan"
        return "General Algorithm"

    def _complexity(self, stats: dict, patterns: dict) -> dict:
        loops = stats["loops"]
        depth = stats["nestedDepth"]
        recursive = stats["recursiveCalls"] > 0
        dc = patterns["hasDivideAndConquer"]
        dp = patterns["hasDynamicProgramming"]

        if dc:
            tc = "O(n log n)"
        elif dp:
            tc = "O(n^2)"
        elif depth >= 3:
            tc = "O(n^3)"
        elif depth >= 2:
            tc = "O(n^2)"
        elif recursive and not dc:
            tc = "O(2^n)"
        elif loops == 1:
            tc = "O(n)"
        elif loops == 0:
            has_halving = bool(re.search(r'mid\s*=|>>\s*1|/\s*2', self.code))
            tc = "O(log n)" if has_halving else "O(1)"
        else:
            tc = "O(n)"

        sc = "O(n)" if (patterns["hasHashMap"] or recursive or dp) else "O(1)"
        best = "O(n)" if depth >= 2 else ("O(1)" if loops > 0 else tc)
        return {
            "time": tc, "space": sc,
            "bestCase": best, "averageCase": tc, "worstCase": tc,
        }

    def _explanations(self) -> list:
        result = []
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if not line or line.startswith("//") or line.startswith("*"):
                continue
            text = ""
            if re.match(r'^for\s*[\(\{]', line) or re.match(r'^for\s+\w', line):
                text = "For loop — O(n) iteration"
            elif re.match(r'^while\s*\(', line):
                text = "While loop — conditional iteration"
            elif re.match(r'^if\s*\(', line):
                text = "Conditional branch"
            elif re.match(r'^return\b', line):
                text = "Return statement"
            elif re.search(r'\b\w+\s+\w+\s*\([^)]*\)\s*\{', line):
                m = re.search(r'\b(\w+)\s*\(', line)
                name = m.group(1) if m else "fn"
                text = "Function '" + name + "' definition"
            elif re.match(r'^(const|let|var|int|long|string|auto|var)\s', line):
                text = "Variable declaration: " + line[:60]
            if text:
                result.append({
                    "line": i,
                    "text": text,
                    "highlight": any(k in line for k in ["for", "while", "return"]),
                })
        return result[:20]

    def _dry_run(self) -> list:
        steps, n = [], 1
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if re.match(r'^for\s*[\(\{]', line) or re.match(r'^for\s+\w', line):
                steps.append({"step": n, "description": "Begin for loop",
                               "variables": {"i": 0}, "lineNumber": i})
                n += 1
            elif re.match(r'^while\s*\(', line):
                steps.append({"step": n, "description": "Evaluate while condition",
                               "variables": {}, "lineNumber": i})
                n += 1
            elif re.match(r'^return\b', line):
                steps.append({"step": n, "description": "Return result",
                               "variables": {}, "lineNumber": i})
                n += 1
            if n > 10:
                break
        return steps

    def _breakdown(self) -> list:
        result = []
        for i, raw in enumerate(self.lines, 1):
            line = raw.strip()
            if re.match(r'^for\s*[\(\{]', line) or re.match(r'^for\s+\w', line):
                result.append({"section": "Loop (L" + str(i) + ")", "complexity": "O(n)",
                                "reason": "Linear iteration", "lineStart": i, "lineEnd": i + 5})
            elif re.match(r'^while\s*\(', line):
                result.append({"section": "While (L" + str(i) + ")", "complexity": "O(n)",
                                "reason": "Conditional iteration", "lineStart": i, "lineEnd": i + 5})
        return result[:8]
