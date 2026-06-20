"use client";

import { useRouter } from "next/navigation";
import LiquidGlassButton from "./LiquidGlassButton";
import { GlassLink } from "./glass";

export default function HeroCTA() {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <LiquidGlassButton text="Launch Exchange" onClick={() => router.push("/exchange")} />
      <GlassLink href="/insights" variant="ghost" className="px-7 py-3 text-base">
        See AI Insights
      </GlassLink>
    </div>
  );
}
