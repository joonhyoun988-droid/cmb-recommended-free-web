# CMB Collaborative Verification Contract

The first implementation is acceptable only when all applicable checks pass.

## Functional

- Demo login `DEMO01 / 0000` still works.
- Inventory search, quantity entry, quick command, queue, and audit behavior are unchanged unless the approved plan says otherwise.
- Invalid and empty inputs remain understandable.

## Mobile

- At 390x844, the primary inventory task becomes reachable earlier than the current baseline.
- No horizontal scrolling, clipped text, overlapping controls, or undersized primary touch targets.
- Risk/WMS information remains accessible.

## Desktop

- At 1440x900, the operational overview remains useful and no major density is lost.

## Visual and accessibility

- Provide current desktop and mobile screenshots from the same stable environment.
- Record the reference-DNA decision and before/after difference.
- Keyboard focus, reduced motion, contrast, disabled, loading, invalid, and error states do not regress.

## Delivery

- Claude reports exact changed files and does not stage or commit them.
- Codex independently reviews the diff and verification evidence.
- Only reviewed files may be selectively committed.
