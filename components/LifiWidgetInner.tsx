"use client";

import { LiFiWidget, type WidgetConfig } from "@lifi/widget";
import { SolanaProvider } from "@lifi/widget-provider-solana";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  mainnet,
  arbitrum,
  optimism,
  base,
  polygon,
  bsc,
  avalanche,
  gnosis,
  scroll,
  linea,
  type AppKitNetwork,
} from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

// This file is loaded client-only (dynamic ssr:false in LifiWidget), so every line here
// runs in the browser. That lets us own the wallet layer with Reown AppKit and skip all
// SSR/cookie-hydration ceremony.

// The WalletConnect/Reown projectId is PUBLIC — it ships in every dApp's client bundle and
// is domain-restricted in the Reown dashboard, not secret. Hardcoded as a fallback so the
// connect modal never breaks on a missing/empty env injection. Override via env if needed.
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "ca22014226fa6fc1795ff48b236accaf";

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  arbitrum,
  optimism,
  base,
  polygon,
  bsc,
  avalanche,
  gnosis,
  scroll,
  linea,
];

const wagmiAdapter = new WagmiAdapter({ networks, projectId, ssr: false });

// AppKit owns the connect experience. Its modal handles the cases the widget's built-in
// QR-only popup can't: desktop EIP-6963 extension auto-detection, AND on mobile it shows
// deep-link buttons that open the wallet app directly (MetaMask/Trust/Rabby/…) plus a
// copy-to-clipboard pairing link — so you never have to scan a QR with the same phone.
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: "IceSwap",
    description: "IceSwap — frost-glass cross-chain DEX",
    url: typeof window !== "undefined" ? window.location.origin : "https://iceswap.vercel.app",
    icons: ["https://iceswap.vercel.app/favicon.ico"],
  },
  // Crypto wallets only — no email/social sign-in.
  features: { analytics: false, email: false, socials: [] },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#2f7be6",
    "--w3m-border-radius-master": "3px",
    "--w3m-z-index": 3000,
  },
});

const queryClient = new QueryClient();

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
  // EVM wallets are sourced from the wagmi context above (AppKit). Solana is handled by the
  // built-in provider via the Solana Wallet Standard (auto-detects Phantom, Solflare, …).
  providers: [SolanaProvider()],
  // Delegate the widget's "Connect wallet" button to AppKit's modal.
  walletConfig: {
    onConnect() {
      appKit.open();
    },
  },
};

export default function LifiWidgetInner() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LiFiWidget integrator="iceswap" config={config as WidgetConfig} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
