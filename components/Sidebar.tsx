"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Snowflake,
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  Waves,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/exchange", label: "Exchange", icon: ArrowLeftRight },
  { href: "/insights", label: "AI Insights", icon: Sparkles },
  { href: "/liquidity", label: "Liquidity Moves", icon: Waves },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-1 py-1">
      <span className="grid place-items-center size-9 rounded-[var(--radius-sm)] bg-gradient-to-br from-accent-bright to-accent-deep text-white shadow-[0_6px_18px_-6px_oklch(55%_0.16_240/0.6)]">
        <Snowflake className="size-5" strokeWidth={2.25} />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-ink">
        Ice<span className="text-accent">Swap</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
              active
                ? "text-accent-deep bg-[oklch(70%_0.12_235/0.16)]"
                : "text-ink-soft hover:text-ink hover:bg-[oklch(90%_0.02_235/0.6)]"
            }`}
          >
            <span
              className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
            />
            <Icon className="size-[18px]" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Footer() {
  return (
    <div className="mt-auto px-1 pt-4 text-xs text-ink-faint">
      <p className="leading-relaxed">
        Powered by <span className="text-ink-soft">LI.FI</span> · live data from{" "}
        <span className="text-ink-soft">DefiLlama</span> &amp; <span className="text-ink-soft">CoinGecko</span>
      </p>
    </div>
  );
}

export default function Sidebar({
  collapsed = false,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-16 glass border-b hairline">
        <Brand />
        <button aria-label="Open menu" onClick={() => setOpen(true)} className="glass-btn glass-btn-ghost size-10 !p-0">
          <Menu className="size-5" />
        </button>
      </header>

      {/* Desktop rail — hidden when collapsed */}
      <aside
        className={`${collapsed ? "lg:hidden" : "lg:flex"} hidden fixed inset-y-3 left-3 z-30 w-[244px] flex-col gap-6 glass rounded-[var(--radius-lg)] p-4`}
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button onClick={onToggle} aria-label="Hide sidebar" title="Hide sidebar" className="glass-btn glass-btn-ghost size-9 !p-0">
            <PanelLeftClose className="size-4" />
          </button>
        </div>
        <NavList />
        <Footer />
      </aside>

      {/* Floating re-open button when collapsed (desktop) */}
      {collapsed && (
        <button
          onClick={onToggle}
          aria-label="Show sidebar"
          title="Show sidebar"
          className="hidden lg:grid place-items-center fixed top-4 left-4 z-30 glass-btn glass-btn-ghost size-11 !p-0"
        >
          <PanelLeftOpen className="size-5" />
        </button>
      )}

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[oklch(30%_0.04_250/0.35)] backdrop-blur-sm animate-[fade_.2s_ease]"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[80%] max-w-[300px] flex flex-col gap-6 glass p-5 animate-[slidein_.28s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center justify-between">
              <Brand />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="glass-btn glass-btn-ghost size-10 !p-0">
                <X className="size-5" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
            <Footer />
          </aside>
        </div>
      )}

      <style>{`
        @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slidein { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}
