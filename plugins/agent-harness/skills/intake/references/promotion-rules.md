# Intake Promotion Rules

Use this reference before moving an intake candidate toward execution.

## Preview Output

Report:

- candidate title
- suggested priority
- target section
- related tasks or artifacts
- acceptance hint
- whether a spec is likely needed
- confirmation needed before recording or execution

## Promote To Task Index

Record only after explicit approval. If the configured task index format is not
safe for automatic writes, provide the exact entry and stop.

## Promote To Execution

Route to `execute` only after these are clear:

- accepted scope
- non-goals
- execution role
- verification
- completion conditions
- pause conditions

If an item is missing, use the mapping in
[Route To Public Entry Mapping](../../../references/route-entry-mapping.md):
shape read-only in `harness:orient`, ask the blocking question, then use
`harness:execute` for authorized Goal preparation/execution. Continue only when
the missing item is not applicable or is supplied by accepted scope/spec/Goal.
