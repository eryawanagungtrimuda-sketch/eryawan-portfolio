import Link from 'next/link';

type JourneyLink = {
  href: string;
  title: string;
  description: string;
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
    <section className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7 ${className}`.trim()} aria-label="Lanjutkan eksplorasi halaman publik">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Journey Navigation</p>
      <h2 className="mt-4 font-display text-2xl leading-[1.15] tracking-[-0.02em] text-[#F4F1EA] sm:text-3xl">{title}</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {uniqueLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex min-h-11 flex-col rounded-2xl border border-white/12 bg-white/[0.02] px-4 py-3 font-sans transition motion-safe:duration-300 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
          >
            <span className="text-sm font-semibold text-[#F4F1EA] group-hover:text-[#D4AF37]">{link.title}</span>
            <span className="mt-1 text-xs leading-6 text-white/60">{link.description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
