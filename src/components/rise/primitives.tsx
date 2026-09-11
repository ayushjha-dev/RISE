import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-reveal";
import { Icon } from "./icons";

/* --------------------------------- Button -------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  full?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-semibold transition-[transform,background-color,border-color,color] duration-150 active:scale-[0.97] active:duration-[80ms] disabled:pointer-events-none disabled:opacity-45",
        size === "sm" && "h-9 rounded-[10px] px-3.5 text-[13px]",
        size === "md" && "h-11 rounded-[14px] px-4.5 text-sm",
        size === "lg" && "h-[52px] rounded-[14px] px-6 text-[15px]",
        variant === "primary" && "bg-accent text-accent-ink hover:brightness-[1.07]",
        variant === "secondary" &&
          "border border-hairline bg-surface text-ink hover:bg-surface-soft",
        variant === "ghost" && "text-body hover:bg-surface-soft",
        variant === "danger" && "border border-hairline bg-surface text-error hover:bg-surface-soft",
        full && "w-full",
        className,
      )}
    />
  );
}

export function IconButton({
  label,
  name,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; name: Parameters<typeof Icon>[0]["name"] }) {
  return (
    <button
      {...rest}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-body transition-transform duration-150 hover:bg-surface-soft active:scale-95",
        className,
      )}
    >
      <Icon name={name} size={18} />
    </button>
  );
}

/* ---------------------------------- Card --------------------------------- */

export function Card({
  children,
  className,
  active,
  hover,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  hover?: boolean;
  as?: "div" | "li" | "article";
}) {
  return (
    <As
      className={cn(
        "raised-sm rounded-[16px] border border-hairline bg-surface",
        hover && "lift",
        active && "active-topline border-t-transparent",
        className,
      )}
      style={active ? { borderTop: "1px solid var(--accent)" } : undefined}
    >
      {children}
    </As>
  );
}

/** Dashboard stat tile: counted value, adaptive accent corner, optional artwork. */
export function StatTile({
  label,
  value,
  note,
  icon,
  tone,
  suffix,
  delay = 0,
}: {
  label: string;
  value: number | string;
  note?: string;
  icon?: ReactNode;
  tone?: string;
  suffix?: string;
  delay?: number;
}) {
  const numeric = typeof value === "number" ? value : null;
  const counted = useCountUp(numeric ?? 0, 900, numeric !== null);
  const hue = tone ?? "var(--accent)";
  return (
    <div
      className="lift group relative overflow-hidden rounded-[16px] border border-hairline bg-surface p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-[0.13] transition-transform duration-500 group-hover:scale-125"
        style={{ background: hue }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {icon && (
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
            style={{ background: "var(--accent-soft)", color: hue }}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="num relative mt-3 font-display text-[34px] leading-none font-semibold" style={{ color: hue }}>
        {numeric !== null ? counted : value}
        {suffix}
      </p>
      {note && <p className="relative mt-2 text-[13px] text-muted">{note}</p>}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "error";
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-soft text-body",
    accent: "bg-accent-soft text-ink",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };
  const semantic = tone === "success" || tone === "warning" || tone === "error";
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-[6px] px-2 py-1 text-[13px] font-semibold",
        tones[tone],
        semantic && "border",
      )}
      style={
        semantic
          ? {
              borderColor: "var(--hairline)",
              backgroundColor: "var(--surface)",
            }
          : undefined
      }
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

export function StatusPill({ status }: { status: "applied" | "shortlisted" | "rejected" }) {
  const map = {
    applied: { label: "Applied", color: "var(--body)", icon: "dot" as const },
    shortlisted: { label: "Shortlisted", color: "var(--success)", icon: "check-circle" as const },
    rejected: { label: "Not selected", color: "var(--error)", icon: "cross-circle" as const },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-surface px-2.5 py-1 text-[13px] font-semibold"
      style={{ color: s.color }}
    >
      <Icon name={s.icon} size={14} />
      {s.label}
    </span>
  );
}

/* --------------------------------- Inputs -------------------------------- */

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
  htmlFor?: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[13px] font-semibold tracking-[0.2px] text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[13px] text-error">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      className={cn(
        "h-11 w-full rounded-[10px] border bg-surface px-3.5 text-[15px] text-ink transition-colors duration-150 placeholder:text-muted focus:border-ink focus:outline-none focus-visible:outline-none",
        invalid ? "border-error" : "border-hairline",
        className,
      )}
      style={invalid ? { borderWidth: 1.5 } : undefined}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      className={cn(
        "w-full rounded-[10px] border bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-ink transition-colors duration-150 placeholder:text-muted focus:border-ink focus:outline-none",
        invalid ? "border-error" : "border-hairline",
        className,
      )}
    />
  );
}

/* --------------------------------- Select -------------------------------- */

export function Select({
  value,
  onChange,
  options,
  placeholder = "Choose one",
  searchable,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; meta?: string }[];
  placeholder?: string;
  searchable?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const list = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-[10px] border bg-surface px-3.5 text-left text-[15px] transition-colors duration-150",
          open ? "border-ink" : "border-hairline",
        )}
      >
        <span className={cn("truncate", selected ? "text-ink" : "text-muted")}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className="shrink-0 text-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          <Icon name="chevron-down" size={18} />
        </span>
      </button>

      {open && (
        <div className="raised anim-fade absolute z-40 mt-2 w-full overflow-hidden rounded-[14px] border border-hairline bg-surface">
          {searchable && (
            <div className="border-b border-hairline p-2">
              <div className="flex h-10 items-center gap-2 rounded-[10px] bg-surface-soft px-3">
                <Icon name="search" size={16} className="shrink-0 text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCursor(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") setCursor((c) => Math.min(c + 1, list.length - 1));
                    if (e.key === "ArrowUp") setCursor((c) => Math.max(c - 1, 0));
                    if (e.key === "Enter" && list[cursor]) {
                      e.preventDefault();
                      onChange(list[cursor].value);
                      setOpen(false);
                    }
                    if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Search"
                  className="h-full w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
              </div>
            </div>
          )}
          <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
            {list.length === 0 && (
              <li className="px-3.5 py-3 text-[13px] text-muted">No matches for that search</li>
            )}
            {list.map((o, i) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm",
                    i === cursor ? "bg-surface-soft" : "bg-transparent",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{o.label}</span>
                    {o.meta && <span className="block truncate text-[13px] text-muted">{o.meta}</span>}
                  </span>
                  {o.value === value && (
                    <span className="shrink-0 text-accent">
                      <Icon name="check" size={16} />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Checkbox / Radio / Toggle --------------------- */

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-1 text-left"
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors duration-150",
          checked ? "border-accent bg-accent" : "border-hairline bg-surface",
        )}
      >
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
          <path
            d="m4 10.5 4 4 8-9"
            stroke="var(--accent-ink)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 22,
              strokeDashoffset: checked ? 0 : 22,
              transition: "stroke-dashoffset 150ms ease-out",
            }}
          />
        </svg>
      </span>
      <span className="text-sm text-body">{label}</span>
    </button>
  );
}

export function RadioOption({
  selected,
  onSelect,
  children,
  large,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-[14px] border bg-surface px-4 text-left transition-colors duration-150 active:scale-[0.99]",
        large ? "min-h-[56px] py-3.5" : "min-h-11 py-3",
        selected ? "border-accent bg-accent-soft" : "border-hairline hover:bg-surface-soft",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors duration-150",
          selected ? "border-accent" : "border-hairline",
        )}
      >
        <span
          className="h-2.5 w-2.5 rounded-full bg-accent transition-transform duration-150"
          style={{ transform: selected ? "scale(1)" : "scale(0)" }}
        />
      </span>
      <span className="min-w-0 text-[15px] text-ink">{children}</span>
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 items-center gap-3"
    >
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-pill border transition-colors duration-200",
          checked ? "border-accent bg-accent" : "border-hairline bg-surface-strong",
        )}
      >
        <span
          className="absolute top-[3px] h-4 w-4 rounded-full bg-surface"
          style={{
            left: checked ? 24 : 3,
            transition: "left 240ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </span>
      <span className="text-sm text-body">
        {label} <span className="font-semibold text-ink">{checked ? "on" : "off"}</span>
      </span>
    </button>
  );
}

/* ---------------------------------- Tabs --------------------------------- */

export function Tabs({
  value,
  onChange,
  items,
  full,
}: {
  value: string;
  onChange: (v: string) => void;
  items: { value: string; label: string }[];
  full?: boolean;
}) {
  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );
  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex rounded-pill border border-hairline bg-surface-soft p-1",
        full && "w-full",
      )}
    >
      <span
        className="absolute top-1 bottom-1 rounded-pill bg-surface shadow-[0_1px_2px_rgba(20,19,17,0.06)]"
        style={{
          width: `calc((100% - 8px) / ${items.length})`,
          left: `calc(4px + ${index} * ((100% - 8px) / ${items.length}))`,
          transition: "left 260ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      {items.map((i) => (
        <button
          key={i.value}
          role="tab"
          type="button"
          aria-selected={i.value === value}
          onClick={() => onChange(i.value)}
          className={cn(
            "relative z-10 min-h-9 flex-1 whitespace-nowrap rounded-pill px-4 text-[13px] font-semibold transition-colors duration-150",
            i.value === value ? "text-ink" : "text-muted",
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- File upload ----------------------------- */

export function Dropzone({
  fileName,
  onFile,
}: {
  fileName?: string | undefined;
  onFile: (name: string) => void;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f.name);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-[14px] border border-dashed px-6 py-8 text-center transition-colors duration-150",
          over ? "border-accent bg-accent-soft" : "border-hairline bg-surface",
        )}
      >
        <span className="text-muted">
          <Icon name="upload" size={22} />
        </span>
        <p className="text-sm text-ink">
          {fileName ? fileName : "Drop your resume here, or choose a file"}
        </p>
        <p className="text-[13px] text-muted">PDF up to 2 MB</p>
        <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
          {fileName ? "Replace file" : "Choose file"}
        </Button>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f.name);
          }}
        />
      </div>
    </div>
  );
}
