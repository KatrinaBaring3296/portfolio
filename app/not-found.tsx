import { StatusMessage } from "@/components/public/status-message";

export const metadata = { title: "Page not found" };

// Shown for any URL that doesn't match a page at all (e.g. /contact-us).
export default function NotFound() {
  return (
    <main>
      <StatusMessage code="404" title="Page not found">
        <p>The link may be mistyped, or the page may have moved.</p>
      </StatusMessage>
    </main>
  );
}
