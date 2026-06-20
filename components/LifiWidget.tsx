"use client";

import dynamic from "next/dynamic";

// Inner widget (with wagmi/Solana providers) is client-only — can't SSR.
const Inner = dynamic(() => import("./LifiWidgetInner"), {
  ssr: false,
  loading: () => (
    <div className="h-[640px] w-full max-w-[416px] rounded-[20px] glass animate-pulse" />
  ),
});

export default function LifiWidget() {
  return <Inner />;
}
