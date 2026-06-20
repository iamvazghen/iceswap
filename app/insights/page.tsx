import Image from "next/image";
import { TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/glass";
import InsightsChat from "@/components/InsightsChat";
import { getProtocols, getCoins, fmtUSD, fmtPct } from "@/lib/data";

export const metadata = { title: "AI Insights — IceSwap" };

export default async function InsightsPage() {
  const [protocols, coins] = await Promise.all([getProtocols(), getCoins()]);
  const gainers = [...protocols].sort((a, b) => b.change1d - a.change1d).slice(0, 4);
  const losers = [...protocols].sort((a, b) => a.change1d - b.change1d).slice(0, 4);

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-accent">AI Insights</p>
        <h1 className="mt-2 text-[var(--text-display-s)] font-bold text-ink leading-tight">
          A market analyst that reads the chain.
        </h1>
        <p className="mt-3 text-ink-soft">
          Every answer is grounded in live on-chain data — not generic web text. Ask where smart
          money is rotating and get reasoning tied to real TVL and volume.
        </p>
      </header>

      <div className="mt-10 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <InsightsChat />

        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="size-4 text-inflow" />
              <h3 className="text-sm font-bold text-ink">Liquidity inflows · 24h</h3>
            </div>
            <ul className="space-y-2.5">
              {gainers.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink">{p.name}</span>
                  <span className="tnum text-inflow font-semibold">{fmtPct(p.change1d)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="size-4 text-outflow" />
              <h3 className="text-sm font-bold text-ink">Liquidity outflows · 24h</h3>
            </div>
            <ul className="space-y-2.5">
              {losers.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink">{p.name}</span>
                  <span className="tnum text-outflow font-semibold">{fmtPct(p.change1d)}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-ink mb-3">Top assets</h3>
            <ul className="space-y-3">
              {coins.slice(0, 5).map((c) => (
                <li key={c.id} className="flex items-center gap-2.5 text-sm">
                  <Image src={c.image} alt="" width={22} height={22} className="rounded-full" unoptimized />
                  <span className="font-medium text-ink">{c.symbol}</span>
                  <span className="ml-auto tnum text-ink-soft">{fmtUSD(c.price)}</span>
                  <span className={`tnum text-xs w-14 text-right ${c.change24h >= 0 ? "text-inflow" : "text-outflow"}`}>
                    {fmtPct(c.change24h)}
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
