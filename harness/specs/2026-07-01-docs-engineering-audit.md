# Spec: Agent Harness Docs Engineering Audit

Created: 2026-07-01
Status: accepted

## Background

The repository has recently changed several public Agent Harness contracts:
delivery-state defaults, provider-neutral review/integration terminology,
gate-only controller behavior, subagent worker defaults, execution DAGs,
spec/gate acceptance evidence, and deterministic skill evals.

The next useful step is a documentation engineering pass that treats the docs
as a product surface: public README files, operator docs, project contract
docs, workflow skill docs, templates, references, and validation guidance
should describe the same current protocol without stale provider-specific or
local-only assumptions.

## Goal

Audit and synchronize the Agent Harness documentation surface after recent
changes so a user can understand the current workflow-controller model,
delivery-state policy, gate evidence requirements, and verification commands
from the documented entry paths.

## Scope

- Audit and update public docs where needed:
  - `README.md`
  - `README.zh-CN.md`
  - `docs/cli.md`
  - `docs/cli.zh-CN.md`
  - `docs/install.md`
  - `docs/project-contract.md`
- Audit and update plugin docs where needed:
  - `plugins/agent-harness/README.md`
  - `plugins/agent-harness/skills/*/SKILL.md`
  - `plugins/agent-harness/references/*.md`
  - `plugins/agent-harness/templates/*`
- Align terminology around `fixed` / `adapter`, workflow skills,
  `gate-only`, `implementer`, `mixed`, `codex-cli-subagent`, execution DAGs,
  `Conversation Route`, `Execution Context Lock`, provider-neutral
  `review-open` / `integrated`, and `Delivery intent:
  integrate-after-gates`.
- Align acceptance language around `Spec Acceptance Checklist`, `Required Gate
  Evidence`, candidate evidence vs accepted completion, and completed run
  requirements.
- Align validation guidance around `npm run validate:plugin`,
  `npm run test:smoke`, `npm run test:eval` when eval docs are touched, and
  `git diff --check`.
- Add or adjust smoke-doc guards only if a documentation consistency issue
  needs deterministic regression coverage.
- Update harness state and run evidence after the worker output is accepted.

## Non-Goals

- Do not change runtime behavior, CLI semantics, schemas, package metadata, or
  skill activation behavior unless a narrow documentation guard is required.
- Do not add project-specific downstream facts to plugin core docs.
- Do not modify `AGENTS.md`.
- Do not start daemons, watchers, network services, background sessions, or
  automations.
- Do not push, open PRs, deploy, publish, release, use credentials, use paid
  APIs, touch production data, or perform destructive operations.

## Task Routing

- Level: standard adapter.
- Reason: the task spans multiple public documentation surfaces and needs
  explicit acceptance criteria, but the expected changes are documentation-only.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, this spec, public docs, plugin
  workflow skills, references, templates, and smoke docs guards if touched.
- Required gates: worker result packet, controller review, `git diff --check`,
  `npm run test:smoke`, `npm run validate:plugin`, `goal validate`, and
  `run record`.
- Execution role: current thread is `gate-only` main control; worker owns
  implementation edits.
- Work mode: `local` on branch `main`.
- Optional competition needed: no; the scope is an audit/sync pass, not a
  product or architecture choice.

## Spec Acceptance Checklist

- Item: `Current protocol terminology`
  - Acceptance: Docs do not present stale `PR-open` / `merged` as primary
    states, old local-only delivery ceilings, or old worker-surface defaults.
  - Evidence: Goal checklist and controller review cite updated CLI docs,
    project contract docs, task-routing, controller-communication, and
    completion-evidence docs; stale terms remain only as compatibility aliases
    or source-task batching language.
  - Status: `satisfied`
- Item: `Workflow-controller entry path`
  - Acceptance: Public and plugin docs consistently describe
    `harness:init`, `harness:orient`, `harness:intake`, and
    `harness:execute` as the primary user workflow.
  - Evidence: `README.md`, `README.zh-CN.md`, and `docs/install.md`.
  - Status: `satisfied`
- Item: `Gate-only and subagent execution`
  - Acceptance: Docs consistently explain that a main control / gate-only
    lane reviews worker output and that default worker dispatch uses
    `codex-cli-subagent` when a run packet requires implementation.
  - Evidence: README files, install docs, adapter/task-routing references,
    `harness:execute`, and the goal template.
  - Status: `satisfied`
- Item: `Acceptance and evidence gates`
  - Acceptance: Docs consistently distinguish candidate evidence from
    accepted completion and describe checklist / required gate evidence for
    completed run records.
  - Evidence: README files, install docs, controller communication,
    completion-evidence docs, and goal template.
  - Status: `satisfied`
- Item: `Verification guidance`
  - Acceptance: Documentation changes are backed by the configured validation
    commands, and any touched eval docs are covered by `npm run test:eval`.
  - Evidence: Verification node records passing `git diff --check`,
    `npm run test:smoke`, `npm run validate:plugin`, goal validation, and run
    status inspection; `npm run test:eval` was skipped because no eval docs or
    fixtures changed.
  - Status: `satisfied`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: Controller reviewed worker output, recorded all DAG node results,
    accepted the documentation diffs, and confirmed verification passed without
    delivery steps above `validated-local`.
  - Status: `satisfied`

## Evidence Plan

- Candidate evidence sources:
  - Worker result packet with changed files, summary, verification, known
    risks, and deferred work.
  - Repository diff after worker output is integrated.
  - Verification command summaries.
- Accepted evidence:
  - Controller review against every checklist item.
  - Passing required validation commands.
  - Recorded run node and run completion evidence.
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - `.harness/runs/`

## Verification

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md
```

Run `npm run test:eval` if the implementation changes eval docs or eval
fixtures.

## Completion Conditions

- The docs audit is complete across the scoped surfaces.
- Stale or inconsistent documentation found by the audit is corrected.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete
  evidence.
- `Required Gate Evidence` is `satisfied`.
- Verification commands pass or a blocked run records the exact blocker.
- `harness/tasks.md`, `harness/status.md`, and run evidence are synchronized.

## Pause Conditions

- This spec conflicts with code, repository instructions, adapter rules, or
  newer user instructions.
- The task expands from documentation sync into runtime behavior, public CLI
  semantics, schema changes, activation behavior, packaging changes, release
  policy, or project direction.
- The audit finds a product/contract ambiguity that materially affects what
  users should do.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, release, daemons, watchers, network services, background
  sessions, or automations become necessary.
