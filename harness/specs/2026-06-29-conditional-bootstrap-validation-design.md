# Conditional Bootstrap Validation Design

Status: implemented
Created: 2026-06-29
Updated: 2026-06-29

## Background

Agent Harness currently activates through project-scope instructions,
explicit user requests, harness skills, and CLI commands. The prior activation
spec deferred plugin-level bootstrap because `SessionStart` behavior has a
larger blast radius than an `AGENTS.md` snippet.

The question for this validation is whether the plugin can add a lightweight
session-start bootstrap that activates only when `.harness/config.json` exists
in the current project, while leaving non-harness projects unaffected in Codex
App and Codex CLI.

Local hook evidence proves that a stronger shape exists: a plugin can declare
a `SessionStart` hook, execute a hook script, and return `additionalContext`.
That approach injects methodology at session start and is intentionally broad.
Agent Harness needs a narrower rule because it is a project control plane, not
a global development methodology.

## Goal

Decide whether Agent Harness should add a plugin-level `SessionStart`
bootstrap now, and record the validation evidence.

## Findings

- A hook-capable reference plugin outside this repository declares `hooks` in
  `.codex-plugin/plugin.json`, points to a hook config, and runs a
  `SessionStart` script.
- The reference hook script returns `hookSpecificOutput.additionalContext` for
  `SessionStart`, injecting bootstrap instructions.
- The current Agent Harness plugin validation gate rejects top-level
  `hooks` in `.codex-plugin/plugin.json`.
- A temporary Agent Harness manifest with `"hooks": "./hooks/hooks-codex.json"`
  fails the same validator.
- The same validator also rejects the external reference manifest because it
  contains `hooks`, confirming that hook bootstrap uses a stronger installation
  shape than the currently validated local plugin contract.

## Decision

Do not add a `SessionStart` hook to Agent Harness now.

The current safe activation mechanisms remain:

- project-scope activation through `AGENTS.md` using
  `agent-harness activation snippet`;
- explicit user requests such as "use harness";
- explicit CLI commands such as `doctor`, `orient next`, `intake idea`,
  `goal create`, `goal validate`, and `run prepare`;
- harness skills when Codex has selected them for the task.

The reason is practical and contractual: enabling a hook would require adding
`hooks` to the plugin manifest, which currently breaks `npm run
validate:plugin`. Without a validated manifest path and runtime coverage in
both Codex App and Codex CLI, Agent Harness cannot claim that a session-start
bootstrap only activates for harness projects.

## Follow-Up Criteria

Reconsider conditional bootstrap only when all of the following are true:

- the plugin validation contract accepts a hook manifest path for local
  plugins;
- a hook script can reliably determine the project root used by Codex App and
  Codex CLI;
- the hook emits no `additionalContext` when `.harness/config.json` is absent;
- runtime tests cover a harness project and a non-harness project in both
  Codex App and Codex CLI;
- the injected context remains lightweight and only instructs Codex to inspect
  harness config before substantial project work.

## Non-Goals

- Do not add `hooks` to the current plugin manifest.
- Do not add a global mandatory methodology.
- Do not silently modify `AGENTS.md`.
- Do not start daemons, watchers, background sessions, push, PR, deploy, or
  release behavior.

## Acceptance Criteria

- The validation decision is documented.
- The current plugin manifest remains hook-free.
- Smoke coverage guards the hook-free manifest boundary.
- Public docs and mental models state that conditional bootstrap is deferred,
  not current behavior.
- `npm run validate:plugin` continues to pass.

## Verification

```bash
PYTHONPATH=tools/python-yaml-shim python3 "${CODEX_HOME:-$HOME/.codex}/skills/.system/plugin-creator/scripts/validate_plugin.py" <temporary-agent-harness-with-hooks>
npm run validate:plugin
npm run test:smoke
```

The temporary hook-manifest validation is expected to fail on `plugin.json
field \`hooks\` is not accepted by plugin validation`. The project validation
commands must pass.

## Pause Conditions

- Newer Codex plugin validation accepts hooks and changes the implementation
  decision.
- Runtime behavior in Codex App or Codex CLI differs from local hook evidence.
- A user explicitly asks to adopt plugin bootstrap behavior despite the current
  validation boundary.
- Hook behavior cannot be made conditional on `.harness/config.json`.
