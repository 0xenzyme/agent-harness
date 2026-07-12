# Spec: Signal-Only Commentary Policy

Created: 2026-07-12
Status: accepted

## Background

Agent Harness compresses final closeouts, but it does not define an equivalent
contract for in-turn `commentary`. Foreground execution can therefore repeat
skill selection, unchanged safety boundaries, and routine tool activity even
when Codex already renders those actions in the UI.

The existing controller launch packet exposes `Report cadence` and `Notify on`
without default semantics. Project config also has no supported way to select a
commentary policy.

## Goal

Add a project-neutral, backward-compatible Commentary Policy that makes
signal-only commentary the default while preserving material risk, blocker,
decision, verification, delivery-transition, and host-required heartbeat
updates.

## Scope

- Add optional `.harness/config.json` `communication.commentary` with
  `minimal`, `balanced`, and `audit` values.
- Resolve an effective default of `minimal` when the field is absent.
- Expose the effective policy through `config inspect` and prepared run state.
- Add one shared user-facing communication reference used by all four public
  Harness skills.
- Propagate the effective policy into run, prompt, DAG, and worker prompt
  artifacts.
- Define `Report cadence` and `Notify on` semantics consistently with the
  project policy.
- Update templates, public protocol docs, smoke tests, behavior eval fixtures,
  and repository Harness state.

## Non-Goals

- Do not suppress or filter Codex App `phase: commentary` messages at the UI or
  transport layer.
- Do not provide a misleading `off` mode.
- Do not override host system/developer instructions or required heartbeat,
  approval, safety, or tool-preamble behavior.
- Do not add services, daemons, telemetry, or downstream-project assumptions.
- Do not deploy the plugin cache, commit, push, publish, or release.

## Key Decisions

- `minimal` is the effective default for old and new configs.
- `minimal` combines skill, reason, scope, boundaries, and next action into one
  kickoff; later commentary must add a new material fact unless it is a
  host-required heartbeat.
- `balanced` allows meaningful phase-transition updates.
- `audit` allows transcript-quality gate and decision reporting.
- The policy is prompt/contract enforcement, not deterministic interception.
- Host requirements always take precedence.

## Work Routing

- Level: durable Goal/current-thread implementation.
- Reason: this changes a public config schema, generated run protocol, four
  skills, tests, and docs.
- Required gates: config schema, protocol/smoke tests, plugin validation.
- Execution DAG: sequential current-thread implementation; no subagents were
  requested or authorized by the active session policy.
- Escalation triggers: schema incompatibility, conflict with current dirty
  terminology edits, need for Codex host changes, or delivery beyond local
  validation.

## Evidence Plan

- Accepted evidence: schema validation, generated fixed/adapter configs,
  `config inspect` JSON/text output, prepared run artifacts, deterministic
  smoke/eval assertions, and plugin validation.
- Candidate evidence sources: local diff and generated temporary fixtures.
- State records to update: this spec, its Goal/Run, `harness/tasks.md`, and
  `harness/status.md`.

## Spec Acceptance Checklist

- Item: Backward-compatible config contract
  - Acceptance: configs without `communication` resolve to `minimal`; invalid
    modes fail schema validation.
  - Evidence: smoke fixtures validate explicit `minimal`, legacy omission ->
    default `minimal`, and invalid `silent` rejection
  - Status: satisfied
  - Unblocker: N/A
- Item: End-to-end propagation
  - Acceptance: effective policy appears in config inspection and generated
    run/worker artifacts.
  - Evidence: smoke assertions inspect config output, Run status, DAG state,
    and generated worker prompts
  - Status: satisfied
  - Unblocker: N/A
- Item: Signal-only skill contract
  - Acceptance: all public skills load one shared policy that removes routine
    narration and duplicate skill/boundary announcements without hiding
    material changes or required heartbeats.
  - Evidence: all four `SKILL.md` files load the shared communication reference;
    protocol and smoke checks passed
  - Status: satisfied
  - Unblocker: N/A
- Item: Documentation and deterministic coverage
  - Acceptance: protocol docs, templates, tests, and behavior evals describe
    and verify the same modes and default.
  - Evidence: `npm run test:all`, `npm run test:eval`, and
    `npm run validate:plugin` passed
  - Status: satisfied
  - Unblocker: N/A

## Required Gate Evidence

- Gate: spec
  - Required: yes
  - Evidence: accepted user direction in the current conversation and this spec
  - Status: satisfied
  - Unblocker: N/A
- Gate: execution
  - Required: yes
  - Evidence: explorer, worker, and verification nodes completed sequentially
    in Run `.harness/runs/20260712-095713-add-signal-only-commentary-policy-controls`
  - Status: satisfied
  - Unblocker: implementation and deterministic verification
- Gate: integration
  - Required: yes
  - Evidence: config validation, full test suites, deterministic eval, plugin
    validation, and diff check all passed locally
  - Status: satisfied
  - Unblocker: full local plugin validation

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: `docs/project-contract.md`, config schema, shared
  communication reference, and generated run artifacts
- Hard boundaries: preserve fixed/adapter contracts and current unrelated
  working-tree changes.

## Acceptance Criteria

- Existing configs remain valid and resolve to `minimal`.
- New templates explicitly write `communication.commentary: minimal`.
- `config inspect --json` returns the effective policy independently of whether
  it was explicitly configured.
- Prepared run/DAG/worker prompts carry the effective policy.
- `minimal`, `balanced`, and `audit` have precise, non-overlapping guidance.
- Routine tool narration and repeated unchanged boundaries are forbidden in
  `minimal`; material changes and host-required heartbeats remain visible.

## Verification

- `node --check plugins/agent-harness/scripts/agent-harness.mjs`
- `node --check tests/smoke.mjs`
- `npm run test:protocol`
- `npm run test:smoke`
- `npm run test:eval`
- `npm run validate:plugin`
- `git diff --check`
- Config schema validation needed: yes

## Pause Conditions

- This spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements become unclear in a way that affects compatibility, cost, risk,
  or product direction.
- Implementation would require UI/transport interception rather than Harness
  prompt and artifact contracts.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, deploy, publish, or release are required.
