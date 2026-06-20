export const PRODUCTION_SITE_URL = "https://eryawanagung.my.id";

export type PromotionSource =
  | "instagram"
  | "tiktok"
  | "facebook"
  | "youtube_short"
  | "linkedin"
  | "manual";

export type PromotionTarget = {
  path: string;
  contentLabel: string;
};

export function toUtmContentLabel(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/[\s-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildPromotionUrl({
  target,
  source,
  campaign,
  content,
}: {
  target: PromotionTarget;
  source: PromotionSource;
  campaign: string;
  content?: string;
}) {
  const url = new URL(target.path, PRODUCTION_SITE_URL);
  const normalizedCampaign = campaign.trim() || "portfolio_content";
  const normalizedContent = toUtmContentLabel(content || target.contentLabel);

  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", normalizedCampaign);

  if (normalizedContent) {
    url.searchParams.set("utm_content", normalizedContent);
  }

  return url.toString();
}
