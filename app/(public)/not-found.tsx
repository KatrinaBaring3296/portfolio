import { StatusMessage } from "@/components/public/status-message";

// Shown (with the site header and footer) when a public page calls notFound(),
// e.g. a hidden profile or a project that doesn't exist.
export default function NotFound() {
  return (
    <StatusMessage code="404" title="Page not found">
      <p>This page doesn&apos;t exist, or it&apos;s no longer available.</p>
    </StatusMessage>
  );
}
