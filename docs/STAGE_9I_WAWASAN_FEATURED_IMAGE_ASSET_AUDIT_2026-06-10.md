# Stage 9I: `/wawasan` Featured Image Asset Audit

Date: 2026-06-10

## Latest PageSpeed status after PR #359

Latest reported PageSpeed result after PR #359:

- `/wawasan` Mobile Performance: 75
- `/wawasan` Desktop Performance: 89

PR #359 is considered a successful rollback because desktop recovered from the PR #358 regression baseline of 75 back to 89 after removing the runtime Supabase image transform path and restoring direct `featured.cover_image` delivery. Mobile remains around 75, so the next likely improvement should reduce the bytes and decode cost of the actual featured image asset rather than changing runtime URL construction.

## Why runtime image rewriting should not be repeated

PR #358 attempted to rewrite the featured `/wawasan` image through the Supabase Storage render endpoint at runtime. That approach regressed PageSpeed, especially desktop performance, and PR #359 restored the direct object URL path.

For Stage 9I, runtime URL rewriting remains out of scope and should not be reintroduced:

- Do not use Supabase render URL rewriting for the featured archive image.
- Do not add a runtime `srcSet` transform path.
- Do not broadly convert archive cards to `next/image`.
- Do not change layout, copywriting, routes, analytics/tracking, Social Composer, AI prompts, Supabase queries, RLS, schema, or admin logic.

The safer follow-up is to optimize or replace the underlying asset that `cover_image` already points to.

## Current `/wawasan` featured image code path

### Data loading

`/wawasan` calls `getPublishedInsights()` from `app/wawasan/page.tsx`, then passes the returned rows into `WawasanArchive` when at least one published insight exists.

`getPublishedInsights()` is defined in `lib/insights.ts`. It:

1. Disables caching with `noStore()`.
2. Returns an empty array when Supabase is not configured.
3. Queries the `insights` table for published rows.
4. Selects `cover_image` along with the other insight columns and `insight_images(image_url,sort_order)`.
5. Orders rows by `created_at` descending, so the default archive order is newest-first.
6. Keeps an existing `insight.cover_image` as-is.
7. For `review_karya` insights without a `cover_image`, uses the first related `insight_images` row by ascending `sort_order` as a fallback `cover_image`.

### Archive selection

`WawasanArchive` defaults `sort` to `terbaru`. Its `filteredInsights` calculation filters by search/category/content/source and then, for the default `terbaru` sort, sorts by `created_at` descending when all filtered items have `created_at` values. The featured archive card is then assigned as `filteredInsights[0]`, and all remaining archive cards are rendered from `filteredInsights.slice(1)`.

Therefore, under the default unfiltered `/wawasan` view, the featured archive item is the newest published insight by `created_at`, after the fallback `cover_image` mapping described above.

### Featured image rendering after PR #359

The PR #358 transform remains removed. The featured archive image currently renders the dynamic `featured.cover_image` value directly:

- `src={featured.cover_image}`
- `loading="eager"`
- `fetchPriority="high"`
- `decoding="async"`
- `width={1600}`
- `height={1000}`
- wrapper: `aspect-[16/10] md:aspect-auto`

The PR #356/#357 improvements are still preserved:

- Above-the-fold featured archive content is not delayed by the archive card reveal animation.
- The first featured image remains eager/high-priority.
- Intrinsic dimensions are present.
- Mobile aspect-ratio reservation is present.

Non-featured archive images remain normal `<img>` elements with `loading="lazy"`, `decoding="async"`, explicit `width={1600}` and `height={1000}`, and a 16:10 visual crop.

## Current featured image asset identification

### What can be confirmed from this repository

The exact featured image URL is content-driven, not hardcoded in this repository. It comes from the live Supabase `insights.cover_image` value for the row that becomes `filteredInsights[0]`, or from that row's first sorted `insight_images.image_url` only when the row is a `review_karya` insight without its own `cover_image`.

Because the featured row is chosen from live published insight data, the exact asset can change whenever a newer insight is published, an existing insight's `created_at` changes, a default filter/sort behavior changes, or the relevant `cover_image` value is updated in Supabase.

### Environment limitation

This container could not confirm the production HTML or live Supabase content for `/wawasan`. A direct production fetch failed with an outbound proxy `403 Forbidden` response:

```bash
curl -I -L --max-time 20 https://eryawanagung.my.id/wawasan
# CONNECT tunnel failed, response 403
```

Because production access is blocked from this environment and no live Supabase content dump is available in the repository, Stage 9I does **not** guess the current featured image URL.

### Manual ways to find the live featured image URL

Use one of these safe production checks after deployment or from an environment that can access production:

1. Open `https://eryawanagung.my.id/wawasan` in a browser.
2. Inspect the first large featured archive card after the search/filter controls.
3. Copy the `<img>` element's `src`; that value is the live featured asset URL currently delivered from `featured.cover_image`.

Alternative browser-console check:

```js
Array.from(document.querySelectorAll('img'))
  .map((img) => ({ src: img.currentSrc || img.src, alt: img.alt, loading: img.loading, fetchPriority: img.fetchPriority }))
  .find((img) => img.fetchPriority === 'high' || img.loading === 'eager');
```

Alternative Supabase data check:

1. Query published insights ordered by `created_at` descending.
2. Identify the newest row under the default public archive conditions.
3. Read its `cover_image` value.
4. If that row is `content_type = 'review_karya'` and `cover_image` is empty, query `insight_images` for that insight ordered by `sort_order` ascending and use the first `image_url`.

Do not change schema, RLS, or admin logic for this check.

## Safe asset-level optimization recommendation

Replace or update the current featured image asset itself instead of changing runtime frontend delivery. The recommended target is a visually equivalent 16:10 image with much lower byte weight.

Recommended asset specs:

- Keep the same visual content and crop.
- Keep the same 16:10 ratio.
- Maximum visual dimensions: `1600 x 1000` for desktop.
- Preferred format: WebP.
- Acceptable fallback format: optimized JPEG.
- AVIF can be considered only if the existing publication/storage workflow can safely serve it with the expected content type and browser support expectations.
- Quality target: around 70-80.
- File size target: under 250-350 KB if possible.
- Avoid huge PNG/JPEG originals for the featured archive image.
- Preserve descriptive alt behavior by keeping the same insight title and frontend path.

### Safe Supabase replacement checklist

1. Confirm the live featured image URL using one of the manual checks above.
2. Download or locate the original image used for that featured insight.
3. Create an optimized derivative:
   - Crop remains 16:10.
   - Resize to no larger than `1600 x 1000`.
   - Export WebP around quality 70-80, or optimized JPEG if WebP is not operationally safe.
   - Verify the resulting file is ideally below 250-350 KB.
4. Upload the optimized asset through the existing Supabase Storage workflow.
5. Choose one of these safe publication approaches:
   - Preferred when operationally safe: replace the object at the same Storage bucket/path so the existing `cover_image` URL continues to work without database edits.
   - Alternative: upload to a new Storage object path and update only the relevant insight's `cover_image` field to the new public URL.
6. Do not change database schema, RLS policies, Supabase queries, admin logic, or frontend runtime URL handling.
7. Clear any relevant CDN/browser cache if replacing the same object path and cache headers prevent immediate verification.
8. Re-open `/wawasan` and confirm the featured `<img>` still uses the direct `cover_image` URL, not a render-transform URL.
9. Confirm the displayed crop and visual content match the previous image.

## Retest plan after asset replacement

After replacing or updating the featured asset, rerun PageSpeed for `/wawasan`:

- Mobile PageSpeed target: 80+
- Desktop PageSpeed target: 90+

Record both mobile and desktop results, especially LCP element, LCP timing, total image bytes, and whether the featured archive image remains the LCP candidate on mobile.

## Stage 9I scope confirmation

Stage 9I is documentation-first. No runtime image transform, `srcSet`, layout change, copywriting change, route change, analytics/tracking change, Social Composer change, AI prompt change, Supabase query/RLS/schema/admin change, dependency change, or broad archive image conversion is required for this stage.
