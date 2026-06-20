import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, Sparkles, Waves, ArrowUpRight, ShieldCheck, Zap, Route } from "lucide-react";
import { GlassCard } from "@/components/glass";
import HeroCTA from "@/components/HeroCTA";
import Sparkline from "@/components/Sparkline";
import { getGlobal, getDexOverview, getCoins, getProtocols, fmtUSD, fmtPct } from "@/lib/data";

export default async function Home() {
  const [global, dex, coins, protocols] = await Promise.all([
    getGlobal(),
    getDexOverview(),
    getCoins(),
    getProtocols(),
  ]);

  const stats = [
    { label: "Total DeFi TVL", value: fmtUSD(global.totalTvl), sub: "across top chains" },
    { label: "24h DEX Volume", value: fmtUSD(dex.total24h), sub: fmtPct(dex.change1d) + " vs prev day" },
    { label: "Crypto Market Cap", value: fmtUSD(global.marketCap), sub: "global" },
    { label: "Protocols tracked", value: `${protocols.length}+`, sub: "live on Liquidity Moves" },
  ];

  const features = [
    {
      href: "/exchange",
      icon: ArrowLeftRight,
      title: "Exchange",
      body: "Cross-chain swaps routed by LI.FI across 30+ networks and every major bridge — best price, lowest gas, one click.",
      cta: "Open the desk",
    },
    {
      href: "/insights",
      icon: Sparkles,
      title: "AI Insights",
      body: "An assistant grounded in live on-chain data. Ask where smart money is rotating; get reasoning, not vibes.",
      cta: "Ask the market",
    },
    {
      href: "/liquidity",
      icon: Waves,
      title: "Liquidity Moves",
      body: "Watch TVL flow between chains and protocols over any window. See where liquidity arrives — and where it bleeds.",
      cta: "Track the flows",
    },
  ];

  const steps = [
    { icon: Zap, title: "Connect", body: "Bring any wallet. No sign-up, no custody." },
    { icon: Route, title: "Route", body: "LI.FI quotes every path and picks the cheapest, fastest one." },
    { icon: ShieldCheck, title: "Settle", body: "Sign once. Funds land on the destination chain." },
  ];

  return (
    <div className="px-5 sm:px-8 lg:px-12 pb-24">
      {/* ---------- Hero ---------- */}
      <section className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center pt-12 lg:pt-20 pb-16">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs font-medium text-ink-soft mb-6">
            <span className="size-1.5 rounded-full bg-inflow animate-pulse" />
            Cross-chain liquidity, live
          </span>
          <h1 className="text-[var(--text-display)] font-bold leading-[0.98] text-ink">
            One liquid surface for <span className="text-accent">every chain</span>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-soft max-w-md">
            IceSwap routes your trade across the whole bridge landscape, reads the market with AI,
            and shows you exactly where liquidity is moving — all behind one pane of glass.
          </p>
          <div className="mt-8">
            <HeroCTA />
          </div>
        </div>

        {/* Live market panel */}
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-ink">Market — live</span>
            <span className="text-xs text-ink-faint">7d trend · CoinGecko</span>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--color-line)]">
            {coins.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <Image src={c.image} alt="" width={28} height={28} className="rounded-full" unoptimized />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink leading-tight">{c.symbol}</p>
                  <p className="text-xs text-ink-faint truncate">{c.name}</p>
                </div>
                <div className="ml-auto hidden sm:block">
                  <Sparkline data={c.sparkline} up={c.change24h >= 0} />
                </div>
                <div className="text-right tnum w-24">
                  <p className="text-sm font-semibold text-ink">{fmtUSD(c.price)}</p>
                  <p className={`text-xs ${c.change24h >= 0 ? "text-inflow" : "text-outflow"}`}>{fmtPct(c.change24h)}</p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      {/* ---------- Stat band ---------- */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-ink tnum font-display">{s.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{s.sub}</p>
          </GlassCard>
        ))}
      </section>

      {/* ---------- Feature trio ---------- */}
      <section className="mt-20">
        <h2 className="text-[var(--text-display-s)] font-bold text-ink max-w-lg leading-tight">
          Three rooms, one cold and clear interface.
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="group">
              <GlassCard className="h-full p-6 transition-transform duration-300 group-hover:-translate-y-1">
                <span className="grid place-items-center size-11 rounded-[var(--radius-sm)] bg-[oklch(70%_0.12_235/0.18)] text-accent-deep">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  {f.cta}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mt-20">
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="flex gap-4">
              <span className="font-display text-3xl font-bold text-accent/40 tnum">{`0${i + 1}`}</span>
              <div>
                <div className="flex items-center gap-2">
                  <s.icon className="size-4 text-accent" />
                  <h3 className="text-lg font-bold text-ink">{s.title}</h3>
                </div>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section className="mt-20">
        <GlassCard className="relative overflow-hidden p-8 sm:p-12">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-gradient-to-br from-accent-bright/30 to-accent/10 blur-2xl" aria-hidden />
          <div className="relative max-w-lg">
            <h2 className="text-[var(--text-display-s)] font-bold text-ink leading-tight">Step onto the ice.</h2>
            <p className="mt-3 text-ink-soft">Connect a wallet and make your first cross-chain swap in under a minute.</p>
            <div className="mt-6">
              <HeroCTA />
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
