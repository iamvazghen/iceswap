import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IceSwap — Liquid DEX",
  description:
    "A frost-glass DEX. Trade across chains with LI.FI, read the market with AI, and watch liquidity move in real time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body suppressHydrationWarning>
        {/* Ice refraction filter — available to any element via filter: url(#ice-refract) */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="ice-refract">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* tighter, subtler refraction tuned for buttons */}
          <filter id="ice-refract-btn">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
