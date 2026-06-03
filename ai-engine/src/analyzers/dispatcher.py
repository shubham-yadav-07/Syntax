from src.analyzers.python_analyzer import PythonAnalyzer
from src.analyzers.js_analyzer import JSAnalyzer
from src.analyzers.generic_analyzer import GenericAnalyzer
from src.generators.suggestions import generate_suggestions
from src.generators.alternatives import generate_alternatives
from src.generators.visualization import generate_visualization_data


def analyze_code(code: str, language: str) -> dict:
    if language == "python":
        analyzer = PythonAnalyzer(code)
    elif language in ("javascript", "js"):
        analyzer = JSAnalyzer(code)
    else:
        analyzer = GenericAnalyzer(code, language)

    base = analyzer.analyze()
    base["suggestions"] = generate_suggestions(base)
    base["alternatives"] = generate_alternatives(base, code, language)
    base["visualization_data"] = generate_visualization_data(base, code, language)
    base["overall_score"] = _compute_score(base)
    return base


def _compute_score(analysis: dict) -> int:
    score = 100
    tc = analysis.get("complexity", {}).get("time", "")
    deductions = {"O(n!)": 70, "O(2^n)": 55, "O(n^3)": 40, "O(n^2)": 30, "O(n*2)": 30,
                  "O(n2)": 30, "O(n squared)": 30, "O(n log n)": 10, "O(n)": 5, "O(log n)": 0, "O(1)": 0}
    for key, val in deductions.items():
        if key.replace(" ","").lower() in tc.replace(" ","").lower():
            score -= val
            break
    patterns = analysis.get("patterns", {})
    if patterns.get("hasNestedLoops"):
        score -= 15
    if patterns.get("hasRecursion") and not patterns.get("hasDivideAndConquer"):
        score -= 5
    stats = analysis.get("stats", {})
    if stats.get("linesOfCode", 0) > 200:
        score -= 10
    return max(0, min(100, score))
