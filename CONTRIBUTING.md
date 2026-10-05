# Contributing to RISE

Thanks for your interest. This document covers how to get set up, the
conventions the codebase follows, and what a good pull request looks like.

## Contents

- [Code of conduct](#code-of-conduct)
- [Quick start](#quick-start)
- [Project layout](#project-layout)
- [Conventions](#conventions)
- [Adding a route](#adding-a-route)
- [Adding a component](#adding-a-component)
- [Working on the design system](#working-on-the-design-system)
- [Data and the simulated backend](#data-and-the-simulated-backend)
- [Before you open a PR](#before-you-open-a-pr)
- [Commit messages](#commit-messages)

---

## Code of conduct

Be decent to each other. Assume good faith, critique the code and never the
person, and assume no offence. Maintainers may remove comments or contributions
that cross that line.

## Quick start

**Prerequisites**

- **Bun 1.4+** (recommended — the repo ships `bun.lock`) **or** Node.js 20+
- Git

```bash
git clone <this-repository-url>
cd RISE
bun install
bun dev
```

The dev server prints a local URL. No environment variables are required — the
AI description generator is optional.

### Environment variables

Copy [`.env.example`](.env.example) to `.env`. Every variable is **optional**:
with none set the app runs fully, and the AI description generator reports "The
description generator isn't configured yet" while the manual posting form works
normally.

| Variable      | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| `AI_API_KEY`  | Bearer token for an OpenAI-compatible `/chat/completions` endpoint |
| `AI_BASE_URL` | Base URL including `/v1`, no trailing slash                        |
| `AI_MODEL`    | Provider-specific model id, e.g. `gemini-2.0-flash`                |

Any OpenAI-compatible provider works (Gemini, OpenAI, OpenRouter, Groq, Together,
a self-hosted vLLM). These are read only on the server. `.env` is gitignored, so
never commit secrets.

## Project layout

```
src/
├── routes/        # file-based pages — one file per URL
├── components/
│   ├── rise/      # the RISE design system ← put new UI here
│   └── ui/        # 46 shadcn components (available, mostly unused)
├── data/          # JSON seeds (simulated backend)
├── hooks/         # use-reveal, use-mobile
├── lib/           # api, store, portal, score-color, jd.functions, errors
├── styles.css     # the whole design system
├── start.ts       # TanStack Start instance (error + CSRF middleware)
├── server.ts      # SSR entry wrapper
└── routeTree.gen.ts  # GENERATED — never edit
```

Before writing code, read the relevant doc:

| Working on                        | Read                                           |
| --------------------------------- | ---------------------------------------------- |
| Architecture / state / data flow  | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)   |
| Colours, type, motion, components | [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) |
| Entities and scoring              | [docs/DATA_MODEL.md](docs/DATA_MODEL.md)       |
| Routing conventions               | [src/routes/README.md](src/routes/README.md)   |

## Conventions

### General

- **Format before pushing.** `bun run format` (Prettier, 100 columns, double
  quotes, trailing commas) and `bun run lint` must both pass.
- **TypeScript strictness is on.** `noUncheckedIndexedAccess` and
  `exactOptionalPropertyTypes` are enabled, so handle `undefined` rather than
  asserting it away. Prefer a guard clause or early return over `!`.
- **Import via `@/`**, which maps to `src/`.
- **Comments explain _why_, not _what_.** Comment the non-obvious decision.

### Data fetching

- Read data through the query factories in `src/lib/api.ts` and `useQuery`. Do
  not `import` a JSON file inside a component.
- Read client state through `src/lib/portal.ts` (`useInternships`,
  `useApplications`, `useCurrentStudent`) or `useStore(selector)`.
- **Never mutate `state` directly.** Use the `actions` object — actions already
  guard preconditions (e.g. duplicate applications).

### Styling

- Use semantic Tailwind tokens (`bg-canvas`, `text-ink`, `text-muted`,
  `border-hairline`, `bg-surface-soft`) — not raw hex codes.
- For portal colour use `var(--accent)`. Hard-coding a portal colour breaks the
  portal system.
- For anything showing a score, use `scoreTone()` from

## Adding a route

Routes are file-based. Create the file, export `createFileRoute(...)`, and the
URL is the file path.

```tsx
// src/routes/student.settings.tsx  →  /student/settings
import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/student/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RISE" },
      { name: "description", content: "Update your RISE preferences." },
    ],
  }),
  component: StudentSettings,
});

function StudentSettings() {
  return <PageTitle title="Settings" />;
}
```

Conventions:

- Dynamic segments use a bare `$param` (`$internshipId`), **not** `{$param}`.
- Optional segments: `{-$category}.tsx`. Splats: `$.tsx`, read `_splat`.
- Layout files hold `<Outlet />` and shared chrome.
- **Never edit `routeTree.gen.ts`** — it is regenerated by the dev server/build.

## Adding a component

New RISE UI belongs in `src/components/rise/`, not `src/components/ui/`.
`ui/` holds shadcn building blocks that are available but not the app's visual
language — mixing the two dialects causes visual drift.

Conventions for `rise/`:

- Compose with existing primitives where possible (`Button`, `Card`, `Field`,
  `TextInput`, `Chip`, …).
- Use `cn()` from `@/lib/utils` to merge class names.
- Use `Reveal` for entrances rather than ad-hoc animation classes.
- Provide loading, empty and error state for anything rendering data
  (`Skeleton`, `EmptyState`, `ErrorState` from `feedback.tsx`).

## Working on the design system

Everything lives in `src/styles.css`.

- **New colour?** Add a token in `:root`, expose it in `@theme inline`, then
  document it in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).
- **New utility?** Use `@utility name { … }` (Tailwind v4 syntax), not a
  `@layer components` class.
- **Anything showing a score?** Route it through `scoreTier`/`scoreTone`.
- **Any animation?** Gate it on `prefers-reduced-motion`.

Changes that alter the look system-wide (tokens, type scale, elevation) should
be proposed in an issue first so the visual direction is agreed before code
lands.

## Data and the simulated backend

`src/data/*.json` is seed data for a backend that does not exist yet.

- Prefer **adding a seed record** over editing existing ones — other screens and
  the docs reference specific IDs and counts.
- `scoreBySubtopic` keys and `assessments.json` `subtopic.name` values must
  match exactly; they are a de facto schema.
- `nptelLinks.json` `skill` values should match subtopic names so learning
  recommendations resolve.

Do not remove the artificial `latency()` delay in `src/lib/api.ts` without
replacing it with real async behaviour — every screen's loading state depends on
reads being genuinely asynchronous.

## Before you open a PR

```bash
bun run lint      # must be clean
bun run format    # commit the result
bun run build     # must succeed
bun dev           # click through the flows you touched
```

Also confirm:

- [ ] New routes have `head()` meta.
- [ ] Data-driven views handle loading, empty and error states.
- [ ] Score colours come from `scoreTone`.
- [ ] Animations respect reduced motion.
- [ ] Works at mobile **and** desktop widths — wide screens are a deliberate
      design target, not an afterthought.
- [ ] Any documented behaviour that changed is reflected in [docs/](docs/).

## Commit messages

Short, imperative, present tense. Reference the area when helpful.

```
Add per-subtopic filter to internship list
Fix hydration mismatch on the student dashboard
Tighten AI error copy when credits are exhausted
```

## Good pull request examples

- **Scoped fix** — one bug, a clear manual repro, and a note on why the fix
  works.
- **Small feature** — the screens it touches, the design tokens it uses, and how
  it looks at mobile and desktop widths.
- **Documentation** — corrections to the docs when behaviour changes.

Avoid sweeping refactors mixed with behaviour changes, standalone dependency
bumps inside a feature PR, and adding a new library where an existing primitive
would do.

## Reporting bugs

Use the **bug report template** and include: what you did, what you expected,
what happened, the portal and route, browser and OS, and console output or a
screenshot if relevant.

## Requesting a feature

Use the **feature request template**. Describe the problem the feature solves
and which portal it affects — a clear problem statement is worth more than a
detailed solution sketch.

---

**See also:** [README](README.md) · [SECURITY.md](SECURITY.md) ·
[ARCHITECTURE.md](docs/ARCHITECTURE.md)
`src/lib/score-color.ts`. Never pick a score colour by hand.

### Accessibility (required)

- Use semantic elements and real form controls.
- Any new animation must respect `prefers-reduced-motion` (see
  `useReveal`/`useCountUp` for the pattern).
- Colour must never be the only signal — pair it with text.
- Keep `head()` meta on every new route.
