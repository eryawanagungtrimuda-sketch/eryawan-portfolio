# Stage 10E — Eryawan Agung Brand Language Alignment

## Summary

Stage 10E audits public-facing copy and structured public metadata so the site presents **Eryawan Agung** as a personal professional interior design portfolio and design-thinking brand, not as a studio or agency.

The refinement is intentionally narrow: no route, layout, Supabase query, database schema, RLS, admin workflow, Social Composer behavior, analytics, CTA, or image behavior was changed.

## Wording changes

- Replaced public contact-page wording from **Eryawan Studio** to **Eryawan Agung** so project inquiries are directed to the personal professional brand.
- Replaced project-detail structured-data publisher wording from an organization-style **Eryawan Studio** reference to **Eryawan Agung** as a `Person`.
- Replaced insight-detail structured-data publisher wording from an organization-style **Eryawan Studio** reference to **Eryawan Agung** as a `Person`.
- Removed the remaining homepage CSS selector wording that referenced “Hubungi studio” and aligned the selector language with **Hubungi Eryawan Agung**.

## Replaced positioning terms

| Previous wording | Updated direction |
| --- | --- |
| `Eryawan Studio` | `Eryawan Agung` |
| Organization-style schema publisher | Person-style schema publisher |
| `Hubungi studio` selector wording | `Hubungi Eryawan Agung` selector wording |

## Public-facing studio wording confirmation

Public-facing pages and components were searched for studio/company positioning terms, including `studio`, `design studio`, `interior studio`, `our studio`, `kami`, `agency`, and `agensi` where relevant. The public page updates avoid studio positioning and keep the visible brand centered on **Eryawan Agung** as a personal design portfolio.

Known remaining `studio` references are intentionally outside the public-facing brand-copy scope, such as admin-only labels, Social Composer tooling, YouTube Studio links, database/setup documentation, and internal/admin generation prompts.

## Files changed

- `app/kontak/page.tsx`
- `app/karya/[slug]/page.tsx`
- `app/wawasan/[slug]/page.tsx`
- `app/globals.css`
- `docs/STAGE_10E_ERYAWAN_BRAND_LANGUAGE_ALIGNMENT_2026-06-11.md`

## Behavior confirmation

- No Supabase queries changed.
- No database schema changed.
- No RLS policy changed.
- No admin logic changed.
- No Social Composer behavior changed.
- No analytics or tracking behavior changed.
- No routes changed.
- No CTAs removed.
- No image behavior changed.
- No dependencies introduced.

## Validation results

- `npm ci` — passed.
- `npm run lint` — passed with existing `@next/next/no-img-element` warnings.
- `npm run typecheck` — passed.
- `npm run build` — passed with existing `@next/next/no-img-element` warnings and the existing sitemap dynamic-server fallback message.
- `npm run start` — started successfully for local smoke checks.
- `curl -I http://localhost:3000/` — returned HTTP 200.
- `curl -I http://localhost:3000/karya` — returned HTTP 200.
- `curl -I http://localhost:3000/wawasan` — returned HTTP 200.
- `curl -I http://localhost:3000/mulai-project` — returned HTTP 200.
- `curl -I http://localhost:3000/karya/residential-interior` — returned HTTP 200 for project-detail smoke QA.

## Manual QA notes

- Homepage copy remains personal and decision-led, using “Saya” positioning and Eryawan Agung's personal design process language.
- `/karya` continues to position work as interior design case studies and a design portfolio.
- `/karya/residential-interior` returned HTTP 200 and project detail structured data now publishes under Eryawan Agung as a person rather than a studio organization.
- `/wawasan` continues to read as a design insight archive.
- Header/footer/public journey copy remains portfolio-oriented and does not introduce studio positioning.
