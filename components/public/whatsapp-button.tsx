// Floating "Chat on WhatsApp" button in the bottom-right corner of public pages.
// It appears automatically when Site settings > Social links has a WhatsApp
// link (wa.me/...). The WhatsApp logo path comes from the server (logo library).

export function WhatsAppButton({ url, logoPath }: { url: string; logoPath: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with me on WhatsApp"
      className="group fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 text-[#0f172a] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-xl sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
        <path d={logoPath} />
      </svg>
      {/* Label slides out on hover (desktop) */}
      <span className="hidden max-w-0 overflow-hidden text-sm font-semibold whitespace-nowrap transition-all duration-300 group-hover:max-w-40 group-hover:pr-1 sm:inline">
        Chat on WhatsApp
      </span>
    </a>
  );
}

/**
 * The WhatsApp link from your social links (if any), with a friendly first
 * message filled in so you know the chat came from your portfolio.
 */
export function whatsappLink(socialLinks: { label: string; url: string }[], ownerFirstName: string) {
  const link = socialLinks.find((l) => /whats\s*app/i.test(l.label) || /wa\.me|whatsapp\.com/i.test(l.url));
  if (!link) return null;
  try {
    const url = new URL(link.url);
    if (!url.searchParams.has("text")) {
      // encodeURIComponent writes spaces as %20; WhatsApp can show "+" literally
      const text = encodeURIComponent(
        `Hi ${ownerFirstName}, I found your portfolio and I'd like to talk about working together.`,
      );
      url.search = url.search ? `${url.search}&text=${text}` : `?text=${text}`;
    }
    return url.toString();
  } catch {
    return link.url;
  }
}
