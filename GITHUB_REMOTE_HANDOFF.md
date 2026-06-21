# GitHub Remote Handoff

Status: `remote_created_and_preview_deployed`

Local commits prepared:

```text
c61fa0c Prepare CMB public preview pipeline
52d98fe Document GitHub remote handoff blocker
```

## Why It Is Blocked

This was previously blocked because the GitHub CLI token was invalid. It is now resolved.

```text
gh auth status -h github.com
Logged in to github.com account joonhyoun988-droid
```

## Remote Evidence

- Repository: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web`
- Pages URL: `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`
- Latest app/workflow proof SHA: `eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`
- Latest frontend proof run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356863`
- Latest Pages deploy run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356885`
- Required check: branch protection requires always-on `frontend-proof`
- Artifact: `cmb-frontend-proof-eaa6a1ddab545698fb4c2213c1e1fe319ea5192c`
- Artifact API: `https://api.github.com/repos/joonhyoun988-droid/cmb-recommended-free-web/actions/artifacts/7777448041`

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

## Resume / Repeat Later

Beginner translation:

- `gh auth login`: log in to GitHub from this computer.
- `repo create`: create the remote GitHub repository.
- `push`: send this local commit to GitHub.
- `workflow`: GitHub's remote verification job.
- `Pages`: GitHub's free static website hosting.

Run after future GitHub login succeeds or when pushing a new change:

```powershell
.\check_github_auth.ps1
.\deploy_github_remote.ps1
.\collect_github_remote_evidence.ps1
gh run list --limit 5
```

Public preview URL:

```text
https://joonhyoun988-droid.github.io/cmb-recommended-free-web/
```

## Required Evidence After Push

Already added back into `REMOTE_OPERATIONS_DATA_BRIDGE.md`:

- GitHub repository URL
- latest `CMB Frontend Proof` run URL
- latest `Deploy CMB Preview` run URL
- GitHub Pages preview URL
- artifact URL or run artifact name
- proof level promoted from `remote_ci_ready` to `remote_ci_proven` after the workflow passed
- proof level promoted to `preview_operational` after the Pages URL returned HTTP 200

## Safety Boundary

The repo is prepared as a public demo:

- demo login only: `DEMO01 / 0000`
- no real operator PIN
- no private Apps Script URL
- no spreadsheet ID
- generated raw reports and screenshots ignored by Git
