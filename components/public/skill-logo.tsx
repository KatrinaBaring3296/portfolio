import Image from "next/image";
import type { SkillLogo as Logo } from "@/lib/types";

// Draws a skill's logo: a brand logo (SVG path from the logo library) or an
// uploaded image. Works in Server and Client Components.
export function SkillLogo({ logo, className = "size-8" }: { logo: Logo; className?: string }) {
  if (logo.kind === "image") {
    return (
      <span className={`relative inline-block ${className}`}>
        <Image src={logo.url} alt="" fill sizes="64px" className="object-contain" />
      </span>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`brand-logo ${className}`}
      // Fill colors per theme (see .brand-logo in globals.css)
      style={{ "--logo-light": logo.lightFill, "--logo-dark": logo.darkFill } as React.CSSProperties}
    >
      <path d={logo.path} />
    </svg>
  );
}
