import Image from "next/image";
import { ImagePlaceholder } from "./image-placeholder";

// Shows an uploaded image (from Supabase Storage), or a placeholder when
// there isn't one yet. The image fills the box, so size it with `className`
// (e.g. "aspect-video rounded-2xl").
export function SiteImage({
  src,
  alt,
  sizes,
  className = "",
  imageClassName = "",
  priority = false,
  variant = "image",
  placeholderLabel = "Image",
}: {
  src: string | null;
  alt: string;
  sizes: string; // how wide the image displays, so the browser downloads the right size
  className?: string;
  imageClassName?: string; // extra classes on the picture itself, e.g. a hover zoom
  priority?: boolean; // true for the main image at the top of a page
  variant?: "image" | "photo";
  placeholderLabel?: string;
}) {
  if (!src) {
    return <ImagePlaceholder label={placeholderLabel} variant={variant} className={className} />;
  }
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${imageClassName}`}
      />
    </div>
  );
}
