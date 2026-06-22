param(
  [string]$Owner = "joonhyoun988-droid",
  [string]$Title = "AI-OS Evolution Board",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$commands = @(
  "gh auth refresh -h github.com --scopes read:project,project",
  "gh project create --owner $Owner --title `"$Title`"",
  "gh project field-create <project-number> --owner $Owner --name Stars --data-type NUMBER",
  "gh project field-create <project-number> --owner $Owner --name Lane --data-type SINGLE_SELECT --single-select-options `"OS Core,Project Delivery,Design,Automation,Ops,Security,Data,Research,Cleanup`"",
  "gh project field-create <project-number> --owner $Owner --name Project --data-type TEXT",
  "gh project field-create <project-number> --owner $Owner --name Decision --data-type SINGLE_SELECT --single-select-options `"ADOPT,PILOT,QUEUE,REJECT,DATA_NEEDED,DONE`"",
  "gh project field-create <project-number> --owner $Owner --name Evidence --data-type TEXT",
  "gh project field-create <project-number> --owner $Owner --name `"Next action`" --data-type TEXT"
)

if (-not $Apply) {
  Write-Output "DRY_RUN: no GitHub project was created."
  $commands | ForEach-Object { Write-Output $_ }
  exit 0
}

Write-Output "Creating GitHub Project: $Title"
$projectJson = gh project create --owner $Owner --title $Title --format json
if ($LASTEXITCODE -ne 0) { throw "gh project create failed. Try: gh auth refresh -h github.com --scopes read:project,project" }
$project = $projectJson | ConvertFrom-Json
$number = $project.number
Write-Output "PROJECT_NUMBER=$number"

gh project field-create $number --owner $Owner --name "Stars" --data-type NUMBER | Out-Host
gh project field-create $number --owner $Owner --name "Lane" --data-type SINGLE_SELECT --single-select-options "OS Core,Project Delivery,Design,Automation,Ops,Security,Data,Research,Cleanup" | Out-Host
gh project field-create $number --owner $Owner --name "Project" --data-type TEXT | Out-Host
gh project field-create $number --owner $Owner --name "Decision" --data-type SINGLE_SELECT --single-select-options "ADOPT,PILOT,QUEUE,REJECT,DATA_NEEDED,DONE" | Out-Host
gh project field-create $number --owner $Owner --name "Evidence" --data-type TEXT | Out-Host
gh project field-create $number --owner $Owner --name "Next action" --data-type TEXT | Out-Host

Write-Output "GitHub Project ready: $($project.url)"
