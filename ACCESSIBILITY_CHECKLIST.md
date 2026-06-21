# CMB Accessibility Checklist

Route: `WORLD_CLASS_DESIGN_STARTING_POINT_PARITY_V8_03`
Status: manual baseline

## Current Baseline

| Area | State | Evidence | Next Upgrade |
|---|---|---|---|
| Keyboard focus | present | `:focus-visible` styles | browser keyboard traversal proof |
| Contrast | partial | dark text and high-contrast primary actions | automated contrast check |
| Labels | present | labels wrap inputs/selects | form error text pattern |
| Reduced motion | present | `prefers-reduced-motion` rule | motion review after animation changes |
| Invalid input | present | `[aria-invalid="true"]` style | JS-driven validation example |
| Mobile touch target | partial | buttons and inputs use 42-48px minimum heights | field-device tap audit |
| Dialog | partial | native `dialog` element and backdrop | focus trap/return proof |

## Rule

Do not call the UI finished unless keyboard focus, labels, contrast, mobile touch targets, and error recovery are checked for the changed flow.

## Next Lowest Lane

Automated a11y proof is not present yet. A later production stack should add axe/Lighthouse or equivalent checks.
