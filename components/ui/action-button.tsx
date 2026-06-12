import type { ButtonHTMLAttributes } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ActionButtonVariant = 'primary' | 'secondary' | 'admin' | 'back' | 'sticky-social';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionButtonVariant;
};

const baseStyles =
  'inline-flex min-h-11 items-center justify-center rounded-full font-sans text-sm font-semibold leading-none transition duration-300 motion-safe:active:scale-[0.985] motion-safe:active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]';

const variantStyles: Record<ActionButtonVariant, string> = {
  primary: 'border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-black hover:bg-[#E2C866]',
  secondary: 'border border-[#D4AF37]/55 bg-transparent px-5 py-2.5 text-[#D4AF37] hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/12',
  admin: 'border border-[#D4AF37]/50 bg-[#D4AF37]/[0.06] px-5 py-2.5 text-[#D4AF37] hover:border-[#D4AF37]/75 hover:bg-[#D4AF37]/[0.14]',
  back: 'border border-white/20 px-6 py-2.5 text-white/80 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]',
  'sticky-social': 'min-w-[200px] max-w-[calc(100vw-48px)] whitespace-nowrap border border-[#D4AF37]/60 bg-[#0B0A08]/90 px-7 py-3 text-[#E2C866] shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur hover:border-[#D4AF37]/80 hover:bg-[#0B0A08]',
};

export function ActionButton({ variant = 'secondary', className, type = 'button', ...props }: ActionButtonProps) {
  return <button type={type} className={cx(baseStyles, variantStyles[variant], className)} {...props} />;
}
