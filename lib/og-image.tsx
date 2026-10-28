import { ImageResponse } from "next/og";
import type { FocusProfile, SiteSettings } from "./types";

// The preview card shown when a profile link is shared (LinkedIn, Messenger,
// email, ...). Rendered as a 1200x630 PNG. Only flexbox layout works here.

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#3a2230";
const BRAND = "#cf336f";
const BRAND_DARK = "#c92d6b";
const TINT = "#fdeef4";
const MUTED = "#76586a";

const isPlaceholder = (text: string) => !text.trim() || /^\[.*\]$/.test(text.trim());

export function profileOgImage(settings: SiteSettings, profile: FocusProfile | null) {
  const headline = profile && !isPlaceholder(profile.headline) ? profile.headline : null;

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fffafc", color: INK }}>
      <div style={{ display: "flex", width: 24, height: "100%", background: BRAND }} />
      <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "64px 72px", gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          {profile && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 20px",
                borderRadius: 999,
                border: `2px solid ${BRAND}`,
                background: TINT,
                color: BRAND_DARK,
                fontSize: 28,
              }}
            >
              {profile.label}
            </div>
          )}
          <div style={{ display: "flex", marginTop: 28, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
            {settings.name}
          </div>
          {headline && (
            <div style={{ display: "flex", marginTop: 20, fontSize: 36, lineHeight: 1.3, color: MUTED }}>
              {headline.length > 110 ? `${headline.slice(0, 107)}…` : headline}
            </div>
          )}
          <div style={{ display: "flex", marginTop: 36, fontSize: 26, color: BRAND_DARK }}>
            {isPlaceholder(settings.availability_text) ? "Philippines (UTC+8)" : settings.availability_text}
          </div>
        </div>
        {settings.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element -- next/image doesn't work inside ImageResponse
          <img
            src={settings.photo_url}
            alt=""
            width={320}
            height={400}
            style={{ borderRadius: 32, objectFit: "cover", border: `4px solid ${BRAND}` }}
          />
        )}
      </div>
    </div>,
    OG_SIZE,
  );
}
