# Remote Release Recovery

Status: `active`

This file captures how CMB handles token expiry, GitHub remote proof, Pages bootstrap, and evidence churn.

## Mindmap

```mermaid
mindmap
  root((CMB Remote Release Recovery))
    Auth
      check_github_auth
      refresh
      browser login
      no token output
    Repository
      repo view
      repo create fallback
      remote origin
      safe directory
    CI
      frontend proof
      latest commit
      run URL
      artifact
    Pages
      workflow build type
      first enablement
      deploy run
      HTTP 200
    Evidence
      collect snapshot
      artifact retention
      no stale run IDs
      doc only changes ignored
    Limits
      required checks
      RUM not live
      operations telemetry not live
```

## Current World-Class Controls

- Auth preflight: `check_github_auth.ps1`
- Auth + deploy wrapper: `deploy_github_remote.ps1`
- Evidence collector: `collect_github_remote_evidence.ps1`
- CI artifact retention: `.github/workflows/cmb-frontend-proof.yml`
- Pages deployment: `.github/workflows/cmb-pages.yml`
- Required-check reliability: `cmb-frontend-proof.yml` runs on every push/PR so the required check is not left pending by path filters.

## Latest Evidence

- App/workflow proof SHA: `bb5bb181a7d6d5e2ffd21bf5a817f27c9ec054fd`
- Frontend proof run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911624373`
- Pages deploy run: `https://github.com/joonhyoun988-droid/cmb-recommended-free-web/actions/runs/27911356885`
- Pages URL: `https://joonhyoun988-droid.github.io/cmb-recommended-free-web/`
- Pages HTTP status: `200`
- Required check: branch protection requires always-on `frontend-proof`
- Artifact: `cmb-frontend-proof-bb5bb181a7d6d5e2ffd21bf5a817f27c9ec054fd`
- Artifact API: `https://api.github.com/repos/joonhyoun988-droid/cmb-recommended-free-web/actions/artifacts/7777527878`

## Remaining Gaps

- Real-user Web Vitals/RUM is still not live.
- Production observability is still a plan, not a live signal.
