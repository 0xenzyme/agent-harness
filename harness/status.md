# Project Status

`harness-rule:bounded-status-snapshot`: this file records current state only.
Historical evidence lives in `harness/tasks.md`, `harness/goals/`, and
`.harness/runs/`.

## Focus

- Current Goal: Document adapter language configuration and artifact-language
  boundaries.
- Current work: Clarify adapter-owned language policy, selection precedence,
  and the current CLI-versus-generated-artifact localization boundary.
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

- State: running.
- Required checks:
  - native-dimension visual inspection of all three README SVG diagrams
  - `xmllint --noout docs/assets/readme/*.svg docs/assets/github/social-preview.svg`
  - README relative-link validation
  - `npm run validate:plugin`
  - `npm run test:all`
  - `git diff --check`

## Route

- Public entry: `harness:execute` for the accepted documentation Goal.
- Internal route: `execute`
- Execution role: `implementer`
- Accepted-state owner: current project control lane after verification.
- Need user: None
- Remaining: Update language docs, validate, commit, push, and deploy the local
  plugin cache.

## Blockers

- None currently recorded.
