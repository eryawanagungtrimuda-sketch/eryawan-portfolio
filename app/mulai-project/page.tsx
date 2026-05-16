import type { Metadata } from 'next';
import ContextualBackButton from '@/components/contextual-back-button';
import ProjectBriefForm from '@/components/project-brief-form';
import RevealObserver from '@/components/reveal-observer';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Mulai Diskusi Project | Eryawan Agung Design Portfolio',
  description:
    'Susun brief awal untuk diskusi project interior, hospitality, workspace, design review, atau kolaborasi strategis bersama Eryawan Agung.',
  alternates: {
    canonical: absoluteUrl('/mulai-project'),
  },
};

export default function MulaiProjectPage() {
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12">
      <RevealObserver />
      <div className="mx-auto max-w-6xl">
        <ContextualBackButton
          fallbackHref="/"
          className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37]"
        />

        <section className="reveal-on-scroll mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#11100c] via-[#0b0b0a] to-[#090908] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-12">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">PROJECT BRIEF</p>
          <h1 className="font-display mt-5 text-4xl leading-[1.08] tracking-[-0.03em] text-[#F6F1E8] md:text-5xl">
            Mulai Diskusi Project
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            Isi beberapa informasi dasar agar arah kebutuhan project bisa dipahami sejak awal. Brief ini membantu
            percakapan menjadi lebih terarah, efisien, dan relevan dengan tujuan ruang maupun bisnis Anda.
          </p>
          <p className="mt-3 text-sm text-[#D9B95D]">
            Susun brief awal agar kebutuhan project bisa dibaca dengan lebih jelas sebelum kita berdiskusi.
          </p>
        </section>

        <ProjectBriefForm />
      </div>
    </main>
  );
}
