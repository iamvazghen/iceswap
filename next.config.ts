import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev origins allowed to reach internal dev endpoints (HMR, etc.). Must include the
  // local hosts you actually browse from, or HMR is rejected and hydration breaks.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "vazghenlaptop.tailc29aaf.ts.net",
    "100.78.222.108",
  ],
  // wagmi/walletconnect/reown reference these optional deps via dynamic import; they aren't
  // installed (optional), so point Turbopack at an empty stub to keep the build from failing.
  turbopack: {
    resolveAlias: {
      accounts: "./lib/empty-module.js",
      "pino-pretty": "./lib/empty-module.js",
      lokijs: "./lib/empty-module.js",
      encoding: "./lib/empty-module.js",
    },
  },
};

export default nextConfig;
