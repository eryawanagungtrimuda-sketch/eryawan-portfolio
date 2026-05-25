const CANONICAL_AREA_TAG_LABELS = {
  lobby: 'Lobby',
  'area cafe': 'Area Cafe',
  'ruang konsultasi': 'Ruang Konsultasi',
  'ruang treatment': 'Ruang Treatment',
  dapur: 'Dapur',
  'ruang makan': 'Ruang Makan',
  'ruang keluarga': 'Ruang Keluarga',
  'kamar tidur': 'Kamar Tidur',
  'kamar mandi': 'Kamar Mandi',
  koridor: 'Koridor',
  fasad: 'Fasad',
  'area outdoor': 'Area Outdoor',
  'area komersial': 'Area Komersial',
  'area privat': 'Area Privat',
} as const;

type CanonicalAreaTagKey = keyof typeof CANONICAL_AREA_TAG_LABELS;

const AREA_TAG_ALIASES: Record<string, CanonicalAreaTagKey> = {
  lobby: 'lobby',
  'area cafe': 'area cafe',
  'area kafe': 'area cafe',
  'cafe area': 'area cafe',
  'café area': 'area cafe',
  'ruang konsultasi': 'ruang konsultasi',
  consultation: 'ruang konsultasi',
  'consultation room': 'ruang konsultasi',
  'ruang treatment': 'ruang treatment',
  'ruang perawatan': 'ruang treatment',
  treatment: 'ruang treatment',
  'treatment room': 'ruang treatment',
  dapur: 'dapur',
  'ruang makan': 'ruang makan',
  'ruang keluarga': 'ruang keluarga',
  'kamar tidur': 'kamar tidur',
  'kamar mandi': 'kamar mandi',
  koridor: 'koridor',
  'koridor belakang': 'koridor',
  fasad: 'fasad',
  'area outdoor': 'area outdoor',
  'area komersial': 'area komersial',
  'area privat': 'area privat',
};

export const DEFAULT_AREA_TAGS: string[] = Object.values(CANONICAL_AREA_TAG_LABELS);

function cleanAreaTagValue(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,/#!$%^&*;:{}=_`~()\[\]\|?+"“”'’]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizeAreaTag(value?: string | null): string {
  const cleaned = cleanAreaTagValue(value);
  if (!cleaned) return '';
  return AREA_TAG_ALIASES[cleaned] || cleaned;
}

export function getCanonicalAreaTag(value?: string | null): string {
  const normalized = normalizeAreaTag(value);
  if (!normalized) return '';
  const canonical = AREA_TAG_ALIASES[normalized] || normalized;
  return canonical;
}

export function getAreaTagLabel(value?: string | null): string {
  const canonical = getCanonicalAreaTag(value);
  if (!canonical) return '';
  const label = CANONICAL_AREA_TAG_LABELS[canonical as CanonicalAreaTagKey];
  if (label) return label;
  return canonical
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function dedupeAreaTags(values: Array<string | null | undefined> = []): string[] {
  if (!Array.isArray(values) || values.length === 0) return [];

  const orderedKeys: string[] = [];
  const seen = new Set<string>();

  values.forEach((value) => {
    const key = getCanonicalAreaTag(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    orderedKeys.push(key);
  });

  const defaultOrderMap = new Map(
    DEFAULT_AREA_TAGS.map((label, index) => [getCanonicalAreaTag(label), index] as const),
  );

  orderedKeys.sort((a, b) => {
    const indexA = defaultOrderMap.get(a);
    const indexB = defaultOrderMap.get(b);
    if (indexA === undefined && indexB === undefined) return 0;
    if (indexA === undefined) return 1;
    if (indexB === undefined) return -1;
    return indexA - indexB;
  });

  return orderedKeys.map((key) => getAreaTagLabel(key)).filter(Boolean);
}
