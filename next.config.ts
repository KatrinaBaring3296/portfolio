import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// The config runs before Next.js loads .env.local in dev, so load it here first
// (otherwise the Supabase URL below is empty and uploaded images are blocked).
loadEnvConfig(__dirname);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// - Other websites can't show this site inside a frame (stops "clickjacking":
//   tricking visitors into clicking hidden buttons on this site)
// - Browsers treat files as exactly the type the server says (an uploaded
//   image can't be run as a script)
// - Links to other sites only share this domain, not the full page address
// - The site never asks for the camera, microphone, location, or payments
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Allow next/image to load (and optimize) files from your Supabase public buckets only
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
  // Security rules sent to the browser with every page (see the list below)
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // Pin the project root: an old package.json in C:\Users\Asus would otherwise confuse Next.js
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
