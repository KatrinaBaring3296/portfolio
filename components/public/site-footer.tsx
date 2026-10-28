import type { SiteSettings } from "@/lib/types";

// "use cache" captures the year once instead of reading the clock on every
// request (Next.js requires a choice here; the year rarely changes).
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = await currentYear();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {year} {settings.name}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {settings.social_links.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-dark"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${settings.email}`} className="hover:text-primary-dark">
              {settings.email}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
