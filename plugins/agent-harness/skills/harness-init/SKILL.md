---
name: harness-init
description: Initialize or audit Agent Harness fixed and adapter contracts without overwriting existing project context.
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

3. Inspect resolved config when available:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

4. For an existing adapter project with `docs/harness/README.md` and a task
   index such as `todolist.md`, persist discovered paths without creating a
   second task index:

```bash
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md --dry-run
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md
```

5. For a new adapter-contract project, initialize explicitly:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project> --contract adapter
```

6. Read `.agent-harness/config.json` when it exists.
7. In the adapter contract, read the configured project adapter and relevant
   installed plugin references.
8. Read the configured task index and any configured state files that exist.
9. Report harness contract, created paths, missing optional paths, and the next
   goal candidate.

## Rules

- Do not overwrite existing files unless the user explicitly asks or `--force`
  is clearly safe.
- Preserve fixed `contract: "fixed"` behavior for old projects.
- Treat `tasks.md` as the fixed default task index, not the universal adapter
  contract.
- In the adapter contract, use configured artifact paths from
  `.agent-harness/config.json` and the project adapter.
- Keep plugin rules in canonical references; keep project-specific boundaries
  in the adapter.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
