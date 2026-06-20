"use client";

import { useEffect, useRef, useState } from "react";
import { GlassButton } from "./glass";

/* Real WebGL liquid-glass button from the vendored dashersw/liquid-glass-js lib.
 * The lib refracts a page snapshot (html2canvas) behind the element — heavy, fixed-px,
 * one rAF loop per button — so it's used ONLY for the hero centerpiece. Everything
 * else uses the CSS .glass-btn twin. Falls back to GlassButton until the lib is ready,
 * on WebGL failure, or under reduced-motion. */

declare global {
  interface Window {
    html2canvas?: unknown;
    Button?: new (opts: Record<string, unknown>) => { element: HTMLElement };
    Container?: { instances: unknown[] };
  }
}

let libPromise: Promise<void> | null = null;
function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`failed ${src}`));
    document.head.appendChild(s);
  });
}
function loadLib() {
  if (libPromise) return libPromise;
  libPromise = (async () => {
    const h2c = (await import("html2canvas")).default;
    window.html2canvas = h2c;
    await loadScript("/liquid-glass/container.js");
    await loadScript("/liquid-glass/button.js");
  })();
  return libPromise;
}

export default function LiquidGlassButton({
  text,
  onClick,
  size = 22,
  type = "pill",
}: {
  text: string;
  onClick?: () => void;
  size?: number;
  type?: "rounded" | "pill" | "circle";
}) {
  const host = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let cancelled = false;
    let el: HTMLElement | null = null;
    loadLib()
      .then(() => {
        if (cancelled || !host.current || !window.Button) return;
        try {
          const btn = new window.Button({ text, size, type, onClick, tintOpacity: 0.18 });
          el = btn.element;
          host.current.appendChild(el);
          setReady(true);
        } catch (e) {
          console.warn("liquid-glass WebGL fallback:", e);
        }
      })
      .catch((e) => console.warn("liquid-glass load failed, using CSS fallback:", e));
    return () => {
      cancelled = true;
      el?.remove();
    };
  }, [text, size, type, onClick]);

  return (
    <span ref={host} className="inline-flex">
      {!ready && (
        <GlassButton variant="primary" onClick={onClick} className="px-7 py-3 text-base">
          {text}
        </GlassButton>
      )}
    </span>
  );
}
