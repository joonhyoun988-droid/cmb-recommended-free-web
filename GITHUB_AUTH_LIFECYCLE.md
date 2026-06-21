# GitHub Auth Lifecycle

Status: `blocked_by_invalid_gh_token`

This file keeps the CMB public-preview deployment from getting stuck when the local GitHub CLI login expires.

Beginner translation:

- `gh`: GitHub command tool.
- `auth`: login permission.
- `token`: the saved login pass on this computer.
- `refresh`: ask GitHub to repair or expand the saved pass.
- `login`: open the browser so the owner can approve a new pass.
- `push`: send local files to GitHub.
- `Actions`: GitHub's remote verification jobs.
- `Pages`: GitHub's free static website hosting.

## Safe Order

1. Check whether the saved login still works.

```powershell
gh auth status -h github.com
```

2. If the token is invalid or missing a scope, try refresh.

```powershell
gh auth refresh -h github.com -s repo,workflow
```

3. If refresh cannot fix it, use browser login.

```powershell
gh auth login -h github.com -p https -w
```

4. Confirm it is fixed.

```powershell
gh auth status -h github.com
```

5. Resume the blocked remote command.

```powershell
gh repo create cmb-recommended-free-web --public --source . --remote origin --push
```

## Do Not Do This

```powershell
gh auth status --show-token
```

Never paste a GitHub token into chat, save it in this folder, commit it to Git, or write it into `README.md`, workflow files, reports, or screenshots.

## CI Boundary

The local GitHub CLI token is only for this computer.

GitHub Actions should use GitHub's workflow token, such as `${{ github.token }}`, or a repository secret configured inside GitHub settings. Do not copy the local token into `.github/workflows`.

## Automation Boundary

The script can detect the problem and open the refresh/login route, but the owner may still need to approve the browser login, OAuth authorization, 2FA, or organization SSO.

That is intentional. Safe automation can guide the door; it should not secretly hold the key.
