# Agami Group website (Vercel)

- `public/index.html` – group home (Agami Group and its four divisions)
- `public/logistics.html`, `marketing.html`, `wiring.html`, `rentals.html` – one page per division (served at `/logistics`, `/marketing`, …)
- `public/site.css`, `public/site.js` – shared design and behaviour for all pages
- `public/admin/` – the admin panel at **yourdomain.com/admin** (password protected)
- `api/` – small server functions that read and save the site text
- Text and team are stored in **Vercel Blob** (one private file: `site/content.json`).

## One-time setup

1. Put this folder in a GitHub repository (github.com → New repository → "uploading an existing file" → drag all files and folders in).
2. vercel.com → **Add New… → Project** → import that repository → **Deploy** (no settings to change).
3. In the project: **Storage → Create → Blob** → create a store and **connect it to this project** (all environments).
4. **Settings → Environment Variables** → add `ADMIN_PASSWORD` = a strong password of your choice (all environments).
5. **Deployments → ⋯ → Redeploy** (so the new settings are used).
6. Open `https://<your-project>.vercel.app/admin`, sign in, edit, press **Save & publish**.

## Connect your GoDaddy domain

1. Vercel project → **Settings → Domains → Add** → type your domain (e.g. `agami-grp.com`, and also `www.agami-grp.com`).
2. Vercel shows the exact DNS records to create (an **A** record for `@` and a **CNAME** for `www`).
3. GoDaddy → My Products → your domain → **DNS** → edit/add those two records only.
   **Do not touch MX records** — they run your email.
4. Wait for Vercel to show "Valid Configuration" (usually minutes, up to a day). HTTPS is automatic.

## Editing
- Go to `/admin`, change text, **Save & publish**. The live site updates within about a minute.
- `*words*` between stars are shown in the accent colour. Enter = new line.
- "Restore original" puts back the built-in text.
- To change the password, change `ADMIN_PASSWORD` in Vercel and redeploy.

## Working locally
- `npm install`, then `npm run dev` → http://localhost:3000 (admin password `admin`; saves go to `.local-content.json`).
