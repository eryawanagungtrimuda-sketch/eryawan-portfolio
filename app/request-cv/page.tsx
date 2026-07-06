import type { Metadata } from 'next';
import ContextualBackButton from '@/components/contextual-back-button';
import CvAccessRequestForm from '@/components/cv-access-request-form';
import RevealObserver from '@/components/reveal-observer';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Minta Akses CV | Eryawan Agung',
  description: 'Form permintaan akses CV lengkap Eryawan Agung dengan proses review terlebih dahulu.',
  alternates: { canonical: absoluteUrl('/request-cv') },
};

export default function RequestCvPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12">
      <RevealObserver />
      <div className="mx-auto max-w-4xl">
        <ContextualBackButton fallbackHref="/" className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37]" ariaLabel="Kembali dari halaman minta akses CV" />
        <section className="reveal-on-scroll mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#11100c] via-[#0b0b0a] to-[#090908] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Akses Terbatas</p>
          <h1 className="font-display mt-5 text-4xl leading-[1.08] tracking-[-0.03em] md:text-5xl">Minta Akses CV</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">Untuk menjaga privasi, CV lengkap hanya tersedia melalui permintaan akses. Silakan isi konteks singkat agar saya dapat meninjau kebutuhan Anda terlebih dahulu.</p>
          <div className="mt-8"><CvAccessRequestForm /></div>
        </section>
      </div>
    </main>
  );
}
