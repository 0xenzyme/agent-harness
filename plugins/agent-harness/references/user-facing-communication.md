# User-Facing Communication

Use this contract for user-visible in-turn `commentary`. It controls Harness
prompt and artifact behavior; it does not filter Codex transport events or
override host system/developer instructions.

`harness-rule:signal-only-commentary`: resolve the effective policy from
`.harness/config.json` `communication.commentary`. Supported values are
`minimal`, `balanced`, and `audit`; omitted configuration defaults to
`minimal`. There is no `off` mode because hosts may require tool preambles,
approval messages, safety notices, or progress heartbeats.

## Common Rules

- Satisfy skill announcement requirements once: combine skill name, why it
  applies, scope, unchanged boundaries, and next action into one short kickoff.
- Do not narrate routine file reads, searches, tool loading, command execution,
  or other activity already visible in the client UI.
- Do not repeat unchanged scope, authorization, safety, or delivery boundaries.
- Always report a new blocker, material risk, failed verification, changed
  assumption/scope/authorization, required user decision, or delivery-state
  transition.
- Obey host-required progress cadence. A heartbeat without a material change
  must be one short sentence and must not restate the plan.
- `Report cadence` and `Notify on` in a Goal Launch Packet may narrow timing or
  add events, but may not hide the mandatory signals above or conflict with the
  host.

## `minimal`

- Default to one kickoff.
- Send later commentary only when it adds a new mandatory signal or satisfies a
  host-required heartbeat.
- Every non-heartbeat update must contain a fact that was not true or known at
  the previous update.
- Combine adjacent findings into one message when doing so does not delay a
  blocker or user decision.
- Default packet values:
  - `Report cadence: material-transition-or-host-heartbeat`
  - `Notify on: blocker, risk, scope-or-authorization-change, user-decision,
    failed-verification, delivery-transition`

## `balanced`

- Apply all common rules.
- In addition to mandatory signals, report meaningful execution phase changes
  such as exploration complete, implementation complete, verification start,
  and verification complete.
- Do not emit per-command or per-file narration.
- Default packet values:
  - `Report cadence: meaningful-phase-transition`
  - `Notify on: minimal-signals, exploration-complete,
    implementation-complete, verification-complete`

## `audit`

- Apply all common rules.
- Permit transcript-quality summaries for gate inputs, decisions, state-sync
  evidence, and delivery transitions.
- Prefer compact evidence summaries and paths over raw packet dumps or command
  output.
- Default packet values:
  - `Report cadence: gate-and-decision-transition`
  - `Notify on: balanced-signals, gate-input, gate-decision, state-sync,
    delivery-transition`

## Precedence

Host system/developer instructions and current user instructions take
precedence. Goal/Run packet overrides may make reporting more detailed inside
their scope. They must not claim that Harness can suppress commentary the host
requires.
