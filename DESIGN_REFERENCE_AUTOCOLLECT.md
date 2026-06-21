# CMB Design Reference Autocollect

Date: 2026-06-21
Route: `DESIGN_REQUEST_REFERENCE_INTAKE_GATE_V8_00`
Label: `reference_transformed`

This is not a copying list. It records the design DNA to adopt, what to reject, and how CMB transforms it for a Korean field inventory workflow.

| Reference | Source | Adopt | Reject | CMB transformation |
|---|---|---|---|---|
| GOV.UK Design System patterns | `https://design-system.service.gov.uk/patterns/` | Task-first patterns, plain labels, predictable form flow. | Government visual identity and content tone. | Field worker flow is kept as direct actions: search, count, send, queue. |
| WCAG 2.2 | `https://www.w3.org/TR/WCAG22/` | Keyboard focus, contrast, input assistance, reduced motion expectations. | Treating accessibility as a final checklist only. | CSS now includes focus-visible, invalid, disabled/loading, reduced-motion support. |
| WAI Forms Tutorial | `https://www.w3.org/WAI/tutorials/forms/` | Labels, instructions, input purpose, error recovery. | Long explanatory copy inside the app. | Inputs keep nearby labels and clear state styling without tutorial text clutter. |
| Operational SaaS command surfaces | Internal AI-OS design route `SAAS_OPERATING_SURFACE_PATTERN_PACK_V7_37` | Dense but readable panels, primary action hierarchy, status badges, audit/queue visibility. | Landing-page hero, oversized decoration, generic cards. | CMB uses command deck, KPI strip, inventory table, mobile count cards, queue/audit panels. |

## Extracted DNA

- Start with the operator's job, not marketing.
- Keep the current state visible before asking for an action.
- Make primary actions obvious and repeated actions predictable.
- Expose pending/offline changes instead of hiding sync risk.
- Treat focus, disabled, error, loading, and success as part of the design, not code leftovers.

## Evidence State

- Reference count: 4
- External official references: 3
- Internal operating-surface reference: 1
- Before screenshots: present
- After screenshots: present
- Browser interaction proof: partial
- Pixel regression proof: queued

## No-Overclaim

Claim allowed: `reference_transformed`
Claim blocked: `world_class_visual_system`, until the local design reference vault and screenshot regression diff are automated.
