const AREA_TAG_LABEL_MAP: Record<string, string> = {
  Lobby: 'Lobby',
  Reception: 'Resepsionis',
  'Waiting Area': 'Ruang Tunggu',
  'Living Room': 'Ruang Keluarga',
  'Dining Area': 'Ruang Makan',
  Kitchen: 'Dapur',
  Bedroom: 'Kamar Tidur',
  Bathroom: 'Kamar Mandi',
  Workspace: 'Area Kerja',
  'Meeting Room': 'Ruang Meeting',
  'Consultation Room': 'Ruang Konsultasi',
  'Treatment Room': 'Ruang Treatment',
  'Ruang Perawatan': 'Ruang Treatment',
  'Ruang Treatment': 'Ruang Treatment',
  'Retail Area': 'Area Retail',
  'Display Area': 'Area Display',
  'Cafe Area': 'Area Cafe',
  Pantry: 'Pantry',
  Corridor: 'Koridor',
  Facade: 'Fasad',
  'Outdoor Area': 'Area Outdoor',
  'Public Service Area': 'Area Layanan Publik',
  'Furniture / Built-in': 'Furniture / Built-in',
  Other: 'Lainnya',
};

const AREA_TAG_ALIASES: Record<string, string> = {
  'ruang perawatan': 'ruang treatment',
  'ruang treatment': 'ruang treatment',
};

export const DEFAULT_AREA_TAGS = [
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
] as const;

export function normalizeAreaTag(value?: string | null) {
  const normalized = (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return AREA_TAG_ALIASES[normalized] || normalized;
}

export function getAreaTagLabel(value: string) {
  const normalized = normalizeAreaTag(value);
  if (normalized === 'ruang treatment') return 'Ruang Treatment';
  return AREA_TAG_LABEL_MAP[value] || value;
}
