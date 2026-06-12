# Stage 10K — Final Responsive QA & Layout Hardening

Date: 2026-06-12

## Pages audited

- `/`
- `/karya`
- `/karya/[slug]` using `/karya/residential-interior` as the smoke-test detail URL
- `/wawasan`
- `/wawasan/[slug]` code path and responsive CTA/detail layout patterns
- `/mulai-project`
- `/kontak`
- `/tentang` as a public route present in the app

## Breakpoints considered

- Mobile narrow: 360px–390px
- Mobile normal: 390px–430px
- Tablet portrait
- Tablet landscape: 900px–1280px landscape
- Desktop 1366px
- Wide desktop

## Summary of small layout fixes

- Hardened the homepage hero against narrow and tablet-landscape crowding by adding safer `min-w-0`, wrapping, and reduced micro-label tracking for long brand wording while preserving the spacious Stage 10I.1 hero direction.
- Improved homepage CTA/footer resilience with safer wrapping for long CTA labels, brand/service labels, footer metadata, and admin/footer link grouping.
- Hardened shared button behavior so long uppercase labels can wrap instead of forcing horizontal overflow.
- Improved `/karya` archive controls and cards with safer mobile filter-sheet overflow handling, search input shrink behavior, active chip wrapping, desktop filter copy wrapping, card metadata wrapping, and bottom share bar wrapping.
- Improved `/wawasan` archive cards and filter/search controls so chips, card links, featured links, and the mobile filter sheet remain contained on narrow viewports.
- Improved project detail pages with safer title/meta wrapping and CTA wrapping for WhatsApp/share/back/admin action areas.
- Improved wawasan detail pages with safer title/chip/source-project/CTA wrapping while keeping scroll progress and image handling unchanged.
- Improved `/kontak` and `/mulai-project` touch targets and CTA/form preview containment with safer wrapping, `min-w-0`, and preview text overflow safeguards.

## Preservation confirmations

- No routes were changed.
- No CTA destinations were changed.
- No `eventName`, `eventProps`, or `data-cta` tracking attributes were changed.
- No Supabase queries, database schema, RLS, admin behavior, AI prompt behavior, or Social Composer behavior were changed.
- No image loading strategy was changed and no images were converted to `next/image`.
- Stage 10H reveal behavior and Stage 10H.1 scroll progress behavior were preserved.
- Stage 10I.1 brand positioning was preserved.
- Stage 10J metadata/SEO/OpenGraph/schema alignment was preserved.

## Validation results

- `npm ci` completed successfully.
- `npm run lint` completed successfully with existing `@next/next/no-img-element` warnings; image strategy was intentionally preserved.
- `npm run typecheck` completed successfully.
- `npm run build` completed successfully with existing image warnings and a handled sitemap dynamic rendering warning/fallback.
- `npm run start` started the production server successfully.
- Header smoke checks returned `200 OK` for `/`, `/karya`, `/wawasan`, `/mulai-project`, `/kontak`, `/tentang`, and `/karya/residential-interior`.
- Screenshot capture was not possible in this container because no local browser binary (`chromium`, `google-chrome`, or `firefox`) is available.

## Manual QA notes

- Confirmed by code audit and production-route smoke checks that no public audited page should introduce horizontal overflow from long labels, CTA rows, archive card metadata, detail CTA rows, contact email text, project brief preview text, or footer labels.
- Confirmed all fixes are small, layout-safe Tailwind class adjustments focused on wrapping, `min-w-0`, `max-w-full`, `break-words`, overflow containment, and touch comfort.
