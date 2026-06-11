# Stage 10C — Homepage Selected Works Curation

## Summary

Stage 10C polishes the homepage works section into a more curated selected-works experience. The section now presents the first available published project as the primary featured study, followed by up to two supporting studies and a clearer bridge into the full `/karya` archive.

## Files Changed

- `app/page.tsx`
  - Curates up to three published projects for the homepage selected works area.
  - Refines the section hierarchy with Indonesian editorial labels: “Karya Terpilih” and “Studi Kasus Pilihan”.
  - Promotes the first project into a larger featured card.
  - Keeps supporting project cards restrained and responsive.
  - Adds a secondary archive-facing CTA: “Jelajahi Studi Kasus”.

- `docs/STAGE_10C_HOMEPAGE_SELECTED_WORKS_2026-06-11.md`
  - Documents the Stage 10C scope, preserved behavior, and validation plan.

## Preserved Behavior

- Existing homepage hero CTA behavior is unchanged.
- Existing `/mulai-project` link behavior is unchanged.
- Existing `/karya` href behavior is preserved.
- Existing project detail links continue to use `/karya/[slug]` when a slug exists, with `/karya` as the fallback.
- Existing tracking attributes, `eventName`, `eventProps`, and `data-cta` usage outside the selected works section were not changed.
- The homepage still uses the existing published projects data source.

## Confirmed Non-Changes

- No Supabase query changes.
- No database schema changes.
- No RLS changes.
- No admin logic changes.
- No AI prompt changes.
- No Social Composer changes.
- No `/wawasan` page changes.
- No `/karya` archive changes.
- No `/karya/[slug]` detail page changes.
- No image conversion to `next/image`.
- No runtime image transforms.
- No new dependencies.

## Validation Results

Completed validation commands:

- `npm ci` — passed.
- `npm run lint` — passed with existing `<img>` lint warnings; homepage selected works intentionally preserves `<img>` usage per performance constraints.
- `npm run typecheck` — passed.
- `npm run build` — passed with existing `<img>` lint warnings and the existing sitemap static-generation fallback warning.
- `npm run start` — passed.
- `curl -I http://localhost:3000/` — returned `200 OK`.
- `curl -I http://localhost:3000/karya` — returned `200 OK`.
- `curl -I http://localhost:3000/wawasan` — returned `200 OK`.

Manual QA notes:

- Verified homepage selected works content is server-rendered and includes “Karya Terpilih”, “Studi Kasus Pilihan”, and “Jelajahi Studi Kasus”.
- Verified `/karya` and project detail href patterns remain intact in the homepage markup.
- Verified existing homepage `data-cta` tracking attributes for collaboration CTAs remain present.
- Browser screenshot capture was attempted, but this container does not include Playwright or a Chromium/Chrome binary.
