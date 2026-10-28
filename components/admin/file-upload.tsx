"use client";

import { FileText, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "./toast";
import { iconButtonClass, secondaryButtonClass } from "./ui";

const LIMITS = {
  images: { maxMB: 5, accept: "image/jpeg,image/png,image/webp,image/avif,image/gif" },
  resumes: { maxMB: 10, accept: "application/pdf" },
};

// Uploads one file straight from the browser to a Supabase Storage bucket and
// hands back its public URL. The URL is only saved when you click Save on the
// form, so remember to save after uploading.
export function FileUpload({
  bucket,
  folder,
  value,
  onChange,
  label = bucket === "images" ? "Upload image" : "Upload PDF",
  transform,
}: {
  bucket: "images" | "resumes";
  folder: string; // e.g. "profile", "projects"
  value: string | null;
  onChange: (url: string | null, file?: File) => void; // file: what was picked (for its name)
  label?: string;
  // Optional step before upload, e.g. watermarking a certificate
  transform?: (file: File) => Promise<File>;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { maxMB, accept } = LIMITS[bucket];

  async function handleFile(picked: File | undefined) {
    if (!picked) return;
    if (!accept.split(",").includes(picked.type)) {
      toast(
        bucket === "images"
          ? "Please choose a JPG, PNG, WebP, AVIF, or GIF image."
          : "Please choose a PDF file.",
        "error",
      );
      return;
    }

    setUploading(true);
    let file = picked;
    if (transform) {
      try {
        file = await transform(picked);
      } catch (e) {
        setUploading(false);
        toast(e instanceof Error ? e.message : "Couldn't prepare that file.", "error");
        return;
      }
    }
    if (file.size > maxMB * 1024 * 1024) {
      setUploading(false);
      toast(`That file is too big. The limit is ${maxMB} MB.`, "error");
      return;
    }

    // A random name, so a new upload never overwrites (or is cached as) an old file
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (error) {
      toast(`Upload failed: ${error.message}`, "error");
      return;
    }
    onChange(supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl, picked);
    toast("Uploaded. Click Save to keep it.");
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-3">
      {value &&
        (bucket === "images" ? (
          <div className="relative size-20 overflow-hidden rounded-lg border border-border bg-primary-tint">
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary-dark hover:underline"
          >
            <FileText className="size-4" aria-hidden /> View PDF
          </a>
        ))}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={secondaryButtonClass}
      >
        {uploading ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
        ) : bucket === "images" ? (
          <ImagePlus className="size-4" aria-hidden />
        ) : (
          <Upload className="size-4" aria-hidden />
        )}
        {uploading ? "Uploading…" : value ? "Replace" : label}
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove file"
          className={iconButtonClass}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      )}
      <span className="w-full text-xs text-muted">Max {maxMB} MB.</span>
    </div>
  );
}
