import { ImageIcon, UserRound } from "lucide-react";

// Shown wherever an image hasn't been uploaded yet.
// Phase 3 swaps these for real images from Supabase Storage.
export function ImagePlaceholder({
  label = "Image",
  variant = "image",
  className = "",
}: {
  label?: string;
  variant?: "image" | "photo";
  className?: string;
}) {
  const IconComponent = variant === "photo" ? UserRound : ImageIcon;
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-2 bg-primary-tint text-primary-dark ${className}`}
    >
      <IconComponent className="size-10 opacity-70" aria-hidden />
      <span className="font-mono text-xs">{label}</span>
    </div>
  );
}
