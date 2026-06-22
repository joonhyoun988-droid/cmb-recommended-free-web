# GitHub Projects Queue

Status: `SCRIPT_READY_NOT_CREATED`

GitHub Projects is the external board lane for AI-OS evolution candidates, star priority, PR waiting work, and proof state.

## Safe Setup

```powershell
.\setup_github_projects_board.ps1
```

This is dry-run only. It prints the commands and creates nothing.

## Real Setup

```powershell
gh auth refresh -h github.com -s project
.\setup_github_projects_board.ps1 -Apply
```

## Board Fields

| Field | Meaning |
|---|---|
| Stars | 1-5 urgency/importance score. |
| Lane | AI-OS, CMB, Design, Ops, Security, QA, Docs. |
| Decision | ADOPT, PILOT, QUEUE, REJECT, DATA_NEEDED. |
| Evidence | Commit, run URL, artifact, screenshot, or dashboard lane. |

No-overclaim: project script ready is not the same as an external board created.
