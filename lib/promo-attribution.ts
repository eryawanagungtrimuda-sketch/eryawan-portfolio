export const PROMO_ATTRIBUTION_STORAGE_KEY = "eryawan_promo_attribution";
export const PROMO_SESSION_KEY = "eryawan_promo_session_id";
export const PROMO_TRACKED_KEYS = "eryawan_promo_tracked_keys";

export const ALLOWED_PROMO_SOURCES = new Set([
  "instagram",
  "tiktok",
  "facebook",
  "youtube_short",
  "linkedin",
  "pinterest",
  "whatsapp",
  "manual",
]);

export type PromoAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export function sanitizePromoValue(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export function readPromoAttribution(): PromoAttribution {
  const empty: PromoAttribution = {
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
  };

  if (typeof window === "undefined") return empty;

  try {
    const stored = window.sessionStorage.getItem(PROMO_ATTRIBUTION_STORAGE_KEY);
    if (!stored) return empty;

    const parsed = JSON.parse(stored) as Partial<PromoAttribution>;
    const source = sanitizePromoValue(parsed.utm_source, 80)?.toLowerCase() || null;
    if (!source || !ALLOWED_PROMO_SOURCES.has(source)) return empty;

    return {
      utm_source: source,
      utm_medium: sanitizePromoValue(parsed.utm_medium, 120),
      utm_campaign: sanitizePromoValue(parsed.utm_campaign, 160),
      utm_content: sanitizePromoValue(parsed.utm_content, 200),
    };
  } catch {
    return empty;
  }
}
