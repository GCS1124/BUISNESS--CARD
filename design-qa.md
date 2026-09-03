# Email signature live preview QA

source visual target: `C:\Users\ANUSHI~1\AppData\Local\Temp\codex-clipboard-ab08e0b7-79b0-4f3c-a5b7-ea8b60f55b1a.png`
previous preview state: `C:\Users\ANUSHI~1\AppData\Local\Temp\codex-clipboard-3523c6d3-2527-4149-bef8-fcd3dea026c5.png`
implementation screenshot path: in-app browser capture of `http://localhost:5173/cardly/email-signatures` (browser tab 4)
viewport: reference 1100 x 697 px; implementation browser capture 1265 x 747 px; browser density 1x
state: guest signature editor, Details section, Desktop preview, populated sample data

## Comparison evidence

Full-view comparison: the preview now follows the selected target with a `Signature Preview` heading, matching subtitle, customization toolbar, and large rounded white canvas.

Focused region comparison: the live signature uses a horizontal two-image row, stacked identity details on the left, a vertical divider, icon-led contact details on the right, and circular social buttons below the identity block. The rendered HTML remains email-safe nested table markup.

## Findings

- No actionable P0/P1/P2 differences remain.
- P3 / expected: the reference uses its own portrait and company artwork; the product renders the user-provided profile and logo fields, including the existing fallback behavior when a second image is not supplied.

## Comparison history

1. Initial implementation: the old default `Minimal` template used the prior styling and did not provide the requested second-image behavior.
2. Fix: replaced the default with `Executive Photo`, migrated legacy `minimal` records, added the second-image fallback, and updated the editor labels and mini preview.
3. Post-fix verification: build, typecheck, template picker, contact links, social links, and two-image live preview all passed in the local browser.
4. Preview replacement: removed the email-message mockup, added the selected preview toolbar and canvas, and matched the two-column signature composition.

## Implementation checklist

- [x] Replace the existing default signature template.
- [x] Preserve legacy signatures by migrating `minimal` to the new template.
- [x] Add an independent second photo/logo control.
- [x] Repeat the profile photo when the second asset is empty.
- [x] Keep copied output email-safe with table markup and inline styles.
- [x] Preserve responsive mobile-preview behavior and editor interactions.
- [x] Verify the local editor and preview in the browser.
- [x] Run `npm run lint`, `npm run build`, and `git diff --check`.

final result: passed
