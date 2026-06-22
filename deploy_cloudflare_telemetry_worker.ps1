param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$commands = @(
  "npm install --save-dev wrangler",
  "npx wrangler login",
  "npx wrangler kv namespace create CMB_TELEMETRY",
  "copy cloudflare/wrangler.toml.example wrangler.toml and replace the KV id",
  "npx wrangler deploy"
)

if (-not $Apply) {
  Write-Output "DRY_RUN: no Cloudflare resource was created."
  $commands | ForEach-Object { Write-Output $_ }
  exit 0
}

if (-not (Test-Path -LiteralPath ".\wrangler.toml")) {
  throw "wrangler.toml is missing. Copy cloudflare/wrangler.toml.example to wrangler.toml and set KV id first."
}

npx wrangler deploy
