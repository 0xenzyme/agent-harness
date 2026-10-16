"""Correct scaffold column wires so they match the Agent Harness architecture.

Hosts share one bus into the three execution paths. Only durable work continues
into the control plane. Plugin, Adapter, and Artifacts read left to right.
"""
import json
from pathlib import Path

CONFIG = Path(__file__).with_name("config.json")


def wire(points, period, offset=0.0):
    return {
        "type": "path",
        "points": points,
        "color": "line",
        "r": 14,
        "width": 2,
        "flow": {
            "period": period,
            "offsets": [offset, offset + 0.55],
            "color": "bl",
        },
    }


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    titles = {
        "Plugin": (40, 214, ["protocol", "skills + CLI"]),
        "Adapter": (306, 214, ["local policy", "paths, language"]),
        "Artifacts": (572, 214, ["goals and runs", "evidence, sync"]),
    }
    for element in cfg["elements"]:
        if element.get("type") != "box" or element.get("y") != 1010:
            continue
        name = element["lines"][0]["t"]
        x, w, lines = titles[name]
        element["x"], element["w"] = x, w
        element["lines"] = [element["lines"][0]] + [
            {"t": line, "c": "mute"} for line in lines
        ]

    cfg["elements"] = [
        element for element in cfg["elements"]
        if element.get("type") != "path"
    ]
    cfg["elements"][2:2] = [
        wire([[158, 375], [158, 490]], 1.7, 0.0),
        wire([[416, 375], [416, 490]], 2.0, 0.2),
        wire([[674, 375], [674, 490]], 2.3, 0.4),
        wire([[158, 490], [674, 490]], 2.6, 0.1),
        wire([[158, 490], [158, 605]], 1.9, 0.3),
        wire([[416, 490], [416, 605]], 2.2, 0.5),
        wire([[674, 490], [674, 605]], 2.5, 0.15),
        wire([[674, 780], [674, 900], [413, 900], [413, 1010]], 2.8, 0.25),
        wire([[254, 1082], [306, 1082]], 2.1, 0.0),
        wire([[520, 1082], [572, 1082]], 2.4, 0.35),
    ]
    CONFIG.write_text(json.dumps(cfg, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"rewired {CONFIG}")


if __name__ == "__main__":
    main()
