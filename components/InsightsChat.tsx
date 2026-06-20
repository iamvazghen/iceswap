"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp, User, Square, Copy, Check, RefreshCw, Plus, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Where is liquidity rotating today?",
  "Which categories are gaining TVL fastest?",
  "Is the market risk-on or risk-off right now?",
  "Summarize the biggest 24h liquidity outflows.",
];

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-accent"
          style={{ animation: `think-bounce 1.1s ${i * 0.16}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {}
      }}
      className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-accent transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function InsightsChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const atBottom = useRef(true);

  // auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 132) + "px";
  }, [input]);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  }
  function pin(force = false) {
    const el = scroller.current;
    if (!el) return;
    if (force || atBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: force ? "auto" : "smooth" });
  }

  async function streamFrom(history: Msg[]) {
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);
    atBottom.current = true;
    requestAnimationFrame(() => pin(true));
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ac.signal,
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
        pin();
      }
      if (!acc.trim()) throw new Error("empty");
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // keep partial
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = {
          role: "assistant",
          content:
            "⚠️ Couldn't reach the AI service. The free models behind freellmapi may be rate-limited — try again, or set a dedicated key in `.env.local` (`FREELLMAPI_*`).",
        };
        return c;
      });
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    streamFrom([...messages, { role: "user", content: text }]);
  }

  function stop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  function regenerate() {
    if (loading) return;
    let h = [...messages];
    if (h.length && h[h.length - 1].role === "assistant") h = h.slice(0, -1);
    if (h.length) streamFrom(h);
  }

  const empty = messages.length === 0;

  return (
    <div className="glass rounded-[var(--radius-lg)] flex flex-col h-[clamp(560px,72vh,820px)] overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b hairline">
        <div className="flex items-center gap-2.5">
          <span className="relative grid place-items-center size-8 rounded-full bg-gradient-to-br from-accent-bright to-accent-deep text-white">
            <Sparkles className="size-4" />
            <span className="absolute inset-0 rounded-full bg-accent-bright/40 blur-md -z-10" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-ink">Market Analyst</p>
            <p className="flex items-center gap-1 text-[11px] text-ink-faint">
              <span className="size-1.5 rounded-full bg-inflow animate-pulse" />
              grounded in live on-chain data
            </p>
          </div>
        </div>
        {!empty && (
          <button
            onClick={() => !loading && setMessages([])}
            className="glass-btn glass-btn-ghost px-3 py-1.5 text-xs"
            aria-label="New chat"
          >
            <Plus className="size-3.5" /> New
          </button>
        )}
      </div>

      {/* messages */}
      <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-5">
        {empty ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-5">
            <span className="relative grid place-items-center size-16 rounded-2xl bg-gradient-to-br from-accent-bright to-accent-deep text-white shadow-[0_12px_40px_-8px_oklch(55%_0.16_240/0.6)]">
              <Sparkles className="size-8" />
              <span className="absolute inset-0 rounded-2xl bg-accent-bright/50 blur-xl -z-10 animate-pulse" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Ask the market</h2>
              <p className="mt-1.5 text-sm text-ink-soft max-w-sm mx-auto">
                Real reasoning over live DefiLlama &amp; CoinGecko data — TVL by category, flows, and prices.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="group flex items-center gap-2 text-left rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[oklch(100%_0_0/0.45)] hover:bg-[oklch(100%_0_0/0.8)] hover:border-accent/40 transition-colors px-3.5 py-2.5 text-xs text-ink"
                >
                  <TrendingUp className="size-3.5 text-accent shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isUser = m.role === "user";
            const isLast = i === messages.length - 1;
            const streaming = loading && isLast && !isUser;
            return (
              <div key={i} className={`msg-in flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                <span
                  className={`grid place-items-center size-8 shrink-0 rounded-full ${
                    isUser
                      ? "bg-[oklch(90%_0.03_235)] text-ink-soft"
                      : "bg-gradient-to-br from-accent-bright to-accent-deep text-white"
                  }`}
                >
                  {isUser ? <User className="size-4" /> : <Sparkles className="size-4" />}
                </span>
                <div className={`min-w-0 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
                  <div
                    className={`rounded-[var(--radius-md)] px-4 py-2.5 ${
                      isUser
                        ? "bg-gradient-to-br from-accent-bright to-accent-deep text-white rounded-tr-sm"
                        : "bg-[oklch(100%_0_0/0.65)] border border-[var(--color-line)] rounded-tl-sm"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    ) : m.content ? (
                      <div className={`chat-md ${streaming ? "stream-caret" : ""}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <ThinkingDots />
                    )}
                  </div>
                  {/* actions on completed assistant messages */}
                  {!isUser && m.content && !streaming && (
                    <div className="flex items-center gap-3 px-1">
                      <CopyButton text={m.content} />
                      {isLast && (
                        <button
                          onClick={regenerate}
                          className="inline-flex items-center gap-1 text-xs text-ink-faint hover:text-accent transition-colors"
                        >
                          <RefreshCw className="size-3.5" /> Regenerate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 sm:p-4 border-t hairline"
      >
        <div className="flex items-end gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[oklch(100%_0_0/0.55)] focus-within:border-accent/50 transition-colors px-3 py-1.5">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Ask about liquidity, flows, or a token…"
            className="flex-1 resize-none bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none py-2 max-h-[132px]"
          />
          {loading ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="glass-btn glass-btn-ghost size-9 !p-0 shrink-0"
            >
              <Square className="size-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="glass-btn glass-btn-primary size-9 !p-0 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUp className="size-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-faint">
          Not financial advice · live data, AI-generated · <kbd className="font-mono">Enter</kbd> to send
        </p>
      </form>
    </div>
  );
}
