<div align="center">

# RISE

**Skill-matched internships for verified students.**

Verify your academic identity once. Get matched to internships by the skills you
actually have. Get ranked on what you can prove — not what your résumé claims.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TanStack](https://img.shields.io/badge/TanStack_Start-1.168-DF4151?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [Design System](#-design-system) · [Data Model](#-data-model) · [Contributing](CONTRIBUTING.md)

</div>

---

## 📌 The problem

Indian students applying to internships run into three failures, and they compound:

1. **Identity is unverifiable.** Recruiters cannot tell a real student from a
   fabricated profile. There is no shared trust anchor between a college, a
   student, and an employer.
2. **Matching is keyword theatre.** Applicant tracking systems compare the words
   on a résumé against the words in a job posting. A student who genuinely knows
   SQL loses out to one who merely wrote "SQL" in a bullet point.
3. **Nobody sees the signal until the interview.** The first real evidence of
   ability is a single vague outcome — hired or not. Students get no feedback,
   and colleges get no aggregate view of where their cohort actually stands.

## 💡 The approach

RISE replaces résumé parsing with **verified identity plus per-skill evidence**.
It is built around three ideas:

- **Verify once, apply everywhere.** A student confirms their
  [Academic Bank of Credits](https://www.abc.gov.in/) (ABC) ID once. Their
  institution is attached automatically, and that link stays true for every
  application they ever make.
- **Skills over keywords.** Openings are ranked by _overlap_ between the skills
  already on a verified profile and the skills a role requires. No keyword
  guessing, no optimisation theatre.
- **Granular, per-subtopic evidence.** A short, role-specific assessment scores
  each subtopic **separately** instead of collapsing everything into one blunt
  number. A candidate strong in React and weak in SQL looks like that — and
  organizations can see it before the résumé screening round.

Because all three portals read from **one shared record**, the same application
is simultaneously visible to the student, the employer's shortlist, and the
college's placement dashboard.

## 🎯 Three portals, one ecosystem

<div align="center">

| 🎓 **Lavender Portal**<br/>Students | 🏛️ **Pine Portal**<br/>Institutions | 🏢 **Terracotta Portal**<br/>Organizations |
| :---------------------------------: | :---------------------------------: | :----------------------------------------: |
|        `--student: #8c7bc9`         |      `--institution: #2b4a47`       |         `--organization: #c1502e`          |
|       Verify your ABC ID once       |        Live cohort dashboard        |         Post a role in two minutes         |
|    Skill-matched recommendations    |    Subtopic performance averages    |        Ranked applicant shortlists         |
|       Per-subtopic scorecards       |    Top performer identification     |           Evidence before résumé           |
|     Application status tracking     |  Application conversion analytics   |          Skill-specific filtering          |

</div>

Each portal is a colour-scoped section of one app: the shell sets
`data-portal`, the accent swaps, and nothing else changes.

## 🔄 How it works

```
 1. VERIFY ONCE     Student confirms their 12-digit ABC ID.
                    ───────────────────────────────►  institution auto-attaches

 2. MATCH BY SKILL  Internships ranked by profile-skill overlap (match %).
                    ───────────────────────────────►  no keyword guessing

 3. PROVE IT        Short role-specific assessment scores each subtopic
                    separately, colour-coded across four performance tiers.
                    ───────────────────────────────►  per-subtopic evidence

## 🗺️ Feature tour

Every screen below is real, running code in `src/routes/`.

### Public

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Landing | Hero, role cards, animated journey band, portal stats, partner strip, CTA |
| `/auth` | Sign in | Role tabbed (student / institution / organization), account picker |
| `/register` | Registration | 4 steps: details → ABC verify → college → preview |

### 🎓 Student portal

| Route | Screen | What it does |
| --- | --- | --- |
| `/student` | Dashboard | Stat tiles, application-status donut, skill meters, recommendations, journey rail |
| `/student/internships` | Internships | Skill filter rail, match-score ring per card, empty and error states |
| `/student/internships/$id` | Role detail | Full posting, match breakdown, apply action |
| `/student/assessment/$id` | Assessment | One-question-at-a-time flow, progress rail with per-subtopic beads |
| `/student/report/$id` | Report | Hero score ring, ranked subtopic bars, plain-language takeaways, courses |
| `/student/learning` | Learning | NPTEL / Swayam courses, **weakest subtopics surfaced first** |
| `/student/profile` | Profile | Two-column identity panel, skills, links, availability |

### 🏛️ Institution portal

| Route | Screen | What it does |
| --- | --- | --- |
| `/institution` | Dashboard | Cohort stats, subtopic radar, status donut, ranked bars, top performers |
| `/institution/students` | Students | Full cohort table with per-student scores |
| `/institution/profile` | Profile | AISHE code, affiliation, placement officer, enrolment |

### 🏢 Organization portal

| Route | Screen | What it does |
| --- | --- | --- |
| `/organization` | Dashboard | Pipeline stats, conversion, recent applicants |
| `/organization/applicants` | Applicants | **Ranked shortlist table**, per-subtopic drill-down drawer, one-tap shortlist/reject |
| `/organization/post` | Post a role | Manual form **or** AI-drafted description, every field reviewable before it goes live |
| `/organization/profile` | Profile | Industry, city, about, hiring contact |

## 🏗️ Architecture

```

                      ┌──────────────────────────────┐

Browser ────────► │ TanStack Router (SSR) │ file-based, 22 routes
│ QueryClient scoped per req │
└──────────────┬───────────────┘
│
┌─────────────────┼──────────────────┐
▼ ▼ ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Local JSON │ │ External │ │ Server Functions │
│ seeds + Query │ │ store │ │ (the only I/O) │
│ ~260ms latency │ │ localStorage │ │ Gemini via Zod │
└────────────────┘ └──────────────┘ └──────────────────┘

````

**The important idea:** the data layer is local JSON, but every read is shaped
like a network call and routed through TanStack Query. Loading, error and empty
states are therefore written once and uniform across every screen — swapping in
a real API later is a change in one file (`src/lib/api.ts`), not twenty-two.

### Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **TanStack Start** `1.168` | SSR + server functions, no Next/Remix |
| Router | **TanStack Router** `1.170` | File-based, typed, auto-generated `routeTree.gen.ts` |
| Server state | **TanStack Query** `5.101` | Every read is async, so every screen has real states |
| UI | **React 19** | `useSyncExternalStore` powers the local store |
| Language | **TypeScript 5.8** | `strict`, plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| Styling | **Tailwind CSS 4.2** | CSS-first `@theme`, custom `@utility` layer |
| Components | **shadcn/ui** (46) | New York style, Radix primitives, Lucide icons |
| Validation | **Zod 3.25** | Server-function input *and* AI output |
| Build | **Vite 8** + Nitro 3 | Cloudflare-oriented default target |
| Runtime | **Bun** | `bun.lock`, 24-hour supply-chain age guard |

> **On Recharts:** it is installed, but `src/components/rise/charts.tsx` is
> deliberately **hand-authored SVG** — no chart-library chrome, no default
> palette, no dead plot area. Every value colour is read from the RISE score
## 🎨 Design system

A warm paper canvas with one saturated accent per portal. Not a dark dashboard
template — the tone is closer to printed matter.

| Token | Value | Role |
| --- | --- | --- |
| `--canvas` | `#fbf8f2` | Warm paper background |
| `--surface` | `#ffffff` | Cards |
| `--ink` | `#141311` | Headings |
| `--body` | `#4a463f` | Body copy |
| `--muted` | `#8a8478` | Secondary text |
| `--hairline` | `#e4decf` | Borders and rules |
| `--student-accent` | `#8c7bc9` | Lavender portal |
| `--institution-accent` | `#2b4a47` | Pine portal |
| `--organization-accent` | `#c1502e` | Terracotta portal |

Type pairs **Fraunces** (display serif) against **Inter** (UI sans). Radii step
`6 → 10 → 14 → 20 → pill`. Depth comes from a paper `grain` overlay, tinted
`band`s, hairline curves and a two-stop `raised` elevation ramp — never from
flat grey shadows.

Portals recolour purely by CSS variable swap:

```css
[data-portal="student"]      { --accent: var(--student-accent); }
[data-portal="institution"]  { --accent: var(--institution-accent); }
[data-portal="organization"] { --accent: var(--organization-accent); }
````

Full token reference, the `@utility` motion and layout helpers, and the
component inventory live in **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)**.

### Motion is a journey, and it is optional

Scroll reveals, count-ups, ring fills and card lifts all route through
`useReveal`, which checks `prefers-reduced-motion` first and reveals
**immediately** when reduced motion is requested. Animation is never a
prerequisite for reading content.

## 🗃️ Data model

Seven JSON seed files under `src/data/` stand in for the API.

| Entity    | File            | Seeds | Key fields                                          |
| --------- | --------------- | ----- | --------------------------------------------------- |
| `Student` | `students.json` | 10    | `abcId`, `abcVerified`, `institutionId`, `skills[]` |

## 🚀 Getting started

Requires **Bun 1.4+** (the repo ships `bun.lock`) or **Node 20+** with npm.

```bash
git clone <this-repository-url>
cd RISE
bun install          # or: npm install
bun dev              # or: npm run dev
```

Open the printed local URL and sign in as any seeded student, institution or
organization — no password, no backend.

### Scripts

| Command             | Action                                                    |
| ------------------- | --------------------------------------------------------- |
| `bun dev`           | Vite dev server with SSR + HMR                            |
| `bun run build`     | Production build (Nitro / Cloudflare target)              |
| `bun run build:dev` | Development-mode build, unminified                        |
| `bun run preview`   | Serve the production build locally                        |
| `bun run lint`      | ESLint 9 flat config, including Prettier                  |
| `bun run format`    | Prettier write (100 cols, double quotes, trailing commas) |

### Environment variables

| Variable          | Required? | Purpose                                                                                                                                                        |
| ----------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOVABLE_API_KEY` | Optional  | Enables **AI-drafted internship descriptions**. When absent the generator returns a plain-language message and the manual posting form still works end to end. |

### Supply-chain note

`bunfig.toml` enforces a **24-hour supply-chain guard** — package versions
published less than a day ago are skipped, with a narrow, explicit allowlist.

## 📚 Further reading

| Document                                           | Covers                                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------------- |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**   | Stack rationale, routing model, state, data layer, SSR lifecycle, error handling |
| **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** | Every token, type scale, motion utilities, component inventory                   |
| **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)**       | Entity-by-entity field reference, relations, score maths                         |
| **[src/routes/README.md](src/routes/README.md)**   | File-based routing conventions and the URL mapping table                         |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**             | Setup, conventions, review process                                               |
| **[SECURITY.md](SECURITY.md)**                     | Reporting a vulnerability                                                        |

## 🗺️ Roadmap

- [x] Three portals sharing application records
- [x] ABC ID verification and institution auto-attachment
- [x] Skill-overlap matching with match scores
- [x] Per-subtopic assessment scoring and colour tiers
- [x] Ranked applicant shortlists
- [x] Cohort analytics for institutions
- [x] Adaptive design system, hand-drawn SVG charts, motion pass
- [ ] Real persistence — replace JSON seeds with a database
- [ ] Real ABC ID verification against the official API
- [ ] Assessment authoring UI for organizations
- [ ] Assessment tracks beyond Web Development
- [ ] Résumé parsing as a _supplementary_ signal, never the primary one
- [ ] Automated tests (Vitest is installed but not yet wired up)

## ⚠️ Project status

This is a **working front-end prototype with a simulated data layer.** Please
be clear-eyed about what that means:

- There is **no real backend**. Applications persist to `localStorage` only, so
  clearing site data resets the demo.
- **ABC verification is a regex**, not a call to the ABC authority.
- Sign-in is a **role + account picker** with no password, session token or real
  authorization boundary. Portal guards are UX, not security.
- The seed people, colleges and companies are **fictional**.

Treat it as a high-fidelity product prototype and a reference implementation of
the design system — not a deployable production system.

## 📄 License

Released under the **MIT License** (see [LICENSE](LICENSE)).

Technology marks used in the interface come from
[simple-icons](https://simpleicons.org) (CC0-1.0) and remain the property of
their respective owners, used unmodified.

---

<div align="center">

**Built with React, TypeScript and TanStack Start.**

Questions, ideas or bug reports — please open an issue.

</div>
| `Internship` | `internships.json` | 8 | `orgId`, `skillsRequired[]`, `assessmentId`, `stipend` |
| `Organization` | `organizations.json` | 5 | `industry`, `city`, `about` |
| `Institution` | `institutions.json` | 3 | `aisheCode`, `affiliation`, `placementOfficer` |
| `Application` | `applications.json` | 10 | `status`, `scoreBySubtopic`, `overallScore` |
| `Assessment` | `assessments.json` | 1 track | `subtopics[]` → `questions[]` → `correctIndex` |
| `LearningLink` | `nptelLinks.json` | 10 | `provider`, `institute`, `weeks`, `url` |

The join that makes the platform work is `Application`:

```ts
studentId ──┐                        ┌── skillsRequired[]
            ├──► Application ────────┤
internshipId ┘   status              └── assessmentId ──► Assessment
                 scoreBySubtopic
                 overallScore        one record, read by all three portals
```

Field-by-field reference in **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)**.

> ramp.

### Resilience, not just rendering

SSR failures in TanStack Start are unusually easy to lose, so RISE handles them
in three places:

- `src/server.ts` — wraps the server entry and recovers the original stack when
  **h3** swallows a throw into a generic `{"unhandled":true}` 500.
- `src/start.ts` — server middleware that converts unknown throws into a styled
  HTML error page, while re-throwing anything carrying a `statusCode`.
- `src/lib/error-capture.ts` — captures the original `Error` out of band and
  walks up to **5 levels** of `cause`, so the log keeps message, stack and chain.

`csrfMiddleware` is **re-declared manually** in `start.ts`, because defining that
file opts out of Start's automatic installation — without it, server functions
would be unprotected from cross-site requests. 4. GET SEEN Organizations shortlist from ranked evidence.
Institutions watch conversion live.
───────────────────────────────► one shared record

```

### The score is a feature, not a summary

A single 72/100 tells an employer nothing. RISE stores
`scoreBySubtopic: { "React": 88, "SQL": 41 }` and derives `overallScore` as the
mean. Every tier boundary is visual, so a weak subtopic is impossible to miss:

| Tier | Range | Token | Meaning |
| --- | --- | --- | --- |
| Weak | `0–39` | `--score-weak` (clay) | Needs work |
| Developing | `40–64` | `--score-mid` (amber) | Getting there |
| Strong | `65–84` | `--score-good` (pine) | Reliable |
| Excellent | `85–100` | `--score-high` (emerald) | Ready now |

A student scoring `88` on React and `41` on SQL is **not** an "80" candidate —
they are a frontend candidate who needs one SQL week. The Learning portal uses
exactly that signal to surface courses for the weakest subtopics first.
```
