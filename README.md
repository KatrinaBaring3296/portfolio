# Portfolio

My personal portfolio: a teacher moving into Virtual Assistant work (admin, customer support,
education support, and online tutoring).
It has **focus profiles** (one URL per type of job), and an **admin panel** where I can edit content
and show/hide things without touching code.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (database, auth, storage) ·
lucide-react · Vercel

## Requirements

- **Node.js 24 LTS, 64-bit** (minimum 22). Check with:
  ```bash
  node -p "process.version + ' ' + process.arch"   # should print v24.x.x x64
  ```
  The 32-bit (`ia32`) build does **not** work: Next.js has no native compiler for it.
- VS Code with the recommended extensions (VS Code will suggest them when you open the folder):
  Prettier, ESLint, Tailwind CSS IntelliSense.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values (Phase 3)
npm run dev                        # open http://localhost:3000
```

## Scripts

| Command                | What it does                                 |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload         |
| `npm run build`        | Production build (run this before deploying) |
| `npm run start`        | Run the production build locally             |
| `npm run lint`         | Check code for problems with ESLint          |
| `npm run format`       | Auto-format every file with Prettier         |
| `npm run format:check` | Check formatting without changing files      |
| `npm run typecheck`    | Check TypeScript types                       |

## Folder structure

```
app/
  layout.tsx              Root layout: fonts, theme (light/dark)
  globals.css             Brand colors + theme tokens (edit colors HERE)
  (public)/               Public site; the (parentheses) group doesn't appear in URLs
    page.tsx              /  → default profile
    for/[profile]/        /for/customer-support, /for/online-tutor, ...
    projects/[slug]/      Project detail pages
  admin/
    login/                /admin/login
    (protected)/          Every admin page; login + admin email are checked here
components/
  public/                 Components for the public site
  admin/                  Components for the admin panel
lib/
  supabase/               Supabase helpers (public client now; logged-in clients in Phase 4)
  content.ts              Loads + caches site content from Supabase (pages call these functions)
  contact-action.ts       Contact form server action (honeypot, validation, insert)
  validation.ts           Contact form rules, shared by browser and server
  types.ts                Shared TypeScript types (mirror the database tables)
proxy.ts                  Redirects logged-out visitors away from /admin (Next 16's name for middleware.ts)
supabase/
  setup.sql               Tables, security rules (RLS), storage buckets, starting content (run once)
```

## Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com) (region: Singapore).
2. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up".
3. **Authentication → Users → Add user → Create new user**: your admin email + a strong password,
   with "Auto Confirm User" ticked.
4. In [`supabase/setup.sql`](supabase/setup.sql), replace `you@example.com` (search "CHANGE THIS")
   with that same email.
5. **SQL Editor → New query**: paste the whole of `setup.sql` and run it, once.
6. **Project Settings → API Keys**: copy the Project URL and publishable key into `.env.local`.

### Extras

- **Email alerts for new messages:** set `RESEND_API_KEY` (free at [resend.com](https://resend.com), sign up
  with the `ADMIN_EMAIL` address). Without it, messages still arrive in the admin inbox. See [`lib/notify.ts`](lib/notify.ts).
- **Visitor stats:** Vercel Web Analytics (enable it in the Vercel project's Analytics tab). Résumé
  downloads are counted via `/resume/[slug]` and shown on the admin dashboard.
- **Keep-alive:** [`vercel.json`](vercel.json) runs `/api/keep-alive` daily so the free Supabase project
  doesn't pause.

### How content updates reach the site

Public pages read everything through [`lib/content.ts`](lib/content.ts), cached under the tag
`content`. Admin saves call `updateTag("content")` so changes show on the next page load. Edits
made directly in the Supabase dashboard appear within about an hour (or after a redeploy).

## Theme

All colors live in [`app/globals.css`](app/globals.css) as CSS variables, exposed to Tailwind as classes
like `bg-primary`, `text-primary-dark`, `bg-primary-tint`, `text-muted`. Each light/dark pair is commented
with its WCAG contrast ratio.

| Token                | Light     | Dark      | Use                                    |
| -------------------- | --------- | --------- | -------------------------------------- |
| `background`         | `#FFF8F1` | `#211715` | Page background (cream / espresso)     |
| `surface`            | `#FFFFFF` | `#2D201D` | Cards                                  |
| `foreground`         | `#3B2A24` | `#FBEFE8` | Body text                              |
| `muted`              | `#6E5A51` | `#C9B3A8` | Secondary text                         |
| `primary`            | `#F08A6C` | `#F2916F` | Coral: buttons, icons, borders, badges |
| `primary-foreground` | `#3B2A24` | `#2A1A15` | Text on primary backgrounds            |
| `primary-dark`       | `#AD4329` | `#F2916F` | Links and small brand-colored text     |
| `primary-tint`       | `#FDEBE2` | `#3A2420` | Soft peach sections, hover states      |
| `accent`             | `#F7B267` | `#E9A15A` | Sunny peach, decoration only           |

Fonts: **Fraunces** (soft serif headings, `font-display`) and **Nunito** (rounded body text, `font-sans`).

## Environment variables

See [`.env.local.example`](.env.local.example). Real values go in `.env.local`, which git ignores.
**Never commit keys.**

## Build phases

Copied from a working portfolio (same features and architecture), then:

- [x] A. Copy and clean: owner content removed, one setup file, teaching/VA starting content
- [x] B. Warm & friendly design (coral/peach + cream)
- [ ] C. Accounts and deploy: GitHub, Supabase, Vercel, Resend
- [ ] D. Real content, filled in through the admin panel
