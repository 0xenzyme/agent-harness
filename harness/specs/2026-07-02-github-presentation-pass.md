# GitHub Presentation Pass

Status: accepted

## Context

The repository `0xenzyme/agent-harness` is pinned on the user's GitHub profile.
The project has useful engineering substance but needs GitHub-facing
presentation work so the pinned card, repository first screen, release surface,
and social preview communicate the value quickly.

This spec is the complete presentation plan and execution contract.

## Objective

Make the GitHub repository look intentional, trustworthy, and immediately
understandable without turning it into a decorative marketing page.

The first impression should say:

```text
Agent Harness is an adapter-driven control plane for coding-agent work.
It turns accepted direction into tasks, goals, run DAGs, worker execution,
verification, gates, and state sync.
```

## Presentation Strategy

1. Make the pinned repository card understandable:
   - set a concise GitHub repository description;
   - add precise repository topics;
   - avoid vague tags such as generic `ai` unless needed later.
2. Make the README first viewport strong:
   - add useful badges for version, plugin validation, smoke/protocol checks,
     license, and Codex plugin positioning;
   - add a compact visual identity / social preview link;
   - keep the coding-agent-first value proposition above detailed docs.
3. Add social preview assets:
   - create a source SVG and, when tooling permits, a PNG at GitHub social
     preview dimensions (`1280x640`);
   - use a restrained engineering visual style with the flow:
     `Tasks -> Goals -> Runs -> Gates -> State Sync`.
4. Add release confidence:
   - add `CHANGELOG.md`;
   - add release notes for `v0.4.0`;
   - create and push `v0.4.0` tag when local verification passes;
   - create GitHub release if `gh` auth supports it.
5. Keep the implementation honest:
   - no runtime protocol changes unless presentation docs/tests need a narrow
     reference;
   - no generated marketing site;
   - no release claim without matching GitHub evidence.

## GitHub Topics

Apply these topics:

```text
codex
codex-plugin
ai-agents
coding-agents
developer-tools
workflow-automation
agent-orchestration
task-management
cli
productivity
automation
agent-harness
```

## Repository Description

Use:

```text
Adapter-driven control plane for Codex and coding-agent work: tasks, goals, run DAGs, gates, verification, and state sync.
```

## Scope

- Update README and README.zh-CN first-screen presentation.
- Add `CHANGELOG.md`.
- Add `docs/releases/v0.4.0.md` with concise release notes.
- Add social preview assets under `docs/assets/github/`.
- Add GitHub presentation guidance docs when useful.
- Update package/documentation validation only as needed to protect the new
  presentation assets and links.
- Apply GitHub repository description and topics using `gh` when authenticated.
- Commit and push the local presentation work to `main`.
- Create and push Git tag `v0.4.0`.
- Create a GitHub Release for `v0.4.0` if supported by available `gh` auth.
- Update Harness task/status/goal/run records.

## Non-Goals

- Do not redesign Agent Harness protocol, CLI behavior, skill routing, or
  generated run packet semantics.
- Do not create a separate website or landing page.
- Do not add network services, daemons, watchers, telemetry, or paid services.
- Do not change plugin activation behavior.
- Do not use stock-like or generic AI imagery.
- Do not claim release/publish state unless the matching remote action succeeds.

## Acceptance Criteria

- README first screen contains badges, sharp positioning, and links to social
  preview / capability matrix / changelog.
- Repository topics and description are applied remotely or a concrete blocker
  is recorded.
- Social preview assets exist and are referenced from docs.
- `CHANGELOG.md` contains `0.4.0`.
- `docs/releases/v0.4.0.md` contains release notes suitable for GitHub Release.
- `v0.4.0` tag exists locally and remotely, or a blocker is recorded.
- GitHub Release `v0.4.0` is created, or the exact missing authorization/tooling
  blocker is recorded.
- Verification passes.
- Harness state is synchronized.

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
```

Also verify:

```bash
gh repo view 0xenzyme/agent-harness --json description,repositoryTopics
git tag --list v0.4.0
git ls-remote --tags origin v0.4.0
gh release view v0.4.0
```

## Completion Conditions

- Acceptance criteria are satisfied or explicit blockers are recorded.
- Local verification passes.
- Remote GitHub metadata/tag/release actions either succeed or have concrete
  recorded blockers.
- Changes are committed and pushed unless GitHub auth/push fails.
- Harness task/status/goal/run evidence is updated.

## Pause Conditions

- GitHub auth is unavailable or lacks required scope for remote metadata,
  tag push, or release creation.
- The user changes presentation direction or rejects the proposed topics,
  description, or social preview style.
- Work would require paid APIs, production credentials, destructive operations,
  or a separate website.
- Local changes appear that conflict with this task's files.
