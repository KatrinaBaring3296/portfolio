import { SITE_URL } from "./seo";

// Emails you when someone sends a contact message or a testimonial.
// Uses Resend (resend.com, free plan). Needs RESEND_API_KEY in .env.local / Vercel;
// without it this quietly does nothing, so the forms still work.
//
// On Resend's free plan (no custom domain), emails can only be sent to the
// address you signed up with, so sign up with your ADMIN_EMAIL.

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );

/** Sends one email to you (ADMIN_EMAIL) in the site's style. */
async function emailAdmin(email: {
  subject: string;
  heading: string;
  from: string; // e.g. "Juan Dela Cruz <juan@example.com>" or "Juan Dela Cruz, Dean"
  body: string;
  footer: string; // plain text; may include one link at `link`
  link: { url: string; label: string };
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) return; // not set up yet

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Resend's shared test sender; works without owning a domain
      from: "Portfolio <onboarding@resend.dev>",
      to,
      reply_to: email.replyTo,
      subject: email.subject,
      text: `${email.heading}\n${email.from}\n\n${email.body}\n\n${email.footer} ${email.link.url}`,
      html: `
        <div style="font-family:system-ui,sans-serif;font-size:15px;color:#3b2a24;max-width:560px">
          <p style="margin:0 0 4px;color:#ad4329;font-weight:600">${escapeHtml(email.heading)}</p>
          <p style="margin:0 0 16px"><strong>${escapeHtml(email.from)}</strong></p>
          <div style="white-space:pre-wrap;border-left:4px solid #f08a6c;padding:8px 14px;background:#fdebe2">${escapeHtml(email.body)}</div>
          <p style="margin:16px 0 0;color:#6e5a51;font-size:13px">
            ${escapeHtml(email.footer)}
            <a href="${email.link.url}" style="color:#ad4329">${escapeHtml(email.link.label)}</a>.
          </p>
        </div>`,
    }),
  });

  if (!response.ok) {
    console.error("Notification email failed:", response.status, await response.text());
  }
}

type NewMessage = { name: string; email: string; message: string; profileLabel: string | null };

export async function emailNewMessage(m: NewMessage) {
  const source = m.profileLabel ? ` via your ${m.profileLabel} page` : "";
  await emailAdmin({
    subject: `New message from ${m.name}${source}`,
    heading: `New message${source}`,
    from: `${m.name} <${m.email}>`,
    body: m.message,
    footer: `Press Reply to answer ${m.name} directly, or`,
    link: { url: `${SITE_URL}/admin/messages`, label: "open your admin inbox" },
    replyTo: m.email, // pressing Reply answers the visitor directly
  });
}

export async function emailNewTestimonial(t: { name: string; role: string; quote: string }) {
  await emailAdmin({
    subject: `New testimonial from ${t.name}`,
    heading: "New testimonial (hidden until you approve it)",
    from: t.role ? `${t.name}, ${t.role}` : t.name,
    body: t.quote,
    footer: "To publish it, set its status to Active in",
    link: { url: `${SITE_URL}/admin/testimonials`, label: "Admin → Testimonials" },
  });
}
