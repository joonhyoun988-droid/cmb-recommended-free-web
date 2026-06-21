param(
  [string]$Repo = "joonhyoun988-droid/cmb-recommended-free-web",
  [switch]$SkipPush,
  [switch]$WatchRuns
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Run-Step([string]$Label, [scriptblock]$Block) {
  Write-Output ""
  Write-Output "== $Label =="
  & $Block
}

function Ensure-Auth {
  Run-Step "GitHub auth preflight" {
    .\check_github_auth.ps1
  }
  if ($LASTEXITCODE -eq 0) { return }

  Run-Step "GitHub auth refresh" {
    .\check_github_auth.ps1 -TryRefresh
  }
  if ($LASTEXITCODE -eq 0) { return }

  Run-Step "GitHub browser login fallback" {
    .\check_github_auth.ps1 -OpenLogin
  }
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub auth is still blocked. Complete the browser login, then rerun deploy_github_remote.ps1."
  }
}

function Ensure-Remote([string]$RepoName) {
  $remoteUrl = "https://github.com/$RepoName.git"
  $existing = git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($existing)) {
    git remote add origin $remoteUrl
    return
  }
  if ($existing.Trim() -ne $remoteUrl) {
    git remote set-url origin $remoteUrl
  }
}

Ensure-Auth

Run-Step "Repository check" {
  gh repo view $Repo --json name,url,visibility,defaultBranchRef
}
if ($LASTEXITCODE -ne 0) {
  Run-Step "Repository create" {
    $name = ($Repo -split "/")[-1]
    gh repo create $name --public --description "CMB inventory public preview"
  }
}

Ensure-Remote $Repo

Run-Step "Local Git status" {
  git status --short
}

if (-not $SkipPush) {
  Run-Step "Push main" {
    git push -u origin main
  }
}

Run-Step "Recent workflow runs" {
  gh run list --repo $Repo --limit 10
}

if ($WatchRuns) {
  $runsJson = gh run list --repo $Repo --limit 2 --json databaseId,status,name | ConvertFrom-Json
  foreach ($run in $runsJson) {
    if ($run.status -ne "completed") {
      Run-Step "Watch $($run.name)" {
        gh run watch $run.databaseId --repo $Repo --exit-status
      }
    }
  }
}

Write-Output ""
Write-Output "Remote repo: https://github.com/$Repo"
Write-Output "Expected Pages URL after Deploy CMB Preview succeeds:"
Write-Output "https://joonhyoun988-droid.github.io/cmb-recommended-free-web/"
