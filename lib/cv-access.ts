export const cvAccessSelectColumns = 'id,full_name,email,company,role,purpose,linkedin_url,whatsapp,status,admin_note,created_at,updated_at,reviewed_at,download_token_created_at,download_expires_at,download_count';
export const cvAccessStatuses = ['pending', 'approved', 'rejected'] as const;
export type CvAccessStatus = (typeof cvAccessStatuses)[number];
export const CV_BUCKET = process.env.CV_STORAGE_BUCKET || 'cv-documents';
export const CV_OBJECT_PATH = process.env.CV_STORAGE_OBJECT_PATH || 'eryawan-agung-trimuda-cv.pdf';
export const CV_SIGNED_URL_EXPIRES_IN = 60 * 60 * 24;
export function sanitizeCvField(input: unknown, max = 500) { return typeof input === 'string' ? input.trim().slice(0, max) : ''; }
export function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
