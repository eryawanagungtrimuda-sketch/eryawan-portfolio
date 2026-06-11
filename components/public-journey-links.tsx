import Link from 'next/link';

type JourneyLink = {
  href: string;
  title: string;
  description: string;
  disabled?: boolean;
  current?: boolean;
  badge?: string;
};

type PublicJourneyLinksProps = {
  title?: string;
  className?: string;
  links?: JourneyLink[];
};

const defaultLinks: JourneyLink[] = [
  {
    href: '/karya',
    title: 'Lihat Karya',
    description: 'Jelajahi studi kasus proyek berbasis keputusan desain.',
  },
  {
    href: '/wawasan',
    title: 'Baca Wawasan',
    description: 'Pelajari insight strategi ruang dan logika desain.',
  },
  {
    href: '/mulai-project',
    title: 'Mulai Percakapan Proyek',
    description: 'Ajukan brief awal agar diskusi proyek lebih terarah.',
  },
];

export default function PublicJourneyLinks({ title = 'Lanjutkan Eksplorasi', className = '', links = defaultLinks }: PublicJourneyLinksProps) {
  const uniqueLinks = links.filter((link, index, arr) => arr.findIndex((item) => item.href === link.href) === index);

  return (
    <section
      className={`rounded-[26px] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018)_52%,rgba(212,175,55,0.055))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.18)] sm:p-6 md:p-7 ${className}`.trim()}
      aria-label="Lanjutkan eksplorasi portfolio Eryawan Agung"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Eryawan Agung</p>
          <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/42 sm:text-[10px]">Interior Designer / Decision-Based Interior Design</p>
          <h2 className="mt-4 font-display text-2xl leading-[1.15] tracking-[-0.02em] text-[#F4F1EA] sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
            Portfolio desain interior yang menampilkan karya, wawasan, dan proses berpikir desain berbasis keputusan.
          </p>
        </div>
        <p className="max-w-sm text-sm leading-7 text-white/56 md:text-right">
          Terbuka untuk peluang kerja, kolaborasi proyek, dan diskusi desain interior.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {uniqueLinks.map((link) => {
          const isCurrent = Boolean(link.current || link.disabled);
          const badgeText = link.badge || (isCurrent ? 'Sedang dibuka' : null);
          const cardClassName = isCurrent
            ? 'flex min-h-11 flex-col rounded-2xl border border-white/10 bg-white/[0.015] px-4 py-3 font-sans opacity-90'
            : 'group flex min-h-11 flex-col rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-3 font-sans transition motion-safe:duration-300 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]';

          const content = (
            <>
              <div className="flex items-start justify-between gap-2">
                <span className={`text-sm font-semibold ${isCurrent ? 'text-[#F4F1EA]/78' : 'text-[#F4F1EA] group-hover:text-[#D4AF37]'}`}>{link.title}</span>
                {badgeText ? (
                  <span className="rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-[#D4AF37]">
                    {badgeText}
                  </span>
                ) : null}
              </div>
              <span className={`mt-1 text-xs leading-6 ${isCurrent ? 'text-white/52' : 'text-white/60'}`}>{link.description}</span>
            </>
          );

          if (isCurrent) {
            return (
              <div key={link.href} aria-disabled="true" className={cardClassName}>
                {content}
              </div>
            );
          }

          return (
            <Link key={link.href} href={link.href} className={cardClassName}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4 font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.16em] text-white/38 sm:flex-row sm:items-center sm:justify-between sm:text-[10px]">
        <span>© Eryawan Agung</span>
        <span>Portfolio Desain Interior Berbasis Keputusan</span>
      </div>
    </section>
  );
}

