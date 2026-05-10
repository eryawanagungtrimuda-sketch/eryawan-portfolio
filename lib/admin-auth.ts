import { adminEmail } from '@/lib/supabase';

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}
