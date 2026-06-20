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
};

export default nextConfig;
