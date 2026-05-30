import { type ReactNode } from 'react';

export function Field({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label className="block max-w-full text-sm text-white/90">
      {label}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-1 min-h-11 w-full max-w-full rounded-xl border border-white/15 bg-[#11100f] p-3 text-sm font-sans text-[#F4F1EA] break-words focus:border-[#D4AF37]/70 focus:outline-none" />
    </label>
  );
}

export function ButtonRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 pt-2 sm:gap-3">{children}</div>;
}

export function CopyButton({ label, copied, onClick, className = '' }: { label: string; copied?: boolean; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-11 max-w-full whitespace-nowrap rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2 text-sm font-sans text-[#E6C676] ${className}`}>
      {copied ? 'Disalin' : label}
    </button>
  );
}

export function ChecklistSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#E6C676]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function ChecklistItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white/90">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-[#D4AF37]" />
      <span>{label}</span>
    </label>
  );
}

export function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm text-white/90">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-white/15 bg-[#11100f] px-3 py-2 text-sm text-[#F4F1EA] focus:border-[#D4AF37]/70 focus:outline-none" />
    </label>
  );
}
