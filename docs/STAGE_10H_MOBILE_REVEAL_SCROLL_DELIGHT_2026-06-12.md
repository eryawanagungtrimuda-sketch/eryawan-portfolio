# Stage 10H — Mobile Reveal & Scroll Delight Polish

## Summary

Stage 10H refines the public reveal-on-scroll and mobile card reveal system so the portfolio scroll experience feels softer, calmer, and more premium without introducing a heavy animation layer.

The polish focuses on reusable reveal behavior:

- Reveal motion now uses opacity and transform only, with a small upward lift and a very subtle card scale on mobile.
- Mobile card stagger is gentler and capped so long archives do not feel delayed.
- Above-the-fold content that is already readable on first paint is marked visible before the reveal-ready class is applied, preventing critical content from being hidden during hydration.
- IntersectionObserver now starts reveals slightly before content enters the viewport and continues to unobserve content after it becomes visible.
- The `/wawasan` archive hero is kept out of reveal treatment to preserve the safer LCP posture from the prior mobile LCP work.

## Files Changed

- `components/reveal-observer.tsx`
  - Refined the shared IntersectionObserver timing, mobile auto-stagger grouping, initial-visible safeguard, reduced-motion handling, and one-time unobserve behavior.
- `app/globals.css`
  - Tuned shared reveal classes for calm opacity/transform motion, mobile card scale, reduced-motion safety, and no filter-based reveal animation.
- `components/karya-archive.tsx`
  - Capped project archive card reveal delays for smoother mobile archive scanning.
- `components/wawasan-archive.tsx`
  - Capped insight archive card reveal delays while preserving featured image loading behavior.
- `app/wawasan/page.tsx`
  - Kept the `/wawasan` hero outside reveal animation so LCP-sensitive editorial intro content is not newly delayed.
- `app/karya/[slug]/page.tsx`
  - Added subtle shared reveal treatment to lower editorial case-study sections and text blocks without changing image sources, loading, layout intent, or Social Composer behavior.
- `components/project-brief-form.tsx`
  - Added gentle shared reveal treatment to the two form cards without changing form logic, validation, POST behavior, WhatsApp handoff, or copy behavior.

## Reduced-Motion Support

Reduced-motion users continue to receive instant visibility with no transform transition. The reveal observer marks reveal nodes visible when `prefers-reduced-motion: reduce` is active, and the CSS disables reveal transitions and transforms in the reduced-motion media query.

## LCP-Sensitive Content

LCP-sensitive content was not newly delayed:

- Above-the-fold reveal nodes are marked visible before `reveal-ready` is applied.
- The `/wawasan` hero no longer uses `reveal-on-scroll`.
- `/wawasan` featured image loading, eager priority, and image strategy were not changed.
- No runtime image transforms, `next/image` conversion, or image loading strategy changes were introduced.

## Preserved Behavior

This stage preserved existing routes, CTAs, tracking attributes, form behavior, image behavior, data access, admin logic, and Social Composer behavior.

No dependencies or animation libraries were added.

## Validation Results

- `npm ci` — passed.
- `npm run lint` — passed with pre-existing `@next/next/no-img-element` warnings; no image strategy was changed in this stage.
- `npm run typecheck` — passed.
- `npm run build` — passed with the same `@next/next/no-img-element` warnings and an existing sitemap dynamic-server-usage fallback warning.
- `npm run start` with HEAD checks for `/`, `/karya`, `/wawasan`, `/mulai-project`, `/kontak`, and `/karya/residential-interior` — passed locally.
