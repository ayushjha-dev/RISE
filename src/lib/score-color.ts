/**
 * Adaptive value colour. A score is never shown in the portal accent colour —
 * the colour itself has to say how good the number is.
 */

export type ScoreTier = "weak" | "developing" | "strong" | "excellent";

export function scoreTier(value: number): ScoreTier {
  const v = Math.max(0, Math.min(100, value));
  if (v < 40) return "weak";
  if (v < 65) return "developing";
  if (v < 85) return "strong";
  return "excellent";
}

const tone: Record<ScoreTier, { color: string; soft: string; from: string; to: string; label: string }> = {
  weak: {
    color: "var(--score-weak)",
    soft: "var(--score-weak-soft)",
    from: "var(--score-weak-from)",
    to: "var(--score-weak)",
    label: "Needs work",
  },
  developing: {
    color: "var(--score-mid)",
    soft: "var(--score-mid-soft)",
    from: "var(--score-mid-from)",
    to: "var(--score-mid)",
    label: "Developing",
  },
  strong: {
    color: "var(--score-good)",
    soft: "var(--score-good-soft)",
    from: "var(--score-good-from)",
    to: "var(--score-good)",
    label: "Strong",
  },
  excellent: {
    color: "var(--score-high)",
    soft: "var(--score-high-soft)",
    from: "var(--score-high-from)",
    to: "var(--score-high)",
    label: "Excellent",
  },
};

export function scoreTone(value: number) {
  return { tier: scoreTier(value), ...tone[scoreTier(value)] };
}

export function scoreColor(value: number) {
  return tone[scoreTier(value)].color;
}

export function scoreSoft(value: number) {
  return tone[scoreTier(value)].soft;
}

export function scoreLabel(value: number) {
  return tone[scoreTier(value)].label;
}

/** Deterministic hue for a categorical series, tuned to the warm paper canvas. */
export const seriesColors = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
];

export function seriesColor(index: number) {
  return seriesColors[index % seriesColors.length]!;
}
