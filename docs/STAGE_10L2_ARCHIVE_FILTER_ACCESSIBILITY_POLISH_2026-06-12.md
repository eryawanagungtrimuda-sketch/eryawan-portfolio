# Stage 10L.2 — Archive Filter Accessibility Polish

Date: 2026-06-12

## Files changed

- `components/karya-archive.tsx`
- `components/wawasan-archive.tsx`
- `docs/STAGE_10L2_ARCHIVE_FILTER_ACCESSIBILITY_POLISH_2026-06-12.md`

## Summary of filter/search accessibility improvements

- Added clearer accessible state to archive filter chips with `aria-pressed` for selected toggle-style filters.
- Added more specific accessible names for selected filter remove chips and reset controls.
- Connected search fields to labels/helper/status text so keyboard and screen-reader users receive clearer context without changing search behavior.
- Added polite result-count announcements to existing archive result summaries so filter/search changes can be announced without duplicating visible copy.

## Keyboard/focus improvements

- Refined `focus-visible` treatment for karya and wawasan filter chips using the existing gold ring and dark offset visual language.
- Improved focus affordances for mobile filter triggers, sheet close buttons, reset buttons, active filter remove buttons, and key archive card links.
- Kept focus behavior simple; no focus trap or layout redesign was introduced.

## Aria/semantic improvements

- Added grouped labels for filter chip sets where appropriate.
- Added `aria-pressed` to selected filter buttons/chips that behave as toggles.
- Added `aria-expanded`, `aria-controls`, and clear labels for mobile filter triggers.
- Added clear dialog labels for mobile filter sheets/panels.
- Added clear accessible labels for reset and remove-filter actions such as `Hapus filter ...`.

## Preservation confirmations

- No routes, hrefs, CTA destinations, `eventName`, `eventProps`, or `data-cta` values were changed.
- No Supabase queries, database schema, RLS, data mapping behavior, admin logic, Social Composer behavior, AI prompts, or image loading behavior were changed.
- No metadata was changed.
- No homepage, project detail page, wawasan detail page, `/kontak`, or `/mulai-project` behavior was changed.
- Stage 10L.1 accessibility work was preserved.
- No archive layout redesign or complex focus trap was introduced.

## Validation results

- `npm run lint` — pass with existing image lint warnings for `<img>` usage in archive components.
- `npm run typecheck` — pass.
- `npm run build` — pass.
- `npm run start` with `curl -I http://localhost:3000/karya` and `curl -I http://localhost:3000/wawasan` — pass.

## Manual QA notes

- Keyboard tab order remains available through `/karya` search, filters, mobile filter trigger, chips, reset controls, and cards.
- Keyboard tab order remains available through `/wawasan` search, filters, mobile filter trigger, chips, reset controls, and cards.
- Focus states remain visible and aligned with the premium gold-ring language.
- Selected filter buttons expose selected state where appropriate.
- Mobile filter triggers and sheets now expose useful labels/state.
- No horizontal overflow, visual redesign, or search/filter behavior regression was intentionally introduced.
