param(
  [string]$Url = "http://127.0.0.1:8767/index.html",
  [string]$NodePath = "C:\Users\joonh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
  [int]$Port = 8767
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $Root "local-preview-server.mjs"
$DesktopShot = Join-Path $Root "preview_desktop.png"
$MobileShot = Join-Path $Root "preview_mobile.png"
$server = $null

try {
  $server = Start-Process -FilePath $NodePath -ArgumentList $ServerPath -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  Start-Sleep -Seconds 2
  Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null

  cmd /c npx playwright screenshot --viewport-size=1440,980 $Url $DesktopShot
  cmd /c npx playwright screenshot --viewport-size=390,1300 $Url $MobileShot

  & $NodePath --check (Join-Path $Root "app.js")

  $html = Get-Content -LiteralPath (Join-Path $Root "index.html") -Raw
  $css = Get-Content -LiteralPath (Join-Path $Root "styles.css") -Raw
  $desktop = Get-Item -LiteralPath $DesktopShot
  $mobile = Get-Item -LiteralPath $MobileShot

  $checks = [ordered]@{
    url = $Url
    htmlLoaded = $html.Length -gt 1000
    jsSyntax = $true
    desktopScreenshotBytes = $desktop.Length
    mobileScreenshotBytes = $mobile.Length
    hasLabels = ([regex]::Matches($html, "<label\b")).Count -ge 1
    hasButtons = ([regex]::Matches($html, "<button\b")).Count -ge 1
    hasInputs = ([regex]::Matches($html, "<input\b|<select\b")).Count -ge 1
    hasFocusVisible = $css.Contains(":focus-visible")
    hasReducedMotion = $css.Contains("prefers-reduced-motion")
    hasInvalidState = $css.Contains("aria-invalid")
    hasLoadingState = $css.Contains("is-loading")
  }

  $failed = @($checks.GetEnumerator() | Where-Object {
    ($_.Value -is [bool] -and -not $_.Value) -or
    ($_.Key -like "*Bytes" -and [int64]$_.Value -lt 10000)
  })

  $summary = [ordered]@{
    status = if ($failed.Count -eq 0) { "PASS" } else { "FAIL" }
    failedCount = $failed.Count
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    checks = $checks
  }

  $summary | ConvertTo-Json -Depth 4
  if ($failed.Count -gt 0) { exit 1 }
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
}
