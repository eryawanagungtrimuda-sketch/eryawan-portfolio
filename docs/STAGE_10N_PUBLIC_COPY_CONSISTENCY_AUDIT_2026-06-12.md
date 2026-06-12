# Stage 10N — Public Copy Consistency Audit

_Date: 2026-06-12_

## Pages/components audited

- `app/page.tsx`
- `app/tentang/page.tsx`
- `app/karya/page.tsx`
- `components/karya-archive.tsx`
- `app/karya/[slug]/page.tsx`
- `app/wawasan/page.tsx`
- `components/wawasan-archive.tsx`
- `app/wawasan/[slug]/page.tsx`
- `app/kontak/page.tsx`
- `app/mulai-project/page.tsx`
- `components/public-journey-links.tsx`
- Footer/admin shortcut areas were reviewed only where visible from the public journey and directly relevant.

## Copy consistency issues found

- A homepage framework line used the phrase “Desain terbaik,” which could read as an unsupported superlative claim.
- A homepage footer-supporting paragraph described the portfolio as only “desain interior,” while the current positioning also includes `arsitektur hunian` and Interior & Residential Design.
- The `/tentang` hero copy leaned heavily toward interior/business language and did not clearly include the residential design / arsitektur hunian positioning.
- The `/kontak` hero introduced Eryawan Agung as only an “Interior Designer” and used “Decision-Based Interior Design,” which was narrower than the current `Interior & Residential Design` and `Decision-Based Design` positioning.
- The `/mulai-project` intent chip and introductory paragraph framed project discussion as “Proyek Interior” only, without the residential/hunian scope.
- The shared public journey component used “Interior Designer / Decision-Based Interior Design,” which was narrower than the current portfolio positioning.
- A few public-facing project detail fallbacks used “project” in otherwise Indonesian copy; these were made consistent with “proyek.”

## Summary of small copy fixes

- Replaced the homepage superlative-style phrase “Desain terbaik” with the safer “Desain yang kuat.”
- Expanded the homepage supporting portfolio sentence to mention both `desain interior` and `arsitektur hunian`.
- Adjusted `/tentang` hero copy so the individual practice explicitly covers interior and arsitektur hunian while keeping the personal, professional tone.
- Updated `/kontak` visible positioning from “Interior Designer / Decision-Based Interior Design” to “Interior & Residential Designer / Decision-Based Design,” and expanded discussion scope to interior plus arsitektur hunian.
- Updated `/mulai-project` visible intent copy from “Proyek Interior” to “Interior & Hunian,” and expanded the introductory scope to include arsitektur hunian.
- Updated `components/public-journey-links.tsx` to use “Interior & Residential Design / Decision-Based Design.”
- Localized small project detail fallbacks from “project” to “proyek.”

## Preservation confirmations

- No layout redesign was introduced.
- No new sections were added.
- No CSS class changes were introduced.
- No routes, hrefs, CTA destinations, `eventName`, `eventProps`, or `data-cta` values were changed.
- No Supabase queries, database schema, RLS, admin behavior, Social Composer behavior, AI prompt behavior, or image loading behavior was changed.
- Stage 10I.1 brand direction, Stage 10J metadata alignment, Stage 10K responsive hardening, Stage 10L accessibility work, and Stage 10M CTA/navigation integrity were preserved.

## Validation results

- `npm run lint` — passed with pre-existing `<img>` optimization warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed with pre-existing `<img>` optimization warnings and the existing sitemap static-generation fallback message.
- `npm run start` — started successfully for local HTTP checks.
- `curl -I http://localhost:3000/` — returned `200 OK`.
- `curl -I http://localhost:3000/tentang` — returned `200 OK`.
- `curl -I http://localhost:3000/karya` — returned `200 OK`.
- `curl -I http://localhost:3000/wawasan` — returned `200 OK`.
- `curl -I http://localhost:3000/kontak` — returned `200 OK`.
- `curl -I http://localhost:3000/mulai-project` — returned `200 OK`.
- `curl -I http://localhost:3000/karya/residential-interior` — returned `200 OK`.

## Manual QA notes

- Homepage visible copy remains spacious and personal, with Interior & Residential Design positioning retained.
- `/tentang` now describes the individual practice more clearly across interior and arsitektur hunian.
- `/karya` and a project detail page retain the decision-based study case framing without agency-like language.
- `/wawasan` and a wawasan detail page continue to frame articles as design notes around decisions, interior, and residential design.
- `/kontak` and `/mulai-project` invite calm, practical conversation without sounding like an agency funnel.
- No visual redesign or layout regression was intentionally introduced.
