# CMB Real User Data Privacy Boundary

Status: ready_not_live

## Collection Boundary

- no secrets
- no sensitive PII
- no PIN, password, token, spreadsheet ID, phone number, or exact personal identifier in analytics events
- purpose: measure reliability, speed, and usability of CMB inventory workflows
- retention: 30 days by default unless the owner approves a longer period
- sampling: start small; increase only when volume requires better signal

## Allowed Examples

- route name
- anonymous session id
- coarse device class
- page load timing
- save latency
- success or failure status
- app version

## Blocked Examples

- operator PIN
- full phone number
- private spreadsheet URL
- credential/token
- exact personal notes
- raw customer or employee data

## Review Rule

Before live collection, re-check this file and the event schema. If any event can identify a person or expose business data, block launch until it is removed or explicitly approved.
