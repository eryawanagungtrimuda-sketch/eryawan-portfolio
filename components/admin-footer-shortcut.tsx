import Link from 'next/link';

export default function AdminFooterShortcut() {
  return (
    <Link
      href="/admin"
      aria-label="Panel admin"
      className="inline-block select-none font-mono text-[9px] tracking-[0.24em] text-white/[0.10] transition hover:text-[#C8A951]/50 focus-visible:text-[#C8A951]/70 focus-visible:outline-none"
    >
      Panel
    </Link>
  );
}
