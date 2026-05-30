export type CopiedStateSetter = (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;

export async function copyText(copyKey: string, text: string, setCopied: CopiedStateSetter) {
  try {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [copyKey]: true }));
    window.setTimeout(() => {
      setCopied((prev) => ({ ...prev, [copyKey]: false }));
    }, 2000);
  } catch {
    setCopied((prev) => ({ ...prev, [copyKey]: false }));
  }
}

export function triggerBrowserDownload(blob: Blob, download: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = download;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
