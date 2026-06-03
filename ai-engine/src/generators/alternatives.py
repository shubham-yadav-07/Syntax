import uuid

TEMPLATES = {
    "javascript": {
        "brute": {"name":"Brute Force","timeComplexity":"O(n^2)","spaceComplexity":"O(1)","readabilityScore":95,"efficiencyScore":35,
          "description":"Simple nested loop. Easy to understand but slowest.",
          "code":"function bruteForce(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return [i, j];\n    }\n  }\n  return [];\n}"},
        "optimized": {"name":"HashMap (Optimal)","timeComplexity":"O(n)","spaceComplexity":"O(n)","readabilityScore":88,"efficiencyScore":97,
          "description":"Single-pass hash map. Most efficient approach.",
          "code":"function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}"},
    },
    "python": {
        "brute": {"name":"Brute Force","timeComplexity":"O(n^2)","spaceComplexity":"O(1)","readabilityScore":95,"efficiencyScore":35,
          "description":"Double loop — simplest but slowest.",
          "code":"def brute_force(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i]+nums[j]==target:\n                return [i, j]\n    return []"},
        "optimized": {"name":"HashMap (Pythonic)","timeComplexity":"O(n)","spaceComplexity":"O(n)","readabilityScore":92,"efficiencyScore":97,
          "description":"Single-pass dictionary lookup. Most Pythonic and efficient.",
          "code":"def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []"},
    },
    "cpp": {
        "brute": {"name":"Brute Force","timeComplexity":"O(n^2)","spaceComplexity":"O(1)","readabilityScore":90,"efficiencyScore":30,
          "description":"Nested loops, no extra space.",
          "code":"vector<int> bruteForce(vector<int>& nums, int target) {\n    for (int i=0;i<nums.size();i++)\n        for (int j=i+1;j<nums.size();j++)\n            if (nums[i]+nums[j]==target) return {i,j};\n    return {};\n}"},
        "optimized": {"name":"unordered_map","timeComplexity":"O(n)","spaceComplexity":"O(n)","readabilityScore":80,"efficiencyScore":96,
          "description":"Hash map for O(1) lookups.",
          "code":"vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int,int> seen;\n    for (int i=0;i<nums.size();i++) {\n        int comp=target-nums[i];\n        if (seen.count(comp)) return {seen[comp],i};\n        seen[nums[i]]=i;\n    }\n    return {};\n}"},
    },
}

RANK = {"O(1)":100,"O(log n)":97,"O(n)":88,"O(n log n)":75,"O(n^2)":45,"O(n^3)":20,"O(2^n)":10,"O(n!)":5}


def generate_alternatives(analysis: dict, code: str, language: str) -> list:
    tc = analysis.get("complexity",{}).get("time","")
    efficiency = max(5, min(100, 100 - RANK.get("O(n^2)",45))) if "n^2" in tc else RANK.get(tc, 70)
    current = {"id": str(uuid.uuid4()), "name":"Current Solution", "code":code, "language":language,
               "timeComplexity":tc, "spaceComplexity":analysis.get("complexity",{}).get("space","O(1)"),
               "readabilityScore":85, "efficiencyScore":efficiency,
               "description":"Your submitted solution — " + analysis.get("patterns",{}).get("detectedAlgorithm","general approach") + "."}
    tmpl = TEMPLATES.get(language, TEMPLATES["javascript"])
    brute = {"id": str(uuid.uuid4()), "language": language, **tmpl["brute"]}
    optimized = {"id": str(uuid.uuid4()), "language": language, **tmpl["optimized"]}
    return [current, brute, optimized]
