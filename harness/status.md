# Project Status

`harness-rule:bounded-status-snapshot`: this file records current state only.
Historical evidence lives in `harness/tasks.md`, `harness/goals/`, and
`.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Documented adapter language configuration, CLI selection
  precedence, `auto` behavior, technical-term preservation, and the current
  English-only generated-artifact boundary.
- Goal:
  `harness/goals/2026-07-12-document-adapter-language-configuration-and-artifact-language-boundaries.md`
- Run: Foreground execution in the current thread; no separate run packet.

## Git And Delivery

- Current branch: `main`
- Work mode: `local`
- Delivery intent: `push-and-deploy-local-plugin`
- Target delivery state: `pushed`
- Commit authorized: `yes` (fresh user authorization on 2026-07-12)
- Push authorized: `yes` (fresh user authorization on 2026-07-12)
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`
- Plugin-cache deployment authorized: `yes` (fresh user authorization on 2026-07-12)

Commit, push, and local plugin cache deployment authorization comes only from
the user's current 2026-07-12 instruction. Review, integration, and release
remain unauthorized.

## Verification

- State: passed.
- Required checks:
  - `npm run validate:plugin`
  - `npm run test:protocol`
  - `npm run test:smoke`
  - `npm run test:all`
  - Goal validation
  - `git diff --check`
  - `npm run deploy:local-plugin`
- Deployment evidence: Documentation commit `3f40b19` pushed to `origin/main`;
  local plugin cache refreshed at
  `/Users/liuyj/.codex/plugins/cache/personal/harness/0.6.0` with validate,
  smoke, reinstall, and cache sentinel checks passing.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Internal route: `orient`
- Execution role: None active.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None. Start a new Codex thread or restart Codex App to load the
  refreshed plugin cache.

## Blockers

- None currently recorded.
