# Goal: Complete The Goal Toolchain

Spec: harness/specs/2026-06-21-complete-goal-toolchain-design.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `P1 Complete the goal toolchain`

## Read First

1. `harness/specs/2026-06-21-complete-goal-toolchain-design.md`
2. `AGENTS.md`
3. `harness/tasks.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `README.md`
7. `docs/project-contract.md`
8. `docs/worktree-policy.md`
9. `plugins/agent-harness/scripts/agent-harness.mjs`
10. `plugins/agent-harness/skills/harness-goal/SKILL.md`
11. `plugins/agent-harness/skills/harness-run/SKILL.md`
12. `plugins/agent-harness/skills/harness-tasks/SKILL.md`

## Work Mode Recommendation

Use `worktree` unless the user explicitly confirms local checkout execution. The current checkout is dirty, and this goal changes core CLI, skill, docs, and state-management behavior.

Before editing, run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd .
```

## Scope

- Implement the minimum complete goal lifecycle described in the spec: goal creation from confirmed spec, goal list/inspect/validate, run preparation validation, and run outcome recording.
- Keep `goal *` commands focused on durable goal handoffs and `run *` commands focused on execution packets, state, and evidence.
- Update docs and skills so users can answer: what goal-related skills exist, how to generate a goal, how to prepare execution, and how to record completion or blockage.
- Preserve existing deterministic behavior for `init`, `doctor`, `print-contract`, `worktree recommend`, existing `goal create`, `run prepare`, and `run status` unless the spec explicitly calls for a compatible extension.

## Non-Goals

- Do not automatically launch Codex sessions.
- Do not add daemons, watchers, network services, or persistent background processes.
- Do not automatically create branch/worktree, push, deploy, publish, or open a PR.
- Do not add downstream-repo-specific assumptions to the core harness contract.
- Do not implement an unattended infinite loop.

## Context

- Source: User noted that the loop engineering skeleton is correct, but goal-related tooling is not enough.
- Core framing: `Loop engineering = 把 agent 的“继续做”变成一个可观察、可验证、可停止、可恢复的工程系统`.
- Current gap: `goal create` and `run prepare` exist, but users cannot deterministically list, inspect, validate, or record the lifecycle result of goals without reading source code or relying on manual convention.

## Verification

```bash
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd . --goal harness/goals/2026-06-21-complete-goal-toolchain.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-21-complete-goal-toolchain.md --json
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd . --goal harness/goals/2026-06-21-complete-goal-toolchain.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd . --run <prepared-run-dir>
```

Also cover these temporary-project cases with deterministic commands:

- confirmed spec + valid task -> `goal create` succeeds.
- missing spec -> `goal validate` exits non-zero.
- `Spec: TBD` -> `goal validate` exits non-zero.
- missing required goal section -> `goal validate` exits non-zero.
- invalid work mode -> `goal validate` exits non-zero.
- `run record --phase completed` updates `status.json` and writes a log.
- `run record --phase blocked` updates `status.json` and writes a log.

## Completion Conditions

- The source task acceptance is satisfied.
- The spec's command surface is implemented or any intentional deviation is documented in the final response and project docs.
- Goal validation catches missing spec, draft spec, missing required sections, invalid work mode, and missing stop/verification conditions.
- Run outcome recording writes machine-readable status and human-readable log evidence.
- `README.md`, `docs/project-contract.md`, `plugins/agent-harness/skills/harness-goal/SKILL.md`, and `plugins/agent-harness/skills/harness-run/SKILL.md` describe the completed workflow.
- `harness/tasks.md` and `harness/status.md` are updated.
- Verification commands pass, or any failure is documented with exact next steps.

## Pause Conditions

- The spec conflicts with code, existing project contract, plugin manifest behavior, production constraints, or newer user instructions.
- The implementation requires credentials, paid APIs, production access, destructive commands, push, PR, deploy, publish, daemon behavior, or automatic Codex session launch.
- A decision is needed on whether `goal create` without `--spec` remains allowed.
- A decision is needed on whether `run record` should automatically update `harness/tasks.md` or `harness/status.md`.
- Product direction, file ownership, or worktree policy is unclear.
