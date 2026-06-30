# Spec: Root README CLI Relocation

Created: 2026-06-30
Status: accepted

## Background

The original README cleanup task required moving most root README CLI material
into docs with only a short root README reference. Earlier work reframed the
CLI as operator tooling but left a long command catalog in `README.md` and
`README.zh-CN.md`.

## Goal

Move detailed root README CLI command catalog content into docs while keeping
the root README coding-agent-first.

## Scope

- Create a dedicated CLI reference doc under `docs/`.
- Move the detailed root README CLI command catalog from `README.md` into that
  doc.
- Move the detailed Chinese root README CLI command catalog from
  `README.zh-CN.md` into a Chinese docs page.
- Leave only a short root README reference to the CLI docs.
- Add smoke guards so root README files do not regain the long
  `agent-harness` CLI command catalog.
- Update task/status/run evidence.

## Non-Goals

- Do not change CLI behavior.
- Do not change install, activation, or plugin packaging behavior.
- Do not modify `AGENTS.md`.
- Do not push, open PRs, deploy, publish, release, or start daemons.

## Key Decisions

- Root README remains user-facing and coding-agent-first.
- Detailed CLI reference belongs in `docs/cli.md` and `docs/cli.zh-CN.md`.
- Install docs may keep short setup commands because it is already a docs page.

## Task Routing

- Level: `execute`
- Reason: user explicitly asked to fix the README relocation follow-up.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  this spec, root README files, and smoke tests.
- Required gates: smoke test, plugin validation, goal validation, and state
  sync.
- Optional competition needed: no.
- Idea Inbox input: previous accepted follow-up task.
- Escalation triggers: changing product positioning beyond README CLI
  relocation, plugin behavior changes, push, PR, deploy, publish, or release.

## Evidence Plan

- Accepted evidence:
  - `README.md` and `README.zh-CN.md` contain only a short CLI reference
  - detailed CLI command catalog exists in docs
  - smoke guard checks root README files do not contain the long
    `agent-harness` CLI command catalog
  - `node --check`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
- Candidate evidence sources:
  - root README diff
  - docs CLI reference diff
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - `.harness/runs/`

## Source Task Acceptance Map

- Task: `Move root README CLI command catalog into docs`
  - Acceptance: Move detailed root `README.md` / `README.zh-CN.md` CLI command
    catalog content into docs, leave only a short root README reference, and
    keep the homepage coding-agent-first.
  - Evidence: `README.md` and `README.zh-CN.md` now keep only a short
    `docs/cli*` reference and no longer contain the detailed
    `node plugins/agent-harness/scripts/agent-harness.mjs ...` command
    catalog; `docs/cli.md` and `docs/cli.zh-CN.md` carry the detailed CLI
    reference; `tests/smoke.mjs` guards the boundary.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: `harness/tasks.md`, `harness/status.md`
- Hard boundaries: keep plugin contracts stable and explicit; validate plugin
  changes with `npm run validate:plugin`.

## Acceptance Criteria

- `README.md` does not contain the detailed
  `node plugins/agent-harness/scripts/agent-harness.mjs ...` command catalog.
- `README.zh-CN.md` does not contain the detailed
  `node plugins/agent-harness/scripts/agent-harness.mjs ...` command catalog.
- Root README files keep a short CLI paragraph linking to docs.
- Detailed CLI reference exists under docs.
- Smoke tests enforce the root README boundary.
- The source task is moved to Done only after the acceptance map is satisfied.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-root-readme-cli-relocation.md
```

## Pause Conditions

- This spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
