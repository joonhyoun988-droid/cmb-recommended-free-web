# CMB Quick Command Input

Status: `READY_LOCAL`

This feature turns short Korean field sentences into inventory transactions without calling an external AI API.

## Supported Examples

```text
그린자임 4리터 30개 생산
그린자임 4L 2개 불량 처리
그린메디 20L 5개 입고
```

Blocked examples:

```text
그린자임 4리터 삼십개 생산
그린자임 4리터 2개 생산하고 라벨 2개 입고
그린자임 생산
```

## Flow

1. Worker enters a sentence.
2. Browser parser extracts item, quantity, action, warehouse, and stock field.
3. App shows a confirmation card.
4. Worker clicks confirm.
5. Inventory changes immediately on screen.
6. Queue and audit log store the original sentence and interpreted transaction.

## Safety Rules

- No external API is required for the first version.
- Ambiguous product names require size or code.
- Negative stock is blocked.
- Quantity must be written with Arabic digits and a unit, such as `30개`; the parser never uses size numbers such as `4L` as quantity.
- One sentence can contain only one transaction.
- Defect handling moves stock from the source field to the `defect` stock field.
- Discard handling removes stock from the selected field.
