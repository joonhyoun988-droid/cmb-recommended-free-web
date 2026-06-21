param(
  [string]$Repo = "joonhyoun988-droid/cmb-recommended-free-web",
  [string]$Branch = "main",
  [string[]]$Contexts = @("frontend-proof"),
  [switch]$EnforceAdmins,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

.\check_github_auth.ps1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "GitHub auth is not healthy. Run .\check_github_auth.ps1 -TryRefresh or -OpenLogin."
}

$payload = [ordered]@{
  required_status_checks = [ordered]@{
    strict = $true
    contexts = $Contexts
  }
  enforce_admins = [bool]$EnforceAdmins
  required_pull_request_reviews = $null
  restrictions = $null
  required_linear_history = $false
  allow_force_pushes = $false
  allow_deletions = $false
  block_creations = $false
  required_conversation_resolution = $true
}

$json = $payload | ConvertTo-Json -Depth 8
Write-Output $json

if ($DryRun) {
  Write-Output "DryRun only. No GitHub branch protection changes were applied."
  exit 0
}

$temp = Join-Path $env:TEMP "cmb-branch-protection.json"
[System.IO.File]::WriteAllText($temp, $json, (New-Object System.Text.UTF8Encoding($false)))

gh api --method PUT "repos/$Repo/branches/$Branch/protection" `
  -H "Accept: application/vnd.github+json" `
  --input $temp

Write-Output "Required checks configured for ${Repo}@${Branch}: $($Contexts -join ', ')"
