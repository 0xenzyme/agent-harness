# GitHub Presentation

This document is the GitHub-facing presentation contract for Agent Harness.
It keeps the pinned profile card, README first screen, social preview, release
surface, and repository metadata aligned with shipped behavior.

## Positioning

Use this description for the GitHub repository:

```text
Adapter-driven control plane for Codex and coding-agent work: tasks, goals, run DAGs, gates, verification, and state sync.
```

## Topics

Apply these GitHub repository topics:

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

## First Screen

`README.md` is the canonical Simplified Chinese README. `README.en.md` is the
secondary English edition. Do not maintain a duplicate `README.zh-CN.md`.

The README first screen should communicate:

- project identity: `Agent Harness`;
- category: adapter-driven control plane for coding-agent work;
- concrete flow: `roadmap -> milestone -> goal -> tasks -> run -> evidence -> state sync`;
- trust signals: version, Codex plugin, protocol checks, smoke checks, license;
- routes to the capability matrix, changelog, release notes, and social preview.

## Social Preview

The social preview source lives at:

```text
docs/assets/github/social-preview.svg
```

If a PNG renderer is available, publish:

```text
docs/assets/github/social-preview.png
```

GitHub's repository social preview setting is managed in repository settings.
If an API or authenticated UI path is unavailable, upload the PNG manually using
the Settings -> General -> Social preview control.

## Release Surface

The release surface for `0.9.0` is:

- `CHANGELOG.md`
- `docs/releases/v0.9.0.md`
- Git tag `v0.9.0`
- GitHub Release `v0.9.0`

Do not claim a Git tag or GitHub Release exists unless `gh release view
v0.9.0` succeeds. Until the release step is explicitly authorized and
completed, local docs are release-prep evidence only.
