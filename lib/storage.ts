const defaultProjectImagesBucket = 'project-images';

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()?.trim();
  if (!extension) return 'jpg';
  return extension.replace(/[^a-z0-9]/g, '') || 'jpg';
}

function getRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createUniqueStorageFileName(fileName: string) {
  const extension = getFileExtension(fileName);
  return `${Date.now()}-${getRandomId()}.${extension}`;
}

export function getProjectImagesBucketName() {
  return process.env.NEXT_PUBLIC_PROJECT_IMAGES_BUCKET || defaultProjectImagesBucket;
}

export function getStoragePathFromPublicUrl(imageUrl: string, bucketName: string) {
  const marker = `/object/public/${bucketName}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return '';
  return imageUrl.slice(markerIndex + marker.length);
}
