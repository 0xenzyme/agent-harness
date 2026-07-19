# Spec: Integrate Agent Harness With Codex-Native Execution

Created: 2026-07-19
Status: accepted

## Decision

Make Harness an adapter between durable repository control and Codex-native
execution. Codex owns ordinary work, runtime Goal, Plan, Thread/subagent
execution, concurrency, cancellation, and model choice. Harness enters only for
durable control or for lightweight postflight synchronization of state that
already existed before execution.

## User Experience

The default paths are:

1. `codex-direct`: clear, local, reversible, untracked work uses Codex only.
2. `codex-direct-postflight`: simple work linked to existing Harness state uses
   Codex execution and one bounded verification/state-sync closeout.
3. `durable-harness`: recovery, audit, milestone, DAG, multiple workers,
   persistent state sync, or high-risk work uses repository Goal/Run evidence.

Harness should remain invisible for most ordinary development. It must not
create lifecycle artifacts merely to record that a small task happened.

## Controller Semantics

- `controller` means outcome owner and accepted-state owner.
- Controller identity does not imply `gate-only` and does not forbid foreground
  implementation.
- Only explicit instructions such as "只审 evidence" or "gate-only" prohibit
  the controller from editing implementation.
- Long-running controller work such as "作为主控开发", "推进直到完成", "不要停",
  or cross-turn continuation should establish or reuse a Codex runtime Goal
  once objective and completion criteria are accepted.
- Multi-step work should use Codex Plan. Harness may seed the plan from durable
  ready nodes but does not mirror every plan transition into Git.

## Native Capability Bridge

- Runtime Goal owns the current task outcome, success criteria, and continuation.
- Codex Plan owns current steps and transient progress.
- Thread/subagent runtime owns execution scheduling and worker lifecycle.
- Harness repository Goal/Run owns cross-task recovery, audit, dependency and
  ownership evidence, acceptance, Delivery State, and bounded state sync.
- Reuse an active compatible runtime Goal. Do not create duplicate Goals.
- If runtime Goal or Plan is unavailable, proceed normally. Record degraded
  provenance only when an active durable Run needs that evidence.
- Do not invent runtime identifiers or machine-readable state the host does not
  expose.

## Postflight Sync Contract

- Run only when the request was already linked to an existing Task, Goal,
  status item, or Run, or when the user explicitly requests state sync.
- Update existing artifacts only; do not create a Goal, Run, DAG, or gate solely
  for postflight bookkeeping.
- Record the changed outcome, verification, actual Delivery State, and remaining
  tracked gap.
- A prepared enforced Run continues to require its recorded evidence contract.
- Adapter completion gates apply to durable Goal/Run completion, not to
  `codex-direct` or lightweight postflight-only completion.

## Scope

- Update public skills, protocol references, prompts, templates, and docs to
  expose the three execution paths and native capability bridge.
- Update controller semantics so gate-only is explicit rather than inferred
  from the word controller.
- Make gate scope explicitly durable-only in CLI behavior and generated
  artifacts without breaking existing durable Runs.
- Add deterministic routing and behavior-trace coverage for runtime Goal/Plan,
  postflight sync, no-artifact direct work, controller semantics, gate scope,
  fallback, and existing enforced Runs.
- Update README, usage, project contract, capability matrix, CLI documentation,
  changelog, release notes, version policy, and current version metadata to
  0.8.0.
- Keep fixed and adapter path contracts and all 0.7 security/delivery invariants.

## Non-Goals

- Do not implement a new scheduler, worker runtime, Plan store, or runtime Goal
  API.
- Do not remove repository Task, Goal, Run, DAG, or gate artifacts.
- Do not mirror every runtime Plan update into repository files.
- Do not require Harness for ordinary changes merely because the plugin is
  installed.
- Do not add speculative config fields for runtime capabilities that are not
  consumed deterministically.
- Do not commit, push, tag, publish, deploy, or refresh local plugin cache.

## Acceptance Criteria

- "作为主控开发并推进到完成" maps to durable execution with an explicit
  runtime Goal and Plan bridge, while "只审 evidence" remains gate-only.
- A clear one-step change maps to `codex-direct` and creates no Harness
  lifecycle artifacts.
- A simple change linked to an existing Task maps to
  `codex-direct-postflight` and updates only existing tracked state after fresh
  verification.
- Durable recovery/milestone/DAG/multi-worker/high-risk requests still map to
  `harness:execute` and preserve Goal/Run evidence.
- `gates.requiredForCompletion` and `gates.blocking` are enforced for durable
  completion but do not promote ordinary direct/postflight work into a Run.
- Existing enforced Runs cannot bypass their DAG, evidence, or gates by calling
  work postflight-only.
- Native capability provenance records only exposed facts and has a documented
  fallback.
- Package, plugin, README, changelog, release notes, presentation docs, and
  version tests agree on 0.8.0.
- Full deterministic tests, plugin validation, skill validation, locale checks,
  syntax checks, and `git diff --check` pass.

## Verification

```text
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check evals/run-agent-harness-eval.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
python -X utf8 <skill-creator>/scripts/quick_validate.py <each plugin skill>
git diff --check
```

Also run smoke and routing classification under a Chinese locale and inspect
the final diff for stale controller, Goal, Plan, route, gate, and version text.

## Delivery Policy

- Target Delivery State: `validated-local`
- Commit: no
- Push: no
- Review: no
- Integration: no
- Release/publish: no
- Deploy/plugin-cache refresh: no
