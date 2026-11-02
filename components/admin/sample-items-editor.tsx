"use client";

import { ArrowDown, ArrowUp, FileText, Link2, PlayCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SampleItem, videoEmbed } from "@/lib/types";
import { FileUpload } from "./file-upload";
import { useToast } from "./toast";
import { iconButtonClass, inputClass, secondaryButtonClass } from "./ui";
import { watermarkImage } from "./watermark";

const KIND_NAME: Record<SampleItem["kind"], string> = {
  image: "photo",
  pdf: "file",
  video: "video",
  link: "video",
};

// Photos and PDFs, each with its own description: a work sample's files, or an
// education entry's diploma. Photos can be watermarked in the browser before
// upload (ticked by default). With allowVideo, also uploaded videos and
// YouTube / Loom / Vimeo / Google Drive video links.
export function SampleItemsEditor({
  value,
  onChange,
  ownerName,
  folder = "samples",
  max = 30,
  watermarkNote = "work sample · not for reuse",
  placeholder = "What this shows, and what you did. e.g. A weekly schedule I built for a client's team of 8.",
  allowVideo = false,
  hint = (
    <>
      Word, Excel, or PowerPoint samples: save them as PDF first (File &gt; Save as / Export &gt; PDF). Cover
      any client names, emails, or private details before uploading.
    </>
  ),
}: {
  value: SampleItem[];
  onChange: (items: SampleItem[]) => void;
  ownerName: string;
  folder?: string;
  max?: number;
  watermarkNote?: string;
  placeholder?: string;
  hint?: React.ReactNode;
  allowVideo?: boolean;
}) {
  const toast = useToast();
  const [watermark, setWatermark] = useState(true);
  const [link, setLink] = useState("");

  const update = (index: number, caption: string) =>
    onChange(value.map((item, i) => (i === index ? { ...item, caption } : item)));

  const move = (index: number, offset: -1 | 1) => {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  };

  const add = (kind: SampleItem["kind"]) => (url: string | null, file?: File) =>
    url && onChange([...value, { url, kind, name: file?.name ?? "", caption: "" }]);

  // A pasted YouTube, Loom, Vimeo, or Google Drive link becomes a video played on the page
  const addLink = () => {
    const embed = videoEmbed(link);
    if (!embed) {
      toast("Paste a YouTube, Loom, Vimeo, or Google Drive video link.", "error");
      return;
    }
    if (value.some((item) => item.url === embed.url)) {
      toast("That video is already added.", "error");
      return;
    }
    onChange([...value, { url: embed.url, kind: "link", name: embed.name, caption: "" }]);
    setLink("");
    toast("Video added. Click Save to keep it.");
  };

  return (
    <div className="space-y-3">
      {value.map((item, i) => (
        <div key={item.url} className="flex gap-3 rounded-lg border border-border p-2">
          <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary-tint">
            {item.kind === "image" ? (
              <Image src={item.url} alt={`File ${i + 1}`} fill sizes="112px" className="object-cover" />
            ) : item.kind === "video" ? (
              // Shows the video's first frame; only a small part of the file loads
              <video src={item.url} preload="metadata" muted className="size-full object-cover" />
            ) : item.kind === "link" ? (
              <span className="flex flex-col items-center gap-1 p-1 text-center text-xs font-semibold text-primary-dark">
                <PlayCircle className="size-6" aria-hidden />
                {item.name || "Video link"}
              </span>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 p-1 text-center text-xs font-semibold text-primary-dark"
              >
                <FileText className="size-6" aria-hidden />
                <span className="line-clamp-2 break-all">{item.name || "PDF"}</span>
              </a>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={`sample-caption-${i}`} className="text-xs font-semibold">
              Description of this {KIND_NAME[item.kind]} (optional)
            </label>
            <textarea
              id={`sample-caption-${i}`}
              rows={3}
              maxLength={1000}
              value={item.caption}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className={`${inputClass} mt-1 resize-y`}
            />
          </div>
          <div className="flex flex-col">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => move(i, -1)}
              aria-label={`Move file ${i + 1} up`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowUp className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
              aria-label={`Move file ${i + 1} down`}
              className={`${iconButtonClass} size-7`}
            >
              <ArrowDown className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove file ${i + 1}`}
              className={`${iconButtonClass} size-7`}
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      ))}

      {value.length < max && (
        <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {/* Uploaders that always start empty; each upload adds a new item */}
            <FileUpload
              bucket="images"
              folder={folder}
              value={null}
              label="Add photo"
              transform={watermark ? (file) => watermarkImage(file, ownerName, watermarkNote) : undefined}
              onChange={add("image")}
            />
            <FileUpload bucket="resumes" folder={folder} value={null} label="Add PDF" onChange={add("pdf")} />
            {allowVideo && (
              <FileUpload
                bucket="videos"
                folder={folder}
                value={null}
                label="Add video"
                onChange={add("video")}
              />
            )}
          </div>
          {allowVideo && (
            <div>
              <label htmlFor={`video-link-${folder}`} className="text-xs font-semibold">
                Or paste a video link (YouTube, Loom, Vimeo, or Google Drive)
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id={`video-link-${folder}`}
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter adds the link instead of submitting the whole form
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLink();
                    }
                  }}
                  placeholder="https://youtu.be/..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!link.trim()}
                  className={secondaryButtonClass}
                >
                  <Link2 className="size-4" aria-hidden /> Add link
                </button>
              </div>
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={watermark}
              onChange={(e) => setWatermark(e.target.checked)}
              className="size-4 accent-primary"
            />
            Watermark photos with my name (untick for work you want shown clean)
          </label>
          <p className="text-xs text-muted">{hint}</p>
        </div>
      )}
    </div>
  );
}
