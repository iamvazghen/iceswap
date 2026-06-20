import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

/* Server-safe glass primitives. The liquid-glass *feel* on every button comes from
 * these CSS classes (see globals.css). WebGL refraction is reserved for the hero
 * (see LiquidGlassButton). ponytail: one CSS system covers every button responsively. */

type Variant = "primary" | "ghost";
const variantClass = (v: Variant) =>
  v === "primary" ? "glass-btn glass-btn-primary" : "glass-btn glass-btn-ghost";

export function GlassButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${variantClass(variant)} px-5 py-2.5 text-sm ${className}`} {...props}>
      {children}
    </button>
  );
}

export function GlassLink({
  variant = "primary",
  className = "",
  href,
  children,
  ...props
}: { variant?: Variant; href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link href={href} className={`${variantClass(variant)} px-5 py-2.5 text-sm ${className}`} {...props}>
      {children}
    </Link>
  );
}

export function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`glass rounded-[var(--radius-lg)] ${className}`}>{children}</div>
  );
}
