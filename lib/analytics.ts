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

declare global {
  interface Window {
    va?: VaTrack;
  }
}

export function trackEvent(name: AnalyticsEventName, props: AnalyticsEventProps) {
  if (typeof window === 'undefined' || typeof window.va !== 'function') return;

  const safeProps: Record<string, string> = {
    source: props.source,
    label: props.label,
    ...(props.content_type ? { content_type: props.content_type } : {}),
    ...(props.slug ? { slug: props.slug } : {}),
    ...(props.href_type ? { href_type: props.href_type } : {}),
  };

  window.va(name, safeProps);
}
