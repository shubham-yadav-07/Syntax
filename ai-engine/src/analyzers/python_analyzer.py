import ast
import re


class PythonAnalyzer:
    def __init__(self, code: str):
        self.code = code
        self.lines = code.splitlines()
        self.tree = None
        self.parse_error = None
        try:
            self.tree = ast.parse(code)
        except SyntaxError as e:
            self.parse_error = str(e)

    def analyze(self) -> dict:
        if self.parse_error or not self.tree:
            return self._fallback()
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
        loops = variables = functions = conditionals = recursion = 0
        func_names = {n.name for n in ast.walk(self.tree)
                      if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
        for node in ast.walk(self.tree):
            if isinstance(node, (ast.For, ast.While)):
                loops += 1
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                functions += 1
            elif isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign)):
                variables += 1
            elif isinstance(node, (ast.If, ast.IfExp)):
                conditionals += 1
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in func_names:
                    recursion += 1

        # Only count LOOP nesting depth (not if/with)
        loop_depth = self._loop_nesting(self.tree, 0)

        return {
            "linesOfCode": len([l for l in self.lines if l.strip()]),
            "loops": loops,
            "recursiveCalls": recursion,
            "variables": variables,
            "functions": functions,
            "nestedDepth": loop_depth,
            "conditionals": conditionals,
        }

    def _loop_nesting(self, tree, depth: int) -> int:
        """Count maximum loop nesting depth (For/While only)."""
        md = depth
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, (ast.For, ast.While)):
                md = max(md, self._loop_nesting(node, depth + 1))
            else:
                md = max(md, self._loop_nesting(node, depth))
        return md

    def _patterns(self, stats: dict) -> dict:
        c = self.code.lower()
        nested = stats["nestedDepth"] >= 2
        dc = (stats["recursiveCalls"] > 1 and
              ("mid" in c or "left" in c or "merge" in c or "right" in c))
        hashmap = bool(re.search(r'\bdict\b|\{\}|defaultdict|Counter|set\(\)', self.code))
        dp = bool(re.search(r'\bdp\b|\bmemo\b|cache|lru_cache', c))
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
        if "insertion" in c: return "Insertion Sort"
        if dc: return "Divide and Conquer"
        if hashmap and stats["loops"] <= 1: return "Hash Map Lookup"
        if nested: return "Nested Iteration"
        if stats["loops"] == 1: return "Linear Scan"
        return "General Algorithm"

    def _complexity(self, stats: dict, patterns: dict) -> dict:
        loops = stats["loops"]
        depth = stats["nestedDepth"]  # loop-only depth
        recursive = stats["recursiveCalls"] > 0
        dc = patterns["hasDivideAndConquer"]
        dp = patterns["hasDynamicProgramming"]

        if dc:
            tc = "O(n log n)"
        elif dp:
            tc = "O(n^2)"
        elif depth >= 3:
            tc = "O(n^3)"
        elif depth >= 2:           # two nested loops
            tc = "O(n^2)"
        elif recursive and not dc:
            tc = "O(2^n)"
        elif loops == 1:
            tc = "O(n)"
        elif loops == 0:
            tc = "O(log n)" if re.search(r'//\s*2|>>|mid\s*=', self.code) else "O(1)"
        else:
            tc = "O(n)"

        sc = "O(n^2)" if dp else ("O(n)" if (patterns["hasHashMap"] or recursive) else "O(1)")
        best = "O(n)" if depth >= 2 else ("O(1)" if loops > 0 else tc)
        return {
            "time": tc, "space": sc,
            "bestCase": best, "averageCase": tc, "worstCase": tc,
        }

    def _explanations(self) -> list:
        result, seen = [], set()
        for node in ast.walk(self.tree):
            if not hasattr(node, "lineno") or node.lineno in seen:
                continue
            text = ""
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                args = [a.arg for a in node.args.args]
                text = ("Function '" + node.name + "' defined with params: " +
                        (", ".join(args) or "none"))
            elif isinstance(node, ast.For):
                text = "For loop — iterates over sequence, contributes O(n)"
            elif isinstance(node, ast.While):
                text = "While loop — conditional iteration, contributes O(n)"
            elif isinstance(node, ast.Return):
                text = "Return statement"
            elif isinstance(node, ast.If):
                text = "Conditional branch — O(1) decision"
            elif isinstance(node, ast.Assign):
                try:
                    text = "Assignment: " + ast.unparse(node)
                except Exception:
                    text = "Variable assignment"
            if text:
                seen.add(node.lineno)
                result.append({
                    "line": node.lineno,
                    "text": text,
                    "highlight": isinstance(node, (ast.For, ast.While, ast.Call)),
                })
        return sorted(result, key=lambda x: x["line"])[:20]

    def _dry_run(self) -> list:
        steps, n = [], 1
        for node in ast.walk(self.tree):
            if not hasattr(node, "lineno"):
                continue
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                steps.append({"step": n, "description": "Enter function '" + node.name + "'",
                               "variables": {}, "lineNumber": node.lineno})
                n += 1
            elif isinstance(node, ast.For):
                steps.append({"step": n, "description": "Begin for loop iteration",
                               "variables": {"i": 0}, "lineNumber": node.lineno})
                n += 1
            elif isinstance(node, ast.While):
                steps.append({"step": n, "description": "Evaluate while condition",
                               "variables": {}, "lineNumber": node.lineno})
                n += 1
            elif isinstance(node, ast.Return):
                steps.append({"step": n, "description": "Return result",
                               "variables": {}, "lineNumber": node.lineno})
                n += 1
            if n > 10:
                break
        return steps

    def _breakdown(self) -> list:
        result = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.For) and hasattr(node, "lineno"):
                result.append({
                    "section": "For Loop",
                    "complexity": "O(n)",
                    "reason": "Iterates over n elements",
                    "lineStart": node.lineno,
                    "lineEnd": node.lineno + len(node.body),
                })
            elif isinstance(node, ast.While) and hasattr(node, "lineno"):
                result.append({
                    "section": "While Loop",
                    "complexity": "O(n)",
                    "reason": "Conditional iteration",
                    "lineStart": node.lineno,
                    "lineEnd": node.lineno + len(node.body),
                })
        return result[:8]

    def _fallback(self) -> dict:
        loops = len(re.findall(r'\b(for|while)\b', self.code))
        loc = len([l for l in self.lines if l.strip()])
        tc = "O(n^2)" if loops > 1 else ("O(n)" if loops == 1 else "O(1)")
        return {
            "complexity": {"time": tc, "space": "O(1)", "bestCase": "O(1)",
                           "averageCase": tc, "worstCase": tc},
            "stats": {"linesOfCode": loc, "loops": loops, "recursiveCalls": 0,
                      "variables": 0, "functions": 0, "nestedDepth": loops - 1 if loops > 1 else 0,
                      "conditionals": 0},
            "patterns": {"hasLoops": loops > 0, "hasRecursion": False,
                         "hasNestedLoops": loops > 1, "hasDivideAndConquer": False,
                         "hasDynamicProgramming": False, "hasHashMap": False,
                         "detectedAlgorithm": "Unknown"},
            "explanations": [{"line": 1, "text": "Parse note: " + str(self.parse_error),
                               "highlight": False}],
            "dry_run": [],
            "complexity_breakdown": [],
        }
