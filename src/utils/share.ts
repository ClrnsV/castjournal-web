/**
 * Builds the shareable link for a catch and copies it to the clipboard.
 * Falls back to a legacy `execCommand` copy when the Clipboard API isn't
 * available (e.g. non-HTTPS / insecure contexts), and never throws —
 * callers get a boolean back so they can show a toast either way.
 */
export function buildCatchShareUrl(catchId: string): string {
  return `${window.location.origin}/catches/${catchId}`;
}

async function copyWithClipboardApi(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function copyWithFallback(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Keep it out of view/scroll and out of the accessibility tree.
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.left = '-1000px';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  const hasClipboardApi = typeof navigator !== 'undefined' && !!navigator.clipboard && window.isSecureContext;
  if (hasClipboardApi) {
    const ok = await copyWithClipboardApi(text);
    if (ok) return true;
  }
  // Either the Clipboard API isn't available, or it failed (e.g. permission
  // denied) — try the older execCommand approach before giving up.
  return copyWithFallback(text);
}

export async function copyCatchLink(catchId: string): Promise<boolean> {
  return copyToClipboard(buildCatchShareUrl(catchId));
}