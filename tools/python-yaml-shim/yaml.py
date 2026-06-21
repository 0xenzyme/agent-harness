"""Minimal YAML shim for the local plugin validator.

The bundled validator only needs `safe_load` for simple mapping frontmatter in
this repository's `SKILL.md` files. Keeping this shim local avoids mutating the
user's Python installation just to run `npm run validate:plugin`.
"""


class YAMLError(Exception):
    """Raised when the limited YAML parser cannot parse input."""


def safe_load(text):
    if text is None:
        return None

    root = {}
    stack = [(-1, root)]

    for line_number, raw_line in enumerate(str(text).splitlines(), start=1):
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        if "\t" in raw_line[: len(raw_line) - len(raw_line.lstrip())]:
            raise YAMLError(f"tabs are not supported at line {line_number}")

        indent = len(raw_line) - len(raw_line.lstrip(" "))
        stripped = raw_line.strip()
        if ":" not in stripped:
            raise YAMLError(f"expected key/value pair at line {line_number}")

        key, value = stripped.split(":", 1)
        key = key.strip()
        if not key:
            raise YAMLError(f"empty key at line {line_number}")

        while indent <= stack[-1][0]:
            stack.pop()
        parent = stack[-1][1]

        value = value.strip()
        if value == "":
            child = {}
            parent[key] = child
            stack.append((indent, child))
        else:
            parent[key] = _parse_scalar(value)

    return root


def _parse_scalar(value):
    lowered = value.lower()
    if lowered == "true":
        return True
    if lowered == "false":
        return False
    if lowered in {"null", "~"}:
        return None
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        return value[1:-1]
    return value
