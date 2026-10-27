/**
 * Detect public Supabase Storage object URLs without matching unrelated hosts
 * or arbitrary URLs that merely contain the same path fragment.
 */
export function isSupabaseStorageUrl(src?: string | null): boolean {
  if (!src) return false;

  try {
    const url = new URL(src);
    const isSupabaseHost = url.hostname === 'supabase.co' || url.hostname.endsWith('.supabase.co');
    return (
      url.protocol === 'https:' &&
      isSupabaseHost &&
      /^\/storage\/v1\/object\/public\//.test(url.pathname)
    );
  } catch {
    return false;
  }
}
