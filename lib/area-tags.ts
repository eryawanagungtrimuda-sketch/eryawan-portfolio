const AREA_TAG_LABEL_MAP: Record<string, string> = {
  'Lobby': 'Lobby',
  'Reception': 'Resepsionis',
  'Waiting Area': 'Ruang Tunggu',
  'Living Room': 'Ruang Keluarga',
  'Dining Area': 'Ruang Makan',
  'Kitchen': 'Dapur',
  'Bedroom': 'Kamar Tidur',
  'Bathroom': 'Kamar Mandi',
  'Workspace': 'Area Kerja',
  'Meeting Room': 'Ruang Meeting',
  'Consultation Room': 'Ruang Konsultasi',
  'Treatment Room': 'Ruang Treatment',
  'Retail Area': 'Area Retail',
  'Display Area': 'Area Display',
  'Cafe Area': 'Area Cafe',
  'Pantry': 'Pantry',
  'Corridor': 'Koridor',
  'Facade': 'Fasad',
  'Outdoor Area': 'Area Outdoor',
  'Public Service Area': 'Area Layanan Publik',
  'Furniture / Built-in': 'Furniture / Built-in',
  'Other': 'Lainnya',
};

export function getAreaTagLabel(value: string) {
  return AREA_TAG_LABEL_MAP[value] || value;
}
