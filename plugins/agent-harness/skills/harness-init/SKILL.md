---
name: harness-init
description: Initialize or audit Agent Harness in a project by creating the standard tasks.md and .agent-harness control files.
---

# Harness Init

Use this skill when the user wants to install, initialize, repair, or inspect
Agent Harness in a software project.

## Workflow

1. Identify the target project directory.
2. Run the doctor first:

```bash
node <plugin-root>/scripts/agent-harness.mjs doctor --cwd <project>
```

3. If required files are missing, run:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project>
```

4. Read `tasks.md` and `.agent-harness/config.json`.
5. Report what was created and what the next goal should be.

## Rules

- Do not overwrite existing files unless the user explicitly asks or `--force`
  is clearly safe.
- Keep `tasks.md` at the project root.
- Keep machine-readable state under `.agent-harness/`.
- Do not create alternate todo files in `docs/`, `.codex/`, or nested folders.
