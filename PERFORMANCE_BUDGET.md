# CMB Performance Budget

Route: `WORLD_CLASS_DESIGN_STARTING_POINT_PARITY_V8_03`
Status: initial budget

This is a lightweight budget for the free/local prototype. It prevents the UI from becoming slow while design quality increases.

| Metric | Target | Why |
|---|---:|---|
| First usable local render | under 1.0s on local preview | field workers should not wait to start |
| Input visual response | under 100ms | counting must feel instant |
| Queued save UI feedback | under 150ms | server sync can be slower, but screen feedback must not be |
| Mobile viewport horizontal overflow | 0 unexpected page-level overflow | phone field work must not require sideways scroll |
| JS syntax check | pass every app script edit | avoid broken demo state |
| Screenshot evidence | desktop and mobile on every visual redesign | design claims need visible proof |

## Measurement Path

1. Run `node --check app.js` after script edits.
2. Open `http://127.0.0.1:8767/index.html` or the current local preview URL.
3. Confirm no page-level horizontal overflow on mobile width.
4. Capture desktop and mobile screenshots when browser policy allows.
5. For production migration, replace this with Lighthouse/Core Web Vitals and real mobile network measurements.

## No-Overclaim

This is not a Lighthouse proof yet. It is an initial performance guardrail so visual polish does not make the field workflow slower.
