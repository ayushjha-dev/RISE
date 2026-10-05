import reactSvg from "@/assets/brands/react.svg";
import jsSvg from "@/assets/brands/javascript.svg";
import tsSvg from "@/assets/brands/typescript.svg";
import nodeSvg from "@/assets/brands/nodedotjs.svg";
import pythonSvg from "@/assets/brands/python.svg";
import sqlSvg from "@/assets/brands/postgresql.svg";
import cssSvg from "@/assets/brands/css.svg";
import dockerSvg from "@/assets/brands/docker.svg";
import testSvg from "@/assets/brands/vitest.svg";
import dataSvg from "@/assets/brands/pandas.svg";
import { cn } from "@/lib/utils";

/**
 * Real technology marks (from theSVG, MIT library — marks remain the property of
 * their owners, used unmodified) so a skill reads as a thing, not a word.
 */
const marks: Record<string, string> = {
  react: reactSvg,
  javascript: jsSvg,
  typescript: tsSvg,
  node: nodeSvg,
  "node.js": nodeSvg,
  python: pythonSvg,
  sql: sqlSvg,
  postgresql: sqlSvg,
  css: cssSvg,
  docker: dockerSvg,
  testing: testSvg,
  "data analysis": dataSvg,
};

export function hasSkillMark(skill: string) {
  return Boolean(marks[skill.trim().toLowerCase()]);
}

export function SkillMark({ skill, size = 16 }: { skill: string; size?: number }) {
  const src = marks[skill.trim().toLowerCase()];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

/** Skill chip with its real technology mark and a warm tinted plate. */
export function SkillChip({
  skill,
  matched,
  size = "md",
}: {
  skill: string;
  matched?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-[8px] border font-semibold transition-colors duration-150",
        size === "sm" ? "px-1.5 py-1 text-[12px]" : "px-2 py-1.5 text-[13px]",
        matched
          ? "border-transparent bg-accent-soft text-ink"
          : "border-hairline bg-surface-soft text-body",
      )}
    >
      <SkillMark skill={skill} size={size === "sm" ? 13 : 15} />
      <span className="truncate">{skill}</span>
      {matched && (
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" className="text-accent">
          <path
            d="m5 12.5 4.5 4.5L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

/** Stacked marks, used to summarise a skill set in one compact object. */
export function SkillStack({ skills, max = 4 }: { skills: string[]; max?: number }) {
  const shown = skills.filter(hasSkillMark).slice(0, max);
  const rest = skills.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((s, i) => (
        <span
          key={s}
          title={s}
          className="grid h-8 w-8 place-items-center rounded-full border border-hairline bg-surface"
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}
        >
          <SkillMark skill={s} size={15} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className="num grid h-8 min-w-8 place-items-center rounded-full border border-hairline bg-surface-soft px-1.5 text-[11px] font-semibold text-muted"
          style={{ marginLeft: shown.length ? -8 : 0 }}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
