// Pure SVG sparkline from a number series. Server-safe, no chart lib.
// ponytail: a polyline is 10 lines; recharts is reserved for the real liquidity charts.
export default function Sparkline({
  data,
  w = 120,
  h = 36,
  up,
}: {
  data: number[];
  w?: number;
  h?: number;
  up?: boolean;
}) {
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = w / (data.length - 1);
  const pts = data.map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / span) * h).toFixed(1)}`);
  const rising = up ?? data[data.length - 1] >= data[0];
  const stroke = rising ? "var(--color-inflow)" : "var(--color-outflow)";
  const id = `sl-${Math.round(min)}-${data.length}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
