type CvAccessNotificationPayload = {
  requestId: string;
  fullName: string;
  email: string;
  company: string | null;
  role: string | null;
  purpose: string;
  createdAt: string;
  adminUrl: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

function buildTextBody(payload: CvAccessNotificationPayload) {
  return `Ada permintaan akses CV baru.\n\nNama:\n${payload.fullName}\n\nEmail:\n${payload.email}\n\nPerusahaan:\n${payload.company || '-'}\n\nJabatan:\n${payload.role || '-'}\n\nTujuan:\n${payload.purpose}\n\nReview di dashboard admin:\n${payload.adminUrl}`;
}

function getAdminUrl() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || '').trim();
  const origin = siteUrl ? (siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`) : 'http://localhost:3000';
  return `${origin.replace(/\/$/, '')}/admin/dashboard`;
}

function getNotifyEmail() {
  return (process.env.CV_ACCESS_ADMIN_NOTIFY_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').trim();
}

async function sendAdminEmail(payload: CvAccessNotificationPayload) {
  const to = getNotifyEmail();
  if (!to) return;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = (process.env.CV_ACCESS_NOTIFY_EMAIL_FROM || process.env.EMAIL_FROM || '').trim();
  if (!apiKey || !from) {
    console.warn('CV access email notification skipped: RESEND_API_KEY and CV_ACCESS_NOTIFY_EMAIL_FROM/EMAIL_FROM are required.');
    return;
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject: 'Permintaan Akses CV Baru', text: buildTextBody(payload) }),
  });

  if (!response.ok) throw new Error(`Resend email API returned ${response.status}`);
}

async function sendWebhook(payload: CvAccessNotificationPayload) {
  const webhookUrl = process.env.CV_ACCESS_NOTIFY_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'cv_access_request_created', ...payload }),
  });

  if (!response.ok) throw new Error(`CV access webhook returned ${response.status}`);
}

export async function notifyCvAccessRequestCreated(payload: Omit<CvAccessNotificationPayload, 'adminUrl'>) {
  const notificationPayload = { ...payload, adminUrl: getAdminUrl() };
  const [emailResult, webhookResult] = await Promise.allSettled([
    sendAdminEmail(notificationPayload),
    sendWebhook(notificationPayload),
  ]);

  if (emailResult.status === 'rejected') console.warn('CV access email notification failed:', emailResult.reason);
  if (webhookResult.status === 'rejected') console.warn('CV access webhook notification failed:', webhookResult.reason);
}
