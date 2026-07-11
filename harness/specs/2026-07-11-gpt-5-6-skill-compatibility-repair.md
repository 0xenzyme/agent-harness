# GPT-5.6 Skill Compatibility Repair

Status: accepted

## Context

GPT-5.6 is the current Codex model family. The 0.6.0 plugin passes structural
validation, but the current skill surface has internal route names that do not
map back to callable skills, oversized discovery descriptions and execution
instructions, static eval output that can be mistaken for live model evidence,
parallel-worker guidance without a hard isolation condition, and stale project
status that preserves obsolete commit/push authorization.

The user explicitly requested fixing the review findings on 2026-07-11.

## Scope

- Keep the four public workflow skills: `harness:init`, `harness:orient`,
  `harness:intake`, and `harness:execute`.
- Define `shape`, `goal`, `competition`, and `ask` as internal routes, not
  invokable skills, and map each route to an exact public entry or user action.
- Let `harness:execute` accept authorized work whose scope boundaries are
  accepted even when it still needs to create or validate a durable Goal.
- Shorten all skill descriptions while preserving positive and negative
  trigger boundaries.
- Reduce `harness:execute` context load through progressive disclosure without
  weakening execution, gate, delivery, or state-sync contracts.
- Require separate worktrees or proven non-overlapping read-only/write scopes
  before parallel worker launch.
- Make eval output distinguish deterministic fixture validation from live
  Codex/GPT-5.6 activation evidence and provide an opt-in live runner.
- Replace stale project status with the current task and authorization state.
- Keep README, docs, templates, CLI-generated guidance, and tests aligned.

## Non-Goals

- Do not add new public `harness:shape`, `harness:goal`, or
  `harness:competition` skills in this repair.
- Do not change the fixed/adapter storage schema or rename existing Goal files.
- Do not publish, release, push, open a PR, deploy the plugin cache, start a
  daemon, or use production/paid credentials.
- Do not pin the plugin to a concrete GPT-5.6 alias; model routing continues to
  use stable capability labels and the runtime default.

## Verification

```bash
node --check evals/run-live-skill-activation.mjs
npm run validate:plugin
npm run test:protocol
npm run test:eval
npm run test:smoke
npm run test:all
git diff --check
```

Run the live activation evaluator only when a Codex session/model is available
and the command is explicitly opted in. Its result must record the actual model
and must not be conflated with deterministic fixture validation.

## Completion Conditions

- Every internal route has a deterministic mapping to a published skill or an
  explicit user decision.
- No skill description exceeds 300 characters.
- `harness:execute` is materially smaller and loads detailed references only
  for the active execution path.
- Parallel worker guidance contains a hard isolation/collision gate.
- `npm run test:eval` no longer claims to validate actual model activation.
- An opt-in live activation runner exists and refuses to claim GPT-5.6 evidence
  unless the actual model is reported.
- `harness/status.md` contains no inherited commit/push authorization.
- Required validation passes and task/status state is synchronized.

## Pause Conditions

- Pause if the four-entry-skill decision conflicts with plugin runtime
  requirements or validation.
- Pause if a live GPT-5.6 check requires unavailable credentials, paid usage,
  network-policy changes, or model selection outside the current runtime.
- Pause before destructive Git operations, commit, push, PR, publish, release,
  production access, daemon launch, or plugin-cache deployment.
