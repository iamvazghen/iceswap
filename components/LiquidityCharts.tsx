"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { X } from "lucide-react";
import type { TvlPoint, Chain, Protocol, Category } from "@/lib/data";
import { fmtUSD, fmtPct } from "@/lib/data";
import { GlassCard } from "./glass";

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
  { label: "MAX", days: Infinity },
];

export default function LiquidityCharts({
  tvlHistory,
  chains,
  protocols,
  categories,
}: {
  tvlHistory: TvlPoint[];
  chains: Chain[];
  protocols: Protocol[];
  categories: Category[];
}) {
  const [days, setDays] = useState(90);
  const [chainFilter, setChainFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [flow, setFlow] = useState<"in" | "out">("in");

  const series = useMemo(() => {
    const sliced = days === Infinity ? tvlHistory : tvlHistory.slice(-days);
    return sliced.map((p) => ({ date: p.date * 1000, tvl: p.tvl }));
  }, [tvlHistory, days]);

  const rangeChange = useMemo(() => {
    if (series.length < 2) return 0;
    const a = series[0].tvl;
    const b = series[series.length - 1].tvl;
    return a ? ((b - a) / a) * 100 : 0;
  }, [series]);

  const current = series.at(-1)?.tvl ?? 0;
  const maxChain = chains[0]?.tvl ?? 1;
  const totalTvl = useMemo(() => categories.reduce((s, c) => s + c.tvl, 0), [categories]);

  const chainOptions = useMemo(
    () => ["All", ...Array.from(new Set(protocols.map((p) => p.chain)))].slice(0, 18),
    [protocols],
  );
  const categoryOptions = useMemo(
    () => ["All", ...categories.map((c) => c.name)],
    [categories],
  );

  const movers = useMemo(() => {
    const filtered = protocols.filter(
      (p) =>
        (chainFilter === "All" || p.chain === chainFilter) &&
        (categoryFilter === "All" || p.category === categoryFilter),
    );
    return [...filtered]
      .sort((a, b) => (flow === "in" ? b.change1d - a.change1d : a.change1d - b.change1d))
      .slice(0, 18);
  }, [protocols, chainFilter, categoryFilter, flow]);

  const topCategories = categories.slice(0, 16);
  const maxCatTvl = topCategories[0]?.tvl ?? 1;

  return (
    <div className="space-y-6">
      {/* Stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total DeFi TVL", value: fmtUSD(totalTvl) },
          { label: "Categories tracked", value: String(categories.length) },
          { label: "Protocols tracked", value: `${protocols.length}+` },
          { label: "Chains tracked", value: `${chains.length}+` },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wide text-ink-faint">{s.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-ink tnum font-display">{s.value}</p>
          </GlassCard>
        ))}
      </div>

      {/* TVL area chart */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-faint">Total DeFi TVL · history</p>
            <p className="mt-1 text-3xl font-bold text-ink tnum font-display">{fmtUSD(current)}</p>
            <p className={`mt-0.5 text-sm tnum ${rangeChange >= 0 ? "text-inflow" : "text-outflow"}`}>
              {fmtPct(rangeChange)} over range
            </p>
          </div>
          <div className="flex gap-1 rounded-[var(--radius-sm)] glass p-1">
            {RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[0.5rem] transition-colors ${
                  days === r.days ? "bg-[oklch(70%_0.12_235/0.22)] text-accent-deep" : "text-ink-soft hover:text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px] -mx-2">
          <ResponsiveContainer width="100%" height="100%" minHeight={260}>
            <AreaChart data={series} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="tvlFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-line)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
                stroke="var(--color-line)"
                minTickGap={40}
              />
              <YAxis
                tickFormatter={(v) => fmtUSD(v, 0)}
                tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
                stroke="var(--color-line)"
                width={52}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(99% 0.006 235)",
                  border: "1px solid var(--color-line)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--color-ink)",
                }}
                labelFormatter={(t) => new Date(t).toLocaleDateString()}
                formatter={(v) => [fmtUSD(Number(v)), "TVL"]}
              />
              <Area type="monotone" dataKey="tvl" stroke="var(--color-accent)" strokeWidth={2} fill="url(#tvlFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Category breakdown */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink">Liquidity by category</h3>
          <span className="text-xs text-ink-faint">click a category to filter movers</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {topCategories.map((c) => {
            const active = categoryFilter === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setCategoryFilter(active ? "All" : c.name)}
                className={`text-left rounded-[var(--radius-md)] p-3.5 transition-all border ${
                  active
                    ? "border-accent bg-[oklch(70%_0.12_235/0.14)]"
                    : "border-[var(--color-line)] bg-[oklch(100%_0_0/0.4)] hover:bg-[oklch(100%_0_0/0.7)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink truncate">{c.name}</span>
                  <span className={`text-xs tnum shrink-0 ${c.change1d >= 0 ? "text-inflow" : "text-outflow"}`}>
                    {fmtPct(c.change1d)}
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-ink tnum font-display">{fmtUSD(c.tvl)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-[oklch(90%_0.02_235)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-bright to-accent"
                    style={{ width: `${Math.max(4, (c.tvl / maxCatTvl) * 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-ink-faint">
                  {c.share.toFixed(1)}% of TVL · {c.count} protocols
                </p>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-start">
        {/* Chain allocation */}
        <GlassCard className="p-5 sm:p-6 min-w-0">
          <h3 className="font-bold text-ink mb-4">Where liquidity sits · by chain</h3>
          <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {chains.map((c) => (
              <li key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ink font-medium">{c.name}</span>
                  <span className="tnum text-ink-soft">{fmtUSD(c.tvl)}</span>
                </div>
                <div className="h-2 rounded-full bg-[oklch(90%_0.02_235)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-bright to-accent"
                    style={{ width: `${Math.max(3, (c.tvl / maxChain) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Movers table */}
        <GlassCard className="p-5 sm:p-6 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-ink">Liquidity movers · 24h</h3>
            <div className="flex flex-wrap gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glass-btn glass-btn-ghost px-3 py-1.5 text-xs cursor-pointer max-w-[140px]"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>
                ))}
              </select>
              <select
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                className="glass-btn glass-btn-ghost px-3 py-1.5 text-xs cursor-pointer max-w-[120px]"
              >
                {chainOptions.map((c) => (
                  <option key={c} value={c}>{c === "All" ? "All chains" : c}</option>
                ))}
              </select>
              <div className="flex gap-1 rounded-[var(--radius-sm)] glass p-1">
                {(["in", "out"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFlow(f)}
                    className={`px-3 py-1 text-xs font-semibold rounded-[0.5rem] transition-colors ${
                      flow === f
                        ? f === "in"
                          ? "bg-[oklch(80%_0.12_165/0.25)] text-inflow"
                          : "bg-[oklch(80%_0.14_22/0.22)] text-outflow"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {f === "in" ? "Inflow" : "Outflow"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(categoryFilter !== "All" || chainFilter !== "All") && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categoryFilter !== "All" && (
                <button onClick={() => setCategoryFilter("All")} className="inline-flex items-center gap-1 text-xs rounded-full bg-[oklch(70%_0.12_235/0.16)] text-accent-deep px-2.5 py-1">
                  {categoryFilter} <X className="size-3" />
                </button>
              )}
              {chainFilter !== "All" && (
                <button onClick={() => setChainFilter("All")} className="inline-flex items-center gap-1 text-xs rounded-full bg-[oklch(70%_0.12_235/0.16)] text-accent-deep px-2.5 py-1">
                  {chainFilter} <X className="size-3" />
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="text-ink-faint text-xs text-left">
                  <th className="font-medium pb-2">Protocol</th>
                  <th className="font-medium pb-2">Category</th>
                  <th className="font-medium pb-2">Chain</th>
                  <th className="font-medium pb-2 text-right">TVL</th>
                  <th className="font-medium pb-2 text-right">24h</th>
                  <th className="font-medium pb-2 text-right">7d</th>
                </tr>
              </thead>
              <tbody>
                {movers.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-ink-faint">No protocols match these filters.</td></tr>
                ) : (
                  movers.map((p) => (
                    <tr key={p.name} className="border-t hairline">
                      <td className="py-2.5 pr-2 text-ink font-medium truncate max-w-[130px]">{p.name}</td>
                      <td className="py-2.5 pr-2 text-ink-faint text-xs truncate max-w-[90px]">{p.category}</td>
                      <td className="py-2.5 pr-2 text-ink-soft">{p.chain}</td>
                      <td className="py-2.5 text-right tnum text-ink-soft">{fmtUSD(p.tvl)}</td>
                      <td className={`py-2.5 text-right tnum ${p.change1d >= 0 ? "text-inflow" : "text-outflow"}`}>{fmtPct(p.change1d)}</td>
                      <td className={`py-2.5 text-right tnum ${p.change7d >= 0 ? "text-inflow" : "text-outflow"}`}>{fmtPct(p.change7d)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
