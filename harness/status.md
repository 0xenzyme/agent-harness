# Project Status

`harness-rule:bounded-status-snapshot`: this file records current state only.
Historical evidence lives in `harness/tasks.md`, `harness/goals/`, and
`.harness/runs/`.

## Focus

- Current Goal: None active.
- Recently completed: Improved README presentation and first-use clarity by
  moving install/skill guidance above the fold, reducing repetition, aligning
  zh-CN structure, and replacing README PNG diagrams with semantic SVGs.
- Goal:
  `harness/goals/2026-07-12-improve-readme-presentation-and-first-use-clarity.md`
- Run: Foreground execution in the current thread; no separate run packet.

## Git And Delivery

- Current branch: `main`
- Work mode: `local`
- Delivery intent: `push-current-branch`
- Target delivery state: `pushed`
- Commit authorized: `yes` (fresh user authorization on 2026-07-12)
- Push authorized: `yes` (fresh user authorization on 2026-07-12)
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`
- Plugin-cache deployment authorized: `no`

Commit and push authorization comes only from the user's current 2026-07-12
instruction. Review, integration, release, and plugin-cache deployment remain
unauthorized.

## Verification

- State: passed.
- Required checks:
  - native-dimension visual inspection of all three README SVG diagrams
  - `xmllint --noout docs/assets/readme/*.svg docs/assets/github/social-preview.svg`
  - README relative-link validation
  - `npm run validate:plugin`
  - `npm run test:all`
  - `git diff --check`

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Internal route: `orient`
- Execution role: None active.
- Accepted-state owner: None active.
- Need user: None
- Remaining: None.

## Blockers

- None currently recorded.
