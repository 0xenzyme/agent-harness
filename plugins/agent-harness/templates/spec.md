# Spec: {Goal Name}

Created: YYYY-MM-DD
Status: draft

## Background

-

## Goal

-

## Scope

-

## Non-Goals

-

## Key Decisions

-

## Context Focus And Intent Routing

- `harness-rule:context-focus-routing`: normalize user intent to `Milestone`,
  `Goal`, `Task`, `Run`, `Priority`, or `Spec` before selecting a context
  focus.
- Public language:
  - Use `context focus` and `focus preset`.
  - Keep `EnvContext` as internal design reference only; do not add a public
    focus parameter, config/schema field, storage migration, activation
    behavior, or external dependency.
- Context layers:
  - `entry/channel`
  - `modality`
  - `dialog`
  - `project/world`
  - `capability`
  - `self/control`
- Default focus preset:
  - `orient`: current state, route recommendation, blockers, stale artifacts,
    and next safe action.
  - `intake`: raw idea, duplicates or related work, proposed priority, likely
    route, and whether a spec or accepted scope is needed.
  - `shape`: decisions, alternatives, source of truth, non-goals, acceptance,
    risks, verification, and pause triggers.
  - `goal`: accepted spec or accepted scope, source Goal/work item acceptance,
    role, context lock, delivery policy, verification, completion conditions,
    and state-sync obligations.
  - `execute`: goal/spec/run packet, DAG, allowed and forbidden scope,
    implementation-relevant files, verification commands, delivery target, and
    state-sync requirements.
- Token/noise controls:
  - Read current conversation-confirmed state, repo instructions,
    adapter/config, current Goal/status, and active spec/goal/run before broad
    docs or historical logs.
  - Summarize old run logs unless their details directly affect routing,
    safety, verification, or acceptance.
  - Keep source of truth, non-goals, verification, completion conditions, and
    pause conditions near the route decision.

## Cybernetic Stability

- `harness-rule:cybernetic-stability`: define how this spec strengthens or
  preserves target selection, observed state, remaining gap, feedback quality,
  and pause behavior.
- `harness-rule:intent-setpoint-selection`: identify the target / setpoint this
  spec controls toward.
- `harness-rule:sensor-freshness`: name the evidence sources and how stale or
  conflicting artifacts should be handled.
- `harness-rule:measurement-snapshot`: define what current-state snapshot is
  needed before implementation and closeout.
- `harness-rule:remaining-gap`: require implementation evidence to say what
  gap closed and what remains.
- `harness-rule:feedback-quality`: define which feedback proves completion and
  which feedback is only advisory.
- `harness-rule:stability-saturation`: define pause or re-route triggers for
  route oscillation, repeated ineffective actions, context limits, authority
  limits, external dependencies, cost, and risk.

## Work Routing

- Level:
- Reason:
- Required docs:
- Required gates:
- Execution DAG:
- Parallel worker candidates:
- Optional competition needed:
- Idea Inbox input:
- Escalation triggers:

## Evidence Plan

- Accepted evidence:
- Candidate evidence sources:
- State records to update:

## Spec Acceptance Checklist

Use this section when prose acceptance must become executable gate evidence
before implementation. Project-specific quality meaning belongs in adapter
gate artifacts; this checklist records what the control lane must verify.

- Item: `<checklist item>`
  - Acceptance: `<what must be true>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Required Gate Evidence

Use this section for adapter-declared completion gates. Technical verification
is necessary but does not replace gate evidence.

- Gate: `<gate name>`
  - Required: `yes`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Source Task Acceptance Map

Use this compatibility-named section when a spec or goal merges multiple source
Goal entries or describes batch completion. Preserve each original source
Goal/work item acceptance before execution; completed runs require every item
to be `satisfied` with concrete evidence. The section name and `- Task:` item
key are retained for CLI compatibility.

- Task: `<source Goal/work item title>`
  - Acceptance: `<original source Goal/work item acceptance>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Milestone Completion Map

Use this section when the goal is to complete a roadmap milestone such as `M5`,
especially when the spec has `Implementation Phasing` with `S*` or `D*`
subgoals. Parent milestone completion requires every item to be `satisfied`
with concrete evidence; a source-spec-only slice should be named as the leaf
item, such as `M5-S0`, instead of marking the parent milestone done.

- Item: `<milestone item, e.g. M5-D1 Diagnosis Read Model>`
  - Acceptance: `<what must be true for this milestone item>`
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Adapter References

- Project adapter:
- Source of truth:
- Hard boundaries:

## Acceptance Criteria

-

## Verification

-
- Config schema validation needed:

## Pause Conditions

- The spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- The target / setpoint, observed state, remaining gap, or feedback quality is
  unclear enough that implementation could stabilize around the wrong outcome.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
