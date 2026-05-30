import type { ComposerDraft, RegenerableField } from './types';

export function applyRegeneratedFields(
  draft: ComposerDraft,
  blankFields: RegenerableField[],
  regenerated: Partial<Record<RegenerableField, string>>,
) {
  const nextDraft = { ...draft };
  for (const field of blankFields) {
    if (String(nextDraft[field] ?? '').trim()) continue;
    const nextValue = regenerated[field];
    if (typeof nextValue === 'string' && nextValue.trim()) nextDraft[field] = nextValue;
  }
  return nextDraft;
}
