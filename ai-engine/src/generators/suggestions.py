import uuid


RULES = [
    {
        "condition": lambda a: a.get("patterns",{}).get("hasNestedLoops") and not a.get("patterns",{}).get("hasHashMap"),
        "title": "Replace nested loops with a HashMap",
        "description": "Your nested loops cause O(n^2) complexity. Use a HashMap to reduce to O(n).",
        "impact": "high", "improvement": "O(n^2) -> O(n)", "category": "time",
        "codeExample": "// Use HashMap instead of nested loops\nconst map = new Map();\nfor (const item of arr) { map.set(item.key, item); }",
    },
    {
        "condition": lambda a: a.get("patterns",{}).get("hasRecursion") and not a.get("patterns",{}).get("hasDynamicProgramming") and not a.get("patterns",{}).get("hasDivideAndConquer"),
        "title": "Add memoization to recursive function",
        "description": "Your recursive function recomputes overlapping subproblems. Cache results to improve from O(2^n) to O(n).",
        "impact": "high", "improvement": "O(2^n) -> O(n)", "category": "time",
        "codeExample": "const memo = {};\nfunction solve(n) {\n  if (n in memo) return memo[n];\n  memo[n] = solve(n-1) + solve(n-2);\n  return memo[n];\n}",
    },
    {
        "condition": lambda a: a.get("patterns",{}).get("hasNestedLoops") and a.get("complexity",{}).get("time","") in ("O(n^2)","O(n2)"),
        "title": "Apply the two-pointer technique",
        "description": "Replace the nested loop with two pointers to reduce complexity from O(n^2) to O(n).",
        "impact": "high", "improvement": "O(n^2) -> O(n)", "category": "time",
        "codeExample": "let left = 0, right = arr.length - 1;\nwhile (left < right) {\n  // process arr[left] and arr[right]\n  left++; right--;\n}",
    },
    {
        "condition": lambda a: a.get("stats",{}).get("loops",0) >= 2 and a.get("complexity",{}).get("time","") in ("O(n^2)","O(n^3)"),
        "title": "Use a sliding window",
        "description": "For contiguous subarray problems, a sliding window eliminates redundant recalculation, reducing to O(n).",
        "impact": "high", "improvement": "O(n^2) -> O(n)", "category": "time",
        "codeExample": "let sum = 0;\nfor (let i = 0; i < k; i++) sum += arr[i];\nfor (let i = k; i < n; i++) { sum += arr[i] - arr[i-k]; }",
    },
    {
        "condition": lambda a: a.get("complexity",{}).get("space","") == "O(n)" and not a.get("patterns",{}).get("hasHashMap"),
        "title": "Reduce space with in-place operations",
        "description": "Your algorithm uses extra memory. Consider in-place modification to achieve O(1) space.",
        "impact": "medium", "improvement": "O(n) -> O(1) space", "category": "space",
        "codeExample": "// Sort in-place instead of creating copies\narr.sort((a, b) => a - b);",
    },
    {
        "condition": lambda a: a.get("patterns",{}).get("hasRecursion"),
        "title": "Convert to tail recursion",
        "description": "Transform your recursive function to use tail calls to reduce stack overhead.",
        "impact": "medium", "improvement": "30% less stack memory", "category": "space",
        "codeExample": "function factorial(n, acc = 1) {\n  if (n <= 1) return acc;\n  return factorial(n - 1, n * acc); // tail call\n}",
    },
    {
        "condition": lambda a: a.get("stats",{}).get("loops",0) > 0,
        "title": "Add early exit conditions",
        "description": "Adding break or early return improves best-case performance significantly.",
        "impact": "low", "improvement": "Better best-case performance", "category": "time",
        "codeExample": "for (const item of arr) {\n  if (found(item)) return item; // early exit\n}",
    },
]


def generate_suggestions(analysis: dict) -> list:
    rank = {"high": 0, "medium": 1, "low": 2}
    result = []
    for rule in RULES:
        try:
            if rule["condition"](analysis):
                result.append({
                    "id": str(uuid.uuid4()),
                    "title": rule["title"],
                    "description": rule["description"],
                    "impact": rule["impact"],
                    "improvement": rule["improvement"],
                    "category": rule["category"],
                    "codeExample": rule.get("codeExample",""),
                })
        except Exception:
            continue
    result.sort(key=lambda s: rank.get(s["impact"], 99))
    return result[:6]
