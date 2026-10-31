import { useEffect, useRef, useState } from "react";
import { Check, Facebook, Link2, Linkedin, Mail, MessageCircle, Send, Share2 } from "lucide-react";

type ShareTarget = { label: string; href: string; icon: React.ReactNode };

/** X's current mark; lucide only ships the old bird. */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Each network's own documented share link, so nothing loads their scripts. */
function shareTargets(url: string, title: string): ShareTarget[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const icon = "h-4 w-4";
  return [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: <MessageCircle className={icon} />,
    },
    { label: "X", href: `https://x.com/intent/tweet?text=${t}&url=${u}`, icon: <XIcon /> },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: <Facebook className={icon} />,
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <Linkedin className={icon} />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${u}&text=${t}`,
      icon: <Send className={icon} />,
    },
    {
      label: "Email",
      href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}`,
      icon: <Mail className={icon} />,
    },
  ];
}

/**
 * Share for a story. On phones and tablets it opens the device's own share
 * sheet, which already lists every app the reader uses. Elsewhere it opens a
 * small menu of the common networks plus copy link. `url` should be the
 * canonical address, so shares never carry tracking or preview parameters.
 */
export function ShareButton({
  url,
  title,
  text,
  className = "",
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onShare = async () => {
    // Desktop browsers also expose navigator.share, but their sheet is thin
    // next to the menu, so the native sheet is kept for touch devices.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share(text ? { title, text, url } : { title, url });
        return;
      } catch (err) {
        // The reader closed the sheet; nothing more to do.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Anything else (blocked, unsupported data): fall through to the menu.
      }
    }
    setOpen((v) => !v);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (no permission, insecure context). The address bar
      // still works, so fail quietly rather than show an error for it.
    }
  };

  const item =
    "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-[13.5px] font-medium text-ink hover:bg-surface focus-visible:bg-surface";

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={onShare}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-primary hover:text-primary-hover"
      >
        <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        Share
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Share this story"
          className="absolute right-0 top-full z-30 mt-2 w-52 rounded-md border border-border bg-popover p-1.5 shadow-lift"
        >
          {shareTargets(url, title).map((t) => (
            <a
              key={t.label}
              role="menuitem"
              href={t.href}
              target={t.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={item}
            >
              {t.icon}
              {t.label}
            </a>
          ))}
          <div className="my-1 border-t border-border" />
          <button type="button" role="menuitem" onClick={onCopy} className={item}>
            {copied ? <Check className="h-4 w-4 text-positive" /> : <Link2 className="h-4 w-4" />}
            <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
