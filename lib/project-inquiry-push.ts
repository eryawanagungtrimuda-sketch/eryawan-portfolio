import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const tableName = 'project_inquiry_push_subscriptions';

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushEnvironment = {
  supabaseUrl: string;
  serviceRoleKey: string;
  publicKey: string;
  privateKey: string;
  subject: string;
};

function getPushEnvironmentState(): {
  config: PushEnvironment | null;
  missingVariables: string[];
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'eryawanagungtrimuda@gmail.com').trim();
  const subject = process.env.WEB_PUSH_SUBJECT || 'mailto:' + adminEmail;

  const missingVariables = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    !publicKey ? 'WEB_PUSH_VAPID_PUBLIC_KEY' : null,
    !privateKey ? 'WEB_PUSH_VAPID_PRIVATE_KEY' : null,
  ].filter((name): name is string => Boolean(name));

  if (missingVariables.length) {
    return { config: null, missingVariables };
  }

  return {
    config: {
      supabaseUrl: supabaseUrl!,
      serviceRoleKey: serviceRoleKey!,
      publicKey: publicKey!,
      privateKey: privateKey!,
      subject,
    },
    missingVariables: [],
  };
}

export function getProjectInquiryPushConfig() {
  const { config, missingVariables } = getPushEnvironmentState();
  return {
    configured: Boolean(config),
    publicKey: config?.publicKey || null,
    missingVariables,
    deploymentEnvironment: process.env.VERCEL_ENV || 'unknown',
  };
}

export async function sendProjectInquiryPushNotification() {
  const config = getPushEnvironmentState().config;
  if (!config) return;

  const supabase = createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data: subscriptions, error } = await supabase
    .from(tableName)
    .select('endpoint,p256dh,auth');

  if (error) throw error;
  if (!subscriptions?.length) return;

  const payload = JSON.stringify({
    title: 'Inquiry Project Baru',
    body: 'Ada brief project baru yang perlu ditinjau.',
    url: '/admin/inquiries',
    tag: 'project-inquiry-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
  });
  const vapidDetails = {
    subject: config.subject,
    publicKey: config.publicKey,
    privateKey: config.privateKey,
  };

  const results = await Promise.allSettled(
    (subscriptions as PushSubscriptionRow[]).map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        payload,
        { TTL: 86400, urgency: 'high', timeout: 5000, vapidDetails }
      )
    )
  );

  const expiredEndpoints: string[] = [];
  let failedCount = 0;
  results.forEach((result, index) => {
    if (result.status !== 'rejected') return;
    const statusCode =
      result.reason && typeof result.reason === 'object'
        ? (result.reason as { statusCode?: number }).statusCode
        : undefined;
    if (statusCode === 404 || statusCode === 410) {
      expiredEndpoints.push((subscriptions as PushSubscriptionRow[])[index].endpoint);
    } else {
      failedCount += 1;
    }
  });

  if (expiredEndpoints.length) {
    const { error: cleanupError } = await supabase
      .from(tableName)
      .delete()
      .in('endpoint', expiredEndpoints);
    if (cleanupError) console.warn('Could not remove expired inquiry push subscriptions.');
  }
  if (failedCount) {
    console.warn('Inquiry desktop push delivery failed for ' + failedCount + ' subscription(s).');
  }
}
