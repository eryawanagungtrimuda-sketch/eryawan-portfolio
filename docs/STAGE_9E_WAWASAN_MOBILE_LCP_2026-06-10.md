# Stage 9E — /wawasan Mobile LCP Targeting

Date: 2026-06-10

## Scope

Stage 9E is limited to the public `/wawasan` listing page mobile LCP path. It does not redesign the page, change copywriting, routes, analytics, Supabase/admin logic, Social Composer, AI prompts, or unrelated homepage and `/karya` behavior.

## Live PageSpeed baseline after PR #354 and #355

- Homepage: mobile Performance 91, desktop Performance 96.
- `/karya`: mobile Performance 95, desktop Performance 95.
- `/wawasan`: mobile Performance 75, desktop Performance 90.
- `/wawasan` mobile LCP was reported around 10.6s while Accessibility, Best Practices, and SEO were already 100.

## LCP investigation note

The live PageSpeed API could not be queried from this container because the outbound proxy returned `403 Forbidden`, so the exact production LCP element could not be confirmed here. Based on the `/wawasan` render path, the likely mobile LCP candidates are the above-the-fold page heading/hero text and, once the user reaches the archive section, the first featured insight card image/title.

## Targeted changes

- Removed reveal-on-scroll treatment from the `/wawasan` page hero so the top heading and intro content are visible immediately instead of waiting for IntersectionObserver hydration on mobile.
- Removed reveal-on-scroll treatment from the `/wawasan` archive wrapper and first featured insight card so the search controls and featured card are not delayed above the fold on mobile.
- Changed only the first featured insight image from lazy loading to eager/high-priority loading because it is the only archive image likely to affect `/wawasan` LCP.
- Kept archive card images lazy-loaded for lower cards.
- Did not change caching, `force-dynamic`, `noStore`, or Supabase freshness behavior; those tradeoffs are intentionally out of this PR unless a future live trace proves data freshness is the main LCP bottleneck.
