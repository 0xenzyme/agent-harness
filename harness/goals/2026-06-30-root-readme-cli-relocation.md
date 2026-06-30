# Goal: Root README CLI Relocation

Spec: harness/specs/2026-06-30-root-readme-cli-relocation.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `P2 Move root README CLI command catalog into docs`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-06-30-root-readme-cli-relocation.md`
7. `README.md`
8. `README.zh-CN.md`
9. `docs/install.md`
10. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local` because this is a foreground docs/test cleanup in the current
checkout.

## Execution Role

Use `implementer`.

- The current thread may edit files inside the accepted scope.
- Final acceptance must cite deterministic verification and state sync.

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

## Scope

- Move detailed CLI command catalog material out of root README files.
- Add docs pages that carry the detailed CLI reference.
- Add smoke guards for the root README boundary.
- Update harness state and run evidence.

## Non-Goals

- Do not change CLI behavior.
- Do not change plugin install behavior.
- Do not modify `AGENTS.md`.
- Do not push, deploy, publish, release, open a PR, start a daemon, or launch
  background sessions.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-root-readme-cli-relocation.md
```

## Completion Conditions

- Root README files contain only a short CLI reference and remain
  coding-agent-first.
- Detailed CLI command catalog exists in docs.
- Smoke tests enforce the boundary.
- The acceptance map is updated to `satisfied` with concrete evidence.
- `harness/tasks.md`, `harness/status.md`, and run evidence are updated.

## Pause Conditions

- The referenced spec conflicts with code, repo instructions, or newer user
  instructions.
- Product positioning beyond CLI relocation becomes the main question.
- The work requires credentials, paid APIs, production access, destructive
  commands, push, PR, deploy, publish, or release.
