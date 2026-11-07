# GitHub Presentation

This document is the GitHub-facing presentation contract for Agent Harness.
It keeps the pinned profile card, README first screen, social preview, release
surface, and repository metadata aligned with shipped behavior.

## Positioning

Use this description for the GitHub repository:

```text
Adapter-driven control plane for coding-agent work: goals, milestones, acceptance, verification summaries, and state sync.
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

`README.md` is the canonical English README. `README.zh-CN.md` is the
Simplified Chinese edition. Do not maintain a duplicate `README.en.md`.

The README first screen should communicate:

- project identity: `Agent Harness`;
- category: adapter-driven control plane for coding-agent work;
- concrete flow: `roadmap -> milestone -> goal -> tasks -> verification -> state sync`;
- trust signals: version, Codex plugin, protocol checks, smoke checks, license;
- routes to the capability matrix, changelog, release notes, and social preview.

First-use copy leads with host prompts, then CLI adoption. Link the social
preview; do not embed the 1280x640 asset in the README.

## Social Preview

The social preview source lives at:

```text
docs/assets/github/social-preview.svg
```

The SVG subtitle matches the repository positioning line (host-neutral, no
Codex prefix). The flow row includes State Sync.

The published 1280x640 PNG is:

```text
docs/assets/github/social-preview.png
```

GitHub's repository social preview setting is managed in repository settings.
If an API or authenticated UI path is unavailable, upload the PNG manually using
the Settings -> General -> Social preview control. `package.json` `description`
uses the same positioning line as the GitHub About text above. About, topics,
and the uploaded OG image cannot be set from repository files.

## Community

These files are the GitHub community profile:

- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/pull_request_template.md`
- `.github/CODEOWNERS`
- `.github/workflows/ci.yml`

`.editorconfig` and `.gitattributes` keep UTF-8 text on LF line endings.
Do not add Dependabot configuration.

## Release Surface

The in-tree release surface for `0.14.0` is:

- `CHANGELOG.md`
- `docs/releases/v0.14.0.md`

This line replaces Run/evidence-centered control with host-owned execution
and Goal/Milestone delivery. The previous published line is `v0.13.0`:
<https://github.com/0xenzyme/agent-harness/releases/tag/v0.13.0>.
No Git tag or GitHub Release is implied by this source version bump.
