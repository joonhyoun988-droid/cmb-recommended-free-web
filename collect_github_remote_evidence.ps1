param(
  [string]$Repo = "joonhyoun988-droid/cmb-recommended-free-web",
  [string]$OutPath = "REMOTE_EVIDENCE_SNAPSHOT.json"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

function Invoke-GhJson([string[]]$GhArgs) {
  $raw = & gh @GhArgs
  if ($LASTEXITCODE -ne 0) {
    throw "gh command failed: gh $($GhArgs -join ' ')"
  }
  $text = ($raw -join "`n")
  if ([string]::IsNullOrWhiteSpace($text)) { return $null }
  return $text | ConvertFrom-Json
}

.\check_github_auth.ps1 | Out-Host
if ($LASTEXITCODE -ne 0) {
  throw "GitHub auth is not healthy. Run .\check_github_auth.ps1 -TryRefresh or -OpenLogin."
}

$headSha = (git rev-parse HEAD).Trim()
$shortHead = (git rev-parse --short HEAD).Trim()
$repoInfo = Invoke-GhJson @("repo","view",$Repo,"--json","name,url,visibility,defaultBranchRef")
$runs = Invoke-GhJson @("run","list","--repo",$Repo,"--limit","20","--json","databaseId,name,status,conclusion,createdAt,url,event,headSha")
$proofRun = $runs | Where-Object { $_.name -eq "CMB Frontend Proof" -and $_.conclusion -eq "success" } | Select-Object -First 1
$deployRun = $runs | Where-Object { $_.name -eq "Deploy CMB Preview" -and $_.conclusion -eq "success" } | Select-Object -First 1
$pages = Invoke-GhJson @("api","repos/$Repo/pages")

$artifact = $null
if ($proofRun) {
  $artifactData = Invoke-GhJson @("api","repos/$Repo/actions/runs/$($proofRun.databaseId)/artifacts")
  if ($artifactData -and $artifactData.artifacts) {
    $artifact = $artifactData.artifacts | Select-Object -First 1
  }
}

$statusCode = $null
if ($pages -and $pages.html_url) {
  try {
    $response = Invoke-WebRequest -Uri $pages.html_url -UseBasicParsing -TimeoutSec 20
    $statusCode = [int]$response.StatusCode
  } catch {
    $statusCode = "error: $($_.Exception.Message)"
  }
}

$snapshot = [pscustomobject]@{
  collectedAt = (Get-Date).ToString("s")
  repo = $Repo
  headSha = $headSha
  shortHead = $shortHead
  repository = $repoInfo
  proofRun = $proofRun
  deployRun = $deployRun
  pages = $pages
  pagesHttpStatus = $statusCode
  artifact = $artifact
  proofLevel = if ($proofRun -and $deployRun -and $statusCode -eq 200) { "preview_operational" } elseif ($proofRun) { "remote_ci_proven" } else { "remote_ci_ready" }
}

$json = $snapshot | ConvertTo-Json -Depth 8
[System.IO.File]::WriteAllText((Join-Path (Get-Location) $OutPath), $json, (New-Object System.Text.UTF8Encoding($true)))
Write-Output $json
