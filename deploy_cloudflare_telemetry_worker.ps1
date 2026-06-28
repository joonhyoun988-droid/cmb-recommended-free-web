param(
  [switch]$Login,
  [switch]$CreateKv,
  [string]$KvId = "",
  [switch]$Deploy
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root
$WranglerConfig = Join-Path $Root "wrangler.toml"
$WranglerExample = Join-Path $Root "cloudflare\wrangler.toml.example"

function Invoke-Wrangler([string]$Arguments) {
  cmd /c "npx wrangler $Arguments"
  if ($LASTEXITCODE -ne 0) { throw "wrangler command failed: $Arguments" }
}

if (-not $Login -and -not $CreateKv -and -not $KvId -and -not $Deploy) {
  Write-Output "DRY_RUN: no Cloudflare resource was created."
  Write-Output "APPROVAL_NEEDED_NOW:"
  Write-Output "- action: Cloudflare browser login"
  Write-Output "- why_needed: Workers deploy and KV namespace creation require your Cloudflare account."
  Write-Output "- risk: browser login grants Wrangler permission to deploy this Worker from this computer."
  Write-Output "- safe_boundary: no secrets are printed or committed; wrangler.toml stays local."
  Write-Output "- exact_command_or_account_step: .\deploy_cloudflare_telemetry_worker.ps1 -Login"
  Write-Output "- rollback_or_cancel: cancel in the browser or run npx wrangler logout."
  Write-Output ""
  Write-Output "Next commands after login:"
  Write-Output "1. .\deploy_cloudflare_telemetry_worker.ps1 -CreateKv"
  Write-Output "2. .\deploy_cloudflare_telemetry_worker.ps1 -KvId <created_kv_id>"
  Write-Output "3. .\deploy_cloudflare_telemetry_worker.ps1 -Deploy"
  exit 0
}

if ($Login) {
  Invoke-Wrangler "login"
}

if ($CreateKv) {
  Invoke-Wrangler "kv namespace create CMB_TELEMETRY"
  Write-Output "Copy the produced id, then run:"
  Write-Output ".\deploy_cloudflare_telemetry_worker.ps1 -KvId <created_kv_id>"
}

if ($KvId) {
  $config = Get-Content -LiteralPath $WranglerExample -Raw
  $config = $config.Replace("replace_with_kv_namespace_id", $KvId)
  [System.IO.File]::WriteAllText($WranglerConfig, $config, (New-Object System.Text.UTF8Encoding($true)))
  Write-Output "WROTE_LOCAL_WRANGLER_CONFIG: $WranglerConfig"
  Write-Output "This file is ignored by Git and should not contain account secrets."
}

if ($Deploy) {
  if (-not (Test-Path -LiteralPath $WranglerConfig)) {
    throw "wrangler.toml is missing. Run with -KvId <created_kv_id> first."
  }
  $configText = Get-Content -LiteralPath $WranglerConfig -Raw
  if ($configText -match "replace_with_kv_namespace_id") {
    throw "wrangler.toml still has placeholder KV id."
  }
  Invoke-Wrangler "deploy"
}
