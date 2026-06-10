# Stage 9D — Production Smoke Test and Lighthouse Baseline

Date: 2026-06-10

## Scope

Stage 9D verifies the site after PR #354 (`cdd7af9`, "Merge pull request #354 from eryawanagungtrimuda-sketch/codex/run-lighthouse-audit-for-stage-9c") with no redesign, copy, route, analytics, Supabase/admin, Social Composer, or AI prompt changes.

## Source sync

- `git pull origin main` could not be completed because this checkout has no configured `origin` remote. The working branch already points at commit `cdd7af9`, which is the PR #354 merge commit available in this environment.

## Static verification

- Production-facing metadata remains defined in `app/layout.tsx` with `metadataBase`, canonical homepage URL, index/follow robots settings, Open Graph, and Twitter card metadata.
- Viewport remains defined in `app/layout.tsx` with `width: device-width`, `initialScale: 1`, dark theme color, and dark color scheme.
- Homepage metadata remains defined in `app/page.tsx` with homepage canonical, Open Graph, and Twitter metadata.
- Homepage-only preload behavior remains scoped to the homepage:
  - `HomePreloadResources` is imported and rendered only by `app/page.tsx`.
  - The preload calls live in `components/home-preload-resources.tsx`.
  - No global preload calls were found in `app/layout.tsx`.

## Build and quality checks

| Check | Result | Notes |
| --- | --- | --- |
| `npm ci` | Passed | Install completed; npm emitted the existing unknown `http-proxy` env config warning and dependency deprecation warnings. |
| `npm run lint` | Passed with warnings | Existing `@next/next/no-img-element` warnings remain; no new lint errors were found. |
| `npm run typecheck` | Passed | `tsc --noEmit` completed successfully. |
| `npm run build` | Passed with warnings | Build completed. Existing image lint warnings appeared during build. Sitemap generation logged the existing dynamic server usage fallback and continued successfully. |

## Local production smoke test

A local production server was started from the completed build with `npm run start -- -p 3000`, then the key public routes were checked with `curl`.

| Route | HTTP status | Rendered title |
| --- | ---: | --- |
| `/` | 200 | `Eryawan Agung \| Design Strategy Portfolio` |
| `/karya` | 200 | `Portfolio Karya \| Eryawan Agung Design Portfolio` |
| `/wawasan` | 200 | `Wawasan Desain \| Eryawan Agung Design Portfolio` |
| `/kontak` | 200 | `Eryawan Agung \| Portfolio Design Strategy` |
| `/mulai-project` | 200 | `Mulai Percakapan Proyek \| Eryawan Agung Design Portfolio` |

Additional local HTML checks:

- Homepage includes `<html lang="id">`.
- Homepage includes viewport metadata with `width=device-width`.
- Homepage includes theme color `#080807`.
- Homepage includes homepage canonical metadata.
- Homepage includes Open Graph image metadata.
- Homepage includes hero and Belleza font preloads.
- `/karya`, `/wawasan`, `/kontak`, and `/mulai-project` do not include the homepage-only hero or Belleza font preloads.

## Live production reachability

Attempting to smoke test `https://eryawanagung.my.id` from this container failed before reaching the site because the environment proxy returned `curl: (56) CONNECT tunnel failed, response 403`. Because of that network limitation, live production HTTP checks could not be completed from this environment.

## Lighthouse baseline

Lighthouse could not be run in this environment:

- No Chrome/Chromium executable is available in the container.
- `npx --yes lighthouse --version` could not fetch Lighthouse from npm because the registry request was blocked with `403 Forbidden`.

Recommended follow-up: run Lighthouse against `https://eryawanagung.my.id/` from an environment with Chrome/Chromium and npm registry access, then attach the JSON/HTML report as the Stage 9D production baseline.

## Fixes

No code fixes were required. Verification did not identify regressions in the checked metadata, viewport, homepage-only preload scope, local production build, or key-route smoke test.
