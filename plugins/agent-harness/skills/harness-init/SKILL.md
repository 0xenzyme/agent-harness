---
name: harness-init
description: Legacy compatibility wrapper for Agent Harness setup. Prefer harness:init for new-project initialization, existing-project migration, doctor, import, and activation preview.
---

# Harness Init

This is a compatibility wrapper for the older setup entry. Prefer the shorter
`harness:init` skill for adoption and migration work.

## Compatibility Workflow

1. Identify the target project directory.
2. Run doctor:

```bash
node <plugin-root>/scripts/agent-harness.mjs doctor --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs config validate --cwd <project>
```

3. For a new adapter-contract project:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project> --contract adapter
```

4. For an existing project with a task index:

```bash
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md --dry-run
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md
```

5. Preview activation instead of editing project instructions:

```bash
node <plugin-root>/scripts/agent-harness.mjs activation snippet --cwd <project>
```

## Rules

- Do not overwrite existing files unless the user explicitly asks or a dry-run
  makes the change safe and clear.
- Do not modify `AGENTS.md` without explicit approval after preview.
- Preserve fixed-contract projects and adapter-configured artifact paths.
- Do not add plugin-level hooks until conditional bootstrap is validated.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
