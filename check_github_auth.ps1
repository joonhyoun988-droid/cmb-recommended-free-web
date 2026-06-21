param(
  [switch]$TryRefresh,
  [switch]$OpenLogin
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Run-AuthStatus {
  [Console]::Out.WriteLine("Running: gh auth status -h github.com")
  $output = & gh auth status -h github.com 2>&1
  $code = $LASTEXITCODE
  $output | ForEach-Object { [Console]::Out.WriteLine($_) }
  return [int]$code
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Output "GITHUB_AUTH: FAIL"
  Write-Output "GitHub CLI was not found on this computer."
  Write-Output "Install GitHub CLI, then run this script again."
  exit 2
}

$statusCode = Run-AuthStatus
if ($statusCode -eq 0) {
  Write-Output "GITHUB_AUTH: OK"
  Write-Output "You can resume: gh repo create cmb-recommended-free-web --public --source . --remote origin --push"
  exit 0
}

Write-Output "GITHUB_AUTH: WARN"
Write-Output "The saved GitHub login is invalid, expired, revoked, or missing a required scope."
Write-Output ""
Write-Output "Recommended safe commands:"
Write-Output "  gh auth refresh -h github.com -s repo,workflow"
Write-Output "  gh auth login -h github.com -p https -w"
Write-Output ""
Write-Output "Never run or save: gh auth status --show-token"

if ($TryRefresh) {
  Write-Output ""
  Write-Output "Trying refresh now: gh auth refresh -h github.com -s repo,workflow"
  & gh auth refresh -h github.com -s repo,workflow
  $refreshCode = $LASTEXITCODE
  Write-Output "Refresh exit code: $refreshCode"
  $statusCode = Run-AuthStatus
  if ($statusCode -eq 0) {
    Write-Output "GITHUB_AUTH: OK_AFTER_REFRESH"
    Write-Output "You can resume: gh repo create cmb-recommended-free-web --public --source . --remote origin --push"
    exit 0
  }
}

if ($OpenLogin) {
  Write-Output ""
  Write-Output "Opening browser login now: gh auth login -h github.com -p https -w"
  & gh auth login -h github.com -p https -w
  $loginCode = $LASTEXITCODE
  Write-Output "Login exit code: $loginCode"
  $statusCode = Run-AuthStatus
  if ($statusCode -eq 0) {
    Write-Output "GITHUB_AUTH: OK_AFTER_LOGIN"
    Write-Output "You can resume: gh repo create cmb-recommended-free-web --public --source . --remote origin --push"
    exit 0
  }
}

Write-Output ""
Write-Output "GITHUB_AUTH: STILL_BLOCKED"
Write-Output "After the browser approval succeeds, rerun this script, then resume the GitHub repo create command."
exit 2
