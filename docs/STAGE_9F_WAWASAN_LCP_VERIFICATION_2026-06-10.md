# Stage 9F — /wawasan LCP Verification After PR #356

Date: 2026-06-10

## Scope

Stage 9F verifies `/wawasan` after PR #356 and applies only safe follow-up work tied to the audit. This pass preserves frontend behavior, copywriting, routes, analytics/tracking events, Social Composer, AI prompts, Supabase logic, admin logic, and unrelated pages.

## Audit method used

- Tried the live PageSpeed Insights API for `https://eryawanagung.my.id/wawasan` with mobile strategy, but this container's outbound proxy returned `403 Forbidden`, matching the Stage 9E limitation.
- Opened the live page through the available web fetcher to verify rendered content and DOM order.
- Built and started the production app locally, then fetched `http://localhost:3000/wawasan` to verify the local production render path. Local Lighthouse could not be installed or run because `npx lighthouse` was blocked by registry `403 Forbidden`, and the container did not include Chrome/Lighthouse.
- Local production `/wawasan` is content-limited because Supabase environment variables are not configured in this container, so the local route renders the empty-state branch instead of the live archive cards.

## Stage 9E baseline for comparison

The Stage 9E baseline documented `/wawasan` mobile Performance at 75, desktop Performance at 90, and mobile LCP around 10.6s. It also noted that the exact production LCP element could not be confirmed from the container because the live PageSpeed API was blocked by `403 Forbidden`.

## Live render verification

The live `/wawasan` page now renders the hero content immediately in document order:

- `h1`: `Wawasan Desain`
- Intro paragraph directly after the heading
- Archive controls after the hero
- 10 published insights in the archive
- First featured insight: `FUNGSI DESIGNER INTERIOR UNTUK HANDERSON'S APP`

The live web fetch confirms the first featured archive image is present before the featured title. Because Lighthouse/PageSpeed was blocked here, the current production LCP element and exact lab LCP value could not be measured in this container. Based on rendered order and PR #356's eager/high-priority change, the remaining likely mobile LCP candidates are the hero heading/text if the archive starts below the viewport, or the first featured archive image/title if that card enters the initial mobile viewport.

## Local production verification

The local production fetch returned HTTP 200 for `/wawasan` with no `reveal-on-scroll` classes in the rendered HTML. Because Supabase is not configured locally, no live insight images are rendered in the local archive branch, so local LCP image behavior cannot be treated as representative of production content.

## Safe follow-up fix applied

The first featured archive image is still intentionally the only eager/high-priority archive image. This pass adds intrinsic dimensions and a mobile aspect-ratio reservation to the archive images so the browser can reserve stable image slots before dynamic Supabase-hosted images finish loading:

- Added `width={1600}` and `height={1000}` to standard archive card images while keeping them `loading="lazy"`.
- Added `width={1600}` and `height={1000}` to the first featured image while keeping it `loading="eager"` and `fetchPriority="high"`.
- Added `aspect-[16/10] md:aspect-auto` to the first featured image wrapper to reserve mobile height without changing the desktop two-column layout.

These changes do not convert images to `next/image`, do not alter dynamic Supabase image sources, do not change copywriting, and do not change routing or tracking behavior.

## Issues intentionally left unchanged

- Existing `@next/next/no-img-element` warnings remain because a broad conversion to `next/image` would be riskier for dynamic Supabase image sources and was explicitly out of scope for this stage.
- The sitemap dynamic/static generation notice remains documented as existing behavior and was not changed.
- No caching, `force-dynamic`, Supabase freshness, admin, Social Composer, AI prompt, or route changes were made.

## Validation summary

- `npm ci`: passed with npm proxy/deprecation warnings only.
- `npm run lint`: passed with existing `@next/next/no-img-element` warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed with existing image warnings and the known sitemap dynamic/static generation notice.
- `npm run start`: passed; local production server started on `http://localhost:3000`.
- `npx lighthouse http://localhost:3000/wawasan --form-factor=mobile --screenEmulation.mobile=true --output=json --output-path=./lighthouse-wawasan-mobile.json`: not run successfully because npm registry access for `lighthouse` returned `403 Forbidden`.
- `npx lighthouse http://localhost:3000/wawasan --preset=desktop --output=json --output-path=./lighthouse-wawasan-desktop.json`: not run successfully for the same registry limitation.
