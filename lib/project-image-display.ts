export type DisplayRatio = 'landscape' | 'wide' | 'square' | 'portrait' | 'tall';
export type ObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export const DEFAULT_DISPLAY_RATIO: DisplayRatio = 'landscape';
export const DEFAULT_OBJECT_POSITION: ObjectPosition = 'center';
export const DEFAULT_CROP_X = 50;
export const DEFAULT_CROP_Y = 50;
export const DEFAULT_CROP_ZOOM = 1;

export function normalizeDisplayRatio(value?: string | null): DisplayRatio {
  if (value === 'wide' || value === 'square' || value === 'portrait' || value === 'tall' || value === 'landscape') return value;
  return DEFAULT_DISPLAY_RATIO;
}

export function normalizeObjectPosition(value?: string | null): ObjectPosition {
  if (value === 'top' || value === 'bottom' || value === 'left' || value === 'right' || value === 'center') return value;
  return DEFAULT_OBJECT_POSITION;
}

export function getAspectRatioClass(displayRatio?: string | null) {
  const ratio = normalizeDisplayRatio(displayRatio);
  if (ratio === 'wide') return 'aspect-[21/9]';
  if (ratio === 'square') return 'aspect-square';
  if (ratio === 'portrait') return 'aspect-[4/5]';
  if (ratio === 'tall') return 'aspect-[3/4]';
  return 'aspect-[16/9]';
}

export function getAspectRatioValue(displayRatio?: string | null) {
  const ratio = normalizeDisplayRatio(displayRatio);
  if (ratio === 'wide') return '21 / 9';
  if (ratio === 'square') return '1 / 1';
  if (ratio === 'portrait') return '4 / 5';
  if (ratio === 'tall') return '3 / 4';
  return '16 / 9';
}

export function getObjectPositionValue(objectPosition?: string | null) {
  const position = normalizeObjectPosition(objectPosition);
  if (position === 'top') return 'center top';
  if (position === 'bottom') return 'center bottom';
  if (position === 'left') return 'left center';
  if (position === 'right') return 'right center';
  return 'center center';
}

export function getObjectPositionClass(objectPosition?: string | null) {
  const position = normalizeObjectPosition(objectPosition);
  if (position === 'top') return 'object-top';
  if (position === 'bottom') return 'object-bottom';
  if (position === 'left') return 'object-left';
  if (position === 'right') return 'object-right';
  return 'object-center';
}

export function normalizeCropX(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_CROP_X;
  return Math.min(100, Math.max(0, value));
}

export function normalizeCropY(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_CROP_Y;
  return Math.min(100, Math.max(0, value));
}

export function normalizeCropZoom(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_CROP_ZOOM;
  return Math.min(2.5, Math.max(1, value));
}

export function getGalleryImageFrameStyle(image: { display_ratio?: string | null }) {
  return { aspectRatio: getAspectRatioValue(image.display_ratio) };
}

export function getGalleryImageStyle(image: { crop_x?: number | null; crop_y?: number | null; crop_zoom?: number | null }) {
  const cropX = normalizeCropX(image.crop_x);
  const cropY = normalizeCropY(image.crop_y);
  const cropZoom = normalizeCropZoom(image.crop_zoom);
  return {
    objectFit: 'cover' as const,
    objectPosition: `${cropX}% ${cropY}%`,
    transform: `scale(${cropZoom})`,
    transformOrigin: `${cropX}% ${cropY}%`,
  };
}
