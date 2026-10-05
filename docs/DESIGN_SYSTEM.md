# Design System

The complete visual language of RISE, and the reasoning behind it. Everything
here lives in **`src/styles.css`** — one file, CSS-first, no JS config.

## Contents

1. [Principles](#1-principles)
2. [Colour foundations](#2-colour-foundations)
3. [Portal accents](#3-portal-accents)
4. [The adaptive value scale](#4-the-adaptive-value-scale)
5. [Categorical series](#5-categorical-series)
6. [Typography](#6-typography)
7. [Radii, borders, elevation](#7-radii-borders-elevation)
8. [Surface treatments](#8-surface-treatments)
9. [Motion utilities](#9-motion-utilities)
10. [Component inventory](#10-component-inventory)
11. [Iconography and brand marks](#11-iconography-and-brand-marks)
12. [Writing rules](#12-writing-rules)

---

## 1. Principles

**1. Warm paper, not dark mode.** The canvas is `#fbf8f2`. RISE should feel
closer to printed matter — a placement brochure, a lab manual — than to a SaaS
dashboard. Grey-on-white is the failure state to avoid.

**2. Colour carries data, not decoration.** There are exactly two colour
channels: the **portal accent** (which app you are in) and the **value ramp**
(how good the number is). They never overlap. A score rendered in the portal
accent would say nothing, so it never happens.

**3. One saturated accent per surface.** Terracotta on a pine background reads
as an accident. Keep large fields neutral; let one accent do the work.

**4. Depth from light, not shadow.** Warm tinted bands, a paper grain overlay,
hairline curves and a restrained elevation ramp. Flat grey drop shadows are
avoided because they read as "template".

**5. Motion guides, never gates.** Every animation is decorative. If motion is
reduced — or if it fails — the content is fully readable and fully actionable.

**6. Illustrate the empty state.** An empty table with the words "No data" wastes
the most important moment in a screen. RISE draws it.

## 2. Colour foundations

| Token              | Value     | Use                          |
| ------------------ | --------- | ---------------------------- |
| `--canvas`         | `#fbf8f2` | Page background — warm paper |
| `--surface`        | `#ffffff` | Cards, panels                |
| `--surface-soft`   | `#f3efe4` | Inset blocks, table zebra    |
| `--surface-strong` | `#eae4d3` | Chips, deeper insets         |
| `--ink`            | `#141311` | Headings, primary text       |
| `--body`           | `#4a463f` | Body copy                    |
| `--muted`          | `#8a8478` | Secondary text, captions     |
| `--hairline`       | `#e4decf` | All borders and rules        |

Semantic status colours:

| Token       | Value     | Use                            |
| ----------- | --------- | ------------------------------ |
| `--success` | `#3f7a5a` | Confirmations, verified states |
| `--warning` | `#b8863a` | Caution, weak-but-passing      |
| `--error`   | `#b4432f` | Errors, rejections             |
| `--on-dark` | `#fbf8f2` | Text on a dark/accent fill     |

In Tailwind these are exposed as `bg-canvas`, `text-ink`, `text-muted`,
`border-hairline`, `bg-surface-soft`, etc., via `@theme inline`.

## 3. Portal accents

| Portal                       | Token                   | Value     | Soft      | Accent ink |
| ---------------------------- | ----------------------- | --------- | --------- | ---------- |
| 🎓 Student (Lavender)        | `--student-accent`      | `#8c7bc9` | `#ede9f7` | `#ffffff`  |
| 🏛️ Institution (Pine)        | `--institution-accent`  | `#2b4a47` | `#e3eae8` | `#fbf8f2`  |
| 🏢 Organization (Terracotta) | `--organization-accent` | `#c1502e` | `#f6e7df` | `#fbf8f2`  |

`--accent` is the _active_ variable. `PortalShell` sets `data-portal="<role>"` on
its root, and the cascade does the rest:

```css
[data-portal="student"] {
  --accent: var(--student-accent);
}
[data-portal="institution"] {
  --accent: var(--institution-accent);
}
[data-portal="organization"] {
  --accent: var(--organization-accent);
}
```

The landing page and auth screens use the pine accent as the default. **Any new
component must reference `var(--accent)`, never a hard-coded portal colour** —
that is what makes a component portal-agnostic.

## 4. The adaptive value scale

Four tiers, each with a base colour, a gradient start and a soft track.

| Tier       | Range    | Base      | From      | Soft      | Label      |
| ---------- | -------- | --------- | --------- | --------- | ---------- |
| Weak       | `0–39`   | `#b8442d` | `#e0764f` | `#f8e6de` | Needs work |
| Developing | `40–64`  | `#bc832c` | `#e0ae4c` | `#f8eed9` | Developing |
| Strong     | `65–84`  | `#3d7a58` | `#6aa87c` | `#e2efe6` | Strong     |
| Excellent  | `85–100` | `#146b57` | `#3fae86` | `#dcefe7` | Excellent  |

Clay → amber → pine → emerald. The ramp runs warm-to-cool as the value rises,
which reads as "getting better" without needing an arrow.

### Consuming it

Always go through `src/lib/score-color.ts` — never hard-code a hex:

```ts
import {
  scoreTier,
  scoreTone,
  scoreColor,
  scoreSoft,
  scoreLabel,
  seriesColor,
} from "@/lib/score-color";

const tone = scoreTone(72);
// → { tier: "strong", color, soft, from, to, label: "Strong" }
```

| Function         | Returns                                             | Use for                |
| ---------------- | --------------------------------------------------- | ---------------------- |
| `scoreTier(v)`   | `"weak" \| "developing" \| "strong" \| "excellent"` | Branching logic        |
| `scoreTone(v)`   | The whole record                                    | Most cases             |
| `scoreColor(v)`  | Base colour                                         | Text, strokes          |
| `scoreSoft(v)`   | Soft tint                                           | Tracks and backgrounds |
| `scoreLabel(v)`  | Human label                                         | The non-colour signal  |
| `seriesColor(i)` | Categorical hue, wrapping at 5                      | Multi-series charts    |

## 5. Categorical series

For charts comparing _unlike_ things (not performance), use the neutral ramp:

| Token        | Value                  |
| ------------ | ---------------------- |
| `--series-1` | `#2b4a47` (pine)       |
| `--series-2` | `#c1502e` (terracotta) |
| `--series-3` | `#8c7bc9` (lavender)   |
| `--series-4` | `#bc832c` (amber)      |
| `--series-5` | `#3f8a8a` (teal)       |

Reach them via `seriesColor(index)` — it wraps with `% length`, so it is safe to
call with any index. Deliberately **not** a rainbow: five hues chosen to sit
together on warm paper and stay distinguishable for the most common forms of
colour-vision deficiency.

**Rule of thumb:** if the number means "how good", use the value ramp. If it means
"which category", use the series ramp. Never mix the two in one chart.

## 6. Typography

| Role      | Stack                                           | Variable         |
| --------- | ----------------------------------------------- | ---------------- |
| Display   | `"Fraunces", ui-serif, Georgia, serif`          | `--font-display` |
| UI / body | `"Inter", system-ui, -apple-system, sans-serif` | `--font-sans`    |

A serif display against a neutral sans gives the "printed matter" tone without
being decorative. Body text is `15px / 1.55`.

### Display scale

| Utility      | Mobile | ≥640px | Weight | Tracking   |
| ------------ | ------ | ------ | ------ | ---------- |
| `display-xl` | `40px` | `56px` | 540    | `-0.02em`  |
| `display-lg` | `30px` | `40px` | 540    | `-0.015em` |
| `display-md` | `24px` | `28px` | 520    | `-0.01em`  |

Line heights are tight (`1.02–1.15`) because these are short headings; body copy
is the only place with generous leading.

### Numbers

Any figure a user might compare across rows or screens gets the `num` utility:

```html
<span class="num">72</span>
```

It applies `font-variant-numeric: tabular-nums`, so digits occupy equal width and
columns of numbers align. Skipping this is the fastest way to make a dashboard
look amateur.

### Layout utilities

| Utility                              | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| `eyebrow`                            | Small uppercase label above a section heading   |
| `zebra`                              | Warm alternating table rows                     |
| `hairline`                           | 1px border in `--hairline`                      |
| `raised` / `raised-sm` / `raised-lg` | Elevation ramp                                  |
| `lift`                               | Hover elevation                                 |
| `scroll-strip`                       | Horizontal scroll, hidden scrollbar (chip rows) |
| `active-topline`                     | Accent top border on the active nav/tab item    |
| `rule-accent`                        | Short accent rule under section headings        |

## 7. Radii, borders, elevation

| Token | Value |

## 8. Surface treatments

| Utility       | Effect                                                           |
| ------------- | ---------------------------------------------------------------- |
| `grain`       | Very subtle paper grain overlay — the core of the "printed" feel |
| `band`        | Tinted full-width section band                                   |
| `band-warm`   | Warmer variant of `band`                                         |
| `dotfield`    | Decorative dot grid to break up empty canvas                     |
| `CornerArcs`  | Hairline corner arcs (component, not utility)                    |
| `WaveDivider` | Decorative section divider (component)                           |
| `sheen`       | Subtle light sweep on hover                                      |
| `reveal`      | Base state consumed by the `Reveal` component                    |

## 9. Motion utilities

| Utility / keyframe               | Purpose                                            |
| -------------------------------- | -------------------------------------------------- |
| `reveal` + `Reveal`              | Scroll-triggered fade-and-rise, staggered by index |
| `anim-in`                        | Fade + 6px rise on mount                           |
| `anim-fade`                      | Fade only                                          |
| `anim-shake`                     | Horizontal shake for validation failure            |
| `anim-float` / `anim-float-slow` | Drifting accent shapes in the hero                 |
| `anim-pop`                       | Small scale pop — badges, completion moments       |
| `anim-draw`                      | SVG stroke draw-on — charts on first view          |
| `anim-grow`                      | Bar/ring growth on first view                      |
| `shimmer`                        | Skeleton loading sweep                             |
| `marquee`                        | Scrolling partner/logo strip                       |

### The reduced-motion contract

`useReveal` and `useCountUp` both check:

```ts
window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

When reduced motion is requested, they **set the final value immediately** and
skip both `IntersectionObserver` and the animation loop. There is no "reduced"
variant to forget to build — the reduced path _is_ the fallback path. Any new
animation must follow the same rule.

## 10. Component inventory

### `primitives.tsx` — form and layout

`Button` (with `full` width variant), `IconButton`, `Card`, `StatTile`, `Chip`,
`StatusPill` (`applied` / `shortlisted` / `rejected`), `Field`, `TextInput`,
`TextArea`, `Select`, `Checkbox`, `RadioOption`, `Toggle`, `Tabs`, `Dropzone`.

### `feedback.tsx` — status and data display

`ScoreRing`, `Skeleton`, `StatCardSkeleton`, `ListSkeleton`, `ChartSkeleton`,
`EmptyState`, `ErrorState`, `Stepper`, `DigitInput`, `passwordTier`,
`PasswordStrength`, `Drawer`, `SectionHead`.

### `charts.tsx` — hand-authored SVG

`Legend`, `StatusDonut`, `RankedBars`, `SkillMeter`, `SubtopicRadar`,
`TrendArea`, `ScoreBullet`. No charting library, no default palette, no dead plot
area.

### `shell.tsx` — chrome

`PortalShell` (session gate + side rail + mobile bar + `data-portal`),
`ActionBar`, `PageTitle`, `useSession`.

### `illustrations.tsx` and `icons.tsx` — artwork

`HeroScene`, `PortalMotif`, `EmptyArt`, `CelebrationBadge`, `CornerArcs`,
`WaveDivider`, `Monogram`, `Icon` (named set via `IconName`), `RiseMark`,
`EmptyIllustration`, `ErrorIllustration`.

### `brand.tsx` — skills

`SkillChip`, `SkillStack`, `SkillMark`, `hasSkillMark`. Skill names map to real
technology marks from `src/assets/brands/` (simple-icons, CC0) so a skill reads
as a thing rather than a word; unknown skills fall back to plain text.

## 11. Iconography and brand marks

`Icon` takes a **named** `IconName`, not a component reference. This keeps the
icon vocabulary finite, greppable, and impossible to drift:

```tsx
<Icon name="user" />       <Icon name="briefcase" />   <Icon name="building" />
<Icon name="dashboard" />  <Icon name="clipboard" />  <Icon name="plus" />
```

`RiseMark` is the wordmark glyph. `Monogram` generates initials avatars so people
and organizations have an identity without uploaded logos.

Skill marks in `src/assets/brands/`: React, JavaScript, TypeScript, Node.js,
Python, PostgreSQL, CSS, Docker, Vitest, Pandas — used unmodified, property of
their owners.

## 12. Writing rules

The interface is written in plain, specific English. Existing examples:

- ✅ "That ID isn't 12 digits — check the number on your ABC card."
- ✅ "The generator is busy right now — try again in a moment."
- ❌ "Oops! Something went wrong 😅"
- ❌ "Invalid input"

Rules: second person, present tense, no emoji in product copy, no exclamation
marks, always name the next action, never blame the user. The AI system prompt
in `jd.functions.ts` enforces the same tone for generated job descriptions.

---

**See also:** [ARCHITECTURE.md](./ARCHITECTURE.md) ·
[DATA_MODEL.md](./DATA_MODEL.md) · [root README](../README.md)
| --- | --- |
| `--radius-xs` | `6px` |
| `--radius-sm` | `10px` |
| `--radius-md` | `14px` |
| `--radius-lg` | `20px` |
| `--radius-pill` | `999px` |

The default control radius is `14px` (`rounded-[14px]`) — noticeably softer than
the shadcn default of `8px`, which is part of what makes the interface feel warm
rather than clinical.

Elevation is a two-stop warm shadow, never neutral grey:

```css
box-shadow:
  0 1px 2px rgba(20, 19, 17, 0.04),
  0 8px 24px rgba(20, 19, 17, 0.06);
```

Three steps: `raised-sm` (resting card) → `raised` / `lift` (hover) →
`raised-lg` (hero panels, the score ring).
Values are clamped to `0–100` internally, so an out-of-range number cannot
produce an undefined tier.

> **Accessibility rule:** the tier's `label` must accompany the colour. A 41 in
> amber and a 91 in emerald must be distinguishable without relying on hue.
