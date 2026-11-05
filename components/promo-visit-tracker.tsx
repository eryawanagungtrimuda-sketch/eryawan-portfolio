'use client';

import { useEffect } from 'react';
import {
  ALLOWED_PROMO_SOURCES,
  PROMO_ATTRIBUTION_STORAGE_KEY,
  PROMO_SESSION_KEY,
  PROMO_TRACKED_KEYS,
  sanitizePromoValue,
} from '@/lib/promo-attribution';

const sessionKey = PROMO_SESSION_KEY;
const trackedKey = PROMO_TRACKED_KEYS;
const allowedSources = ALLOWED_PROMO_SOURCES;

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(sessionKey);
    if (existing) return existing;
    const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `promo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(sessionKey, generated);
    return generated;
  } catch {
    return null;
  }
}

function getReferrerOrigin() {
  try {
    return document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    return null;
  }
}

function hasTracked(dedupeKey: string) {
  try {
    const existing = JSON.parse(window.sessionStorage.getItem(trackedKey) || '[]') as string[];
    return existing.includes(dedupeKey);
  } catch {
    return false;
  }
}

function markTracked(dedupeKey: string) {
  try {
    const existing = JSON.parse(window.sessionStorage.getItem(trackedKey) || '[]') as string[];
    const next = Array.from(new Set([...existing, dedupeKey])).slice(-80);
    window.sessionStorage.setItem(trackedKey, JSON.stringify(next));
  } catch {
    // Ignore sessionStorage failures; tracking must never affect page rendering.
  }
}

export default function PromoVisitTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = sanitizePromoValue(params.get('utm_source'), 80)?.toLowerCase() || '';
    if (!utmSource || !allowedSources.has(utmSource)) return;

    const attribution = {
      utm_source: utmSource,
      utm_medium: sanitizePromoValue(params.get('utm_medium'), 120),
      utm_campaign: sanitizePromoValue(params.get('utm_campaign'), 160),
      utm_content: sanitizePromoValue(params.get('utm_content'), 200),
    };

    try {
      window.sessionStorage.setItem(PROMO_ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // Inquiry submission still works if browser session storage is unavailable.
    }

    const path = window.location.pathname;
    const payload = {
      path,
      ...attribution,
      referrer: getReferrerOrigin(),
      session_id: getSessionId(),
    };

    const dedupeKey = JSON.stringify(payload);
    if (hasTracked(dedupeKey)) return;
    markTracked(dedupeKey);

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/promo-visit', blob)) return;
    }

    fetch('/api/promo-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Silent by design: promo tracking must never interrupt public pages.
    });
  }, []);

  return null;
}
