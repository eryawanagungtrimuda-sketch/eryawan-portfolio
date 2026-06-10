# Stage 9G — /wawasan Featured Image Delivery Optimization

Date: 2026-06-10

## Scope

Stage 9G targets only the public `/wawasan` archive featured-image delivery path. It preserves frontend behavior, copywriting, routes, analytics/tracking events, Social Composer, AI prompts, Supabase/admin logic, database schema, and the page's visual identity.

## Current PageSpeed baseline

The current known PageSpeed baseline before this change is:

- Mobile Performance: 75
- Desktop Performance: 92

Desktop is acceptable, so this pass focuses on lowering mobile LCP image transfer cost without redesigning the archive.

## Audit findings

- `/wawasan` receives published insight rows from `getPublishedInsights()`, ordered by newest first, including the dynamic `cover_image` field and fallback image data for review insights.
- `WawasanArchive` selects `filteredInsights[0]` as the featured archive card. That first card is rendered before the rest grid, immediately after the search/filter controls, so it remains the only archive image likely to affect mobile LCP when the archive enters the initial viewport.
- PR #356/#357 behavior is preserved: the first featured image still has `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, explicit `width`/`height`, and a mobile `aspect-[16/10]` wrapper reservation. Below-the-fold archive card images remain lazy.
- Live production HTML could not be fetched from this container because the outbound proxy returned `403 Forbidden`; therefore, the exact current production image URL could not be re-confirmed here. The code path shows the source is the dynamic `cover_image` URL supplied by Supabase data, and Stage 9F previously confirmed the first live featured insight image is present before the featured title.

## Strategy used

Option B was used instead of converting the card to `next/image`:

- Only the first featured archive image now uses a small helper that recognizes Supabase Storage public object URLs containing `/storage/v1/object/public/`.
- For those Supabase URLs only, the featured image source is rewritten to the Supabase image rendering endpoint at `/storage/v1/render/image/public/` with `width=960`, `quality=75`, and `resize=cover` for the default/mobile candidate.
- A `srcSet` also provides a 1600px transformed candidate for larger desktop/tablet slots, while `sizes` tells the browser the actual mobile and desktop display widths.
- If the URL is not a Supabase public object URL, the helper returns the original URL unchanged.
- If a transformed Supabase image fails to load, the image clears `srcset` and falls back to the original `cover_image` URL.

## Why this is safe for dynamic Supabase images

This avoids a broad image migration and does not require broad remote image allowlisting. The transformation is intentionally narrow: it only applies to URLs whose path matches Supabase's public Storage object route. Non-Supabase external images, relative URLs, invalid URLs, and any future dynamic source that does not match that route continue using the original source. The original image remains the runtime fallback for transformed-image failures.

## Files changed

- `components/wawasan-archive.tsx`
- `docs/STAGE_9G_WAWASAN_FEATURED_IMAGE_OPTIMIZATION_2026-06-10.md`

## Warnings intentionally left unchanged

- Existing `@next/next/no-img-element` warnings can remain for non-featured archive images because converting every archive image to `next/image` was explicitly out of scope and riskier for dynamic image sources.
- No Supabase query, caching, admin, Social Composer, AI prompt, analytics, or route behavior was changed.

## Validation results

- `npm ci`: passed with npm proxy/deprecation warnings only.
- `npm run lint`: passed with existing `@next/next/no-img-element` warnings. The featured `/wawasan` warning remains because this stage intentionally kept `<img>` and used a narrow Supabase transform fallback strategy instead of a broader `next/image` conversion.
- `npm run typecheck`: passed.
- `npm run build`: passed with existing image warnings and the known sitemap dynamic/static generation notice.
- `npm run start`: passed; local production server started on `http://localhost:3000`.
- `curl -I --max-time 10 http://localhost:3000/wawasan`: passed with HTTP 200. Local content remains limited by missing Supabase environment variables, so the archive image branch cannot be visually verified locally with live records.
- `npx lighthouse http://localhost:3000/wawasan --form-factor=mobile --screenEmulation.mobile=true --output=json --output-path=./lighthouse-wawasan-mobile.json`: blocked because npm registry access for `lighthouse` returned `403 Forbidden`.
- `npx lighthouse http://localhost:3000/wawasan --preset=desktop --output=json --output-path=./lighthouse-wawasan-desktop.json`: blocked for the same npm registry `403 Forbidden` limitation.
