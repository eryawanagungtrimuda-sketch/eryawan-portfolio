import { defaultChecklist } from './constants';
import type { ComposerDraft, PublishChecklist } from './types';

export function safeParseStoredJson<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

export function readStoredDraft(storageKey: string) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    return safeParseStoredJson<ComposerDraft>(raw);
  } catch {
    // ignore invalid session data
    return null;
  }
}

export function writeStoredDraft(storageKey: string, draft: ComposerDraft) {
  sessionStorage.setItem(storageKey, JSON.stringify(draft));
}

export function readStoredChecklist(checklistStorageKey: string) {
  try {
    const raw = localStorage.getItem(checklistStorageKey);
    if (!raw) {
      return defaultChecklist;
    }
    const parsed = safeParseStoredJson<Partial<PublishChecklist>>(raw);
    return { ...defaultChecklist, ...parsed };
  } catch {
    return defaultChecklist;
  }
}

export function writeStoredChecklist(checklistStorageKey: string, checklist: PublishChecklist) {
  localStorage.setItem(checklistStorageKey, JSON.stringify(checklist));
}

export function removeStoredChecklist(checklistStorageKey: string) {
  localStorage.removeItem(checklistStorageKey);
}
