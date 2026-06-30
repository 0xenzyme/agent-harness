# Versioning Policy

Agent Harness uses blueprint-driven versioning.

The repository already has version fields in:

- `package.json`
- `plugins/agent-harness/.codex-plugin/plugin.json`

Both version fields must stay aligned.

## Version Unit

One confirmed and implemented blueprint is the normal release unit.

This works without a separate roadmap because each blueprint already contains:

- problem and goal
- scope and non-goals
- acceptance criteria
- verification
- pause conditions
- state sync

When a blueprint completes and changes public behavior, command behavior,
plugin skills, contracts, templates, or user-facing docs, the project should
consider a version bump.

## Pre-1.0 Mapping

While Agent Harness is pre-1.0, use this rule:

- `0.MINOR.0`: one completed feature / workflow / contract blueprint
- `0.MINOR.PATCH`: repair, documentation clarification, validation fix, or
  compatibility cleanup inside the same blueprint line

Examples:

```text
0.1.0 -> 0.2.0  completed workflow-controller skill blueprint
0.2.0 -> 0.3.0  removed legacy wrapper skills from the public skill surface
0.3.0 -> 0.3.1  fix wording or validation coverage for that blueprint line
```

After `1.0.0`, switch to normal semver:

- `MAJOR`: breaking contract or skill behavior changes
- `MINOR`: new backward-compatible workflow, command, or skill behavior
- `PATCH`: compatible fixes and documentation corrections

## Release Gate

A version bump should happen only after:

- the blueprint status is implemented;
- task/status records are synced;
- `package.json` and `plugins/agent-harness/.codex-plugin/plugin.json` versions
  match;
- `npm run validate:plugin` passes;
- `npm run test:smoke` passes;
- user-facing docs mention only shipped behavior;
- fresh-thread skill discoverability is checked when skills are added, removed,
  or renamed.

The release gate is also the packaging-discipline check: docs, skills,
templates, marketplace metadata, validation commands, and version metadata must
agree before the version is treated as shippable.

## Non-Goals

- Do not create a roadmap just to assign versions.
- Do not bump versions for unconfirmed drafts.
- Do not use version numbers as a substitute for acceptance evidence.
- Do not release a version when plugin validation fails.
