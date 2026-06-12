# Stage 10H.1 — Mobile Journey Microinteractions

Date: 2026-06-12

## Summary

Stage 10H.1 adds lightweight, mobile-first journey microinteractions that make long public pages feel calmer, more tactile, and easier to continue exploring after reading.

Implemented:

- A thin fixed scroll progress hairline for long editorial/detail reading pages.
- A refined continue-exploring card experience using the existing public journey component.
- Subtle tap feedback for public journey cards and key detail-page CTAs.
- Shared button tap feedback adjusted to a gentler `0.985` active scale with brightness feedback.

Not implemented:

- The optional mobile sticky CTA was intentionally skipped. The existing detail pages already include WhatsApp/share CTAs, journey links, and final next-step CTAs. Adding another sticky surface would increase risk of covering content or feeling too app-like.

## Pages affected

- `/karya/[slug]`
- `/wawasan/[slug]`
- Shared CTA/card usage through the existing public journey component and shared button components.

## Files changed

- `components/scroll-progress.tsx`
- `components/public-journey-links.tsx`
- `components/ui/action-button.tsx`
- `components/ui/button.tsx`
- `app/karya/[slug]/page.tsx`
- `app/wawasan/[slug]/page.tsx`
- `app/globals.css`
- `docs/STAGE_10H_1_MOBILE_JOURNEY_MICROINTERACTIONS_2026-06-12.md`

## Reduced-motion support

- The scroll progress bar uses direct transform updates with transition limited to `motion-safe` opacity only.
- The shared `.mobile-tap-feedback` utility disables transform changes under `prefers-reduced-motion: reduce`.
- Shared button active scale utilities were moved behind `motion-safe` variants.

## Preservation confirmations

- Existing CTAs were preserved.
- Existing tracking attributes, `eventName`, `eventProps`, and `data-cta` values were preserved.
- Existing forms were not changed.
- Existing image loading strategy was not changed.
- No images were converted to `next/image`.
- No runtime image transforms were introduced.
- No routes were changed.
- No dependencies were added.
- No Supabase queries were changed.
- No database schema or RLS changes were made.
- No admin logic was changed.
- No AI prompts were changed.
- No Social Composer behavior was changed.

## Validation results

Executed validation commands:

- `npm ci` — passed.
- `npm run lint` — passed with existing `<img>` warnings; image strategy intentionally preserved.
- `npm run typecheck` — passed.
- `npm run build` — passed with existing `<img>` warnings and existing sitemap dynamic-render warning; data/query behavior intentionally preserved.
- `npm run start` — passed.
- `curl -I http://localhost:3000/` — returned `200 OK`.
- `curl -I http://localhost:3000/karya` — returned `200 OK`.
- `curl -I http://localhost:3000/wawasan` — returned `200 OK`.
- `curl -I http://localhost:3000/karya/residential-interior` — returned `200 OK`.
- `curl -I http://localhost:3000/mulai-project` — returned `200 OK`.
- `curl -I http://localhost:3000/kontak` — returned `200 OK`.

Manual QA focus:

- Scroll progress remains a subtle top hairline and does not affect layout height.
- Journey card remains editorial and restrained.
- Tap feedback feels tactile without bounce.
- No sticky CTA covers content because the optional sticky CTA was skipped.
- No horizontal overflow is introduced.
