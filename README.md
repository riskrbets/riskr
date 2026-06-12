# Riskr 🎰

A free, **fake-money** browser arcade — Crash, Plinko, Slots, Blackjack, and
Roulette — with a shared global leaderboard. Everyone starts with $1,000 of
pretend money and races for the top multiplier. No real money, no gambling, no
prizes — just bragging rights. For entertainment only, 18+.

## Tech

- **Frontend:** a single static `index.html` (vanilla JS + canvas, no build step).
- **API:** `api/leaderboard.js` — a Vercel serverless function.
- **Storage:** [Upstash Redis](https://upstash.com/) (sorted sets for the boards).
- **Content pages:** `about.html`, `privacy.html`, `terms.html`, `contact.html`.

## Project layout

```
index.html          # the game
about.html          # About / how to play
privacy.html        # Privacy Policy (required for AdSense)
terms.html          # Terms & disclaimer
contact.html        # Contact
api/leaderboard.js  # GET (read board) + POST (submit score)
ads.txt             # AdSense authorized sellers (placeholder)
robots.txt          # crawler rules
sitemap.xml         # sitemap
vercel.json         # clean URLs + headers
.env.example        # required environment variables
```

## Deploy to Vercel

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/riskr.git
   git push -u origin main
   ```

2. **Import into Vercel** — go to [vercel.com/new](https://vercel.com/new), import
   the repo. No framework/build settings are needed; Vercel serves the static
   files and runs `api/leaderboard.js` automatically.

3. **Add the Redis store** — either:
   - Vercel dashboard → **Storage** → add **Upstash** (injects `KV_REST_API_URL`
     and `KV_REST_API_TOKEN` automatically), **or**
   - create a database at [upstash.com](https://upstash.com/) and set
     `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` under
     **Settings → Environment Variables**.

   See `.env.example`. Redeploy after setting the variables.

## Local development

```bash
npm install
npm i -g vercel
vercel dev          # serves index.html + the /api function locally
```

Create a `.env.local` (copy from `.env.example`) with your Upstash credentials.

## Before you go live

- **Contact email** is set to `riskrsupport@gmail.com` across the legal pages.
- **Domain** is set to `riskr.bet` (canonical URLs, `robots.txt`, `sitemap.xml`,
  Open Graph, `ads.txt` notes). If you end up using a different domain, find &
  replace `riskr.bet` across `*.html`, `robots.txt`, and `sitemap.xml`.

## Enabling Google AdSense (after approval)

1. Apply at [adsense.google.com](https://adsense.google.com) and add/verify this site.
2. In `index.html`, uncomment the AdSense `<script>` in `<head>` and replace
   `ca-pub-0000000000000000` with your publisher ID.
3. In `ads.txt`, uncomment the line and insert your `pub-…` ID.
4. Add ad units where you want ads to appear; redeploy.

> **Note on content:** Riskr is *simulated* (fake-money) casino-style
> content. Google's gambling **Publisher Restrictions** target *real-money*
> gambling, which this is not — but reviewers are strict, and game pages can be
> flagged as "thin content." The About/Privacy/Terms/Contact pages and the
> disclaimers exist to address this. Approval is still at Google's discretion.
