import { Route, Fuel, ShieldCheck, Wallet } from "lucide-react";
import { GlassCard } from "@/components/glass";
import LifiWidget from "@/components/LifiWidget";

export const metadata = { title: "Exchange — IceSwap" };

const perks = [
  { icon: Wallet, title: "Every wallet", body: "MetaMask, Rabby, Coinbase, Phantom and more — auto-detected the moment you click Connect." },
  { icon: Route, title: "Best route, always", body: "Every bridge and DEX quoted; the cheapest, fastest path wins." },
  { icon: Fuel, title: "Gas on destination", body: "Arrive with native gas — no stranded funds on a new chain." },
  { icon: ShieldCheck, title: "Non-custodial", body: "You sign, you hold. IceSwap never touches your keys." },
];

export default function ExchangePage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold text-accent">Exchange</p>
        <h1 className="mt-2 text-[var(--text-display-s)] font-bold text-ink leading-tight">
          Trade across chains, settle like glass.
        </h1>
        <p className="mt-3 text-ink-soft">
          Powered by LI.FI — one widget over 30+ chains, every major bridge, and your whole wallet
          set across EVM and Solana. Connect a wallet to begin.
        </p>
      </header>

      <div className="mt-10 grid lg:grid-cols-[416px_1fr] gap-8 items-start">
        <div className="flex justify-center lg:justify-start">
          <LifiWidget />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 self-stretch">
          {perks.map((p) => (
            <GlassCard key={p.title} className="p-5">
              <p.icon className="size-5 text-accent" />
              <h3 className="mt-3 font-bold text-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{p.body}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
