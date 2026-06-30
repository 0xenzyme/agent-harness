# Spec: Master Acceptance And Adapter Gates

Created: 2026-06-30
Status: accepted

## Background

The `mwi-wiki` adapter exposed a false-completion failure mode: technical
verification passed, routes existed, and tasks were marked done, while content
depth, guide IA, and product acceptance were not actually satisfied. The
failure is not specific to Astro or content sites. It shows that Agent Harness
needs a stronger distinction between candidate evidence and accepted
completion.

B3ehive's useful invariant is: candidate output or self-tested evidence is not
accepted completion. Agent Harness should keep its adapter-first model while
adding a lightweight master acceptance gate, adapter-declared required gates,
and evidence linting for completed runs.

## Goal

Make Agent Harness reject premature completed run records when required
adapter gates or spec checklist evidence are missing.

## Scope

- Add an adapter-declared required gate contract to `.harness/config.json`.
- Add `Spec Acceptance Checklist` and `Required Gate Evidence` goal sections.
- Validate those sections in `goal validate`.
- Record required gate metadata in `run prepare`.
- Make `run record --phase completed` reject missing or unsatisfied required
  gate evidence.
- Update `harness:execute`, templates, docs, and smoke tests.
- Keep gate names and business meaning project-owned and project-neutral.

## Non-Goals

- Do not introduce b3ehive cron, lease, ROI, tmux worker, or generated
  blueprint machinery.
- Do not hardcode content-site, SEO, wiki, guide, or `mwi-wiki` rules in core.
- Do not change task-index parsing into a new global schema.
- Do not modify `AGENTS.md`.
- Do not push, open PRs, deploy, publish, release, or start daemons.

## Key Decisions

- Agent Harness uses `Spec Acceptance Checklist` instead of adopting
  b3ehive's `[ ] / [_] / [x]` grammar across all project files.
- Adapter config declares gate names and completion requirements; adapter docs
  and gate artifacts define what those gates mean.
- CLI evidence lint stays intentionally minimal: it checks presence,
  recognized status, and concrete evidence, not domain-specific quality.
- Technical verification is necessary but not sufficient when required gates
  are configured.

## Task Routing

- Level: `execute`
- Reason: user explicitly asked the current thread to act as control and
  implement the discussed harness-layer fix.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, this spec, templates, workflow
  skills, CLI script, schema, and smoke tests.
- Required gates: `node --check`, `git diff --check`, `npm run test:smoke`,
  `npm run validate:plugin`, `goal validate`, and `run record`.
- Optional competition needed: no; the design direction was discussed and
  accepted in the control thread.
- Idea Inbox input: `mwi-wiki` quality-gap diagnosis and b3ehive gate review.
- Escalation triggers: changing core task schema, adding domain-specific
  content rules to plugin core, changing activation behavior, push/PR/deploy,
  or introducing daemons/automation.

## Evidence Plan

- Accepted evidence:
  - config schema allows required/blocking gate declarations
  - generated goals include checklist and required gate sections
  - goal validation catches malformed checklist/gate evidence
  - run completion rejects required gates without satisfied evidence
  - execute skill documents checklist-before-implementation behavior
  - smoke tests cover technical verification passing while gate evidence is
    missing
- Candidate evidence sources:
  - CLI diff
  - schema diff
  - template/skill docs diff
  - smoke fixture output
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - `.harness/runs/`

## Source Task Acceptance Map

- Task: `Add master acceptance and adapter-declared gates to Agent Harness`
  - Acceptance: Agent Harness distinguishes candidate evidence from accepted
    completion by requiring spec checklist and adapter-required gate evidence
    before completed run records can be accepted.
  - Evidence: Config schema, CLI goal/run validation, templates, execute skill
    guidance, docs, and smoke fixtures now enforce checklist/gate evidence
    before completed run records.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: `harness/tasks.md`, `harness/status.md`
- Hard boundaries: keep plugin core project-neutral; project adapters define
  domain-specific gate meaning.

## Acceptance Criteria

- `.harness/config.json` and schema support `gates.requiredForCompletion` and
  `gates.blocking`.
- `goal validate` accepts well-formed checklist/gate evidence and rejects
  malformed required gate evidence.
- `run prepare` records required gate names and item counts.
- `run record --phase completed` fails when a required gate item is not
  `satisfied` or lacks concrete evidence, even if `--verification` is present.
- `harness:execute` says spec-heavy/content/product tasks must turn accepted
  spec acceptance into a checklist before implementation.
- Smoke coverage demonstrates the false-completion guard.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md
```

## Pause Conditions

- This spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- The work would require a domain-specific content quality rule in plugin core.
- The work expands into task-index schema migration or activation behavior.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
