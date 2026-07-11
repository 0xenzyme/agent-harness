# Execute Routing Boundaries

Use this reference when `execute` is triggered but the request still needs route
selection.

## Owns

- Confirmed implementation slices.
- Confirmed gate-only or acceptance-lane reviews.
- Confirmed run packets, DAG nodes, or goal execution.
- Verification and state sync after authorized work.

## Does Not Own

- Read-only project orientation.
- Rough ideas, inbox notes, or not-yet-accepted requirements.
- Harness adoption, initialization, config import, or activation preview.
- Vague next-step questions without accepted scope.
- Product, content, security, data, or milestone work whose acceptance criteria
  are not explicit.

## Fallback Routes

Route names below are internal states. Use
[Route To Public Entry Mapping](../../../references/route-entry-mapping.md) and
always return a published skill or exact user action.

- Use `orient` for read-only state, blockers, and next-route questions.
- Use `intake` for rough ideas, requirements, bugs, and inbox notes.
- Use `init` for setup, adoption, config import, and activation preview.
- Keep `shape` in `harness:orient`. After accepted authorization, use
  `harness:execute` for the internal `goal` route and durable Goal creation.
- Use `ask` when product direction, destructive impact, credentials, paid APIs,
  production access, or user intent is unclear.

## Hard Rule

Routing inside `execute` may only narrow, defer, or pause work. It must not grant
implementation permission that the user, confirmed goal, or run packet did not
already provide.

## Near Neighbors

- "What should we do next?" -> `orient`.
- "Add this idea to the backlog" -> `intake`.
- "Set up harness in this repo" -> `init`.
- "Create a goal from this accepted spec" -> internal `goal` route through
  `harness:execute`.
- "Review worker output as the control lane" -> `execute` with `gate-only`.
