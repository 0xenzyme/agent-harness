# Completion Evidence

Evidence serves delivery. Direct work requires only the delivered result and
its actual verification; it does not require a Harness evidence artifact.
Durable work retains only what is needed to prove acceptance, resume interrupted
work, or satisfy explicit audit and gate requirements. Do not duplicate native
plans, transcripts, or narrative progress into repository records.

Durable completion requires concrete changed/reviewed files, verification
commands and results, required checklist and gate evidence, Run orchestration
evidence, authoritative Task/Goal phase, and verified State Sync Notes.
Acceptance covers both the requested outcome and non-breakage of every global
hard constraint. Passing node checks alone is insufficient when the target needs
an integration, end-to-end, or other whole-target check.

The final user report is result-first: delivered outcome, key changes,
whole-target and hard-constraint verification, actual external/delivery state,
`Need user`, and `Remaining`. It does not require a separate report artifact.

Adversarially check that the accepted objective is not larger than the local
artifact, all dependencies and configured roots were respected, evidence is
fresh, required nodes and gates are complete, and candidate worker output was
validated by the accepted-state owner. Task/Goal is the accepted-state
authority; Run retains evidence and status remains a bounded projection.

Postflight-only synchronization is narrower: verify the completed result, then
update only state that existed before execution with the observed outcome,
verification, and remaining gap. Do not create a
Goal, Run, orchestration, gate, or status artifact solely for postflight bookkeeping.
Durable required gates do not apply unless the work closes a durable Goal/Run;
an existing enforced Run still requires its full recorded evidence.

Tracked durable completion must retain the CLI's exact log copies and hashed
completion snapshot; these requirements do not extend to direct work.
Verification exclusions are explicit; ignored build artifacts cannot be implicit
source inputs. Completed history and current validation are separate: a sealed
`done` is historical when `currentVerification.status` is `changed`. Record new
verification for follow-up edits without overwriting old receipts.
