import type { Metadata } from "next";

// Applies to every /admin page, including the login page.
export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" }, // e.g. "Messages | Admin"
  robots: { index: false, follow: false }, // keep the admin out of Google
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
