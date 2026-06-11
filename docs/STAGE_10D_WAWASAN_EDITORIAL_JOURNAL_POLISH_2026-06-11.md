# Stage 10D — `/wawasan` Editorial Journal Polish

## Summary

Stage 10D refines the `/wawasan` archive/listing experience into a calmer premium editorial journal. The polish keeps the existing route, data flow, filtering, search, sort, links, CTAs, sharing actions, and image behavior intact while improving hierarchy, spacing, metadata treatment, and editorial tone.

## Visual and Editorial Polish

- Refined the `/wawasan` hero into a quieter journal-style introduction with the Indonesian editorial label “Beranda / Jurnal Desain” and the headline “Arsip Wawasan.”
- Reworked the search/filter surface into a curated archive panel with calmer language, improved spacing, and a softer premium treatment.
- Elevated the first filtered insight into a lead editorial article with the label “Wawasan Utama,” clearer metadata hierarchy, larger display title rhythm, and a more editorial CTA.
- Softened archive cards with quieter badges, more breathable title/excerpt spacing, restrained card surfaces, and the CTA “Lanjut Membaca.”
- Improved empty states with a curated editorial tone: “Arsip wawasan sedang dikurasi.”
- Kept mobile comfort in mind through responsive spacing, comfortable touch targets, and non-overflowing card/filter layouts.

## Files Changed

- `app/wawasan/page.tsx`
- `components/wawasan-archive.tsx`
- `docs/STAGE_10D_WAWASAN_EDITORIAL_JOURNAL_POLISH_2026-06-11.md`

## Preserved Behavior

- Existing `/wawasan` route behavior is preserved.
- Existing `getPublishedInsights()` data retrieval is preserved.
- Existing search, category/content/source filters, sort behavior, and reset behavior are preserved.
- Existing insight links are preserved.
- Existing archive share actions, including WhatsApp sharing and `ShareLinkButton`, are preserved.
- Existing CTAs to `/karya`, `/mulai-project`, and `/` are preserved.

## Explicit Non-Changes

- No Supabase query changes.
- No database schema changes.
- No RLS changes.
- No admin logic changes.
- No AI prompt changes.
- No Social Composer changes.
- No `/karya`, `/karya/[slug]`, or homepage code changes.
- No new dependencies.
- No route changes.
- No runtime image transforms.
- No PR #358-style Supabase render transform approach.

## Image Loading Preservation

- Featured `/wawasan` image still uses the direct `featured.cover_image` URL.
- Featured `/wawasan` image still uses the existing `<img>` element rather than `next/image`.
- Featured `/wawasan` image keeps `width`, `height`, `loading="eager"`, `fetchPriority="high"`, and `decoding="async"`.
- Archive card images still use direct `item.cover_image` URLs.
- Archive card images still use `<img>` elements with `loading="lazy"` and `decoding="async"`.
- No image assets, compression, or runtime transformation strategy was changed.

## Validation Results

- `npm ci` — passed.
- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm run start` — passed for local production server startup.
- `curl -I http://localhost:3000/wawasan` — passed with `200 OK`.
- `curl -I http://localhost:3000/karya` — passed with `200 OK`.
- `curl -I http://localhost:3000/` — passed with `200 OK`.
