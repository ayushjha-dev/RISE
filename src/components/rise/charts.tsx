import { useId } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { scoreTone, seriesColor } from "@/lib/score-color";
import { cn } from "@/lib/utils";

/**
 * Every chart here is hand-drawn SVG — no charting library chrome, no default
 * palette, no dead plot area. Colour is adaptive: performance values take their
 * hue from the value itself, categorical series take it from the RISE series ramp.
 */

/* --------------------------------- Legend -------------------------------- */

export function Legend({
  items,
  columns,
}: {
  items: { label: string; color: string; value?: string }[];
  columns?: boolean;
}) {
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2.5", columns && "flex-col gap-y-3")}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2.5 text-[13px] text-body">
          <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: i.color }} />
          <span className="min-w-0 flex-1 truncate">{i.label}</span>
          {i.value && <span className="num font-semibold text-ink">{i.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- Donut ----------------------------------- */

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x1, y1] = p(from);
  const [x2, y2] = p(to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function StatusDonut({
  data,
  centerLabel = "total",
}: {
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const total = data.reduce((a, b) => a + b.value, 0);
  const size = 208;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;
  const stroke = 20;
  const gap = 0.05;

  let angle = -Math.PI / 2;
  const arcs = data
    .filter((d) => d.value > 0)
    .map((d, i) => {
      const span = (d.value / Math.max(1, total)) * Math.PI * 2;
      const from = angle + gap / 2;
      const to = angle + span - gap / 2;
      angle += span;
      return { ...d, from, to: Math.max(from + 0.01, to), color: d.color ?? seriesColor(i) };
    });

  return (
    <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-7">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} aria-hidden="true">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-soft)" strokeWidth={stroke} />
          {arcs.map((a, i) => {
            const len = (a.to - a.from) * r;
            return (
              <path
                key={a.name}
                d={arcPath(cx, cy, r, a.from, a.to)}
                fill="none"
                stroke={a.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                style={{
                  strokeDasharray: len,
                  strokeDashoffset: shown ? 0 : len,
                  transition: `stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1) ${i * 130}ms`,
                }}
              />
            );
          })}
          {/* inner hairline ring for depth */}
          <circle cx={cx} cy={cy} r={r - stroke / 2 - 5} fill="none" stroke="var(--hairline)" strokeWidth="1" />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="num font-display text-[34px] leading-none font-semibold text-ink">{total}</p>
            <p className="mt-1 text-[13px] text-muted">{centerLabel}</p>
          </div>
        </div>
      </div>
      <div className="w-full min-w-0">
        <Legend
          columns
          items={arcs.map((d) => ({
            label: d.name,
            color: d.color,
            value: `${d.value} · ${Math.round((d.value / Math.max(1, total)) * 100)}%`,
          }))}
        />
      </div>
    </div>
  );
}

/* ------------------------------ Ranked bars ------------------------------ */

/** Vertical bars with adaptive fill, value caps and a grid that fills the frame. */
export function RankedBars({
  data,
  suffix = "",
  scrollable,
  adaptive = true,
  max,
}: {
  data: { name: string; value: number }[];
  suffix?: string;
  scrollable?: boolean;
  adaptive?: boolean;
  max?: number;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const top = max ?? Math.max(100, ...data.map((d) => d.value));
  const gid = useId().replace(/:/g, "");

  return (
    <div ref={ref} className={cn(scrollable && "scroll-strip -mx-1 px-1")}>
      <div
        className="relative flex items-end gap-3 pl-8 sm:gap-4"
        style={{ minWidth: scrollable ? Math.max(data.length * 78, 300) : undefined, height: 236 }}
      >
        {/* grid lines so the plot never looks like floating sticks */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-7">
          {[0, 25, 50, 75, 100].map((p) => (
            <div
              key={p}
              className="absolute inset-x-0 border-t border-dashed border-hairline"
              style={{ bottom: `${p}%` }}
            >
              <span className="num absolute -top-2 left-0 pr-1 text-[11px] text-muted">
                {Math.round((top * p) / 100)}
              </span>
            </div>
          ))}
        </div>

        {data.map((d, i) => {
          const pct = Math.max(0, Math.min(100, (d.value / top) * 100));
          const tone = adaptive ? scoreTone(d.value) : null;
          const from = tone ? tone.from : "var(--accent)";
          const to = tone ? tone.to : "var(--accent)";
          return (
            <div
              key={d.name}
              className="group relative flex min-w-0 flex-1 flex-col justify-end"
              style={{ height: "100%", maxWidth: 96 }}
            >
              <div className="relative flex-1">
                <div
                  className="absolute inset-x-1.5 bottom-0 rounded-t-[8px]"
                  style={{
                    height: `${shown ? pct : 0}%`,
                    background: `linear-gradient(180deg, ${from}, ${to})`,
                    boxShadow: `0 -2px 12px -6px ${to}`,
                    transition: `height 780ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
                  }}
                >
                  <span
                    className="num absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] font-semibold text-ink opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                    id={`${gid}-${i}`}
                  >
                    {d.value}
                    {suffix}
                  </span>
                </div>
              </div>
              <p className="mt-2 h-7 truncate text-center text-[12px] text-muted" title={d.name}>
                {d.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Skill meters ----------------------------- */

/** Horizontal adaptive meter row — used for subtopics and skill breakdowns. */
export function SkillMeter({
  label,
  value,
  note,
  icon,
  delay = 0,
}: {
  label: string;
  value: number;
  note?: string;
  icon?: React.ReactNode;
  delay?: number;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const tone = scoreTone(value);
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm text-body">
          {icon}
          <span className="truncate">{label}</span>
        </span>
        <span className="num shrink-0 text-sm font-semibold" style={{ color: tone.color }}>
          {value}%
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-pill" style={{ background: tone.soft }}>
        <div
          className="h-full rounded-pill"
          style={{
            width: `${shown ? Math.max(2, value) : 0}%`,
            background: `linear-gradient(90deg, ${tone.from}, ${tone.to})`,
            transition: `width 820ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          }}
        />
      </div>
      {note && <p className="mt-1.5 text-[12px] text-muted">{note}</p>}
    </div>
  );
}

/* --------------------------------- Radar --------------------------------- */

/** Subtopic radar: shows shape of ability, fills the frame, colours by average. */
export function SubtopicRadar({
  data,
  size = 260,
}: {
  data: { name: string; value: number }[];
  size?: number;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const pts = data.length >= 3 ? data : [...data, ...data, ...data].slice(0, 3);
  const avg = Math.round(pts.reduce((a, b) => a + b.value, 0) / pts.length);
  const tone = scoreTone(avg);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 34;
  const angleAt = (i: number) => (i / pts.length) * Math.PI * 2 - Math.PI / 2;
  const at = (i: number, ratio: number) => [
    cx + r * ratio * Math.cos(angleAt(i)),
    cy + r * ratio * Math.sin(angleAt(i)),
  ];
  const poly = (ratio: (i: number) => number) =>
    pts.map((_, i) => at(i, ratio(i)).join(",")).join(" ");

  return (
    <div ref={ref} className="mx-auto" style={{ width: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label="Ability by subtopic">
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <polygon
            key={g}
            points={poly(() => g)}
            fill={g === 1 ? "var(--surface-soft)" : "none"}
            stroke="var(--hairline)"
            strokeWidth="1"
          />
        ))}
        {pts.map((_, i) => (
          <line key={i} x1={cx} y1={cy} x2={at(i, 1)[0]} y2={at(i, 1)[1]} stroke="var(--hairline)" strokeWidth="1" />
        ))}
        <polygon
          points={poly((i) => (pts[i]!.value / 100) * (shown ? 1 : 0.02))}
          fill={tone.color}
          fillOpacity="0.20"
          stroke={tone.color}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: "all 900ms cubic-bezier(0.16,1,0.3,1)" }}
        />
        {pts.map((p, i) => {
          const [x, y] = at(i, (p.value / 100) * (shown ? 1 : 0.02));
          return <circle key={p.name + i} cx={x} cy={y} r="4" fill="var(--surface)" stroke={scoreTone(p.value).color} strokeWidth="2.5" />;
        })}
        {pts.map((p, i) => {
          const x = at(i, 1.19)[0]!;
          const y = at(i, 1.19)[1]!;
          return (
            <text
              key={`l-${p.name}-${i}`}
              x={x}
              y={y}
              textAnchor={x > cx + 4 ? "start" : x < cx - 4 ? "end" : "middle"}
              dominantBaseline="middle"
              fontSize="11"
              fill="var(--muted)"
              fontFamily="var(--font-sans)"
            >
              {p.name.length > 12 ? `${p.name.slice(0, 11)}…` : p.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------- Trend area ------------------------------ */

/** Small area trend with drawn line — used for cohort and pipeline momentum. */
export function TrendArea({
  data,
  height = 132,
  label,
}: {
  data: { name: string; value: number }[];
  height?: number;
  label?: string;
}) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const gid = useId().replace(/:/g, "");
  const w = 320;
  const h = height;
  const top = Math.max(1, ...data.map((d) => d.value));
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const pt = (i: number, v: number) => [i * step, h - 14 - (v / top) * (h - 34)];
  const line = data.map((d, i) => pt(i, d.value).join(",")).join(" L ");
  const area = `M 0 ${h - 14} L ${line} L ${w} ${h - 14} Z`;

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" aria-label={label ?? "Trend"} role="img">
        <defs>
          <linearGradient id={`ta-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66].map((g) => (
          <line key={g} x1="0" y1={(h - 14) * g + 8} x2={w} y2={(h - 14) * g + 8} stroke="var(--hairline)" strokeDasharray="3 6" strokeWidth="1" />
        ))}
        <path d={area} fill={`url(#ta-${gid})`} opacity={shown ? 1 : 0} style={{ transition: "opacity 700ms ease 300ms" }} />
        <path
          d={`M ${line}`}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1400,
            strokeDashoffset: shown ? 0 : 1400,
            transition: "stroke-dashoffset 1300ms cubic-bezier(0.16,1,0.3,1)",
          }}
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) => {
          const [x, y] = pt(i, d.value);
          return <circle key={d.name} cx={x} cy={y} r="3" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      <div className="mt-1.5 flex justify-between text-[11px] text-muted">
        {data.map((d) => (
          <span key={d.name} className="truncate">
            {d.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- Bullet -------------------------------- */

/** Compact adaptive score cell for dense tables. */
export function ScoreBullet({ value, width = 68 }: { value: number; width?: number }) {
  const tone = scoreTone(value);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="overflow-hidden rounded-pill" style={{ width, height: 6, background: tone.soft }}>
        <span
          className="block h-full rounded-pill"
          style={{ width: `${Math.max(3, value)}%`, background: `linear-gradient(90deg, ${tone.from}, ${tone.to})` }}
        />
      </span>
      <span className="num text-[13px] font-semibold" style={{ color: tone.color }}>
        {value}
      </span>
    </span>
  );
}
