# IceSwap ❄️

A frost-glass cross-chain **DEX** — built as a front-end / UI-UX showcase. Real liquidity
trading, real on-chain data, and an AI market analyst, behind one pane of liquid glass.

> Design-first: ice palette in OKLCH, a custom CSS liquid-glass system on every button,
> responsive down to 320px, and a streaming AI chat with markdown rendering.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Landing — live TVL / DEX-volume stats, feature trio, CTA |
| `/exchange` | Cross-chain swaps via the **LI.FI** widget (30+ chains, EVM + Solana, WalletConnect) |
| `/insights` | **AI market analyst** — streams answers grounded in live DefiLlama + CoinGecko data |
| `/liquidity` | DefiLlama-style dashboard — TVL history, breakdown by 16 categories (DEXes, Lending, Liquid Staking, RWA, Restaking, CDP, …), chains, and a filterable movers table |

## Stack

- **Next.js 15** (App Router) · TypeScript · Tailwind v4
- **LI.FI** widget for swaps (`@lifi/widget` + ethereum/solana providers)
- **Recharts** for liquidity charts · **react-markdown** for AI replies
- **Vercel AI SDK** streaming → an OpenAI-compatible endpoint
- Liquid-glass: a CSS frost system (`globals.css`) + the vendored WebGL lib in `vendor/`
- Live data: **DefiLlama** + **CoinGecko** (keyless)

## Run locally

```bash
npm install
cp .env.local.example .env.local   # fill in keys (all optional except the AI endpoint)
npm run dev                          # http://localhost:3000
```

See `.env.local.example` for the (mostly optional) environment variables. DefiLlama and
CoinGecko need no keys; the swap widget works out of the box; the AI chat needs an
OpenAI-compatible endpoint.

## Notes

- The AI is **grounded**, not connected to RPC nodes: each request injects live TVL-by-category,
  protocol flows, and prices into the model's context — reasoning over real on-chain-derived data.
- The on-ramp (Onramper, the aggregator LI.FI uses) and mobile WalletConnect activate when their
  keys are present.

---

Built with [Claude Code](https://claude.com/claude-code).
