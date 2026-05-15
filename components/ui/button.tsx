import Link from 'next/link';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: ButtonVariant;
  ariaLabel?: string;
};

const baseStyles = 'inline-flex min-h-11 max-w-full items-center justify-center rounded-full px-7 py-3 text-center font-mono text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 ease-out hover:bg-white/5 active:scale-[0.98] active:brightness-95';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#C8A951] text-[#080807] hover:bg-[#D7BD72]',
  secondary: 'border border-white/10 bg-transparent text-[#C8A951] hover:border-[#C8A951]/35 hover:bg-[#C8A951]/10',
};

export default function Button({ children, href, className = '', variant = 'primary', ariaLabel }: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  if (href) {
    return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>;
  }

  return <button type="button" className={classes} aria-label={ariaLabel}>{children}</button>;
}
