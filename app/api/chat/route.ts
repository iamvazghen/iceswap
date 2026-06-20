import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getCoins, getProtocols, getGlobal, getDexOverview, getCategories, fmtUSD, fmtPct } from "@/lib/data";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are IceSwap's on-chain market analyst. You help traders read DeFi liquidity.
Rules:
- Ground every claim in the LIVE DATA block below. Quote the actual numbers.
- Be concise and direct. Short paragraphs or tight bullet lists. No filler.
- When asked where liquidity is moving, reason from TVL changes and DEX volume.
- You are not a financial advisor; never tell the user to buy or sell. Frame as observations.
- If the data doesn't cover the question, say so plainly.`;

function liveContext(
  coins: Awaited<ReturnType<typeof getCoins>>,
  protocols: Awaited<ReturnType<typeof getProtocols>>,
  global: Awaited<ReturnType<typeof getGlobal>>,
  dex: Awaited<ReturnType<typeof getDexOverview>>,
  categories: Awaited<ReturnType<typeof getCategories>>,
) {
  const catLines = categories
    .slice(0, 14)
    .map((c) => `${c.name} ${fmtUSD(c.tvl)} (${c.share.toFixed(1)}% share, ${fmtPct(c.change1d)} 1d)`)
    .join("; ");
  const topCoins = coins
    .map((c) => `${c.symbol} ${fmtUSD(c.price)} (${fmtPct(c.change24h)} 24h)`)
    .join(", ");
  const gainers = [...protocols].sort((a, b) => b.change1d - a.change1d).slice(0, 6);
  const losers = [...protocols].sort((a, b) => a.change1d - b.change1d).slice(0, 6);
  const fmtP = (p: (typeof protocols)[number]) =>
    `${p.name} [${p.chain}/${p.category}] ${fmtUSD(p.tvl)} (${fmtPct(p.change1d)} 1d)`;
  return `LIVE DATA (auto-refreshed):
Global: DeFi TVL ${fmtUSD(global.totalTvl)}, crypto market cap ${fmtUSD(global.marketCap)}, 24h DEX volume ${fmtUSD(dex.total24h)} (${fmtPct(dex.change1d)} vs prev day).
Top assets: ${topCoins}.
TVL by CATEGORY (DEXes, Lending, Liquid Staking, Restaking, RWA, CDP, Derivatives, etc.): ${catLines}.
Liquidity GAINERS (24h TVL up): ${gainers.map(fmtP).join("; ")}.
Liquidity OUTFLOWS (24h TVL down): ${losers.map(fmtP).join("; ")}.`;
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const [coins, protocols, global, dex, categories] = await Promise.all([
    getCoins(),
    getProtocols(),
    getGlobal(),
    getDexOverview(),
    getCategories(),
  ]);

  const openai = createOpenAI({
    baseURL: process.env.FREELLMAPI_BASE_URL ?? "http://127.0.0.1:3001/v1",
    apiKey: process.env.FREELLMAPI_KEY ?? "sk-local",
  });

  const result = streamText({
    // .chat() forces /v1/chat/completions — freellmapi has no Responses API endpoint.
    model: openai.chat(process.env.FREELLMAPI_MODEL ?? "auto"),
    system: `${SYSTEM}\n\n${liveContext(coins, protocols, global, dex, categories)}`,
    messages,
    onError: ({ error }) => console.error("[chat] stream error:", error),
  });

  return result.toTextStreamResponse();
}
