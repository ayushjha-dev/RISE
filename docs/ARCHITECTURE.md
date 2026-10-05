# Architecture

How RISE is put together, and why each decision was made. For the product story
see the [root README](../README.md); for visual language see
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Contents

1. [Shape of the app](#1-shape-of-the-app)
2. [Stack rationale](#2-stack-rationale)
3. [Project structure](#3-project-structure)
4. [Routing](#4-routing)
5. [State: two stores, deliberately](#5-state-two-stores-deliberately)
6. [The data layer](#6-the-data-layer)
7. [Scoring and matching](#7-scoring-and-matching)
8. [Server functions](#8-server-functions)
9. [SSR lifecycle and error handling](#9-ssr-lifecycle-and-error-handling)
10. [Build and runtime](#10-build-and-runtime)
11. [Accessibility](#11-accessibility)
12. [Deliberate non-goals](#12-deliberate-non-goals)

---

## 1. Shape of the app

RISE is a **single application** serving three audiences. There is no
microservice boundary, no separate admin app, and no shared-component package —
the three portals are colour- and route-scoped views over one store.

```
                       ┌───────────────────────────────┐
  /            public  │  landing                      │
  /auth                │  auth + register               │
                       └───────────────┬───────────────┘
                                       │
      ┌────────────────────────────────┼───────────────────────────────┐
      ▼                                ▼                               ▼
┌──────────────┐              ┌────────────────┐             ┌──────────────────┐
│ /student/*   │              │ /institution/* │             │ /organization/*  │
│ lavender     │              │ pine           │             │ terracotta       │
│ 7 routes     │              │ 3 routes       │             │ 4 routes         │
└──────┬───────┘              └────────┬───────┘             └────────┬─────────┘
       │                               │                            │
       └────────────────┬──────────────┴────────────────────────────┘
                        ▼
     ┌──────────────────────────────────────────────┐
     │  store.ts   session · applications · extras  │  useSyncExternalStore
     │  api.ts     students · internships · assess.  │  TanStack Query
     │  data/*.json  immutable seed snapshots       │
     └──────────────────────────────────────────────┘
```

Every portal layout (`student.tsx`, `institution.tsx`, `organization.tsx`) is a
thin wrapper that mounts `PortalShell` with a nav list. `PortalShell` handles
the session gate, the side rail, the mobile bar and the `data-portal` attribute.
Adding a nav item is a one-line change in that file.

## 2. Stack rationale

| Decision                                  | Rationale                                                                                      | Trade-off accepted                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| TanStack Start over Next.js               | First-class server functions, no framework lock-in, Cloudflare/Nitro output                    | Younger ecosystem; some rough edges (see §9)       |
| TanStack Router                           | Types flow from the route tree into `Link`, params and search validation                       | `routeTree.gen.ts` is generated, never hand-edited |
| TanStack Query over a local source        | Forces every read through async, so loading/error/empty states are real rather than decorative | Slight ceremony for what is local JSON             |
| `useSyncExternalStore` over Redux/Zustand | ~40 lines, zero dependencies, SSR-safe via a server snapshot                                   | No devtools, no time-travel                        |
| Tailwind v4 CSS-first                     | Tokens live in `@theme`, inspectable in one file                                               | Requires the v4 model (`@utility`, not config JS)  |
| Hand-authored SVG charts                  | Full control over adaptive value colour, no dead plot area                                     | No built-in axes or tooltips                       |
| Bun                                       | Fast installs, committed lockfile                                                              | npm users must match versions carefully            |

### Why shadcn/ui is present but not dominant

`src/components/ui/` holds 46 shadcn components (New York style, Radix
primitives). They exist as **available building blocks**, not as the app's
visual language. Screens are composed from `src/components/rise/`, which encodes
the RISE design system — warm paper, custom radii, adaptive score colour.
Mixing the two dialects in one view produces visual drift, so new RISE UI should
be built in `rise/`.

## 3. Project structure

```
src/
├── routes/               # 22 file-based routes — see routes/README.md
├── components/
│   ├── rise/             # ← the design system (9 modules)
│   │   ├── primitives.tsx    Button, Card, Field, Select, Tabs, Dropzone…
│   │   ├── charts.tsx       Hand-authored SVG: donut, bars, radar, area
│   │   ├── feedback.tsx     ScoreRing, skeletons, empty/error, Stepper, Drawer
│   │   ├── illustrations.tsx HeroScene, PortalMotif, EmptyArt, CornerArcs…
│   │   ├── icons.tsx        Icon (named set), RiseMark, empty/error art
│   │   ├── brand.tsx        SkillChip, SkillStack, SkillMark (tech marks)
│   │   ├── shell.tsx        PortalShell, ActionBar, PageTitle, useSession
│   │   ├── reveal.tsx       Reveal — scroll-triggered entrance wrapper
│   │   └── toast.tsx        ToastProvider, useToast
│   └── ui/               # 46 shadcn components (available, rarely used)
├── data/                 # 7 JSON seed files
├── hooks/                # use-reveal.ts, use-mobile.tsx
├── lib/
│   ├── api.ts            # Query definitions + matchScore/scoreOf/verifyAbcId
│   ├── store.ts          # External store, actions, localStorage persistence
│   ├── portal.ts         # Cross-portal data hooks + formatters
│   ├── score-color.ts    # scoreTier() + the value ramp
│   ├── jd.functions.ts   # The only server function (AI draft)
│   ├── error-capture.ts  # Out-of-band error capture, cause-chain walker
│   ├── error-page.ts     # Standalone HTML error page string
│   └── utils.ts          # cn() — clsx + tailwind-merge
├── assets/brands/        # 10 technology marks (simple-icons)
├── styles.css            # The entire design system in one file
├── router.tsx            # Router factory, one QueryClient per request
├── start.ts              # createStart: error + CSRF middleware
├── server.ts             # SSR entry wrapper (h3 error recovery)
└── routeTree.gen.ts      # GENERATED — do not edit
```

### The `@/` alias

`tsconfig.json` maps `@/*` → `./src/*`, resolved in Vite by
`vite-tsconfig-paths`. Use `@/` in imports; never write `../../`.

## 4. Routing

Routing is **file-based and fully typed**. A route file's exported `Route`
object determines the URL, and params/search are inferred — no manual prop
types.

| File                                    | URL                                                 | Notes                             |
| --------------------------------------- | --------------------------------------------------- | --------------------------------- |
| `index.tsx`                             | `/`                                                 | Landing                           |
| `auth.tsx`                              | `/auth`                                             | Role tabs + account picker        |
| `register.tsx`                          | `/register`                                         | 4-step wizard, state held locally |
| `student.tsx`                           | `/student`                                          | Layout + nav                      |
| `student.index.tsx`                     | `/student`                                          | Dashboard                         |
| `student.internships.tsx`               | `/student/internships`                              | Layout for the group              |
| `student.internships.index.tsx`         | `/student/internships`                              | List + filters                    |
| `student.internships.$internshipId.tsx` | `/student/internships/:internshipId`                |                                   |
| `student.assessment.$internshipId.tsx`  | `/student/assessment/:internshipId`                 |                                   |
| `student.report.$internshipId.tsx`      | `/student/report/:internshipId`                     |                                   |
| `student.learning.tsx`                  | `/student/learning`                                 |                                   |
| `student.profile.tsx`                   | `/student/profile`                                  |                                   |
| `institution.tsx` + 3                   | `/institution`, `/students`, `/profile`             | Layout + 3 screens                |
| `organization.tsx` + 4                  | `/organization`, `/applicants`, `/post`, `/profile` | Layout + 4 screens                |

Conventions that matter:

- **Params use bare `$`**, never curly braces: `$internshipId`, not `{$id}`.
- **Optional segments** use `{-$category}`; **splats** use `$.tsx` and are read
  from `_splat`.
- `organization.post.tsx` declares `validateSearch` to read `?edit=<id>`, which
  is how editing an existing posting is triggered.
- Every route declares `head()` returning meta + Open Graph tags. This is the
  single biggest SEO win available — keep it.

Full conventions: [src/routes/README.md](../src/routes/README.md).

## 5. State: two stores, deliberately

RISE has exactly two state mechanisms, and the split is intentional.

### Server state → TanStack Query (`src/lib/api.ts`)

Read-only, cacheable, "fetched" data: students, institutions, organizations,
internships, assessments, learning links. Query keys are tuples like
`["students"]` and `["assessment", id]`. `queryOptions()` factories mean a screen
declares `useQuery(studentsQuery())` rather than hand-writing keys — a typo
becomes a type error.

### Client state → external store (`src/lib/store.ts`)

Mutable, user-owned state: the session, applications, internships created at
runtime, students registered at runtime, and seen milestones.

````ts
## 6. The data layer

`src/data/*.json` are **immutable seed snapshots**. `src/lib/api.ts` composes
them with runtime additions and wraps each read in an artificial delay:

```ts
const latency = (ms = 260) => new Promise((r) => setTimeout(r, ms));
async function read<T>(value: () => T, ms?: number) { await latency(ms); return value(); }
````

That delay is the most important line in the file. It forces every screen to
render a skeleton before data, so the loading states you see are the states
users get. Remove it and you will silently break every screen's layout.

Reads merge seed data with runtime additions — because there is no dedicated
admin screen for creating either of these:

```ts
studentsQuery: [...studentsSeed, ...getState().extraStudents];
internshipsQuery: [...getState().extraInternships, ...internshipsSeed];
```

New internships are prepended so a just-posted role appears first.

> **Swapping in a real API later:** replace the bodies of the `*Query()`
> factories with real fetches. Keep the return shapes. Nothing above this layer
> needs to change — that is the entire point of the async wrapper.

## 7. Scoring and matching

Two pure functions in `src/lib/api.ts` drive the product's logic.

### `matchScore(studentSkills, required)`

```ts
if (!studentSkills.length || !required.length) return null; // never fake a 0
const set = new Set(studentSkills.map((s) => s.toLowerCase()));
const hits = required.filter((r) => set.has(r.toLowerCase())).length;
return Math.round((hits / required.length) * 100);
```

Case-insensitive overlap percentage. Returning `null` for missing data is
deliberate — a 0% match and "we don't know" are different facts, and conflating
them would tell a student they are unqualified when the system simply has no data.

### `scoreOf(scores)` and `recordScores`

`overallScore` is the **arithmetic mean** of `scoreBySubtopic`. This is a lossy
summary by design — it exists only for sorting. The UI never shows an overall
number as _the_ verdict; it always expands to subtopics.

### `scoreTier(value)` (`src/lib/score-color.ts`)

Clamps to `0–100`, then buckets: `<40` weak, `<65` developing, `<85` strong,
else excellent. Every visual — ring, bar, donut segment, pill, table cell —
reads from `scoreTone()`, which returns the tier's `color`, `soft` (track),
`from`/`to` (gradient) and human `label`. **A score is never rendered in the
portal accent colour**: the accent says which portal you are in, the value ramp
says how good the number is. Keeping those two channels separate is why the
charts stay readable.

## 8. Server functions

`src/lib/jd.functions.ts` holds the only real network call in RISE.

## 9. SSR lifecycle and error handling

This is the most infrastructure-heavy part of the codebase, and every line
exists because of a specific h3/Nitro behaviour.

### The problem

h3 serializes a throw into a normal `500` response whose body is
`{"unhandled":true,"message":"HTTPError"}` — **no stack, no cause**. A
`try/catch` around the handler never fires, so the real error vanishes.

### The solution, in three parts

**a) Capture out of band** — `src/lib/error-capture.ts` stashes the thrown
`Error` in module scope with a **5-second TTL**, and `describeError()` walks up
to 5 levels of `error.cause` to rebuild a readable chain (capped at 8,000
characters so a cyclic or enormous cause cannot flood logs).

**b) Normalize the response** — `src/server.ts` intercepts any `5xx` with a JSON
content type, checks whether the body is exactly the h3-swallowed shape, and if
so swaps in the styled HTML page from `error-page.ts` while logging the
recovered original error.

**c) Catch what h3 misses** — `src/start.ts` registers `errorMiddleware`, which
converts unknown throws to the same HTML page but **re-throws anything carrying a
`statusCode`**, so deliberate 404s and redirects keep their semantics.

### CSRF

`start.ts` defines `csrfMiddleware` with `filter: ctx => ctx.handlerType ===
"serverFn"`. This must be re-declared manually: TanStack Start installs it
automatically **only when `src/start.ts` is absent**. Defining the file to add
error handling silently opts out of CSRF protection, so anyone adding middleware
here must keep that block.

### Three client/server error surfaces

| Surface                                | Handles                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `notFoundComponent` in `__root.tsx`    | Unknown URLs → styled 404 with a way home                                        |
| `errorComponent` in `__root.tsx`       | Render errors → `router.invalidate()` + reset, reported via `reportLovableError` |
| `renderErrorPage()` in `error-page.ts` | Server-side failures, before React ever runs                                     |

## 10. Build and runtime

`vite.config.ts` is intentionally tiny. `@lovable.dev/vite-tanstack-config`
already registers TanStack devtools, `tanstackStart`, React, Tailwind, tsconfig
paths, Nitro (Cloudflare default target), `VITE_*` env injection, the `@` alias,
React/TanStack dedupe, error-logger plugins and sandbox port detection.
**Re-adding any of those duplicates plugins and breaks the app.** The only local
override is redirecting the server entry to `src/server.ts` for SSR error
recovery.

### Runtime notes

- Nitro targets Cloudflare Workers by default; `.gitignore` already covers
  `.wrangler/` and `.dev.vars`.
- `bunfig.toml` sets `minimumReleaseAge = 86400`, so Bun skips any package
  version published in the last 24 hours — a supply-chain guard against
  compromised fresh publishes. `minimumReleaseAgeExcludes` is the deliberate,
  reviewed escape hatch.
- `package.json` pins `rolldown` via `overrides`, and TanStack Router / Router
  Plugin / Start are pinned to exact patch versions — these packages have shipped
  breaking changes within a single minor.

## 11. Accessibility

- Every interactive element is a real focusable control; `:focus-visible` is
  styled globally in `styles.css`.
- All animation is gated on `prefers-reduced-motion` in both `useReveal` and
  `useCountUp` — content appears instantly when motion is reduced.
- Score colour is **never the sole carrier of meaning**: every tier also ships a
  text `label` ("Needs work", "Strong") and a numeric value.
- Empty and error states are illustrated _and_ described in text.
- Tables use semantic markup with real headers.

## 12. Deliberate non-goals

Things that are intentionally absent, so nobody "fixes" them by accident:

| Not present           | Why                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------- |
| Real authentication   | Out of scope for a prototype; portal guards are UX only                             |
| Database              | JSON seeds + `localStorage` keep the demo zero-setup                                |
| Test suite            | Vitest is installed but unwired; adding tests is a roadmap item                     |
| Recharts usage        | Installed as a dependency, but RISE charts are hand-drawn SVG by choice             |
| Analytics / telemetry | Not needed to evaluate the product                                                  |
| Dark mode             | The warm paper canvas _is_ the brand; a dark variant would need its own token audit |

---

**See also:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) ·
[DATA_MODEL.md](./DATA_MODEL.md) · [CONTRIBUTING.md](../CONTRIBUTING.md)

```ts
export const generateJd = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }): Promise<GeneratedJd> => {
    /* … */
  });
```

Design points worth copying:

- **Zod on the way in.** `role` is 2–120 chars, `skills` is 1–12 entries. The
  client cannot smuggle an oversized payload to the model.
- **Zod on the way out.** The model is asked for JSON and the response is
  re-parsed and shape-validated. A truncated or verbose model reply becomes a
  clean error, never a broken screen.
- **Every failure has plain language.** `429` → "busy, try again", `402` →
  "credits exhausted, write it manually", `403` → "AI off, write it manually",
  unparseable → "came back malformed". Each message names the **manual
  fallback**, so the AI being unavailable never dead-ends the flow.
- The system prompt forbids emoji, marketing adjectives, bullet lists and
  headings — so descriptions read like a person wrote them.

The client calls it through `useServerFn` + `useMutation`, so it participates in
TanStack Query's lifecycle for pending/error state.
useSyncExternalStore(subscribe, () => select(state), () => select(initial))

```

The third argument is the **server snapshot**. It returns `initial` state during
SSR, which is what makes the store hydration-safe: server HTML and first client
render agree, then `hydrateStore()` rehydrates from `localStorage` in an effect.

**Persistence:** the whole state is serialized to `localStorage` under
`rise.state.v1` on every mutation, wrapped in try/catch so private-mode browsers
degrade quietly instead of throwing.

**Actions** are plain functions on an `actions` object, never setters exposed to
components. Each validates its own precondition — `apply()` returns `false` if the
application already exists rather than creating a duplicate, and
`markMilestone()` returns `false` if already seen. Callers can therefore render
"Already applied" without re-deriving that fact.

### Why not a state library

Redux/Zustand would add a dependency and an abstraction for a state shape that
fits in 170 lines. The trade-off: no devtools time-travel, and discipline is
enforced by convention (only `actions` mutates).
```
