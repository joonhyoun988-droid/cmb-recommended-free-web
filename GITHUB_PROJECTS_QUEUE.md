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
gh auth refresh -h github.com --scopes read:project,project
.\setup_github_projects_board.ps1 -Apply
```

## Board Fields

| Field | Meaning |
|---|---|
| Stars | 1-5 urgency/importance score. |
| Lane | Fixed operating core: OS Core, Project Delivery, Design, Automation, Ops, Security, Data, Research, Cleanup. |
| Project | Changing project/entity name, such as CMB, AI-OS, or the next project. Keep this separate from Lane. |
| Decision | ADOPT, PILOT, QUEUE, REJECT, DATA_NEEDED, DONE. |
| Evidence | Commit, run URL, artifact, screenshot, or dashboard lane. |
| Next action | Next concrete action. |

No-overclaim: project script ready is not the same as an external board created.

Schema-first note: `Lane` must stay stable across future projects. Project names belong in `Project`, not in `Lane`.
