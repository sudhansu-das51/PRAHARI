# Prahari

**Live cyclone alerts, nearest shelters and emergency helplines for coastal Odisha — in one screen, in your language, even offline.**

*Prahari* (ପ୍ରହରୀ / प्रहरी) means *sentinel* — the one who keeps watch.

---

## The problem

During Fani (2019) and Amphan (2020), the information people actually needed — *am I in danger, where do I go, who do I call* — was scattered across government PDFs, news tickers and WhatsApp forwards. Official portals crashed under load exactly when they mattered most. Rural users on 2G, on low-end phones, in the dark, in panic, had nowhere clean to look.

Prahari is that one clean place.

## What it does

- **Live district-wise alert level** — computed from real forecast data, not hardcoded
- **Three states** — Normal / Warning / Danger, with the entire UI morphing colour to match
- **Nearest cyclone shelters** — name, block, capacity, distance
- **Tap-to-call helplines** — one tap opens the dialer; no numbers to remember or type
- **Odia / Hindi translation** — the alert rewritten in simple language for low-literacy readers
- **Detailed advisory** — five concrete, prioritised actions generated for the current conditions
- **Works offline** — service worker + local cache serve the last known alert when the network dies

## How it works

```
Browser (React PWA + GSAP)
  ├── Open-Meteo API (direct, free, no key)  →  live wind gusts / rain / pressure
  ├── /api/translate  →  Vercel function  →  Groq   →  simple Odia/Hindi alert
  └── /api/advisory   →  Vercel function  →  Claude →  5-point advisory (1-hour edge cache)

alertLevel.js   →  computeLevel(gusts, rain)  →  green | orange | red
GSAP            →  animates CSS variables     →  whole UI morphs together
Service worker  →  NetworkFirst + localStorage →  last-known alert survives an outage
```

**Alert thresholds follow IMD classification:**

| Level | Wind gusts | Rain (24h) |
|---|---|---|
| Danger | ≥ 118 km/h | ≥ 204 mm |
| Warning | ≥ 62 km/h | ≥ 115 mm |
| Normal | below | below |

## Design decisions worth defending

**Why Open-Meteo, not IMD directly?** IMD has no clean public API — its warnings live in HTML pages and PDFs. Scraping them is brittle: one layout change and the app breaks silently during a cyclone, which is the worst possible failure. Prahari uses Open-Meteo for reliable live numbers and applies *IMD's own classification thresholds* to them. The logic is IMD's; the pipeline is one that won't break.

**Why is Claude behind a tap, not automatic?** Claude costs money per call. The advisory loads only when the user asks for it, and the serverless function caches each district's advisory at the edge for an hour. First tap calls Claude; every tap for the next hour is free and instant. Two layers of cost control, zero degradation in usefulness.

**Why do shelters and helplines render outside the weather block?** Because if the weather fetch fails, a shelter address and a phone number are *more* important, not less. They render whether or not live data loaded.

**Why a colour that morphs the whole page?** GSAP animates two CSS variables on `<html>`; every accent in the app reads from them. One animation, one source of truth — the status can never visually contradict itself.

## Honest limitations

These are real, and they belong in the open:

- **Alert levels come from forecast wind and rain, not official IMD warnings.** A production version should parse IMD district bulletins server-side as the authoritative source, with Open-Meteo as the live-numbers layer.
- **Shelter data ships as a static file and must be verified against the official OSDMA registry** before any public launch. Sending someone to a shelter that isn't there is worse than sending them nowhere.
- **Distances are measured from district headquarters, not the user's location.** Geolocation-based sorting is the top next feature.
- Helpline numbers should be confirmed with district offices before release.

## Stack

React 18 · Vite · GSAP · Open-Meteo · Groq (`llama-3.3-70b`) · Claude API · Vercel serverless · vite-plugin-pwa

## Run locally

```bash
npm install
npm run dev          # UI + live weather (Groq/Claude features show a fallback)
```

For the full app including translation and advisory:

```bash
npm i -g vercel
cp .env.example .env.local     # paste your real keys
vercel dev
```

Open-Meteo needs no key and is called directly from the browser, so `npm run dev` already shows **live data** and every alert-state transition. The `/api` functions only run under `vercel dev` or after deployment.

## Deploy

```bash
vercel
vercel --prod
```

Then add the environment variables in **Vercel → Project → Settings → Environment Variables**:

| Name | Where to get it |
|---|---|
| `GROQ_API_KEY` | console.groq.com (free tier) |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

Redeploy once after adding them.

### Security rules that are not negotiable

- Keys live only in `.env.local` (gitignored) and Vercel environment variables.
- Never prefix them with `VITE_` — that ships them into the browser bundle for anyone to read.
- Never call Groq or Claude directly from React. Both go through `/api`.

## Testing the alert states

Live weather in calm season means everything renders green — which is the app working correctly, not a bug. To see Warning and Danger, temporarily lower the thresholds in `src/lib/alertLevel.js` (e.g. red at `>= 55`), switch districts, then revert before deploying.

If you record a demo with lowered thresholds, say so. "Simulated severe input, real pipeline" is a stronger claim than a silent one.

## Project structure

```
api/
  translate.js              Groq: alert → simple Odia/Hindi
  advisory.js               Claude: 5-point advisory, 1-hour edge cache
src/
  lib/alertLevel.js         IMD thresholds → green | orange | red
  hooks/
    useDistrictAlert.js     Open-Meteo fetch, 10-min refresh, offline cache
    useTranslation.js       /api/translate caller with client-side cache
    useAdvisory.js          /api/advisory caller (tap-to-load only)
    useClock.js             live ticking clock
  components/
    AlertBanner.jsx         signature GSAP element (theme morph + danger pulse)
    StatsGrid.jsx           live weather numbers
    ShelterList.jsx         GSAP stagger entrance
    Helplines.jsx           tap-to-call links
  data/
    districts.json          coordinates + control rooms
    shelters.json           shelter registry (verify before launch)
  App.jsx                   composition
  index.css                 glassmorphism theme, 8px spacing system
```

## Accessibility

- `prefers-reduced-motion` respected — all animation is skipped, content is not
- `aria-live` on the alert banner so screen readers announce state changes
- Visible focus rings on every interactive element
- Large touch targets, high contrast, battery-saving dark UI

---

**This is an information aid. Always follow official IMD and OSDMA instructions.**