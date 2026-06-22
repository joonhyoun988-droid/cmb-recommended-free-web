param(
  [string]$Owner = "joonhyoun988-droid",
  [string]$Title = "AI-OS Operating Board",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$commands = @(
  "gh auth refresh -h github.com -s project",
  "gh project create --owner $Owner --title `"$Title`"",
  "gh project field-create <project-number> --owner $Owner --name Stars --data-type number",
  "gh project field-create <project-number> --owner $Owner --name Lane --data-type text",
  "gh project field-create <project-number> --owner $Owner --name Decision --data-type single-select --single-select-options ADOPT,PILOT,QUEUE,REJECT,DATA_NEEDED",
  "gh project field-create <project-number> --owner $Owner --name Evidence --data-type text"
)

if (-not $Apply) {
  Write-Output "DRY_RUN: no GitHub project was created."
  $commands | ForEach-Object { Write-Output $_ }
  exit 0
}

Write-Output "Creating GitHub Project: $Title"
$projectJson = gh project create --owner $Owner --title $Title --format json
if ($LASTEXITCODE -ne 0) { throw "gh project create failed. Try: gh auth refresh -h github.com -s project" }
$project = $projectJson | ConvertFrom-Json
$number = $project.number
Write-Output "PROJECT_NUMBER=$number"

gh project field-create $number --owner $Owner --name "Stars" --data-type number | Out-Host
gh project field-create $number --owner $Owner --name "Lane" --data-type text | Out-Host
gh project field-create $number --owner $Owner --name "Decision" --data-type single-select --single-select-options "ADOPT,PILOT,QUEUE,REJECT,DATA_NEEDED" | Out-Host
gh project field-create $number --owner $Owner --name "Evidence" --data-type text | Out-Host

Write-Output "GitHub Project ready: $($project.url)"
