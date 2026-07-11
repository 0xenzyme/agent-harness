# Route To Public Entry Mapping

Agent Harness publishes four invokable skills. Route names describe control
state; they are not additional skills.

| Internal route | Public entry / action |
| --- | --- |
| `orient` | Use `harness:orient`. |
| `intake` | Use `harness:intake`. |
| `init` | Use `harness:init`. |
| `shape` | Stay in `harness:orient`, clarify scope without mutation, then ask the user to accept it. After acceptance, use `harness:execute`. |
| `goal` | Use `harness:execute` after the user authorizes the accepted scope; create or validate the durable Goal before implementation. |
| `execute` | Use `harness:execute`. |
| `competition` | Keep it inside `harness:orient` as an optional proposal protocol. Do not imply that `harness:competition` exists. After the user accepts a route, continue through `harness:execute`. |
| `ask` | Ask the smallest blocking question. Resume the skill implied by the answer; do not present `ask` as an invokable skill. |

## Boundary

- Never tell the user to invoke an unshipped skill.
- A route recommendation must include its public entry or exact user action.
- `harness:execute` may prepare a Goal from accepted, authorized scope, but it
  must not turn rough or ambiguous direction into accepted scope.
- Keep built-in Codex thread goals separate from repository Harness Goal files.
  A repository Goal is created only through the Harness artifact workflow.
