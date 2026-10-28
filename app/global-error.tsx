"use client"; // error pages must be Client Components

// Last-resort error page, used only if the root layout itself fails.
// It replaces the whole page, so it can't use the site's stylesheet or fonts:
// the styles are written inline, with the same brand colors.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fff8f1",
          color: "#3b2a24",
          textAlign: "center",
          padding: 16,
        }}
      >
        <title>Something went wrong</title>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#6e5a51" }}>The site couldn&apos;t load. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              border: 0,
              borderRadius: 999,
              background: "#f08a6c",
              color: "#3b2a24",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
