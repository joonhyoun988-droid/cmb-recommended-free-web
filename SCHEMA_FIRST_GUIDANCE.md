# Schema-First Guidance

Route: `BEGINNER_SAFE_SCHEMA_FIRST_GUIDANCE_V8_19`
Receipt: `SCHEMA_FIRST_GUIDANCE_RECEIPT`

Status: `ADOPTED`

## Current Board Schema

| Field | Type | Purpose |
|---|---|---|
| Stars | Number | 1-5 urgency/importance. |
| Lane | Single select | Fixed operating core only. |
| Project | Text | Changing project/entity name. |
| Decision | Single select | ADOPT, PILOT, QUEUE, REJECT, DATA_NEEDED, DONE. |
| Evidence | Text | Commit, run URL, artifact, screenshot, or dashboard lane. |
| Next action | Text | Next concrete action. |

## Receipt

```text
SCHEMA_FIRST_GUIDANCE_RECEIPT:
- fixed_axis: Lane
- variable_entity: Project
- temporary_state: Decision
- evidence_field: Evidence
- beginner_explanation: fields are columns; items are rows; fixed categories must not contain project names.
- reversible_path: rename/edit field options in GitHub Projects settings if a field was created wrong.
- counterexample_simulation: a future non-CMB project can reuse Lane without adding a new project option.
- corrected_guidance: create Project separately and keep Lane as stable operating cores.
```
