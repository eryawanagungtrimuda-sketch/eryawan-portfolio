'use client';

import { useState } from 'react';

type ShareLinkButtonProps = {
  url: string;
  className?: string;
  ariaLabel?: string;
};

export default function ShareLinkButton({
  url,
  className,
  ariaLabel = 'Salin tautan halaman',
}: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const buttonClassName = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] ${className ?? ''}`.trim();

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onCopy}
        aria-label={ariaLabel}
        className={buttonClassName}
      >
        Salin Link
      </button>
      {copied ? (
        <span className="text-xs text-[#D4AF37]" role="status" aria-live="polite">
          Tautan berhasil disalin.
        </span>
      ) : null}
    </div>
  );
}
