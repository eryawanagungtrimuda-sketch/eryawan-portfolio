const AREA_TAG_DISPLAY_LABELS: Record<string, string> = {
  lobby: 'Lobby',
  resepsionis: 'Resepsionis',
  'ruang tunggu': 'Ruang Tunggu',
  'ruang keluarga': 'Ruang Keluarga',
  'ruang makan': 'Ruang Makan',
  dapur: 'Dapur',
  pantry: 'Pantry',
  koridor: 'Koridor',
  'kamar tidur': 'Kamar Tidur',
  'kamar mandi': 'Kamar Mandi',
  'area kerja': 'Area Kerja',
  'ruang meeting': 'Ruang Meeting',
  'ruang konsultasi': 'Ruang Konsultasi',
  'ruang treatment': 'Ruang Treatment',
  'area retail': 'Area Retail',
  'area display': 'Area Display',
  'area cafe': 'Area Cafe',
  'area outdoor': 'Area Outdoor',
  'area layanan publik': 'Area Layanan Publik',
  'furniture / built-in': 'Furniture / Built-in',
  fasad: 'Fasad',
  lainnya: 'Lainnya',
};

const AREA_TAG_ALIASES: Record<string, string> = {
  reception: 'resepsionis',
  'waiting area': 'ruang tunggu',
  'living room': 'ruang keluarga',
  'dining area': 'ruang makan',
  kitchen: 'dapur',
  bedroom: 'kamar tidur',
  bathroom: 'kamar mandi',
  workspace: 'area kerja',
  'meeting room': 'ruang meeting',
  'consultation room': 'ruang konsultasi',
  'treatment room': 'ruang treatment',
  'ruang perawatan': 'ruang treatment',
  'retail area': 'area retail',
  'display area': 'area display',
  'cafe area': 'area cafe',
  'area kafe': 'area cafe',
  corridor: 'koridor',
  facade: 'fasad',
  'outdoor area': 'area outdoor',
  'public service area': 'area layanan publik',
  other: 'lainnya',
};

export const DEFAULT_AREA_TAGS: string[] = [
  'Lobby',
  'Resepsionis',
  'Ruang Tunggu',
  'Ruang Keluarga',
  'Ruang Makan',
  'Dapur',
  'Pantry',
  'Koridor',
  'Kamar Tidur',
  'Kamar Mandi',
  'Area Kerja',
  'Ruang Meeting',
  'Ruang Konsultasi',
  'Ruang Treatment',
  'Area Retail',
  'Area Display',
  'Area Cafe',
  'Area Outdoor',
  'Area Layanan Publik',
  'Furniture / Built-in',
  'Fasad',
  'Lainnya',
];

export function normalizeAreaTag(value?: string | null) {
  const normalized = (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return AREA_TAG_ALIASES[normalized] || normalized;
}

export function getAreaTagLabel(value: string) {
  const normalized = normalizeAreaTag(value);
  const canonicalLabel = AREA_TAG_DISPLAY_LABELS[normalized];
  if (canonicalLabel) return canonicalLabel;
  return normalized
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}
