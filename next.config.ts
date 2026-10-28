import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// The config runs before Next.js loads .env.local in dev, so load it here first
// (otherwise the Supabase URL below is empty and uploaded images are blocked).
loadEnvConfig(__dirname);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Allow next/image to load (and optimize) files from your Supabase public buckets only
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
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
