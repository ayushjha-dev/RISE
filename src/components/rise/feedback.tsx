import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./primitives";
import { ErrorIllustration, Icon } from "./icons";
import { EmptyArt, type EmptyArtVariant } from "./illustrations";
import { scoreTone } from "@/lib/score-color";

/* ------------------------------- Score ring ------------------------------ */

/** The ring takes its colour from the value: clay → amber → pine → emerald. */
export function ScoreRing({
  value,
  size = 56,
  label,
  animate = true,
  showTier,
}: {
  value: number;
  size?: number;
  label?: string | undefined;
  animate?: boolean;
  showTier?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const [shown, setShown] = useState(animate ? 0 : clamped);
  const stroke = size >= 72 ? 7 : size >= 48 ? 5 : 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = scoreTone(clamped);
  const gid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!animate) {
      setShown(clamped);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(clamped * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [clamped, animate]);

  return (
    <div className="inline-flex shrink-0 flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id={`sr-${gid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tone.from} />
              <stop offset="100%" stopColor={tone.to} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={tone.soft} strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#sr-${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={c - (c * shown) / 100}
          />
        </svg>
        <span
          className="num absolute inset-0 grid place-items-center font-semibold"
          style={{ fontSize: Math.max(11, Math.round(size * 0.27)), color: tone.color }}
        >
          {shown}
        </span>
      </div>
      {label && <span className="text-[13px] text-muted">{label}</span>}
      {showTier && (
        <span className="text-[12px] font-semibold" style={{ color: tone.color }}>
          {tone.label}
        </span>
      )}
      <span className="sr-only">{clamped} percent</span>
    </div>
  );
}

/* -------------------------------- Skeletons ------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-[10px]", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[14px] border border-hairline bg-surface p-5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-[14px] border border-hairline bg-surface p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-2.5 h-3 w-28" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-[6px]" />
                <Skeleton className="h-6 w-20 rounded-[6px]" />
              </div>
            </div>
            <Skeleton className="h-14 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-[14px] border border-hairline bg-surface p-5">
      <Skeleton className="h-4 w-40" />
      <div className="mt-6 flex h-40 items-end gap-4">
        {[60, 100, 45, 80, 70].map((h, i) => (
          <div key={i} className="flex flex-1 items-end" style={{ height: `${h}%` }}>
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Empty / error states ----------------------- */

export function EmptyState({
  title,
  note,
  variant = "list",
  action,
}: {
  title: string;
  note?: string | undefined;
  variant?: EmptyArtVariant;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="dotfield relative flex flex-col items-center overflow-hidden rounded-[16px] border border-dashed border-hairline bg-surface px-6 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,var(--accent-soft),transparent_70%)] opacity-70" />
      <div className="relative">
        <EmptyArt variant={variant} />
      </div>
      <p className="relative mt-5 max-w-sm font-display text-[19px] leading-snug font-semibold text-ink">{title}</p>
      {note && <p className="relative mt-2 max-w-sm text-sm text-muted">{note}</p>}
      {action && <div className="relative mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Couldn't load this — check your connection and try again.",
  onRetry,
}: {
  title?: string | undefined;
  onRetry?: (() => void) | undefined;
}) {
  return (
    <div className="flex flex-col items-center rounded-[14px] border border-hairline bg-surface px-6 py-12 text-center">
      <ErrorIllustration />
      <p className="mt-5 max-w-sm text-sm text-body">{title}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Stepper ------------------------------- */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      {/* Mobile: compact rail with the current step named */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between">
          <p className="num text-[13px] font-semibold text-muted">
            Step {current + 1} of {steps.length}
          </p>
          <p className="text-[13px] font-semibold text-ink">{steps[current]}</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface-strong">
          <div
            className="h-full rounded-pill bg-accent"
            style={{
              width: `${((current + 1) / steps.length) * 100}%`,
              transition: "width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      </div>

      {/* Desktop: numbered nodes with a filling connector */}
      <ol className="hidden items-center sm:flex">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "num grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors duration-200",
                    done && "border-accent bg-accent text-accent-ink",
                    active && "border-accent bg-accent-soft text-ink ring-2 ring-accent/25",
                    !done && !active && "border-hairline bg-surface text-muted",
                  )}
                >
                  {done ? <Icon name="check" size={15} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px] font-semibold",
                    active ? "text-ink" : "text-muted",
                  )}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="mx-3 h-px flex-1 bg-hairline">
                  <span
                    className="block h-px bg-accent"
                    style={{
                      width: done ? "100%" : "0%",
                      transition: "width 320ms ease-out",
                    }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ----------------------------- Digit ID input ---------------------------- */

export function DigitInput({
  length = 12,
  value,
  onChange,
  state,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  state: "idle" | "checking" | "verified" | "failed";
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setAt = (i: number, ch: string) => {
    const next = digits.map((d, idx) => (idx === i ? ch : d)).join("").replace(/ /g, " ");
    onChange(next.trimEnd());
  };

  return (
    <div>
      <div
        className={cn("flex flex-wrap gap-1.5", state === "failed" && "anim-shake")}
        role="group"
        aria-label="Academic Bank of Credits ID"
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d.trim()}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            maxLength={1}
            disabled={state === "checking" || state === "verified"}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              setAt(i, ch || " ");
              if (ch && i < length - 1) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !d.trim() && i > 0) refs.current[i - 1]?.focus();
            }}
            className={cn(
              "num h-12 w-[calc((100%-9*0.375rem)/10)] min-w-8 rounded-[10px] border bg-surface text-center text-base font-semibold text-ink transition-colors duration-150 focus:border-ink focus:outline-none sm:w-11",
              state === "verified" && "border-success",
              state === "failed" && "border-error",
              state !== "verified" && state !== "failed" && "border-hairline",
            )}
            style={
              state === "checking"
                ? { animation: `rise-pulse-cell 320ms ease-in-out ${i * 40}ms` }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Password strength -------------------------- */

const weak = ["password", "12345678", "qwerty123", "iloveyou", "admin123", "letmein1"];

export function passwordTier(pw: string) {
  if (!pw) return { score: 0, label: "Use at least 8 characters", color: "var(--muted)" };
  if (weak.includes(pw.toLowerCase()))
    return { score: 1, label: "That password is too common — pick something else", color: "var(--error)" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = [
    { label: "Use at least 8 characters", color: "var(--error)" },
    { label: "Add a capital letter", color: "var(--error)" },
    { label: "Add a number or symbol", color: "var(--warning)" },
    { label: "Good password", color: "var(--warning)" },
    { label: "Strong password", color: "var(--success)" },
  ];
  return { score, ...labels[score] };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, color } = passwordTier(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-strong">
            <span
              className="block h-full rounded-pill"
              style={{
                width: score > i ? "100%" : "0%",
                background: color,
                transition: "width 200ms ease-out, background-color 200ms ease-out",
              }}
            />
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-[13px]" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

/* ------------------------------ Drawer / sheet -------------------------- */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const nodes = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes.length) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex">
      <div
        className="anim-fade absolute inset-0 bg-[rgba(20,19,17,0.35)]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="raised relative ml-auto flex h-full w-full flex-col bg-surface sm:max-w-[460px]"
        style={{
          animation: `${typeof window !== "undefined" && window.innerWidth < 640 ? "rise-slide-up" : "rise-slide-right"} 300ms cubic-bezier(0.16, 1, 0.3, 1)`,
        }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <h2 className="display-md truncate text-[22px]">{title}</h2>
            {subtitle && <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline text-body transition-transform active:scale-95"
          >
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-hairline px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------- Section ------------------------------ */

export function SectionHead({
  title,
  note,
  action,
}: {
  title: string;
  note?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h2 className="display-md">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </div>
      {action}
    </div>
  );
}
