import LiquidityCharts from "@/components/LiquidityCharts";
import { getTvlHistory, getChains, getProtocols, getCategories } from "@/lib/data";

export const metadata = { title: "Liquidity Moves — IceSwap" };

export default async function LiquidityPage() {
  const [tvlHistory, chains, protocols, categories] = await Promise.all([
    getTvlHistory(),
    getChains(),
    getProtocols(),
    getCategories(),
  ]);

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
      <header className="max-w-2xl mb-10">
        <p className="text-sm font-semibold text-accent">Liquidity Moves</p>
        <h1 className="mt-2 text-[var(--text-display-s)] font-bold text-ink leading-tight">
          Watch the ice shift.
        </h1>
        <p className="mt-3 text-ink-soft">
          Total value locked over any window, how it&apos;s split across chains, and which protocols
          are pulling liquidity in — or bleeding it out — right now. Live from DefiLlama.
        </p>
      </header>

      <LiquidityCharts tvlHistory={tvlHistory} chains={chains} protocols={protocols} categories={categories} />
    </div>
  );
}
