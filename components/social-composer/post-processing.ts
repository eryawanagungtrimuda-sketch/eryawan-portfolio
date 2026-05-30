import type { ComposerDraft, RegenerableField } from './types';

export function fallbackText(draft: ComposerDraft, field: RegenerableField) {
  return draft[field];
}

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
