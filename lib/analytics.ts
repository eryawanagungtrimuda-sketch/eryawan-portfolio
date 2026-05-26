export type AnalyticsEventName =
  | 'cta_click'
  | 'contact_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'project_view_intent'
  | 'insight_view_intent';

export type AnalyticsEventProps = {
  source: string;
  label: string;
  content_type?: string;
  slug?: string;
  href_type?: string;
};

type VaTrack = (eventName: string, payload?: Record<string, string>) => void;

const ALLOWED_EVENT_NAMES: ReadonlySet<AnalyticsEventName> = new Set<AnalyticsEventName>([
  'cta_click',
  'contact_click',
  'whatsapp_click',
  'email_click',
  'project_view_intent',
  'insight_view_intent',
]);

function getRuntimeTrack(): VaTrack | null {
  if (typeof window === 'undefined') return null;

  const candidate = (window as Window & { va?: unknown }).va;
  return typeof candidate === 'function' ? (candidate as VaTrack) : null;
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsEventProps) {
  if (!ALLOWED_EVENT_NAMES.has(name)) return;

  const runtimeTrack = getRuntimeTrack();
  if (!runtimeTrack) return;

  const safeProps: Record<string, string> = {
    source: props.source,
    label: props.label,
    ...(props.content_type ? { content_type: props.content_type } : {}),
    ...(props.slug ? { slug: props.slug } : {}),
    ...(props.href_type ? { href_type: props.href_type } : {}),
  };

  try {
    runtimeTrack(name, safeProps);
  } catch {
    // no-op by design: analytics failures must never break navigation or UI interaction.
  }
}
