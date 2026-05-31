import ContextualBackButton from '@/components/contextual-back-button';
import TrackedLink from '@/components/tracked-link';

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-[#080807] px-4 py-12 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 motion-safe:animate-[fade-in-up_800ms_ease-out_forwards] sm:p-8 md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Kontak</p>
        <h1 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.03em] md:text-5xl">Mari Diskusikan Kebutuhan Proyek Anda</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">Untuk konsultasi proyek baru, kolaborasi, atau ulasan desain, hubungi Eryawan Studio melalui email berikut.</p>
        <TrackedLink href="mailto:eryawanagungtrimuda@gmail.com" eventName="email_click" eventProps={{ source: "kontak_page", label: "email_primary", href_type: "email" }} data-cta="contact-email" className="mt-8 inline-flex min-h-11 max-w-full break-all rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-black transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866] sm:px-6 sm:text-xs sm:tracking-[0.16em]">eryawanagungtrimuda@gmail.com</TrackedLink>
                <div className="mt-5 flex flex-wrap gap-3">
          <TrackedLink href="/mulai-project" eventName="contact_click" eventProps={{ source: "kontak_page", label: "ajukan_kolaborasi", href_type: "internal" }} data-cta="contact-collaboration" className="inline-flex rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37] transition hover:bg-[#D4AF37]/20">Ajukan Kolaborasi</TrackedLink>
          <ContextualBackButton fallbackHref="/" className="inline-flex rounded-full border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/66 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]" />
        </div>
      </section>
    </main>
  );
}
