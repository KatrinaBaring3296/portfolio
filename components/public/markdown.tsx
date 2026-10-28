import ReactMarkdown from "react-markdown";

// Turns markdown (from the admin panel) into styled HTML.
// Raw HTML inside the markdown is ignored, so it's safe to render.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
