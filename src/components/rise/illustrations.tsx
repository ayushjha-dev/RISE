import type { Role } from "@/lib/store";

/**
 * Hand-authored SVG artwork, drawn for the warm paper canvas: thin ink lines,
 * flat tinted planes, one accent per portal. No stock imagery anywhere.
 */

/* --------------------------------- Hero ---------------------------------- */

export function HeroScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 440" className={className} role="img" aria-label="Three RISE portals sharing one student record">
      <defs>
        <linearGradient id="hs-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--surface)" />
          <stop offset="100%" stopColor="var(--surface-soft)" />
        </linearGradient>
        <linearGradient id="hs-pine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--institution-accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--institution-accent)" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id="hs-clay" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--organization-accent)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--score-mid-from)" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--student-accent)" stopOpacity="0.30" />
          <stop offset="100%" stopColor="var(--student-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="262" cy="200" r="190" fill="url(#hs-glow)" />

      {/* drifting background shapes */}
      <g className="anim-float-slow">
        <circle cx="72" cy="72" r="30" fill="var(--student-accent-soft)" />
        <rect x="430" y="52" width="54" height="54" rx="16" fill="var(--organization-accent-soft)" />
        <path d="M40 372c40-26 84-26 124 0" stroke="var(--hairline)" strokeWidth="2" fill="none" />
      </g>

      {/* base card: the student record */}
      <g className="anim-float" style={{ animationDuration: "9s" }}>
        <rect x="58" y="132" width="300" height="186" rx="22" fill="url(#hs-paper)" stroke="var(--hairline)" strokeWidth="1.5" />
        <circle cx="98" cy="176" r="17" fill="var(--student-accent-soft)" />
        <path d="M98 170a5.6 5.6 0 1 1 0 11.2A5.6 5.6 0 0 1 98 170Zm-9 16c2-4.4 5.2-6.6 9-6.6s7 2.2 9 6.6" stroke="var(--student-accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="126" y="166" width="118" height="9" rx="4.5" fill="var(--surface-strong)" />
        <rect x="126" y="182" width="76" height="8" rx="4" fill="var(--surface-strong)" opacity="0.7" />

        {/* adaptive skill meters */}
        <g>
          <rect x="86" y="222" width="200" height="8" rx="4" fill="var(--surface-strong)" />
          <rect x="86" y="222" width="176" height="8" rx="4" fill="var(--score-high)" />
          <rect x="86" y="246" width="200" height="8" rx="4" fill="var(--surface-strong)" />
          <rect x="86" y="246" width="126" height="8" rx="4" fill="var(--score-good)" />
          <rect x="86" y="270" width="200" height="8" rx="4" fill="var(--surface-strong)" />
          <rect x="86" y="270" width="66" height="8" rx="4" fill="var(--score-mid)" />
        </g>

        {/* score ring on the record */}
        <g transform="translate(304 236)">
          <circle r="26" fill="var(--surface)" stroke="var(--surface-strong)" strokeWidth="6" />
          <circle
            r="26"
            fill="none"
            stroke="var(--score-high)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="163"
            strokeDashoffset="33"
            transform="rotate(-90)"
          />
          <text textAnchor="middle" y="6" fontSize="16" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-sans)">
            80
          </text>
        </g>
      </g>

      {/* institution plane */}
      <g className="anim-float" style={{ animationDelay: "1.4s" }}>
        <rect x="286" y="66" width="176" height="104" rx="18" fill="url(#hs-pine)" />
        <path d="M320 142V104l22-14 22 14v38" stroke="var(--on-dark)" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
        <path d="M364 118h26v24" stroke="var(--on-dark)" strokeWidth="1.6" fill="none" />
        <path d="M310 142h122" stroke="var(--on-dark)" strokeWidth="1.6" strokeLinecap="round" />
        <g opacity="0.85">
          <rect x="404" y="96" width="8" height="26" rx="4" fill="var(--on-dark)" />
          <rect x="418" y="86" width="8" height="36" rx="4" fill="var(--on-dark)" />
          <rect x="432" y="76" width="8" height="46" rx="4" fill="var(--on-dark)" />
        </g>
      </g>

      {/* organization plane */}
      <g className="anim-float" style={{ animationDelay: "2.6s" }}>
        <rect x="292" y="292" width="184" height="112" rx="18" fill="url(#hs-clay)" />
        <rect x="314" y="318" width="66" height="10" rx="5" fill="var(--on-dark)" opacity="0.9" />
        <rect x="314" y="338" width="140" height="8" rx="4" fill="var(--on-dark)" opacity="0.55" />
        <rect x="314" y="356" width="112" height="8" rx="4" fill="var(--on-dark)" opacity="0.4" />
        <g transform="translate(438 322)">
          <circle r="16" fill="var(--on-dark)" opacity="0.18" />
          <path d="m-6 1 4.5 4.5L8-4" stroke="var(--on-dark)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* connective threads */}
      <g stroke="var(--muted)" strokeWidth="1.4" fill="none" opacity="0.55" strokeDasharray="4 6">
        <path d="M300 170c30 14 30 40 6 56" />
        <path d="M304 300c30-12 34-30 14-48" />
      </g>
    </svg>
  );
}

/* ------------------------- Portal header motifs -------------------------- */

/** Low-contrast artwork band that sits behind a page title so no page starts bare. */
export function PortalMotif({ role, className }: { role: Role; className?: string }) {
  return (
    <svg viewBox="0 0 480 160" className={className} aria-hidden="true" preserveAspectRatio="xMaxYMid slice">
      <defs>
        <linearGradient id={`pm-${role}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <circle cx="392" cy="52" r="96" fill={`url(#pm-${role})`} />
      <g stroke="var(--accent)" strokeOpacity="0.30" strokeWidth="1.4" fill="none">
        {role === "student" && (
          <>
            <path d="M240 128c46-64 108-92 214-92" />
            <path d="M268 138c40-52 96-76 186-76" strokeDasharray="4 7" />
            <circle cx="454" cy="36" r="7" fill="var(--accent)" fillOpacity="0.5" stroke="none" />
          </>
        )}
        {role === "institution" && (
          <>
            <path d="M300 130V74l30-20 30 20v56" />
            <path d="M360 96h34v34" />
            <path d="M282 130h140" />
            <path d="M416 130V70M440 130V52M464 130V86" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />
          </>
        )}
        {role === "organization" && (
          <>
            <rect x="300" y="60" width="140" height="66" rx="14" />
            <path d="M340 60V48a10 10 0 0 1 10-10h20a10 10 0 0 1 10 10v12" />
            <path d="M300 90h140" strokeDasharray="5 7" />
            <circle cx="452" cy="40" r="9" fill="var(--accent)" fillOpacity="0.4" stroke="none" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ------------------------------ Empty states ----------------------------- */

export type EmptyArtVariant =
  | "applications"
  | "applicants"
  | "students"
  | "search"
  | "report"
  | "learning"
  | "list"
  | "chart";

export function EmptyArt({ variant = "list" }: { variant?: EmptyArtVariant }) {
  const ink = "var(--muted)";
  const accent = "var(--accent)";
  return (
    <svg viewBox="0 0 160 116" width="176" height="128" fill="none" aria-hidden="true">
      <ellipse cx="80" cy="104" rx="52" ry="6" fill="var(--surface-strong)" opacity="0.7" />
      {variant === "applications" && (
        <g className="anim-float" style={{ animationDuration: "8s" }}>
          <rect x="34" y="20" width="66" height="80" rx="12" fill="var(--surface)" stroke="var(--hairline)" strokeWidth="1.5" />
          <rect x="46" y="36" width="42" height="6" rx="3" fill="var(--surface-strong)" />
          <rect x="46" y="50" width="30" height="5" rx="2.5" fill="var(--surface-strong)" />
          <rect x="46" y="62" width="36" height="5" rx="2.5" fill="var(--surface-strong)" />
          <circle cx="106" cy="74" r="19" fill="var(--accent-soft)" stroke={accent} strokeWidth="1.5" />
          <path d="M106 66v16M98 74h16" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {variant === "applicants" && (
        <g>
          <circle cx="58" cy="46" r="13" stroke={ink} strokeWidth="1.5" />
          <path d="M40 78c3.6-10 9.8-15 18-15s14.4 5 18 15" stroke={ink} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="52" r="10" stroke="var(--hairline)" strokeWidth="1.5" />
          <path d="M86 78c2.8-8 7.6-11.5 14-11.5s11.2 3.5 14 11.5" stroke="var(--hairline)" strokeWidth="1.5" />
          <path d="M28 92h104" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="2 6" />
        </g>
      )}
      {variant === "students" && (
        <g>
          <path d="M28 52 80 26l52 26-52 26-52-26Z" stroke={accent} strokeWidth="1.5" fill="var(--accent-soft)" />
          <path d="M46 62v18c0 7 15 12 34 12s34-5 34-12V62" stroke={ink} strokeWidth="1.5" />
        </g>
      )}
      {variant === "search" && (
        <g>
          <circle cx="72" cy="52" r="24" stroke={accent} strokeWidth="1.6" fill="var(--accent-soft)" fillOpacity="0.5" />
          <path d="m90 70 18 18" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M60 52h24M60 44h16" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 5" />
        </g>
      )}
      {variant === "report" && (
        <g>
          <rect x="30" y="24" width="100" height="72" rx="12" fill="var(--surface)" stroke="var(--hairline)" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="17" stroke="var(--surface-strong)" strokeWidth="5" />
          <path d="M60 43a17 17 0 0 1 15 9" stroke="var(--score-mid)" strokeWidth="5" strokeLinecap="round" />
          <rect x="88" y="48" width="30" height="6" rx="3" fill="var(--surface-strong)" />
          <rect x="88" y="62" width="22" height="6" rx="3" fill="var(--surface-strong)" />
        </g>
      )}
      {variant === "learning" && (
        <g>
          <path d="M36 34h40c5 0 8 3 8 8v50c0-5-3-8-8-8H36V34Z" stroke={ink} strokeWidth="1.5" fill="var(--surface)" />
          <path d="M124 34H84c-5 0-8 3-8 8v50c0-5 3-8 8-8h40V34Z" stroke={accent} strokeWidth="1.5" fill="var(--accent-soft)" fillOpacity="0.6" />
          <path d="M80 42v46" stroke="var(--hairline)" strokeWidth="1.5" />
        </g>
      )}
      {(variant === "list" || variant === "chart") && (
        <g>
          <rect x="30" y="26" width="100" height="66" rx="12" stroke="var(--hairline)" strokeWidth="1.5" />
          {variant === "list" ? (
            <path d="M44 46h44M44 60h56M44 74h30" stroke={ink} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 6" />
          ) : (
            <path d="M48 80V58M66 80V44M84 80V66M102 80V38" stroke={ink} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="3 6" />
          )}
        </g>
      )}
    </svg>
  );
}

/* ------------------------------ Celebration ------------------------------ */

export function CelebrationBadge({ score }: { score: number }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" className="anim-pop">
      <defs>
        <linearGradient id="cb-ribbon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--score-high-from)" />
          <stop offset="100%" stopColor="var(--score-high)" />
        </linearGradient>
      </defs>
      <g className="anim-float" style={{ animationDuration: "6s" }}>
        <path d="M42 78 30 112l16-8 10 8 6-30Z" fill="var(--accent)" opacity="0.75" />
        <path d="M78 78 90 112l-16-8-10 8-6-30Z" fill="var(--accent)" opacity="0.5" />
        <circle cx="60" cy="52" r="34" fill="url(#cb-ribbon)" />
        <circle cx="60" cy="52" r="27" fill="var(--surface)" opacity="0.16" />
        <text
          x="60"
          y="60"
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill="var(--on-dark)"
          fontFamily="var(--font-sans)"
        >
          {Math.round(score)}
        </text>
      </g>
      <g stroke="var(--score-mid)" strokeWidth="2.5" strokeLinecap="round">
        <path d="M14 30 6 24M106 30l8-6M22 12l-3-8M98 12l3-8" />
      </g>
    </svg>
  );
}

/* ------------------------------- Decoration ------------------------------ */

export function CornerArcs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" fill="none">
      <g stroke="var(--accent)" strokeOpacity="0.22" strokeWidth="1.3">
        <circle cx="112" cy="8" r="34" />
        <circle cx="112" cy="8" r="58" />
        <circle cx="112" cy="8" r="84" strokeDasharray="3 8" />
      </g>
    </svg>
  );
}

export function WaveDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 40" className={className} preserveAspectRatio="none" aria-hidden="true" fill="none">
      <path d="M0 26c150-24 300-24 450 0s300 24 450 0 150-18 300-6" stroke="var(--hairline)" strokeWidth="1.5" />
      <path d="M0 34c150-24 300-24 450 0s300 24 450 0 150-18 300-6" stroke="var(--accent)" strokeOpacity="0.22" strokeWidth="1.5" />
    </svg>
  );
}

/** Monogram tile for an organization or institution — deterministic pattern. */
export function Monogram({ name, size = 44 }: { name: string; size?: number }) {
  const letters = name
    .split(" ")
    .filter((w) => /[A-Za-z]/.test(w[0] ?? ""))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const seed = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rotate = seed % 90;
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-[12px] border border-hairline"
      style={{ width: size, height: size, background: "var(--accent-soft)" }}
    >
      <svg viewBox="0 0 44 44" width={size} height={size} className="absolute inset-0" aria-hidden="true">
        <g transform={`rotate(${rotate} 22 22)`} stroke="var(--accent)" strokeOpacity="0.28" strokeWidth="1.2" fill="none">
          <circle cx="4" cy="6" r="16" />
          <circle cx="40" cy="38" r="14" />
        </g>
      </svg>
      <span
        className="relative font-display font-semibold text-ink"
        style={{ fontSize: Math.round(size * 0.36) }}
      >
        {letters || "R"}
      </span>
    </span>
  );
}
