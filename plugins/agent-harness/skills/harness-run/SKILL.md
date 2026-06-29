---
name: harness-run
description: Legacy compatibility wrapper for Agent Harness run packets. Prefer harness:execute for confirmed run preparation, execution evidence, verification, and run record updates.
---

# Harness Run

This is a compatibility wrapper for the older run entry. New run work belongs
inside the `harness:execute` workflow.

## Compatibility Workflow

1. Read the goal file and its referenced spec before implementation.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Prepare a run packet when the user wants a controlled execution handoff:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

4. Inspect an existing run packet:

```bash
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir>
```

5. Record a completed or blocked outcome after verification:

```bash
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase completed --summary "<summary>" --verification "<verification summary>"
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase blocked --summary "<blocker summary>"
```

6. When the adapter requires state sync, preview and explicitly record
   deterministic task/status maintenance:

```bash
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project> --record
```

## Rules

- `run prepare` does not start Codex, create daemons, push, deploy, publish, or
  open PRs.
- `run record` updates only the run directory; use explicit state sync when
  the adapter requires task/status updates.
- Keep subagent ownership explicit and non-overlapping.
- Preserve fixed-contract behavior and adapter-configured paths.
- Stop if the goal conflicts with repo instructions, production constraints, or
  newer user instructions.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
