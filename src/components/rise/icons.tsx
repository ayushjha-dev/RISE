import type { ReactElement, SVGProps } from "react";

/**
 * One hand-built icon set: 24x24 viewbox, 1.5px stroke, round caps and joins.
 * Solid state icons (check-circle, dot) are the only filled shapes.
 */

export type IconName =
  | "dashboard"
  | "briefcase"
  | "clipboard"
  | "user"
  | "building"
  | "students"
  | "search"
  | "filter"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "close"
  | "check"
  | "check-circle"
  | "dot"
  | "alert"
  | "info"
  | "sparkle"
  | "upload"
  | "external"
  | "logout"
  | "clock"
  | "location"
  | "plus"
  | "arc"
  | "inbox"
  | "cross-circle";

const paths: Record<IconName, ReactElement> = {
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="12.5" rx="3" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.5h18" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="3" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" />
      <path d="M8.75 11h6.5M8.75 15h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
    </>
  ),
  building: (
    <>
      <path d="M4.5 20.5V6.5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M14.5 10.5h3a2 2 0 0 1 2 2v8" />
      <path d="M3 20.5h18M8 8.5h3M8 12.5h3M8 16.5h3" />
    </>
  ),
  students: (
    <>
      <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z" />
      <path d="M7 11.6v4.2c0 1.6 2.2 2.9 5 2.9s5-1.3 5-2.9v-4.2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  filter: (
    <>
      <path d="M4 7h16M7 12h10M10 17h4" />
    </>
  ),
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  "chevron-right": <path d="m9.5 6 6 6-6 6" />,
  "chevron-left": <path d="m14.5 6-6 6 6 6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" />
      <path d="m8 12.2 2.7 2.7L16 9.5" stroke="var(--surface)" strokeWidth="1.8" />
    </>
  ),
  "cross-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  alert: (
    <>
      <path d="M12 4.5 21 20H3l9-15.5Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5Z" />
      <path d="M18.5 17.5 19.3 20l2.2.8-2.2.8-.8 2.2" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16.5V5m0 0L7.5 9.5M12 5l4.5 4.5" />
      <path d="M4.5 15v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M19 5l-7.5 7.5" />
      <path d="M18 14.5V18a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 1 4 18V9a2.5 2.5 0 0 1 2.5-2.5H10" />
    </>
  ),
  logout: (
    <>
      <path d="M14 5H7.5A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19H14" />
      <path d="M17 8.5 20.5 12 17 15.5M11 12h9.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.5 2" />
    </>
  ),
  location: (
    <>
      <path d="M12 21c4-4.2 6.5-7.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 13.8 8 16.8 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  arc: <path d="M4.5 18a7.5 7.5 0 0 1 15 0" />,
  inbox: (
    <>
      <path d="M3.5 13.5 6 5.5h12l2.5 8v4A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-4Z" />
      <path d="M3.5 13.5h4.2l1 2.2h6.6l1-2.2h4.2" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

/** Small geometric brand mark: three rising bars inside a rounded square. */
export function RiseMark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="9" fill="var(--ink)" />
      <path
        d="M9 22V17M16 22V12M23 22V8"
        stroke="var(--canvas)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ----------------------------- Illustrations ----------------------------- */

export function EmptyIllustration({ variant = "list" }: { variant?: "list" | "search" | "chart" }) {
  const stroke = "var(--muted)";
  return (
    <svg viewBox="0 0 96 72" width="112" height="84" fill="none" aria-hidden="true">
      <rect x="8" y="10" width="80" height="52" rx="10" stroke="var(--hairline)" strokeWidth="1.5" />
      {variant === "list" && (
        <>
          <path d="M20 26h34M20 36h44M20 46h24" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 5" />
          <circle cx="72" cy="46" r="9" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M72 41.5v9M67.5 46h9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {variant === "search" && (
        <>
          <circle cx="44" cy="34" r="12" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="m53 43 9 9" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 56h20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 5" />
        </>
      )}
      {variant === "chart" && (
        <>
          <path d="M22 52V40M36 52V32M50 52V44M64 52V26" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 5" />
          <path d="M18 56h60" stroke="var(--hairline)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export function ErrorIllustration() {
  return (
    <svg viewBox="0 0 72 60" width="88" height="72" fill="none" aria-hidden="true">
      <path
        d="M36 8 66 52H6L36 8Z"
        stroke="var(--error)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M36 24v12" stroke="var(--error)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="43" r="1.4" fill="var(--error)" />
    </svg>
  );
}
