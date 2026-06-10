# Stage 9H: `/wawasan` Image Transform Rollback

Date: 2026-06-10

## Why this rollback is needed

PR #358 introduced a Supabase Storage render-transform helper for the first featured `/wawasan` image. After that change was merged, PageSpeed results regressed instead of improving, especially on desktop.

Observed PageSpeed results after PR #358:

- Mobile Performance: 73
- Desktop Performance: 75

Previous known baseline before PR #358:

- Mobile Performance: approximately 75
- Desktop Performance: approximately 92

Because the runtime transform strategy likely changed delivery characteristics in a way that hurt performance, Stage 9H rolls back only the risky transform behavior from PR #358.

## What was removed

Stage 9H removes the PR #358 runtime image rewriting path for the featured `/wawasan` image:

- Supabase render-transform helper
- Transformed featured image `src`
- Featured image `srcSet`
- Featured image `sizes`
- Runtime fallback logic that swapped the image back to the original object URL after transform load errors

The featured image now uses the original `featured.cover_image` value directly again.

## What was preserved

This rollback intentionally preserves the safe `/wawasan` performance improvements from PR #356 and PR #357:

- PR #356 reveal removal for the above-the-fold featured content
- PR #356 eager/high-priority featured image behavior
- PR #357 intrinsic featured image dimensions
- PR #357 aspect-ratio reservation for the featured image wrapper

The featured image continues to use:

- `loading="eager"`
- `fetchPriority="high"`
- `decoding="async"`
- `width={1600}`
- `height={1000}`
- `aspect-[16/10] md:aspect-auto` wrapper reservation

Non-featured archive images remain lazy-loaded and unchanged.

## Next recommended optimization

The next `/wawasan` image optimization should be asset-level optimization, not runtime URL rewriting. Recommended follow-up work should focus on preparing appropriately compressed and dimensioned source assets before upload or publication, then serving those stable asset URLs directly.
