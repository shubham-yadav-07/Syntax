import re


def generate_visualization_data(analysis: dict, code: str, language: str) -> dict:
    patterns = analysis.get("patterns", {})
    stats = analysis.get("stats", {})
    return {
        "array": _array(code),
        "linked_list": _linked_list(),
        "tree": _tree(),
        "graph": _graph(),
        "stack": _stack(stats),
        "queue": _queue(),
        "recursion_tree": _recursion_tree(patterns),
        "execution_steps": _exec_steps(analysis),
    }


def _array(code: str) -> dict:
    m = re.search(r'\[([0-9,\s]+)\]', code)
    if m:
        try: vals = [int(v.strip()) for v in m.group(1).split(",") if v.strip()][:10]
        except: vals = [23, 45, 67, 12, 89, 34, 56]
    else:
        vals = [23, 45, 67, 12, 89, 34, 56]
    return {"type":"array","elements":[{"index":i,"value":v,"highlighted":False,"color":"primary"} for i,v in enumerate(vals)],"activeIndex":-1}


def _linked_list() -> dict:
    nodes = [12, 25, 37, 49]
    return {"type":"linked_list","nodes":[{"id":i,"value":v,"next":i+1 if i<len(nodes)-1 else None,"highlighted":False} for i,v in enumerate(nodes)]}


def _tree() -> dict:
    return {"type":"tree","root":{
        "id":0,"value":50,"depth":0,"highlighted":False,
        "left":{"id":1,"value":30,"depth":1,"highlighted":False,
            "left":{"id":3,"value":20,"depth":2,"highlighted":False,"left":None,"right":None},
            "right":{"id":4,"value":40,"depth":2,"highlighted":False,"left":None,"right":None}},
        "right":{"id":2,"value":70,"depth":1,"highlighted":False,
            "left":{"id":5,"value":60,"depth":2,"highlighted":False,"left":None,"right":None},
            "right":{"id":6,"value":80,"depth":2,"highlighted":False,"left":None,"right":None}},
    }}


def _graph() -> dict:
    return {"type":"graph",
        "nodes":[{"id":"A","x":80,"y":50},{"id":"B","x":200,"y":50},{"id":"C","x":140,"y":130},{"id":"D","x":260,"y":130},{"id":"E","x":80,"y":210}],
        "edges":[{"from":"A","to":"B"},{"from":"A","to":"C"},{"from":"B","to":"D"},{"from":"C","to":"D"},{"from":"C","to":"E"}],
        "directed":False}


def _stack(stats: dict) -> dict:
    depth = max(3, stats.get("nestedDepth", 3))
    vals = list(range(10, 10 + depth * 10, 10))[:6]
    return {"type":"stack","elements":[{"value":v,"isTop":i==len(vals)-1} for i,v in enumerate(vals)],"top":len(vals)-1}


def _queue() -> dict:
    vals = [5, 10, 15, 20, 25]
    return {"type":"queue","elements":[{"value":v,"isFront":i==0,"isRear":i==4} for i,v in enumerate(vals)],"front":0,"rear":4}


def _recursion_tree(patterns: dict) -> dict:
    def make(val, depth, max_d):
        if depth >= max_d or val <= 0:
            return {"value":"f("+str(val)+")","depth":depth,"children":[],"highlighted":depth==0}
        return {"value":"f("+str(val)+")","depth":depth,"highlighted":depth==0,
                "children":[make(val-1,depth+1,max_d), make(val-2,depth+1,max_d)]}
    algo = patterns.get("detectedAlgorithm","")
    md = 3 if "Divide" in algo or "Merge" in algo else 2
    return {"type":"recursion_tree","root":make(5,0,md)}


def _exec_steps(analysis: dict) -> list:
    return [{"stepNumber":i+1,"description":s.get("description","Step "+str(i+1)),
              "lineNumber":s.get("lineNumber",1),"variables":s.get("variables",{}),"callStack":[]}
            for i,s in enumerate(analysis.get("dry_run",[])[:10])]
