---
name: init
description: Explicitly audit, initialize, import, or repair Agent Harness setup and config migration; not for ordinary status, intake, or product implementation. / 显式接入、迁移或修复 Harness。
---

# Harness Init

Use this skill only for explicit Harness setup, import, migration, or repair.
Doctor and activation preview remain read-only.

Read [Setup And Migration Safety](references/setup-migration-safety.md) before
any mutating init, import, or repair action.

1. Read repo instructions and inspect current state:

```bash
node <plugin-root>/scripts/agent-harness.mjs doctor --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project> --json
node <plugin-root>/scripts/agent-harness.mjs config validate --cwd <project> --json
```

2. Before mutation, identify the existing Goal index and adapter paths. Never
   create a second Goal index when importing an existing project.
3. Preview import/migration with `--dry-run --json`. Canonical output writes
   `contract`, canonical paths, `worktree.defaultPolicy`, and completion gates.
   Legacy aliases are read for one migration boundary; conflicts fail.
4. Initialize or import only after explicit setup authority:

```bash
node <plugin-root>/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node <plugin-root>/scripts/agent-harness.mjs config import --cwd <project> --task-index todolist.md --dry-run --json
```

5. Every planned write must pass project-root, configured-root, absolute/`..`,
   and existing-parent realpath/symlink containment before any file is written.

Do not overwrite existing artifacts without explicit authority, edit
`AGENTS.md` from an activation preview, start implementation, create workers,
or perform delivery/deploy actions.
