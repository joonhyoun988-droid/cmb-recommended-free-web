param(
  [string]$AiOsRoot = "C:\Users\joonh\Documents\Codex\AI-OS",
  [string]$ProjectPath = ".",
  [string]$BranchName = "",
  [switch]$CreatePr,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
if ([string]::IsNullOrWhiteSpace($BranchName)) {
  $BranchName = "ai-os/adopt-project-criteria"
}

function Run-Git([string[]]$Args) {
  & git -C $ProjectPath @Args
  if ($LASTEXITCODE -ne 0) { throw "git $($Args -join ' ') failed" }
}

$status = & git -C $ProjectPath status --short
if ($status -and -not $DryRun) {
  throw "Worktree is not clean. Commit or stash changes before creating an adoption PR."
}

$commands = @(
  "git checkout $BranchName if it exists, otherwise git checkout -b $BranchName",
  "powershell -ExecutionPolicy Bypass -File $AiOsRoot\_tools\run_project_migration_cockpit_gate_v8_13.ps1 -Root $AiOsRoot -ProjectPath $ProjectPath -Apply -NoReport",
  "powershell -ExecutionPolicy Bypass -File $AiOsRoot\_tools\run_platform_circulation_loop_gate_v8_14.ps1 -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport",
  "powershell -ExecutionPolicy Bypass -File $AiOsRoot\_tools\run_upgrade_demand_governor_gate_v8_15.ps1 -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport",
  "powershell -ExecutionPolicy Bypass -File $AiOsRoot\_tools\run_platform_gap_execution_closure_gate_v8_16.ps1 -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport",
  "git add --all",
  "git commit -m `"Adopt AI-OS project criteria`"",
  "git push -u origin $BranchName",
  "gh pr create --draft --fill --base main --head $BranchName"
)

if ($DryRun) {
  $commands | ForEach-Object { Write-Output $_ }
  exit 0
}

& git -C $ProjectPath rev-parse --verify $BranchName 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  Run-Git @("checkout", $BranchName)
} else {
  Run-Git @("checkout", "-b", $BranchName)
}
& powershell -ExecutionPolicy Bypass -File (Join-Path $AiOsRoot "_tools\run_project_migration_cockpit_gate_v8_13.ps1") -Root $AiOsRoot -ProjectPath $ProjectPath -Apply -NoReport
& powershell -ExecutionPolicy Bypass -File (Join-Path $AiOsRoot "_tools\run_platform_circulation_loop_gate_v8_14.ps1") -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport
& powershell -ExecutionPolicy Bypass -File (Join-Path $AiOsRoot "_tools\run_upgrade_demand_governor_gate_v8_15.ps1") -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport
& powershell -ExecutionPolicy Bypass -File (Join-Path $AiOsRoot "_tools\run_platform_gap_execution_closure_gate_v8_16.ps1") -Root $AiOsRoot -ProjectPath $ProjectPath -NoReport
Run-Git @("add", "--all")
$changed = & git -C $ProjectPath status --short
if (-not $changed) {
  Write-Output "No adoption changes to commit."
  exit 0
}
Run-Git @("commit", "-m", "Adopt AI-OS project criteria")
Run-Git @("push", "-u", "origin", $BranchName)
if ($CreatePr) {
  & gh pr create --draft --fill --base main --head $BranchName
} else {
  Write-Output "Branch pushed. Re-run with -CreatePr to open a draft PR."
}
