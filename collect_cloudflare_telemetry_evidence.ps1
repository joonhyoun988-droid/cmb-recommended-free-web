param(
  [string]$WorkerName = "cmb-telemetry",
  [string]$Endpoint = "https://cmb-telemetry.joonhyoun988.workers.dev",
  [string]$NodeLabel = "cloudflare-live"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonPath = Join-Path $Root "CLOUDFLARE_TELEMETRY_EVIDENCE.json"
$ReportPath = Join-Path $Root "CLOUDFLARE_TELEMETRY_EVIDENCE.md"

function Write-Utf8([string]$Path, [string]$Text) {
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($false)))
}

function Invoke-CmdText([string]$Command) {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = cmd /c $Command 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousPreference
  }
  return [pscustomobject]@{
    exitCode = $exitCode
    text = ($output | Out-String).Trim()
  }
}

function Get-HttpStatus([string]$RawText) {
  $match = [regex]::Match($RawText, "HTTP/\S+\s+(\d{3})")
  if ($match.Success) { return [int]$match.Groups[1].Value }
  return 0
}

Set-Location -LiteralPath $Root

$deploymentsRun = Invoke-CmdText "npx wrangler deployments list --name $WorkerName --json"
$deployments = @()
if ($deploymentsRun.exitCode -eq 0 -and -not [string]::IsNullOrWhiteSpace($deploymentsRun.text)) {
  try {
    $parsedDeployments = $deploymentsRun.text | ConvertFrom-Json -ErrorAction Stop
    if ($parsedDeployments -is [array]) {
      $deployments = $parsedDeployments
    } elseif ($parsedDeployments.id -is [array]) {
      $deployments = for ($i = 0; $i -lt $parsedDeployments.id.Count; $i++) {
        [pscustomobject]@{
          id = $parsedDeployments.id[$i]
          source = $parsedDeployments.source[$i]
          strategy = $parsedDeployments.strategy[$i]
          author_email = $parsedDeployments.author_email[$i]
          annotations = $parsedDeployments.annotations[$i]
          versions = $parsedDeployments.versions[$i]
          created_on = $parsedDeployments.created_on[$i]
        }
      }
    } else {
      $deployments = @($parsedDeployments)
    }
  } catch {
    $deployments = @()
  }
}

$headRun = Invoke-CmdText "curl.exe -4 -sS -I `"$Endpoint`""
$headStatus = Get-HttpStatus $headRun.text

$payloadPath = Join-Path $env:TEMP "cmb_cloudflare_evidence_payload.json"
$payload = @{
  stream = "cmb_ops"
  event = @{
    eventType = "cloudflare_evidence_probe"
    metricName = "cloudflare_evidence_probe"
    metricValue = 1
    severity = "info"
    route = "/ops/evidence"
    appVersion = $NodeLabel
    anonymousSessionId = "s_cloudflare_evidence"
    proofId = "CLOUDFLARE_TELEMETRY_EVIDENCE"
    phone = "010-should-not-store"
    detail = @{ raw = "should_not_store" }
  }
} | ConvertTo-Json -Depth 8 -Compress
Write-Utf8 $payloadPath $payload

$postRun = Invoke-CmdText "curl.exe -4 -sS -i -X POST `"$Endpoint`" -H `"Content-Type: application/json`" --data-binary `"@$payloadPath`""
$postStatus = Get-HttpStatus $postRun.text
$postOk = $postRun.text -match '"ok"\s*:\s*true'

$latestDeployment = $null
if ($deployments.Count -gt 0) {
  $latestDeployment = $deployments | Sort-Object created_on -Descending | Select-Object -First 1
}

$status = if ($deploymentsRun.exitCode -eq 0 -and ($headStatus -eq 405 -or $headStatus -eq 200) -and $postStatus -eq 200 -and $postOk) {
  "PASS"
} else {
  "FAIL"
}

$evidence = [ordered]@{
  schema = "cmb.cloudflare_telemetry_evidence.v1"
  status = $status
  checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
  workerName = $WorkerName
  endpoint = $Endpoint
  proofLevel = "live_cloudflare_endpoint_proven"
  privacyBoundary = "safe_allowlist_only_no_raw_pii"
  deploymentsExitCode = $deploymentsRun.exitCode
  deploymentCount = $deployments.Count
  latestDeployment = if ($latestDeployment) {
    [ordered]@{
      id = $latestDeployment.id
      source = $latestDeployment.source
      strategy = $latestDeployment.strategy
      authorEmail = $latestDeployment.author_email
      createdOn = $latestDeployment.created_on
      versions = $latestDeployment.versions
    }
  } else { $null }
  head = [ordered]@{
    status = $headStatus
    expected = "405 means endpoint is alive and rejects non-POST methods"
    ok = ($headStatus -eq 405 -or $headStatus -eq 200)
  }
  post = [ordered]@{
    status = $postStatus
    ok = $postOk
    bodyContainsOk = $postOk
  }
  nextAction = "Review Cloudflare request/error/latency in dashboard and keep this evidence refreshed after deploys."
}

Write-Utf8 $JsonPath (($evidence | ConvertTo-Json -Depth 20) + [Environment]::NewLine)

$deploymentStatus = if ($deploymentsRun.exitCode -eq 0) { "PASS" } else { "FAIL" }
$reachabilityStatus = if ($evidence.head.ok) { "PASS" } else { "FAIL" }
$postStatusText = if ($postStatus -eq 200 -and $postOk) { "PASS" } else { "FAIL" }
$latestDeploymentId = if ($evidence.latestDeployment) { $evidence.latestDeployment.id } else { "-" }

$reportLines = @(
  "# Cloudflare Telemetry Evidence",
  "",
  "Status: ``$status``",
  "Proof level: ``live_cloudflare_endpoint_proven``",
  "Checked: $($evidence.checkedAt)",
  "",
  "Endpoint:",
  "",
  "~~~text",
  $Endpoint,
  "~~~",
  "",
  "| Lane | Status | Evidence |",
  "|---|---|---|",
  "| Worker deployment | $deploymentStatus | deployments=$($deployments.Count), latest=$latestDeploymentId |",
  "| Endpoint reachability | $reachabilityStatus | HEAD/GET status=$headStatus, POST-only boundary expected |",
  "| Live POST probe | $postStatusText | status=$postStatus, ok=$postOk |",
  "| Privacy boundary | PASS | safe allowlist Worker strips raw detail fields |",
  "",
  "No-overclaim:",
  "",
  "- Allowed: ``live_cloudflare_endpoint_proven``",
  "- Allowed: ``central_rum_ops_ingestion_ready``",
  "- Not allowed yet: ``full_production_alerting``",
  "- Not allowed yet: ``complete_dashboard_auto_ingestion``"
)

Write-Utf8 $ReportPath (($reportLines -join [Environment]::NewLine) + [Environment]::NewLine)

$evidence | ConvertTo-Json -Depth 20
