# Spec: Behavior Eval And Degraded Execution Provenance

Created: 2026-07-08
Status: completed with validated-local evidence

## Background

The Impeccable critique workflow showed two useful patterns for Agent Harness:
independent execution evidence must be visibly declared, and skill behavior
should be checked by tool-call traces instead of only by static text or CLI
output.

Agent Harness already has strong protocol language for `gate-only`,
worker-produced candidate evidence, controller acceptance, Delivery State, and
state sync. The current gap is that these rules are easier to regress in skill
behavior than in static protocol checks. The existing `evals/` runner validates
trigger cases and deterministic CLI fixture behavior, but it does not yet
exercise workflow skill text through a trace-shaped behavior harness.

## Goal

Add a project-neutral behavior-eval surface for Agent Harness and make
degraded execution provenance mechanically visible in the Harness protocol.

The first implementation should be useful without credentials or paid model
calls. It should establish the trace schema, fixture shape, and deterministic
assertions now, while leaving real LLM/provider replay as an explicit optional
future enhancement.

## Scope

- Add behavior eval fixtures that model agent tool-call traces for key Harness
  workflow scenarios.
- Add deterministic behavior checks to `npm run test:eval` or a clearly
  related local command so regressions are caught without credentials.
- Cover at least these behavior cases:
  - `harness:orient` stays read-only and reads config/adapter/task/status
    evidence before recommending a route.
  - `harness:execute` in `gate-only` does not directly edit implementation
    files and records worker output as candidate evidence.
  - `harness:execute` reports a visible degraded provenance marker when worker
    delegation is unavailable or not used.
  - Completed `gate-only` work requires implementer output, verification, and
    controller acceptance evidence before accepted state moves forward.
- Add or update protocol/docs/skill guidance so degraded execution is not
  silent. A user-facing closeout or run/gate record should make the execution
  method clear.
- Keep the implementation project-neutral: no downstream product names, ports,
  providers, production policy, credentials, or paid API assumptions.
- Keep the first pass local and deterministic. Do not introduce background
  services, daemons, persistent watchers, publish/release steps, or mandatory
  network/API calls.
- Sync Harness task/status/run state after implementation and verification.

## Non-Goals

- Do not implement paid LLM-backed eval execution in this pass.
- Do not add a new external provider dependency or require API keys.
- Do not change Codex plugin activation behavior.
- Do not create a new long-lived Codex thread unless explicitly requested.
- Do not commit, push, open a PR, publish, deploy, or release.
- Do not broaden Harness worker authority beyond candidate evidence.
- Do not replace existing `test:protocol`, `test:smoke`, or
  `validate:plugin`; extend or complement them.

## Key Decisions

- The first behavior-eval pass is deterministic and trace-shaped. It should
  make future real-agent replay easy, but it must not depend on credentials.
- Degraded execution provenance is part of Harness control evidence, not just
  prose style. Silent fallback from worker/controller execution to
  single-context foreground work should be detectable.
- `gate-only` remains an acceptance role. Workers produce candidate evidence;
  the controller validates and records accepted state.
- The current thread is the controller / acceptance lane for this goal. Worker
  implementation returns candidate evidence only.

## Context Focus And Intent Routing

- `harness-rule:context-focus-routing`: normalize this request as a `Goal`
  implementing an accepted `Spec`.
- Use the `execute` focus preset: goal/spec/run packet, allowed and forbidden
  scope, implementation files, validation commands, Delivery State, and state
  sync.
- Keep historical run logs summarized unless they directly affect this goal's
  scope or validation.

## Cybernetic Stability

- `harness-rule:cybernetic-stability`: this spec strengthens the feedback loop
  by adding behavior-level sensors for workflow regressions.
- `harness-rule:intent-setpoint-selection`: target is behavior-level evidence
  that Harness follows controller/worker and degraded-provenance rules.
- `harness-rule:sensor-freshness`: use current skill text, eval runner,
  fixtures, local command output, and fresh git diff as evidence.
- `harness-rule:measurement-snapshot`: before acceptance, summarize the trace
  cases added, protocol guidance changed, commands run, Delivery State, and
  remaining gap.
- `harness-rule:remaining-gap`: closeout must state whether real LLM/provider
  replay remains deferred.
- `harness-rule:feedback-quality`: passing deterministic trace checks,
  protocol checks, smoke checks, plugin validation, and git whitespace checks
  are accepted local feedback; worker summaries alone are candidate evidence.
- `harness-rule:stability-saturation`: pause if implementation requires
  credentials, paid APIs, external services, activation changes, incompatible
  schema changes, destructive operations, or product-direction judgment.

## Task Routing

- Level: standard Harness development goal.
- Reason: changes eval behavior, workflow protocol guidance, and potentially
  docs/tests.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  this spec, `evals/README.md`, `evals/run-agent-harness-eval.mjs`,
  `plugins/agent-harness/skills/execute/SKILL.md`, worker/controller/gate
  references, `scripts/test-suites.mjs`, and `tests/smoke.mjs`.
- Required gates: spec, execution, integration.
- Execution DAG: controller-gated worker implementation followed by controller
  verification and state sync.
- Parallel worker candidates: one implementation worker is sufficient for the
  first pass.
- Optional competition needed: no.
- Idea Inbox input: derived from the current conversation's Impeccable review.
- Escalation triggers: mandatory model/API calls, new dependencies requiring
  install, persistent process, activation behavior change, schema migration,
  or delivery above `validated-local`.

## Evidence Plan

- Accepted evidence:
  - worker implementation output reviewed by the controller;
  - behavior eval fixtures/checks added and passing;
  - degraded provenance guidance present in protocol/skill docs;
  - `npm run test:eval`, `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, and `git diff --check` passing;
  - Harness run/task/status state sync.
- Candidate evidence sources:
  - worker result packet;
  - local diffs;
  - command output.
- State records to update:
  - `harness/tasks.md`;
  - `harness/status.md`;
  - run packet under `.harness/runs/`.

## Spec Acceptance Checklist

- Item: `Trace-shaped behavior eval`
  - Acceptance: Deterministic eval data and runner checks verify tool-call
    trace behavior for orient and gate-only execute scenarios.
  - Evidence: `Added evals/skills/agent-harness/behavior_trace_cases.yaml and
    extended evals/run-agent-harness-eval.mjs to validate ordered reads,
    forbidden writes/mutations, worker candidate evidence, degraded provenance,
    and gate-only acceptance evidence. Controller verification passed with
    npm run test:eval, which reported Behavior trace cases: 4.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Degraded provenance visibility`
  - Acceptance: Harness protocol or skill guidance requires visible degraded
    execution provenance when worker/controller execution falls back.
  - Evidence: `Added harness-rule:degraded-execution-provenance to
    docs/HARNESSES.md, docs/project-contract.md, worker-runner, controller
    communication, gate-results, harness:execute, worker prompt template,
    generated run/DAG/worker prompts in plugins/agent-harness/scripts/agent-harness.mjs,
    protocol checks, and smoke checks.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Gate-only acceptance discipline`
  - Acceptance: Behavior checks or protocol checks prove gate-only completion
    requires implementer output, verification, and controller acceptance
    evidence before accepted state moves forward.
  - Evidence: `behavior_trace_cases.yaml includes gate-only acceptance evidence
    requirements; eval runner asserts implementer_output, verification,
    controller_acceptance, and state_transition_after_gate; run node records
    cite explorer, worker, and verification candidate evidence before this
    Controller acceptance update.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Local deterministic validation`
  - Acceptance: Local validation passes without credentials, paid APIs,
    daemons, push, PR, deploy, publish, or release.
  - Evidence: `Controller ran node --check evals/run-agent-harness-eval.mjs,
    node --check scripts/test-suites.mjs, node --check tests/smoke.mjs,
    node --check plugins/agent-harness/scripts/agent-harness.mjs,
    npm run test:eval, npm run test:protocol, npm run test:smoke,
    npm run validate:plugin, and git diff --check; all exited 0.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: `This spec records accepted scope, non-goals, verification,
    completion conditions, and pause conditions from the current user request.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: `Run .harness/runs/20260708-114327-implement-behavior-eval-and-degraded-execution-provenance-for-harness recorded completed explorer, worker, and verification DAG nodes with codex-cli-subagent surfaces and controller-reviewed candidate evidence.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed worker output, inspected scoped diff,
    independently ran all goal verification commands successfully, and accepted
    Delivery State validated-local. No commit, push, PR, review, integration,
    release, deploy, daemon, credential, paid API, production access, or
    destructive action was performed.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: current user request, this spec, `evals/README.md`, and
  plugin workflow references.
- Hard boundaries: no release, deploy, publish, push, PR, production,
  credentials, paid APIs, daemons, or destructive operations.

## Acceptance Criteria

- Behavior eval cases are represented as project-neutral fixtures or data under
  `evals/`.
- The eval runner validates behavior cases and fails on missing required reads,
  forbidden writes, silent degraded fallback, or gate-only accepted state
  without implementer/verification/controller evidence.
- Harness skill/protocol/docs guidance clearly states how degraded execution
  provenance should appear.
- Existing deterministic validation commands still pass.
- Harness task/status/run state is updated with accepted evidence and Delivery
  State.

## Verification

- `node --check evals/run-agent-harness-eval.mjs`
- `node --check scripts/test-suites.mjs`
- `node --check tests/smoke.mjs`
- `npm run test:eval`
- `npm run test:protocol`
- `npm run test:smoke`
- `npm run validate:plugin`
- `git diff --check`
- Config schema validation needed: no, unless implementation changes
  `.harness/config.json` or plugin schemas.

## Pause Conditions

- The spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- The target / setpoint, observed state, remaining gap, or feedback quality is
  unclear enough that implementation could stabilize around the wrong outcome.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, persistent daemons, or activation changes are
  required.
