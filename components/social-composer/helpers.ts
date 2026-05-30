import type { ContentType } from './types';

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
