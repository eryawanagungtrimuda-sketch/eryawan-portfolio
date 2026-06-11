# Stage 10A — `/karya` Archive Premium UI Polish

## Baseline performance context

- `/karya` Mobile Performance: around 93.
- `/karya` Desktop Performance: around 99.

## Summary of visual polish

- Refined the archive project cards with a more editorial Indonesian “Studi Kasus / XX” header, quieter index treatment, and a restrained “Karya Terpilih” label.
- Rebalanced title, teaser, share-copy excerpt, metadata, and CTA spacing so each card reads more like a curated interior design archive entry.
- Softened metadata badges with lower-contrast borders, tighter uppercase tracking, and quieter surfaces.
- Reduced desktop hover intensity to a subtle lift with a softer shadow and border treatment.
- Improved image edge treatment with a lightweight CSS gradient overlay while preserving existing archive image sources and lazy loading.
- Adjusted CTA spacing and hierarchy so the primary project route remains prominent while email and WhatsApp actions stay available.

## Preserved behavior

- Existing `/karya/${project.slug}` links are preserved.
- Existing mailto inquiry links are preserved.
- Existing WhatsApp links are preserved.
- Search, filters, sort, mobile filter sheet, active filter chips, reset behavior, and lightbox behavior are preserved.

## Data, query, and image-loading confirmation

- No Supabase query changes were made.
- No database schema, RLS, admin, AI prompt, Social Composer, analytics, or route changes were made.
- Archive images still use the existing `<img>` elements.
- Archive images still use `loading="lazy"` and `decoding="async"`.
- No runtime image transforms or new dependencies were introduced.

## Validation results

- `npm ci` passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run build` passed.
- `npm run start` ran successfully for route header checks.
- `curl -I http://localhost:3000/karya` returned `200 OK`.
- `curl -I http://localhost:3000/wawasan` returned `200 OK`.
