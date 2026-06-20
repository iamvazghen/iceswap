// Server-side data layer. Keyless public APIs (DefiLlama + CoinGecko), cached 5 min.
// Every fetch is defensive: on failure it returns a typed fallback so SSR never crashes
// (e.g. offline dev, rate limit). Swap/extend providers here without touching the UI.

const TTL_MS = 300_000; // 5 min

// ponytail: in-memory TTL memo. Next's fetch cache rejects items >2MB (DefiLlama
// /protocols is ~11MB), so we cache ourselves and serve stale on failure.
const memo = new Map<string, { t: number; data: unknown }>();

async function refresh<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const data = (await res.json()) as T;
    memo.set(url, { t: Date.now(), data });
    return data;
  } catch (e) {
    const hit = memo.get(url);
    if (hit) return hit.data as T; // serve stale rather than blank
    console.warn("[data] fetch failed, using fallback:", (e as Error).message);
    return fallback;
  }
}

// Stale-while-revalidate: only the first cold load blocks. After that, serve cached
// instantly and refresh in the background — the DefiLlama payloads are multi-MB, so we
// never make a visitor wait on a re-download. ponytail: fire-and-forget refresh is fine
// on a long-lived node server; on serverless, wrap with waitUntil if you deploy there.
async function getJSON<T>(url: string, fallback: T): Promise<T> {
  const hit = memo.get(url) as { t: number; data: T } | undefined;
  if (hit) {
    if (Date.now() - hit.t >= TTL_MS) void refresh(url, fallback);
    return hit.data;
  }
  return refresh(url, fallback);
}

export const fmtUSD = (n: number, max = 2) =>
  n >= 1e12
    ? `$${(n / 1e12).toFixed(max)}T`
    : n >= 1e9
      ? `$${(n / 1e9).toFixed(max)}B`
      : n >= 1e6
        ? `$${(n / 1e6).toFixed(max)}M`
        : n >= 1e3
          ? `$${(n / 1e3).toFixed(1)}K`
          : `$${n.toFixed(2)}`;

export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

// ---------- Chains ----------
export type Chain = { name: string; tvl: number; symbol: string };
export async function getChains(): Promise<Chain[]> {
  const raw = await getJSON<{ name: string; tvl: number; tokenSymbol: string | null }[]>(
    "https://api.llama.fi/v2/chains",
    [],
  );
  return raw
    .filter((c) => c.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 24)
    .map((c) => ({ name: c.name, tvl: c.tvl, symbol: c.tokenSymbol ?? "" }));
}

// ---------- Global TVL history (for area chart + date range) ----------
export type TvlPoint = { date: number; tvl: number };
export async function getTvlHistory(): Promise<TvlPoint[]> {
  return getJSON<TvlPoint[]>("https://api.llama.fi/v2/historicalChainTvl", []);
}

// ---------- Top protocols (liquidity movers) ----------
export type Protocol = {
  name: string;
  symbol: string;
  category: string;
  chain: string;
  tvl: number;
  change1d: number;
  change7d: number;
  logo: string;
};
export async function getProtocols(): Promise<Protocol[]> {
  const raw = await getJSON<
    {
      name: string;
      symbol: string;
      category: string;
      chain: string;
      tvl: number;
      change_1d: number | null;
      change_7d: number | null;
      logo: string;
    }[]
  >("https://api.llama.fi/protocols", []);
  return raw
    .filter((p) => p.tvl > 1e6)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 120)
    .map((p) => ({
      name: p.name,
      symbol: p.symbol === "-" ? "" : p.symbol,
      category: p.category ?? "Other",
      chain: p.chain,
      tvl: p.tvl,
      change1d: p.change_1d ?? 0,
      change7d: p.change_7d ?? 0,
      logo: p.logo,
    }));
}

// ---------- Category breakdown (ALL protocols grouped by category) ----------
// Covers DEXes, Lending, Liquid Staking, Restaking, RWA, CDP, Derivatives, Yield,
// Bridge, Farm, Stablecoins (Algo-Stables), etc. — straight from DefiLlama's taxonomy.
export type Category = { name: string; tvl: number; count: number; change1d: number; share: number };
export async function getCategories(): Promise<Category[]> {
  const raw = await getJSON<
    { category: string | null; tvl: number; change_1d: number | null }[]
  >("https://api.llama.fi/protocols", []);
  const map = new Map<string, { tvl: number; count: number; wchange: number }>();
  for (const p of raw) {
    if (!p.tvl || p.tvl <= 0) continue;
    const name = p.category ?? "Other";
    const c = map.get(name) ?? { tvl: 0, count: 0, wchange: 0 };
    c.tvl += p.tvl;
    c.count += 1;
    c.wchange += p.tvl * (p.change_1d ?? 0);
    map.set(name, c);
  }
  const total = [...map.values()].reduce((s, c) => s + c.tvl, 0) || 1;
  return [...map.entries()]
    .map(([name, c]) => ({
      name,
      tvl: c.tvl,
      count: c.count,
      change1d: c.tvl ? c.wchange / c.tvl : 0,
      share: (c.tvl / total) * 100,
    }))
    .sort((a, b) => b.tvl - a.tvl);
}

// ---------- DEX volume overview ----------
export type DexOverview = { total24h: number; total7d: number; change1d: number };
export async function getDexOverview(): Promise<DexOverview> {
  const d = await getJSON<{ total24h: number; total7d: number; change_1d: number }>(
    "https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true",
    { total24h: 0, total7d: 0, change_1d: 0 },
  );
  return { total24h: d.total24h, total7d: d.total7d, change1d: d.change_1d ?? 0 };
}

// ---------- Coin markets (cards + token logos) ----------
export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  marketCap: number;
  sparkline: number[];
};
export async function getCoins(): Promise<Coin[]> {
  const raw = await getJSON<
    {
      id: string;
      symbol: string;
      name: string;
      image: string;
      current_price: number;
      price_change_percentage_24h: number;
      market_cap: number;
      sparkline_in_7d?: { price: number[] };
    }[]
  >(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&sparkline=true&price_change_percentage=24h",
    [],
  );
  return raw.map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    image: c.image,
    price: c.current_price,
    change24h: c.price_change_percentage_24h ?? 0,
    marketCap: c.market_cap,
    sparkline: c.sparkline_in_7d?.price ?? [],
  }));
}

// ---------- Global market snapshot ----------
export type Global = { totalTvl: number; marketCap: number; volume24h: number };
export async function getGlobal(): Promise<Global> {
  const chains = await getChains();
  const totalTvl = chains.reduce((s, c) => s + c.tvl, 0);
  const g = await getJSON<{
    data: { total_market_cap: { usd: number }; total_volume: { usd: number } };
  }>("https://api.coingecko.com/api/v3/global", {
    data: { total_market_cap: { usd: 0 }, total_volume: { usd: 0 } },
  });
  return {
    totalTvl,
    marketCap: g.data.total_market_cap.usd,
    volume24h: g.data.total_volume.usd,
  };
}
