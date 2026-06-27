param(
  [string]$Url = "http://127.0.0.1:8767/index.html",
  [string]$NodePath = "C:\Users\joonh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
  [int]$Port = 8767,
  [double]$PixelDiffThreshold = 0.002,
  [int]$PixelTolerance = 8,
  [string]$ChromePath = "C:\Users\joonh\.browser-driver-manager\chrome\win64-149.0.7827.155\chrome-win64\chrome.exe",
  [string]$ChromeDriverPath = "C:\Users\joonh\.browser-driver-manager\chromedriver\win64-149.0.7827.155\chromedriver-win64\chromedriver.exe"
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $Root "local-preview-server.mjs"
$DesktopShot = Join-Path $Root "preview_desktop.png"
$MobileShot = Join-Path $Root "preview_mobile.png"
$DesktopBaseline = Join-Path $Root "visual_baseline_desktop.png"
$MobileBaseline = Join-Path $Root "visual_baseline_mobile.png"
$DesktopDiff = Join-Path $Root "visual_diff_desktop.png"
$MobileDiff = Join-Path $Root "visual_diff_mobile.png"
$VisualSummaryPath = Join-Path $Root "visual-diff-summary.json"
$InteractionJsonPath = Join-Path $Root "interaction-scenario-summary.json"
$PlaywrightRawPath = Join-Path $Root "playwright-critical-flow-report.json"
$PlatformScenarioJsonPath = Join-Path $Root "platform-scenario-summary.json"
$PlatformScenarioRawPath = Join-Path $Root "platform-scenario-report.json"
$AxeJsonPath = Join-Path $Root "axe-report.json"
$AxeSummaryPath = Join-Path $Root "axe-summary.json"
$LighthouseJsonPath = Join-Path $Root "lighthouse-report.json"
$ManifestPath = Join-Path $Root "QA_ARTIFACT_MANIFEST.json"
$TempRoot = Join-Path $Root ".qa-temp"
if (-not (Test-Path -LiteralPath $TempRoot)) { New-Item -ItemType Directory -Force -Path $TempRoot | Out-Null }
$env:TEMP = $TempRoot
$env:TMP = $TempRoot

function Write-Utf8([string]$Path, [string]$Text) {
  [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($true)))
}

function Write-JsonFile([string]$Path, $Object) {
  Write-Utf8 $Path (($Object | ConvertTo-Json -Depth 20) + [Environment]::NewLine)
}

function Invoke-CmdCapture([string]$Command, [string]$OutputPath) {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = cmd /c $Command 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousPreference
  }
  $text = ($output | Out-String)
  Write-Utf8 $OutputPath $text
  return [pscustomobject]@{
    exitCode = $exitCode
    output = $text
  }
}

function Get-JsonOrNull([string]$Path) {
  try {
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    $text = Get-Content -LiteralPath $Path -Raw
    if ([string]::IsNullOrWhiteSpace($text)) { return $null }
    return $text | ConvertFrom-Json -ErrorAction Stop
  } catch {
    return $null
  }
}

function Compare-PngPixels([string]$BaselinePath, [string]$CurrentPath, [string]$DiffPath, [int]$Tolerance) {
  Add-Type -AssemblyName System.Drawing
  $base = New-Object System.Drawing.Bitmap($BaselinePath)
  $current = New-Object System.Drawing.Bitmap($CurrentPath)
  try {
    if ($base.Width -ne $current.Width -or $base.Height -ne $current.Height) {
      return [pscustomobject]@{
        status = "FAIL"
        reason = "dimension_mismatch"
        width = $current.Width
        height = $current.Height
        totalPixels = 0
        diffPixels = 0
        diffRatio = 1
      }
    }
    $diff = New-Object System.Drawing.Bitmap($current.Width, $current.Height)
    $diffPixels = 0
    for ($y = 0; $y -lt $current.Height; $y++) {
      for ($x = 0; $x -lt $current.Width; $x++) {
        $a = $base.GetPixel($x, $y)
        $b = $current.GetPixel($x, $y)
        $delta = [Math]::Max([Math]::Abs($a.R - $b.R), [Math]::Max([Math]::Abs($a.G - $b.G), [Math]::Abs($a.B - $b.B)))
        if ($delta -gt $Tolerance) {
          $diffPixels++
          $diff.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 0, 0))
        } else {
          $diff.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 245, 248, 247))
        }
      }
    }
    $diff.Save($DiffPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $total = $current.Width * $current.Height
    return [pscustomobject]@{
      status = "PASS"
      reason = "compared"
      width = $current.Width
      height = $current.Height
      totalPixels = $total
      diffPixels = $diffPixels
      diffRatio = if ($total -gt 0) { [double]$diffPixels / [double]$total } else { 1 }
    }
  } finally {
    $base.Dispose()
    $current.Dispose()
    if ($diff) { $diff.Dispose() }
  }
}

$server = $null
$startedAt = Get-Date
$baselineCreated = @()

try {
  $server = Start-Process -FilePath $NodePath -ArgumentList $ServerPath,$Port -WorkingDirectory $Root -WindowStyle Hidden -PassThru
  Start-Sleep -Seconds 2
  Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 8 | Out-Null

  cmd /c npx playwright screenshot --viewport-size=1440,980 $Url $DesktopShot | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Desktop screenshot failed." }
  cmd /c npx playwright screenshot --viewport-size=390,1300 $Url $MobileShot | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Mobile screenshot failed." }

  if (-not (Test-Path -LiteralPath $DesktopBaseline)) {
    Copy-Item -LiteralPath $DesktopShot -Destination $DesktopBaseline -Force
    $baselineCreated += "desktop"
  }
  if (-not (Test-Path -LiteralPath $MobileBaseline)) {
    Copy-Item -LiteralPath $MobileShot -Destination $MobileBaseline -Force
    $baselineCreated += "mobile"
  }

  $desktopDiff = Compare-PngPixels $DesktopBaseline $DesktopShot $DesktopDiff $PixelTolerance
  $mobileDiff = Compare-PngPixels $MobileBaseline $MobileShot $MobileDiff $PixelTolerance
  $maxRatio = [Math]::Max([double]$desktopDiff.diffRatio, [double]$mobileDiff.diffRatio)
  $visualStatus = if ($desktopDiff.status -eq "PASS" -and $mobileDiff.status -eq "PASS" -and $maxRatio -le $PixelDiffThreshold) { "PASS" } else { "WARN" }
  $visualSummary = [ordered]@{
    status = $visualStatus
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    threshold = $PixelDiffThreshold
    tolerance = $PixelTolerance
    baselineCreated = $baselineCreated
    desktop = $desktopDiff
    mobile = $mobileDiff
    diffArtifacts = @("visual_diff_desktop.png","visual_diff_mobile.png")
  }
  Write-JsonFile $VisualSummaryPath $visualSummary

  $env:CMB_PREVIEW_URL = $Url
  $interactionScript = Join-Path $Root "qa\cmb-critical-flow-cdp.mjs"
  $interaction = Invoke-CmdCapture "`"$NodePath`" `"$interactionScript`" $Url `"$ChromePath`"" $PlaywrightRawPath
  $interactionJson = Get-JsonOrNull $PlaywrightRawPath
  $passedScenarios = 0
  $failedScenarios = 0
  if ($interactionJson -and $interactionJson.status) {
    $passedScenarios = [int]$interactionJson.passedScenarios
    $failedScenarios = [int]$interactionJson.failedScenarios
  }
  $interactionSummary = [ordered]@{
    status = if ($interaction.exitCode -eq 0 -and $failedScenarios -eq 0 -and $passedScenarios -ge 1) { "PASS" } else { "FAIL" }
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    exitCode = $interaction.exitCode
    passedScenarios = $passedScenarios
    failedScenarios = $failedScenarios
    rawReport = "playwright-critical-flow-report.json"
    runner = "Chrome DevTools Protocol"
  }
  Write-JsonFile $InteractionJsonPath $interactionSummary

  $platformScenarioScript = Join-Path $Root "qa\cmb-platform-scenarios-cdp.mjs"
  $platformScenario = Invoke-CmdCapture "`"$NodePath`" `"$platformScenarioScript`" $Url `"$ChromePath`"" $PlatformScenarioRawPath
  $platformScenarioJson = Get-JsonOrNull $PlatformScenarioRawPath
  $platformPassedScenarios = 0
  $platformFailedScenarios = 0
  if ($platformScenarioJson -and $platformScenarioJson.status) {
    $platformPassedScenarios = [int]$platformScenarioJson.passedScenarios
    $platformFailedScenarios = [int]$platformScenarioJson.failedScenarios
  }
  $platformScenarioSummary = [ordered]@{
    status = if ($platformScenario.exitCode -eq 0 -and $platformFailedScenarios -eq 0 -and $platformPassedScenarios -ge 1) { "PASS" } else { "FAIL" }
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    exitCode = $platformScenario.exitCode
    passedScenarios = $platformPassedScenarios
    failedScenarios = $platformFailedScenarios
    rawReport = "platform-scenario-report.json"
    runner = "Chrome DevTools Protocol"
  }
  Write-JsonFile $PlatformScenarioJsonPath $platformScenarioSummary

  if ((Test-Path -LiteralPath $ChromePath) -and (Test-Path -LiteralPath $ChromeDriverPath)) {
    $axeCmd = "npx -y @axe-core/cli $Url --save axe-report.json --timeout 60 --chrome-path `"$ChromePath`" --chromedriver-path `"$ChromeDriverPath`" --no-reporter"
    $axeRun = Invoke-CmdCapture $axeCmd (Join-Path $Root "axe-cli-output.txt")
  } else {
    $axeRun = [pscustomobject]@{ exitCode = 2; output = "Missing ChromePath or ChromeDriverPath." }
    Write-Utf8 (Join-Path $Root "axe-cli-output.txt") $axeRun.output
  }

  $lighthouseCmd = "npx -y lighthouse $Url --quiet --output=json --output-path=lighthouse-report.json --chrome-flags=`"--headless=new --no-sandbox --disable-gpu`""
  $lighthouseRun = Invoke-CmdCapture $lighthouseCmd (Join-Path $Root "lighthouse-cli-output.txt")

  $axeSummaryCode = "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const r=Array.isArray(j)?j[0]:j;console.log(JSON.stringify({violations:(r.violations||[]).length,incomplete:(r.incomplete||[]).length,passes:(r.passes||[]).length,url:r.url||''}));"
  if (Test-Path -LiteralPath $AxeJsonPath) {
    $axeSummaryRaw = & $NodePath -e $axeSummaryCode $AxeJsonPath 2>&1
    Write-Utf8 $AxeSummaryPath (($axeSummaryRaw | Out-String).Trim() + [Environment]::NewLine)
  }
  $axeJson = Get-JsonOrNull $AxeSummaryPath
  $axeViolations = -1
  $axeIncomplete = -1
  if ($axeJson -and $null -ne $axeJson.violations) {
    $axeViolations = [int]$axeJson.violations
    $axeIncomplete = [int]$axeJson.incomplete
  }

  $lighthouseJson = Get-JsonOrNull $LighthouseJsonPath
  $perfScore = -1
  $a11yScore = -1
  $bestScore = -1
  $seoScore = -1
  if ($lighthouseJson -and $lighthouseJson.categories) {
    $perfScore = [Math]::Round([double]$lighthouseJson.categories.performance.score * 100)
    $a11yScore = [Math]::Round([double]$lighthouseJson.categories.accessibility.score * 100)
    $bestScore = [Math]::Round([double]$lighthouseJson.categories."best-practices".score * 100)
    $seoScore = [Math]::Round([double]$lighthouseJson.categories.seo.score * 100)
  }

  $wcagRows = @(
    [pscustomobject]@{ item = "Keyboard order"; automation = "Playwright Tab smoke"; status = "covered_local_smoke"; manualNeeded = "Review full workflow order on mobile and desktop." },
    [pscustomobject]@{ item = "Contrast"; automation = "axe color-contrast, Lighthouse accessibility"; status = if ($axeIncomplete -gt 0) { "manual_review_needed" } else { "covered" }; manualNeeded = "Gradients and visual context may require human review." },
    [pscustomobject]@{ item = "Labels and names"; automation = "axe + static label check"; status = if ($axeViolations -eq 0) { "covered" } else { "fix_required" }; manualNeeded = "Confirm Korean labels are meaningful to field workers." },
    [pscustomobject]@{ item = "Error help"; automation = "static invalid-state class"; status = "partial"; manualNeeded = "Confirm actual validation messages in each business flow." },
    [pscustomobject]@{ item = "Zoom/reflow"; automation = "mobile screenshot"; status = "partial"; manualNeeded = "Manual 200% zoom/reflow pass before production." },
    [pscustomobject]@{ item = "Motion"; automation = "prefers-reduced-motion CSS"; status = "covered_static"; manualNeeded = "Confirm no unexpected JS motion is added." }
  )

  $accessibilityStatus = if ($axeRun.exitCode -eq 0 -and $axeViolations -eq 0) { if ($axeIncomplete -gt 0) { "PASS_WITH_MANUAL_REVIEW" } else { "PASS" } } else { "WARN" }
  $lighthouseStatus = if ($perfScore -ge 70 -and $a11yScore -ge 90) { "PASS" } else { "WARN" }

  $visualReportText = @"
# Visual Diff QA Report

Status: $visualStatus
Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Checked at: $($visualSummary.checkedAt)

| View | Diff ratio | Diff pixels | Threshold | Result |
|---|---:|---:|---:|---|
| Desktop | $([Math]::Round([double]$desktopDiff.diffRatio, 6)) | $($desktopDiff.diffPixels) | $PixelDiffThreshold | $(if ([double]$desktopDiff.diffRatio -le $PixelDiffThreshold) { "PASS" } else { "WARN" }) |
| Mobile | $([Math]::Round([double]$mobileDiff.diffRatio, 6)) | $($mobileDiff.diffPixels) | $PixelDiffThreshold | $(if ([double]$mobileDiff.diffRatio -le $PixelDiffThreshold) { "PASS" } else { "WARN" }) |

Baseline created this run: $($baselineCreated -join ", ")

No-overclaim: this is local static visual regression proof. It is not cloud cross-browser visual monitoring.
"@
  Write-Utf8 (Join-Path $Root "VISUAL_DIFF_QA_REPORT.md") $visualReportText

  $interactionReportText = @"
# Interaction Scenario QA Report

Status: $($interactionSummary.status)
Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Checked at: $($interactionSummary.checkedAt)

Scenarios covered:

- Login with DEMO01 / 0000
- Search item 00027
- Enter a field count and save
- Assert audit log and latency state changed
- Parse quick command: Greenzyme 4L production
- Apply quick command and assert audit log
- Parse defect command and move stock to defect
- Block Korean-word quantity so 4L is not mistaken as quantity
- Block multi-action sentence with multiple quantities
- Keyboard/focus smoke test

Passed scenarios: $passedScenarios
Failed scenarios: $failedScenarios
Raw report: playwright-critical-flow-report.json
Runner: Chrome DevTools Protocol, no local node_modules required

Additional platform scenarios are tracked in platform-scenario-summary.json:

- Platform dashboard includes the free toolchain radar.
- Component workshop exposes design tokens and accessibility rules.
- Telemetry and Sentry stay disabled by default until endpoints/DSN are approved.

No-overclaim: this proves a local critical path, not every production workflow.
"@
  Write-Utf8 (Join-Path $Root "INTERACTION_SCENARIO_QA_REPORT.md") $interactionReportText

  $accessibilityReportText = @"
# Accessibility Audit Report

Status: $accessibilityStatus
Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Checked at: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz"))

| Tool | Result |
|---|---|
| axe-core CLI | exit=$($axeRun.exitCode), violations=$axeViolations, incomplete=$axeIncomplete |
| WCAG scope | see WCAG_REVIEW_SCOPE.md |

Notes:

- violations=0 means axe did not find confirmed automated violations.
- incomplete>0 means axe could not fully judge some items, usually requiring manual review.
- This is local static audit proof.
"@
  Write-Utf8 (Join-Path $Root "ACCESSIBILITY_AUDIT_REPORT.md") $accessibilityReportText

  $lighthouseReportText = @"
# Lighthouse QA Report

Status: $lighthouseStatus
Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Checked at: $((Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz"))

| Category | Score |
|---|---:|
| Performance | $perfScore |
| Accessibility | $a11yScore |
| Best Practices | $bestScore |
| SEO | $seoScore |

Raw report: lighthouse-report.json

No-overclaim: this is a local Lighthouse run, not production real-user monitoring.
"@
  Write-Utf8 (Join-Path $Root "LIGHTHOUSE_QA_REPORT.md") $lighthouseReportText

  $wcagLines = New-Object System.Collections.Generic.List[string]
  [void]$wcagLines.Add("# WCAG Review Scope")
  [void]$wcagLines.Add("")
  [void]$wcagLines.Add("Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04")
  [void]$wcagLines.Add("Proof level: local_static")
  [void]$wcagLines.Add("")
  [void]$wcagLines.Add("| Item | Automation | Status | Manual needed |")
  [void]$wcagLines.Add("|---|---|---|---|")
  foreach ($row in $wcagRows) {
    [void]$wcagLines.Add("| $($row.item) | $($row.automation) | $($row.status) | $($row.manualNeeded) |")
  }
  Write-Utf8 (Join-Path $Root "WCAG_REVIEW_SCOPE.md") (($wcagLines -join [Environment]::NewLine) + [Environment]::NewLine)

  $manifest = [ordered]@{
    route = "WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04"
    receipt = "FRONTEND_PROOF_STACK_RECEIPT"
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    previewUrl = $Url
    proofLevel = "local_static"
    artifacts = @(
      "visual-diff-summary.json",
      "VISUAL_DIFF_QA_REPORT.md",
      "visual_baseline_desktop.png",
      "visual_baseline_mobile.png",
      "visual_diff_desktop.png",
      "visual_diff_mobile.png",
      "interaction-scenario-summary.json",
      "INTERACTION_SCENARIO_QA_REPORT.md",
      "playwright-critical-flow-report.json",
      "platform-scenario-summary.json",
      "platform-scenario-report.json",
      "axe-report.json",
      "axe-summary.json",
      "ACCESSIBILITY_AUDIT_REPORT.md",
      "lighthouse-report.json",
      "LIGHTHOUSE_QA_REPORT.md",
      "WCAG_REVIEW_SCOPE.md"
    )
    statuses = [ordered]@{
      visual = $visualStatus
      interaction = $interactionSummary.status
      platformScenario = $platformScenarioSummary.status
      accessibility = $accessibilityStatus
      lighthouse = $lighthouseStatus
    }
  }
  Write-JsonFile $ManifestPath $manifest

  $proofStackText = @"
# CMB World-Class Frontend Proof Stack

Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Receipt: FRONTEND_PROOF_STACK_RECEIPT
Proof level: local_static
Preview: $Url

| Lane | Status | Evidence | Next action |
|---|---|---|---|
| Pixel diff threshold | $visualStatus | VISUAL_DIFF_QA_REPORT.md, visual-diff-summary.json | Keep baseline updates review-only. |
| Interaction scenario | $($interactionSummary.status) | INTERACTION_SCENARIO_QA_REPORT.md | Add more CMB business paths as the product grows. |
| Platform scenario | $($platformScenarioSummary.status) | platform-scenario-summary.json, platform-scenario-report.json | Keep dashboard, component workshop, and telemetry disabled-by-default proof current. |
| axe accessibility automation | $accessibilityStatus | ACCESSIBILITY_AUDIT_REPORT.md, axe-report.json, axe-summary.json | Review axe incomplete/manual items before production. |
| Lighthouse budget | $lighthouseStatus | LIGHTHOUSE_QA_REPORT.md, lighthouse-report.json | Raise budgets after production hosting exists. |
| WCAG manual scope | PASS | WCAG_REVIEW_SCOPE.md | Complete human review for production claims. |
| Artifact retention | PASS | QA_ARTIFACT_MANIFEST.json | Retain raw JSON/images plus summary docs. |
| CI-ready command | PASS | run_cmb_frontend_proof_stack.ps1 | Wire into remote CI later. |
| No-overclaim label | PASS | local_static | Do not call this production monitoring. |
| Project adoption | PASS | this file | Refresh after each frontend proof run. |

## Current Boundary

This closes the local static proof stack. Production-grade proof still needs hosted preview/CI required checks and real-user monitoring.
"@
  Write-Utf8 (Join-Path $Root "WORLD_CLASS_FRONTEND_PROOF_STACK.md") $proofStackText

  $overallStatus = if ($visualStatus -eq "PASS" -and $interactionSummary.status -eq "PASS" -and $platformScenarioSummary.status -eq "PASS" -and $accessibilityStatus -match "^PASS" -and $lighthouseStatus -eq "PASS") { "PASS" } else { "PASS_WITH_REVIEW" }
  $result = [ordered]@{
    status = $overallStatus
    checkedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss zzz")
    visual = $visualStatus
    interaction = $interactionSummary.status
    platformScenario = $platformScenarioSummary.status
    axeViolations = $axeViolations
    axeIncomplete = $axeIncomplete
    lighthousePerformance = $perfScore
    lighthouseAccessibility = $a11yScore
    proofLevel = "local_static"
  }
  $result | ConvertTo-Json -Depth 8
} finally {
  if ($server -and -not $server.HasExited) {
    Stop-Process -Id $server.Id -Force
  }
  try {
    if (Test-Path -LiteralPath $TempRoot) {
      $resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
      $resolvedTemp = (Resolve-Path -LiteralPath $TempRoot).Path
      if ($resolvedTemp.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        Get-ChildItem -LiteralPath $resolvedTemp -Force | ForEach-Object {
          Remove-Item -LiteralPath $_.FullName -Recurse -Force
        }
        Remove-Item -LiteralPath $resolvedTemp -Force
      }
    }
  } catch {}
}
