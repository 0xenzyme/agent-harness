---
name: execute
description: Execute confirmed Agent Harness work. Use when the user asks to implement, execute, continue, verify, or complete a confirmed task, spec, goal, or run packet.
---

# Harness Execute

Use this skill when the user has authorized a concrete implementation slice or
asked the current thread to act as the control lane for a confirmed task.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.harness/config.json`, the configured project adapter, task index,
   status file, and the relevant spec / goal / run packet.
4. Confirm the executable scope, non-goals, verification commands, completion
   conditions, and pause conditions. If any of these are missing and the choice
   affects risk, cost, or product direction, pause and ask.
   Briefly record why this is `shape`, `goal`, `execute`, `competition`, or
   `ask` when the route affects scope or acceptance.
5. If the user asks what to do next before authorizing work, switch to orient:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

6. Create, inspect, or validate a goal when a durable handoff is needed:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --spec <spec-path>
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
```

7. Prepare or inspect a run packet when useful for controlled execution:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir>
```

8. Implement only the authorized scope.
9. Run verification, then update configured task/status/run evidence and record
   deferred work. When deterministic maintenance is useful, preview or record
   it explicitly:

```bash
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project> --record
```

10. Record a run outcome when a run packet exists:

```bash
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase completed --summary "<summary>" --verification "<verification summary>"
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase blocked --summary "<blocker summary>"
```

## Boundaries

- Do not execute ambiguous product direction without confirmation.
- Do not modify `AGENTS.md` or activation behavior without explicit approval.
- Do not push, open PRs, deploy, release, use credentials, use paid APIs, touch
  production, perform destructive operations, or start daemons without explicit
  approval.
- Do not mark work complete without verification and state sync.
- Treat subagents, inbox threads, automation, and proposal competition as
  candidate evidence sources. The active control thread owns final acceptance
  after validation.
- Keep accepted state inspectable: cite concrete task entries, specs, goals,
  run records, gate records, command summaries, or human review notes.
- Keep plugin core docs and templates project-neutral; put local facts in the
  project adapter and project artifacts.
- Preserve fixed-contract behavior and adapter-configured paths.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
