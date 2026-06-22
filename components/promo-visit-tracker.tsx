'use client';

import { useEffect } from 'react';

const sessionKey = 'eryawan_promo_session_id';
const trackedKey = 'eryawan_promo_tracked_keys';
const allowedSources = new Set(['instagram', 'tiktok', 'facebook', 'youtube_short', 'linkedin', 'manual']);

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
    const utmSource = (params.get('utm_source') || '').trim().toLowerCase();
    if (!utmSource || !allowedSources.has(utmSource)) return;

    const path = window.location.pathname;
    const payload = {
      path,
      utm_source: utmSource,
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content: params.get('utm_content'),
      referrer: document.referrer || null,
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
