# CMB Free Web Redesign Brief

Token: `DESIGN_REQUEST_REFERENCE_INTAKE_GATE_V8_00`
State: `assumption_locked`

## Question Card

| Slot | Selection |
|---|---|
| style_target | dense operations console with stronger command-deck contrast |
| change_magnitude | visible refresh, not a framework rewrite |
| reference_policy | public design-system anchors plus existing CMB workflow |
| proof_policy | before/after desktop and mobile screenshots, JS syntax check, DOM smoke check |

## Reference DNA

- Shopify Polaris: admin work surfaces should rely on predictable components, action hierarchy, state badges, and dense but readable controls.
- Atlassian Design System: foundations, tokens, and component consistency should drive the UI before one-off decoration.
- Carbon/USWDS style baseline: operational tables need clear hierarchy, restrained color, accessible contrast, and explicit states.

## Direction Lock

Selected direction: `field command console`.

Visible deltas:

- first viewport becomes a darker command deck with clearer primary actions;
- status metrics gain stronger hierarchy and category color;
- table, count cards, queue, map, and settings share one component language;
- mobile keeps the count cards first and increases input/action clarity;
- palette moves from one-note green to green + amber + blue + warm neutral.

## Proof Plan

- Preserve old screenshots as `preview_before_desktop.png` and `preview_before_mobile.png`.
- Generate new `preview_desktop.png` and `preview_mobile.png`.
- Run `node --check app.js`.
- Smoke-check the DOM for the main heading, save button, count cards, and inventory table.

## Residual Risks

- This is still a static free-web prototype until a real backend or Apps Script endpoint is connected.
- The visual redesign does not prove real Google Sheets write performance.
