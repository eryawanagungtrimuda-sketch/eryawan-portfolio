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

const baseStyles = 'inline-flex items-center justify-center rounded-[4px] px-7 py-4 font-mono text-sm font-semibold uppercase tracking-[0.1em] transition duration-300 hover:-translate-y-0.5';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#C8A951] text-[#080807] hover:bg-[#D7BD72]',
  secondary: 'border border-[#C8A951] bg-transparent text-[#C8A951] hover:bg-[#C8A951]/10',
};

export default function Button({ children, href, className = '', variant = 'primary', ariaLabel }: ButtonProps) {
  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`.trim();

  if (href) {
    return <Link href={href} className={classes} aria-label={ariaLabel}>{children}</Link>;
  }

  return <button type="button" className={classes} aria-label={ariaLabel}>{children}</button>;
}
