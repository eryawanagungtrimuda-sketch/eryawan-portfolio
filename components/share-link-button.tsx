'use client';

import { useState } from 'react';

type ShareLinkButtonProps = {
  url: string;
  className?: string;
};

export default function ShareLinkButton({ url, className }: ShareLinkButtonProps) {
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

  return (
    <div className="flex flex-col items-start gap-2">
      <button type="button" onClick={onCopy} aria-label="Salin tautan wawasan" className={className}>
        Salin Link
      </button>
      {copied ? <span className="text-xs text-[#D4AF37]">Link disalin</span> : null}
    </div>
  );
}
