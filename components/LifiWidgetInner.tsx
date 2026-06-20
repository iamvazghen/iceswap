"use client";

import { LiFiWidget, type WidgetConfig } from "@lifi/widget";
import { EthereumProvider } from "@lifi/widget-provider-ethereum";
import { SolanaProvider } from "@lifi/widget-provider-solana";

// Client-only (loaded via dynamic ssr:false in LifiWidget) so wagmi/Solana
// wallet contexts never execute during SSR.
// EVM wallets: wagmi's default multiInjectedProviderDiscovery (EIP-6963) auto-detects
// every installed extension wallet; metaMask/coinbase add SDK fallbacks; WalletConnect
// (mobile/QR) turns on only when a projectId is provided.
// The WalletConnect projectId is PUBLIC (it ships in every dApp's client bundle and is
// domain-restricted in the Reown dashboard, not secret). Hardcoded as a fallback so the
// QR/mobile flow never breaks on a missing/empty env injection. Override via env if needed.
const wcProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "ca22014226fa6fc1795ff48b236accaf";

const config: Partial<WidgetConfig> = {
  integrator: "iceswap",
  appearance: "light",
  variant: "compact",
  theme: {
    colorSchemes: {
      light: {
        palette: {
          primary: { main: "#2f7be6" },
          secondary: { main: "#37c7d4" },
        },
      },
    },
    shape: { borderRadius: 14 },
    container: {
      borderRadius: "20px",
      boxShadow: "0 18px 50px -18px rgba(47,123,230,0.35)",
      border: "1px solid rgba(255,255,255,0.7)",
    },
  },
  providers: [
    // No metaMask/coinbase SDK connectors — they always render a "Get Started" SDK option
    // that masks the EIP-6963 detection of the user's *actual* installed extension and
    // clicks into an install flow instead of connecting. With them removed,
    // multiInjectedProviderDiscovery (on by default) auto-lists every installed extension
    // (MetaMask, Rabby, Coinbase, Phantom, Brave…) and connects directly; walletConnect
    // covers phones/tablets via QR.
    EthereumProvider(wcProjectId ? { walletConnect: { projectId: wcProjectId } } : {}),
    SolanaProvider(),
  ],
};

export default function LifiWidgetInner() {
  return <LiFiWidget integrator="iceswap" config={config as WidgetConfig} />;
}
