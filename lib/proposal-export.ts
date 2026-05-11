import type { ProjectInquiry, ProjectInquiryProposalDraft } from '@/lib/types';

const fallbackText = 'Belum diisi';

function normalizeValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallbackText;
}

function sanitizeFilenamePart(value: string) {
  const normalized = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const cleaned = normalized.replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned || 'calon-klien';
}

export function buildProposalTextContent(inquiry: ProjectInquiry, draft: ProjectInquiryProposalDraft) {
  const lines = [
    `Judul Proposal: ${draft.title}`,
    '',
    'Ringkasan Inquiry',
    `- Nama calon klien: ${normalizeValue(inquiry.nama)}`,
    `- Perusahaan / Brand / Instansi: ${normalizeValue(inquiry.perusahaan)}`,
    `- Email: ${normalizeValue(inquiry.email)}`,
    `- WhatsApp: ${normalizeValue(inquiry.whatsapp)}`,
    `- Jenis kebutuhan: ${normalizeValue(inquiry.jenis_kebutuhan)}`,
    `- Lokasi project: ${normalizeValue(inquiry.lokasi_project)}`,
    `- Estimasi luas: ${normalizeValue(inquiry.estimasi_luas)}`,
    `- Tahap project: ${normalizeValue(inquiry.tahap_project)}`,
    `- Timeline: ${normalizeValue(inquiry.timeline)}`,
    `- Range budget: ${normalizeValue(inquiry.budget_range)}`,
    `- Status file: ${normalizeValue(inquiry.status_file)}`,
    `- Kebutuhan utama: ${normalizeValue(inquiry.kebutuhan_utama)}`,
    '',
    'Isi Proposal',
    draft.draft_content,
    '',
    'Pesan Follow-up',
    draft.follow_up_message?.trim() || fallbackText,
    '',
    'Metadata Draft',
    `- Versi: ${draft.version}`,
    `- Status: ${draft.status}`,
    `- Tanggal dibuat: ${new Date(draft.created_at).toLocaleString('id-ID')}`,
    `- Dibuat oleh: ${normalizeValue(draft.created_by)}`,
  ];

  return lines.join('\n');
}

export function downloadProposalText(inquiry: ProjectInquiry, draft: ProjectInquiryProposalDraft) {
  const text = buildProposalTextContent(inquiry, draft);
  const clientOrCompany = inquiry.perusahaan || inquiry.nama || 'calon-klien';
  const filename = `proposal-${sanitizeFilenamePart(clientOrCompany)}-v${draft.version}.txt`;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
