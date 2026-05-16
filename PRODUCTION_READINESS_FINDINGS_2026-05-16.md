# Production Readiness Findings
Date: 2026-05-16
Domain: https://eryawanagung.my.id

## Executive Summary
Production setup is already close to launch quality, with solid baseline metadata in root layout, dynamic OG support, and explicit robots/sitemap handlers. The biggest risk cluster is SEO consistency drift caused by mixed fallback domains (`eryawanagung.com` vs `eryawanagung.my.id`) and runtime-generated sitemap timestamps that can reduce crawl signal quality. Secondary risks are admin-surface discoverability, environment hygiene (`.env.example` duplication), and several accessibility/performance opportunities that can be improved in small safe PRs without touching gallery/admin core logic.

## Must Fix Before Wider Public Sharing

### 1) Domain consistency mismatch in fallback URLs
- **Issue**: Multiple pages and metadata routes still fallback to `https://eryawanagung.com`, while production domain is `https://eryawanagung.my.id`.
- **File/location**: `app/robots.ts`, `app/sitemap.ts`, `app/karya/page.tsx`, `app/tentang/page.tsx`, `app/karya/[slug]/page.tsx`, `app/wawasan/page.tsx`, `app/wawasan/[slug]/page.tsx`, `app/mulai-project/page.tsx`.
- **Risk**: Canonical, Open Graph URL, robots sitemap URL, and dynamic metadata can emit wrong host when env variable is missing/misconfigured in any environment. This can create duplicate-index candidates and dilute share previews.
- **Recommended fix**: Standardize single fallback constant to `https://eryawanagung.my.id` across app metadata and metadata-route files.
- **Suggested PR size**: **XS** (single-purpose text-level update).

### 2) Sitemap `lastModified` uses request-time `new Date()` for static routes
- **Issue**: Static routes in sitemap are stamped with current request time (`new Date()`), not content-level update events.
- **File/location**: `app/sitemap.ts` static route map and dynamic item fallbacks.
- **Risk**: Search crawlers may interpret pages as constantly changing, reducing trust in freshness signals and crawl efficiency.
- **Recommended fix**: Use stable timestamps (e.g., repository build stamp or fixed recent baseline), and only use real content timestamps for dynamic entries.
- **Suggested PR size**: **S**.

### 3) Duplicate key in `.env.example`
- **Issue**: `NEXT_PUBLIC_PROJECT_IMAGES_BUCKET` appears twice.
- **File/location**: `.env.example`.
- **Risk**: Confuses onboarding, increases configuration mistakes, and weakens environment hygiene review.
- **Recommended fix**: Keep one authoritative key and add short comments for required/optional variables.
- **Suggested PR size**: **XS**.

## Should Fix Soon

### 4) Root/home metadata canonical is relative while many inner pages are absolute
- **Issue**: `app/layout.tsx` uses `alternates.canonical: '/'` and OG URL `'/'`, while page-level metadata often uses absolute URLs.
- **File/location**: `app/layout.tsx` plus page metadata files.
- **Risk**: Inconsistency is technically valid with `metadataBase`, but operationally brittle during environment migrations and audits.
- **Recommended fix**: Standardize canonical/OG URL strategy (all metadata derived from one site URL utility).
- **Suggested PR size**: **S**.

### 5) Admin route discoverability through client-visible edit shortcuts
- **Issue**: Public detail pages include admin edit shortcut components that resolve at client runtime for logged-in admin.
- **File/location**: `app/karya/[slug]/page.tsx`, `app/wawasan/[slug]/page.tsx`, `components/admin-edit-project-shortcut.tsx`, `components/admin-edit-wawasan-shortcut.tsx`.
- **Risk**: Low direct security risk (button hidden for non-admin), but increases admin surface discoverability and coupling between public routes and admin controls.
- **Recommended fix**: Gate via stronger server-side claims check and optional feature flag for production public pages.
- **Suggested PR size**: **S-M**.

### 6) Accessibility baseline: missing explicit skip-link and mixed heading font semantics
- **Issue**: No obvious skip-to-content link in root layout; multiple pages rely heavily on stylized text with visual hierarchy.
- **File/location**: `app/layout.tsx` and major page templates.
- **Risk**: Keyboard navigation and screen-reader ergonomics may be weaker than expected for production portfolio site.
- **Recommended fix**: Add non-intrusive skip-link + quick semantic pass for heading order and interactive target labels.
- **Suggested PR size**: **S**.

### 7) Image optimization opportunities (`img` instead of `next/image` in some high-visibility areas)
- **Issue**: Some pages render large images via native `<img>`.
- **File/location**: `app/wawasan/[slug]/page.tsx` (cover/source project images), possibly other content-gallery-adjacent paths.
- **Risk**: Potential LCP/bandwidth inefficiency on slower mobile networks.
- **Recommended fix**: Selective migration to `next/image` only where safe and non-disruptive; do not alter gallery crop/order logic.
- **Suggested PR size**: **M** (careful testing).

### 8) Route health and structured metadata quality checks not automated
- **Issue**: No documented periodic check for all public pages, metadata rendering, robots and sitemap validity.
- **File/location**: Process/documentation gap (repository-level).
- **Risk**: Regressions may reach production unnoticed.
- **Recommended fix**: Add lightweight checklist and optional CI smoke checks for metadata/route responses.
- **Suggested PR size**: **S-M**.

## Nice To Polish Later

### 9) Twitter metadata completeness could be made uniform
- **Issue**: Some pages have full twitter metadata including image, some only partial/default inheritance.
- **File/location**: `app/mulai-project/page.tsx`, others compared against detail pages.
- **Risk**: Minor variance in social card quality across URLs.
- **Recommended fix**: Ensure all key landing pages specify card/title/description/image explicitly.
- **Suggested PR size**: **XS-S**.

### 10) Public folder assets are minimal and can be extended for richer SEO/support files
- **Issue**: Public assets currently appear limited (`hero.jpg` only from quick scan).
- **File/location**: `public/`.
- **Risk**: Missing optional assets such as additional share images, favicon variants, or crawler verification files if needed later.
- **Recommended fix**: Add production asset checklist; implement only as needed.
- **Suggested PR size**: **S**.

### 11) Dead code and unused import sweeps should be periodic
- **Issue**: No obvious debug logs found, but periodic dead-code sweep should be institutionalized.
- **File/location**: `app/`, `components/`, `lib/` (process-level maintenance).
- **Risk**: Gradual bundle and maintenance bloat.
- **Recommended fix**: Add lint rule cadence and monthly cleanup ticket.
- **Suggested PR size**: **S**.

## Safe PR Plan

- **PR 1: SEO / robots / sitemap**
  - Unify fallback domain constants to `https://eryawanagung.my.id`.
  - Normalize canonical/OG URL strategy across root + page metadata.
  - Stabilize sitemap `lastModified` behavior for static routes.

- **PR 2: environment cleanup**
  - Remove duplicate `.env.example` entry.
  - Add concise comments to clarify public vs secret variables.

- **PR 3: accessibility and link safety**
  - Add skip-link and verify keyboard flow.
  - Verify external link safety pattern (`target="_blank"` + `rel`) where applicable.
  - Validate alt text fallbacks for editorial images.

- **PR 4: admin link hardening**
  - Reduce public/admin coupling by tightening server-side eligibility gate or feature-flag behavior.
  - Keep existing admin editing functionality unchanged.

- **PR 5: performance and image polish**
  - Apply targeted image optimization on non-sensitive pages.
  - Validate mobile overflow, LCP, and hydration stability after small changes.

## Do Not Touch Without Separate Review
- Supabase RLS
- database schema
- storage bucket logic
- gallery upload/delete/order/crop
- admin editor logic
- Karya filter/search
- Wawasan filter/search
