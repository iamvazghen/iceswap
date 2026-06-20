# IceSwap — Roadmap

A DEX frontend **design showcase**. Sole purpose: demonstrate UI/UX + frontend craft + crypto fluency.
Built lazy-correct: real liquidity trading (li.fi) + real on-chain data (free keyless APIs) + AI insights — **no speculative backend.**

## Stack
- Next.js 15 (App Router) · TypeScript · Tailwind v4
- Liquid-glass aesthetic: CSS frost system (`components/glass.tsx`) + vendored WebGL lib (`lib/liquid-glass/`, optional hero use)
- Framer Motion (restrained) · Recharts (liquidity charts) · lucide-react (icons)
- Swaps: `@lifi/widget` (Transak on-ramp included by the widget)
- AI: Vercel AI SDK streaming → **Google Gemini** (`gemini-2.5-flash`, OpenAI-compatible endpoint).
- Data: DefiLlama + CoinGecko (no API key, no signup)

## Pages
1. **`/` Landing** — hero, live TVL/volume stat band, feature trio, how-it-works, CTA. ✅
2. **`/exchange`** — li.fi widget, icy-themed. ✅
3. **`/insights`** — AI chat (Gemini) grounded in live market data + market cards. ✅
4. **`/liquidity`** — DefiLlama-style: chain TVL, protocol flows, date range, inflow/outflow. ✅

## Status
- [x] Scaffold + deps + vendor liquid-glass
- [x] Ice design tokens + glass component system
- [x] App shell (sidebar nav) + landing page
- [x] Exchange (li.fi widget)
- [x] AI Insights (streaming chat + live-data grounding + market cards)
- [x] Liquidity Moves (TVL chart, top movers, date range)
- [ ] Wallet connect polish / mobile sidebar drawer refinement
- [x] Deploy to Vercel + production Gemini key

## Deliberately skipped (add when actually needed)
- Covalent / The Graph / Dune — DefiLlama+CoinGecko cover the showcase. Add a provider behind `lib/data.ts` when you need wallet-level whale flows.
- Supabase / pgvector / chat history — stateless chat ships the demo. Add when users need saved sessions.
- LangGraph multi-agent — single streaming call with live-data context is enough. Add when tool-calling chains are real.

## Env
Copy `.env.local.example` → `.env.local`, set `GEMINI_*`.
