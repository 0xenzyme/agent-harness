---
name: harness-goal
description: Legacy compatibility wrapper for Agent Harness goal handoffs. Prefer harness:execute for confirmed goal/spec/run work and harness:orient when the user asks what to do next.
---

# Harness Goal

This is a compatibility wrapper for the older goal entry. New goal work belongs
inside the `harness:execute` workflow; read-only next-step questions belong in
`harness:orient`.

## Compatibility Workflow

1. Read repo instructions such as `AGENTS.md`.
2. If the user asks what to do next, orient first:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

3. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

4. Create or validate a durable handoff only when the user wants execution
   preparation:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --spec <spec-path>
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
```

5. Prepare a run packet only after the goal is confirmed and valid:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

## Rules

- Do not turn orientation into implementation unless the user clearly asks to
  execute.
- Include scope, non-goals, verification, completion conditions, and pause
  conditions in every goal.
- Do not automatically create worktrees, start Codex sessions, push, open PRs,
  deploy, or release.
- Preserve fixed-contract behavior and adapter-configured paths.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
