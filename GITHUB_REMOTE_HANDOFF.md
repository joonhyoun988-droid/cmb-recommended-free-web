# GitHub Remote Handoff

Status: `blocked_by_github_auth`

Local commits prepared:

```text
c61fa0c Prepare CMB public preview pipeline
52d98fe Document GitHub remote handoff blocker
```

## Why It Is Blocked

GitHub CLI is installed, but the current token is invalid.

```text
gh auth status
X Failed to log in to github.com account joonhyoun988-droid
The token in default is invalid.
```

## Auth Lifecycle Guard

Use the project guard before every GitHub remote step:

```powershell
.\check_github_auth.ps1
```

If it reports `WARN`, use the safe refresh/login route:

```powershell
.\check_github_auth.ps1 -TryRefresh
.\check_github_auth.ps1 -OpenLogin
```

The script never prints tokens. It only checks whether the local GitHub CLI login is healthy.

## Resume After Login

Beginner translation:

- `gh auth login`: log in to GitHub from this computer.
- `repo create`: create the remote GitHub repository.
- `push`: send this local commit to GitHub.
- `workflow`: GitHub's remote verification job.
- `Pages`: GitHub's free static website hosting.

Run after GitHub login succeeds:

```powershell
.\check_github_auth.ps1
gh repo create cmb-recommended-free-web --public --source . --remote origin --push
gh run list --limit 5
```

Expected public preview URL after the Pages workflow succeeds:

```text
https://joonhyoun988-droid.github.io/cmb-recommended-free-web/
```

## Required Evidence After Push

Add these back into `REMOTE_OPERATIONS_DATA_BRIDGE.md`:

- GitHub repository URL
- latest `CMB Frontend Proof` run URL
- latest `Deploy CMB Preview` run URL
- GitHub Pages preview URL
- artifact URL or run artifact name
- proof level promoted from `remote_ci_ready` to `remote_ci_proven` only after the workflow passes
- proof level promoted to `preview_operational` only after the Pages URL loads

## Safety Boundary

The repo is prepared as a public demo:

- demo login only: `DEMO01 / 0000`
- no real operator PIN
- no private Apps Script URL
- no spreadsheet ID
- generated raw reports and screenshots ignored by Git
