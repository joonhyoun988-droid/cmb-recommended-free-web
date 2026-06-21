# WCAG Review Scope

Route: WORLD_CLASS_FRONTEND_PROOF_STACK_V8_04
Proof level: local_static

| Item | Automation | Status | Manual needed |
|---|---|---|---|
| Keyboard order | Playwright Tab smoke | covered_local_smoke | Review full workflow order on mobile and desktop. |
| Contrast | axe color-contrast, Lighthouse accessibility | manual_review_needed | Gradients and visual context may require human review. |
| Labels and names | axe + static label check | covered | Confirm Korean labels are meaningful to field workers. |
| Error help | static invalid-state class | partial | Confirm actual validation messages in each business flow. |
| Zoom/reflow | mobile screenshot | partial | Manual 200% zoom/reflow pass before production. |
| Motion | prefers-reduced-motion CSS | covered_static | Confirm no unexpected JS motion is added. |
