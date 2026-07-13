# Project Status

`harness-rule:bounded-status-snapshot`: this file records current state only.
Historical evidence lives in `harness/tasks.md`, `harness/goals/`, and
`.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Added reusable `harness_explorer`,
  `harness_implementer`, and `harness_reviewer` Codex custom-agent templates,
  bilingual installation guidance, model-routing integration, and deterministic
  smoke coverage.
- Goal:
  `harness/goals/2026-07-13-add-reusable-codex-custom-agent-templates-for-harness-execution-roles.md`
- Run:
  `.harness/runs/20260713-135738-add-reusable-codex-custom-agent-templates-for-harness-execution-roles/`
- Execution evidence: explorer, implementation, and independent verification
  nodes completed sequentially; execution-worker output was reviewed and
  accepted only by this controller.
- Delivery evidence: commit `6b4460c` pushed to `origin/main`; local
  `harness@personal` plugin cache refreshed at
  `/Users/liuyj/.codex/plugins/cache/personal/harness/0.6.0`.

## Git And Delivery

- Current branch: `main`
- Work mode: `local`
- Delivery intent: `local-validation`
- Target delivery state: `pushed`
- Commit authorized: `yes` (fresh user authorization on 2026-07-13)
- Push authorized: `yes` (fresh user authorization on 2026-07-13)
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`
- Plugin-cache deployment authorized: `yes` (fresh user authorization on 2026-07-13)

No commit, push, review, integration, release, plugin-cache deployment,
credentials, paid API, production, daemon, or destructive-operation authority
is recorded for the custom-agent templates Goal.

## Verification

- State: passed.
- Required checks:
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run test:protocol`
  - `npm run validate:plugin`
- Evidence: canonical TOML policy parse, smoke, protocol, plugin validation,
  and diff checks passed locally; plugin deployment re-ran plugin validation
  and smoke successfully.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Internal route: `orient`
- Execution role: None active.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None

## Blockers

- None currently recorded.
