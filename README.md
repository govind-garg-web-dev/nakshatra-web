# Nakshatra

Vedic astrology + psychology web app — free Kundli, compatibility (Guna
Milan), an AI astrologer ("Tara"), Shubh Muhurat, daily horoscopes, and a
Career Timing niche tool. Built with Next.js 16 (App Router), Tailwind CSS,
Supabase, Razorpay, and Anthropic's Claude. See
`NAKSHATRA_WEB_MASTERPLAN.md` (one level up) for the full spec this was built
from.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in real values:
   - `ANTHROPIC_API_KEY` — required for Tara chat, horoscopes, psychology
     compatibility, career timing, and paid reports. Without it, those
     features degrade to a friendly "try again" message instead of crashing.
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
     `SUPABASE_SERVICE_ROLE_KEY` — required for auth, saved charts, chat
     history, and credits. Run the SQL in the masterplan's Section 5 against
     your Supabase project first.
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` —
     required for paid reports and question packs (uses Razorpay Payment
     Links, not Checkout.js).
3. `npm run dev` — app runs at http://localhost:3000 even with the above
   unset (free Kundli, Guna Milan, and Shubh Muhurat all work with zero
   config since they're pure-TypeScript astronomy, no external API).

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm test` — Vitest unit tests for the astrology engine (regression chart +
  Guna Milan symmetry)
- `npm run lint` — ESLint

## Notable design choices (see inline `TODO(founder)` comments for more)

- **Ephemeris** (`lib/astro/ephemeris.ts`) is a low-precision two-body
  Keplerian model (Paul Schlyter's classic formulas), not Swiss Ephemeris —
  accurate to roughly a degree, which is fine for an MVP kundli but not for
  arc-minute-precision use cases.
- **Guna Milan** (`lib/astro/gunaMilan.ts`) computes each koota
  symmetrically (`score(A,B) === score(B,A)`) rather than using classical
  groom/bride-specific rules, since the tool doesn't know which chart is
  which.
- **Payments** use Razorpay Payment Links (hosted checkout, short URL) rather
  than embedding Checkout.js, to keep the client simple.
- **Credits** (`lib/db/credits.ts`) share one `balance` column between the
  free daily allowance and purchased question packs — see the TODO there if
  you want to track them separately.
- **Daily horoscope** caching is in-memory (resets on redeploy) — fine for an
  MVP, move to Supabase if that becomes annoying.

## Deploying

Push to GitHub and import into Vercel — it's a standard Next.js app, no
special build config beyond the env vars above.
