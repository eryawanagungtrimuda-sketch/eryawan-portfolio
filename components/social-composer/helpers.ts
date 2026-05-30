import type { ComposerDraft, ContentType } from './types';

export function ensureThreadsCta(draft: ComposerDraft, canonicalUrl?: string | null): ComposerDraft {
  const safeUrl = String(canonicalUrl || '').trim();
  const expected = `Baca studi lengkapnya di website: ${safeUrl}`;
  const cta = String(draft.threadsCta || '').trim();
  const hasUrlInCta = safeUrl ? cta.includes(safeUrl) : false;
  const onlyPrefix = /^Baca studi lengkapnya di website:\s*$/i.test(cta);
  const missingAfterColon = /^Baca studi lengkapnya di website:\s+$/i.test(draft.threadsCta || '');

  if (cta && hasUrlInCta && !onlyPrefix && !missingAfterColon) return draft;
  return { ...draft, threadsCta: expected };
}

export function shortText(text: string, max = 90) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export function designLabel(designDecision: string, solution: string) {
  return designDecision || solution || 'Keputusan desain diarahkan untuk membuat alur ruang lebih efisien dan nyaman.';
}

export function contentTypeLabel(contentType: ContentType) {
  return contentType === 'wawasan' ? 'wawasan' : 'karya';
}
