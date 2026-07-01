# Goal: GitHub Presentation Pass

Spec: harness/specs/2026-07-02-github-presentation-pass.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: `Execute GitHub presentation pass for profile-pinned repository.`

## Read First

1. `AGENTS.md`
2. `harness/specs/2026-07-02-github-presentation-pass.md`
3. `harness/tasks.md`
4. `harness/status.md`
5. `docs/HARNESSES.md`
6. `docs/versioning.md`
7. `README.md`
8. `README.zh-CN.md`

## Work Mode Recommendation

Use `local`.

The repository is clean at goal start, the user asked to execute the
presentation work, and the current branch is `main`.

## Execution Role

Use `implementer`.

The current thread may edit files inside this goal's scope, run verification,
apply GitHub metadata when authenticated, commit, push, tag, and create the
GitHub Release if local and remote gates pass.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `release-after-gates`
- Target delivery state: `released`
- Commit authorized: `yes`
- Push authorized: `yes`
- Review authorized: `no`
- Integration authorized: `yes`
- Release authorized: `yes`

Completed state requires local verification, pushed `main`, pushed `v0.4.0`
tag, applied GitHub repository metadata, and GitHub Release evidence.

## Spec Acceptance Checklist

- Item: `Pinned card metadata`
  - Acceptance: Repository description and topics match the accepted spec, or a concrete GitHub auth/tooling blocker is recorded.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
- Item: `README first screen`
  - Acceptance: README has badges, clear positioning, and links to capability matrix, changelog, release notes, and social preview assets.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
- Item: `Social preview assets`
  - Acceptance: Source social preview asset exists under `docs/assets/github/`, with PNG output when local tooling supports it.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
- Item: `Release surface`
  - Acceptance: `CHANGELOG.md`, `docs/releases/v0.4.0.md`, Git tag `v0.4.0`, and GitHub Release are present, or exact blockers are recorded.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`
- Item: `Verification and state sync`
  - Acceptance: Required verification passes and Harness task/status/goal/run records are synchronized.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Scope

- Implement the accepted GitHub presentation spec.
- Update README, README.zh-CN, changelog/release docs, social preview assets,
  and narrow validation coverage.
- Apply GitHub repository description and topics using authenticated `gh`.
- Commit and push `main`.
- Create and push `v0.4.0` tag.
- Create GitHub Release `v0.4.0` if authenticated `gh` supports it.
- Synchronize Harness state.

## Non-Goals

- Do not change runtime protocol, CLI behavior, skill routing, plugin activation,
  generated run packet semantics, or adapter contracts except narrow docs/tests
  needed for presentation links.
- Do not create a separate website.
- Do not use paid APIs, production credentials, daemons, watchers, or destructive
  operations.

## Verification

```bash
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check plugins/agent-harness/scripts/agent-harness.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-02-github-presentation-pass.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
gh repo view 0xenzyme/agent-harness --json description,repositoryTopics
git tag --list v0.4.0
git ls-remote --tags origin v0.4.0
gh release view v0.4.0
```

## Evidence And State Sync

- Candidate evidence: local diff, command output, GitHub CLI output.
- Accepted evidence: passing verification, pushed commit, pushed tag, GitHub
  topics/description output, GitHub Release URL or recorded blocker.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and generated run packet.

## Completion Conditions

- Every Spec Acceptance Checklist item is `satisfied`, or an item that depends
  on unavailable remote authorization records a concrete blocker.
- Required verification passes.
- Delivery reaches `released`, or the run is recorded as delivery pending /
  blocked with exact missing evidence.
- Harness state is synchronized.

## Pause Conditions

- The accepted spec conflicts with repository instructions, GitHub constraints,
  current implementation facts, or newer user instructions.
- GitHub auth fails or lacks required scope.
- Remote write, tag push, or release creation fails for reasons that cannot be
  resolved locally.
- User changes presentation direction, topics, description, or visual style.
- Work requires paid APIs, destructive operations, production credentials, a
  website, daemons, or plugin activation changes.
