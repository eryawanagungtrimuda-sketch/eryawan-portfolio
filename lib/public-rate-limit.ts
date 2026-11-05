import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type PublicRateLimitResult = {
  allowed: boolean;
  configured: boolean;
};

function getClientIp(request: Request): string | null {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp && isIP(realIp)) return realIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const entries = forwardedFor.split(',').map((entry) => entry.trim()).filter(Boolean);
    const candidate = entries[entries.length - 1];
    if (candidate && isIP(candidate)) return candidate;
  }

  return null;
}

/**
 * Uses a keyed hash of the request IP so raw IP addresses are never stored.
 * If the rate-limit migration/configuration is unavailable, this fails open to
 * avoid interrupting legitimate inquiry submissions. The form honeypot and
 * minimum-completion-time checks remain active in that case.
 */
export async function enforcePublicRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<PublicRateLimitResult> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createSupabaseAdminClient();
  const clientIp = getClientIp(request);

  if (!secret || !supabase || !clientIp) {
    return { allowed: true, configured: false };
  }

  const keyHash = createHmac('sha256', secret)
    .update(scope + ':' + clientIp)
    .digest('hex');

  try {
    const { data, error } = await supabase.rpc('consume_public_endpoint_rate_limit', {
      p_key_hash: keyHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.warn('[public-rate-limit] Rate limiter unavailable', {
        scope,
        code: error.code,
      });
      return { allowed: true, configured: false };
    }

    return { allowed: data === true, configured: true };
  } catch {
    console.warn('[public-rate-limit] Rate limiter request failed', { scope });
    return { allowed: true, configured: false };
  }
}
