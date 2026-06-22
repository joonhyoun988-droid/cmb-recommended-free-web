# CMB Upgrade Demand Governor

Route: `UPGRADE_DEMAND_GOVERNOR_V8_15`
Receipt: `UPGRADE_DEMAND_RECEIPT`

Status: `adopted_for_project`
Updated: 2026-06-22

| Lane | Status | Evidence | Next forced action |
|---|---|---|---|
| `SIGNAL_INTAKE_LANE` | PASS | signal_source recorded before OS expansion | Capture whether the issue is owner frustration, repeated miss, metric, design gap, or project friction. |
| `TRIAGE_LANE` | PASS | `PROJECT_TASK`, `OS_CANDIDATE`, `DURABLE_RULE`, `AUTOMATION`, `DEFER`, `REJECT`, `RETIRE_MERGE` | Default one-off CMB bugs to project tasks, not permanent AI-OS rules. |
| `CADENCE_WIP_LANE` | PASS | WIP cap: one OS upgrade lane at a time; batch non-urgent candidates | Keep shipping/design work from being interrupted by every possible criterion. |
| `ROI_TOIL_LANE` | PASS | Compare value with time/token/file/report/maintenance/user-energy cost | Automate only repeated toil or high-risk failure paths. |
| `LIFECYCLE_LANE` | PASS | candidate -> pilot -> adopted -> enforced -> deprecated -> retired | Do not keep weak criteria forever. |
| `CLOSURE_LANE` | PASS | done / queued / blocked / data_needed / not_worth_it / revisit_on_trigger | End each improvement request with a state. |
| `NO_BLOAT_LANE` | PASS | reuse, merge, retire before durable rule | Prefer existing v8.11-v8.14 routes before adding more files. |
| `OWNER_ENERGY_LANE` | PASS | ship/project focus when owner fatigue appears | If fatigue rises, pause OS expansion and improve the visible project unless safety is at risk. |

```text
UPGRADE_DEMAND_RECEIPT:
- signal_source: endless-upgrade fatigue and 0.01% comparison pressure
- triage_class: DURABLE_RULE because this affects every future AI-OS upgrade
- urgency: medium; prevents bloat and owner fatigue
- value_score: 5
- toil_score: 5
- risk_score: 3
- complexity_score: 2
- owner_energy_state: protect_delivery_focus
- lifecycle_stage: adopted
- cadence_bucket: next-batch unless safety/high-risk/repeated miss
- closure_state: done
- next_trigger: repeated upgrade fatigue, report bloat, or new-rule cascade
- evidence: AI-OS v8.15 gate, this project adoption doc
```
