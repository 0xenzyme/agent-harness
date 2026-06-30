---
name: execute
description: Execute confirmed Agent Harness work with verification and state sync. / 执行已确认的 Agent Harness 工作，并完成验证与状态同步。
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
4. Determine the execution role before editing files:
   - `gate-only`: the current thread is the control / acceptance lane. It
     may inspect candidate output, run verification, request fixes, and accept
     or block state, but it must not directly edit implementation files.
   - `implementer`: the current thread may edit files inside the authorized
     scope and then present evidence for acceptance.
   - `mixed`: the current thread may both edit and gate only when the user
     explicitly accepts the tradeoff or the change is low-risk and local; state
     the reason before editing.
   User language such as "control lane", "main control", "gate", "judge",
   "review", or "acceptance" defaults to `gate-only` unless the user clearly
   asks the current thread to implement directly.
5. Confirm the executable scope, non-goals, verification commands, completion
   conditions, and pause conditions. If any of these are missing and the choice
   affects risk, cost, or product direction, pause and ask.
   Briefly record why this is `shape`, `goal`, `execute`, `competition`, or
   `ask`, and record the execution role when it affects scope or acceptance.
6. If the user asks what to do next before authorizing work, switch to orient:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

7. Create, inspect, or validate a goal when a durable handoff is needed:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>" --spec <spec-path>
node <plugin-root>/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal-file>
```

8. Prepare or inspect a run packet when useful for controlled execution:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir>
```

9. If the role is `gate-only`, do not implement directly. Review the
   implementer output, compare it to the goal, run verification, and either
   accept state or request concrete corrections.
10. If the role is `implementer` or accepted `mixed`, implement only the
   authorized scope.
11. Run verification, then update configured task/status/run evidence and record
   deferred work. When deterministic maintenance is useful, preview or record
   it explicitly:

```bash
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs maintain tasks --cwd <project> --record
```

12. Record a run outcome when a run packet exists:

```bash
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase completed --summary "<summary>" --verification "<verification summary>" --gate-evidence "<gate-only evidence when needed>"
node <plugin-root>/scripts/agent-harness.mjs run record --cwd <project> --run <run-dir> --phase blocked --summary "<blocker summary>"
```

## Boundaries

- Do not execute ambiguous product direction without confirmation.
- Do not combine control-lane acceptance and implementation when the user has
  asked for gate-only, control-only, review-only, or acceptance-lane behavior.
- Do not modify `AGENTS.md` or activation behavior without explicit approval.
- Do not push, open PRs, deploy, release, use credentials, use paid APIs, touch
  production, perform destructive operations, or start daemons without explicit
  approval.
- Do not mark work complete without verification and state sync.
- Treat subagents, inbox threads, automation, and proposal competition as
  candidate evidence sources. The active control thread owns final acceptance
  after validation.
- In `gate-only` mode, accepted state must cite implementer output plus
  concrete verification evidence; the control thread should not rewrite the
  candidate output itself.
- Completed run records require verification evidence. Completed `gate-only`
  records also require gate evidence that names the implementer output and
  acceptance evidence reviewed by the control lane.
- Keep accepted state inspectable: cite concrete task entries, specs, goals,
  run records, gate records, command summaries, or human review notes.
- Keep plugin core docs and templates project-neutral; put local facts in the
  project adapter and project artifacts.
- Preserve fixed-contract behavior and adapter-configured paths.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
