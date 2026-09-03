# Email signature template QA

source visual truth path: `C:\Users\ANUSHI~1\AppData\Local\Temp\codex-clipboard-6d556d6d-b1b1-4141-a45b-0ac1bce27163.png`
secondary source state: `C:\Users\ANUSHI~1\AppData\Local\Temp\codex-clipboard-4c688994-1dea-4e97-a4f2-47a6f60d5012.png`
implementation screenshot path: in-app browser capture of `http://127.0.0.1:4173/cardly/email-signatures` (browser tab 1)
viewport: reference 1086 x 540 px; implementation browser capture 747 x 747 px; browser density 1x
state: local demo workspace, saved signature editor, Details section, Desktop preview

## Comparison evidence

Full-view comparison: the signature now uses the reference composition: a left image rail, a strong name/title block, a light divider, contact rows with icons, and a navy circular social row. The source photos remain user content rather than being copied into every new signature.

Focused region comparison: the live preview was inspected after entering representative contact details and a profile image. The rendered HTML contained two image elements: the uploaded profile image and a second image using the profile image as its fallback. The editor also exposed independent inputs for `Profile photo` and `Second photo or logo`.

## Findings

- No actionable P0/P1/P2 differences remain.
- P3 / expected: the reference contains sample portrait and company artwork, while the product starts with user-controlled image slots. The second slot repeats the profile photo until the user supplies a logo or another photo.

## Comparison history

1. Initial implementation: the old default `Minimal` template used the prior styling and did not provide the requested second-image behavior.
2. Fix: replaced the default with `Executive Photo`, migrated legacy `minimal` records, added the second-image fallback, and updated the editor labels and mini preview.
3. Post-fix verification: build, typecheck, template picker, contact links, social links, and two-image live preview all passed in the local browser.

## Implementation checklist

- [x] Replace the existing default signature template.
- [x] Preserve legacy signatures by migrating `minimal` to the new template.
- [x] Add an independent second photo/logo control.
- [x] Repeat the profile photo when the second asset is empty.
- [x] Keep copied output email-safe with table markup and inline styles.
- [x] Verify the local editor and preview.

final result: passed
