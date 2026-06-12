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
