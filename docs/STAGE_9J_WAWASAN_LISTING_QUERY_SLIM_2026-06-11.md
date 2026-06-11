# Stage 9J — `/wawasan` Listing Query Payload Slim

Date: 2026-06-11

## Current known PageSpeed baseline

After the Stage 9H rollback and Stage 9I asset audit, the known `/wawasan` PageSpeed baseline is:

- Mobile: around 75
- Desktop: around 89

The `/karya` archive is materially faster in the same period, around Mobile 93 / Desktop 99.

## Why `/karya` can be faster despite a similar archive layout

The `/karya` archive can perform better because its listing path is lighter in practice: it does not need to carry full article body data for every archive item, and its published project listing is closer to the fields rendered by the cards and archive metadata. `/wawasan` previously reused the full insight column set for the public archive, so each listing request could include heavy article fields even though the archive only renders title, slug, taxonomy, cover image, excerpt, publish state, timestamps, and fallback image data.

The earlier Stage 9I audit also identified that `/wawasan` featured image asset weight remains a separate optimization track. Stage 9J intentionally avoids runtime image URL rewriting and focuses only on reducing server/data payload for the archive listing query.

## What changed

- Added a dedicated lightweight `/wawasan` public listing column set for `getPublishedInsights()`.
- The public listing query no longer fetches article `content`.
- The public listing query no longer fetches `ai_prompt_source`.
- The public listing query also omits `source_project_id` because the archive cards do not render or filter by project linkage.
- The listing query still fetches `insight_images(image_url,sort_order)` so `review_karya` items without a direct `cover_image` can use the first sorted fallback image.
- Detail/admin-related insight functions continue to use the full column set so detail pages and editing flows can still fetch full content and prompt-source metadata.

## What was intentionally preserved

- No `/wawasan` layout changes.
- No copywriting changes.
- No route changes.
- No analytics/tracking changes.
- No Social Composer changes.
- No AI prompt changes.
- No Supabase schema, RLS, or admin logic changes.
- No Supabase runtime image transform was reintroduced.
- Archive images were not converted to `next/image`.
- Image loading behavior from PR #356, PR #357, and PR #359 was preserved.
- The featured `/wawasan` image still renders the direct `featured.cover_image` URL.
- The featured image keeps `loading="eager"`, `fetchPriority="high"`, `width={1600}`, `height={1000}`, and the existing `aspect-[16/10] md:aspect-auto` reservation.

## Validation results

Commands run for this change:

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run start`
- `curl -I http://localhost:3000/wawasan`
- `curl -I http://localhost:3000/karya`

Final command status is recorded in the PR notes and handoff summary.
