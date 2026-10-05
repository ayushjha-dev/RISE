<div align="center">

# RISE

**Skill-matched internships for verified students.**

Verify your academic identity once. Get matched to internships by the skills you
actually have. Get ranked on what you can prove, not what your resume claims.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TanStack](https://img.shields.io/badge/TanStack_Start-1.168-DF4151?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)

[Getting Started](#getting-started) - [Architecture](#architecture) -
[Verification](#verification-and-trust) - [Contributing](CONTRIBUTING.md)

</div>

---

## The problem

Aarav is in his third year at a college in Coimbatore. He has spent four months
learning React properly. He can build a working dashboard unaided. He has never
been invited to a single interview.

Across the country, roughly a million students apply to internships this way each
year, and almost all of them hit the same wall. Not because they lack the skills,
but because nothing in the hiring process can see those skills.

**Nobody can confirm who anyone is.**

A recruiter receives four hundred applications for one role. The name on a
resume is self-reported, the email is self-chosen, and the college affiliation
is a free-text field. Some of those applicants did not attend the college they
name. Nobody can tell. So every employer quietly assumes the worst and falls back
on the cheapest available signal.

**Matching is keyword comparison.**

So the signal becomes keywords. A student who wrote "SQL" in a bullet point
scores identically to one who can actually write a join. Both read as the same
word in the same file. Resume optimization replaces skill development, because
optimization is what the filter rewards. Meanwhile a genuinely strong candidate
who describes their work in their own words is filtered out for using different
vocabulary than the job posting.

**Feedback arrives too late to help.**

Suppose Aarav does get an interview and does well. Nobody tells him why. He never
learns that his SQL was the gap, because no one ever told him it was the gap. He
cannot fix what he cannot see, so the same weakness follows him to the next
application, and the next.

Meanwhile the college sees only an aggregate: a placement percentage, moving
slowly, with no indication of which skills are actually thin across the cohort.
The placement officer cannot advise a student toward the subject that would help
them most, because that information does not exist anywhere.

Three failures, and they compound. Unverifiable identity forces keyword matching,
keyword matching produces no real feedback, and no feedback means students never
close their gaps.

## The approach

RISE replaces resume parsing with **verified identity plus per-skill evidence**.
It is built on three ideas.

**Verify once, apply everywhere.** A student confirms their
[Academic Bank of Credits](https://www.abc.gov.in/) (ABC) ID once. The ABC
authority returns their institution, so the link between student and college is
established by a third party rather than by self-attestation. That link then
stays true for every application they ever make.

**Skills over keywords.** Openings are ranked by actual overlap between the skills
on a verified profile and the skills a role requires. A student who knows SQL
ranks higher than one who merely wrote the word, regardless of how either phrases
their bullet points.

**Evidence per subtopic, not one blended number.** A short, role-specific
assessment scores each subtopic separately. This is the part that fixes Aarav's
problem directly: a candidate strong in React and weak in SQL is no longer
flattened into an "80" and lost in a ranking. They appear as a frontend candidate
with one specific, named gap, and the Learning portal knows exactly which course
to recommend.

Because all three portals read from one shared application record, the same
application is visible to the student, the employer's shortlist, and the
college's placement dashboard at the same time.

## Three portals, one ecosystem

```
+-------------------+  +--------------------+  +----------------------+
|  STUDENT          |  |  INSTITUTION       |  |  ORGANIZATION        |
|  Lavender         |  |  Pine              |  |  Terracotta          |
|  #8c7bc9          |  |  #2b4a47           |  |  #c1502e             |
+-------------------+  +--------------------+  +----------------------+
| Verify ABC ID     |  | Cohort dashboard   |  | Post a role in 2 min |
| Skill matches     |  | Subtopic averages  |  | Ranked shortlists    |
| Per-subtopic score|  | Top performers     |  | Evidence over resume |
| Apply and track   |  | Conversion funnel  |  | Skill filtering      |
+-------------------+  +--------------------+  +----------------------+
         |                          |                          |
         +--------------+-----------+-------------+------------+
                        v
              one shared application record
```

Each portal is a colour-scoped section of one application. The shell sets
`data-portal`, the accent swaps, and nothing else changes.

## How it works

```
  Step 1               Step 2                Step 3              Step 4
  VERIFY ONCE          MATCH BY SKILL        PROVE IT            GET SEEN
  ---------            --------------        --------            --------
  Student enters  |    Student skills   |    Short assessment  |  Organization
  12-digit ABC   |    Internships     |    scores each        |  shortlists from
  ID                 |    ranked by       |    subtopic           |  ranked evidence.
       |            |    overlap:         |     separately:       |       |
       v            |                     |                      |       v
  +----------+      |    React    100   |   JavaScript   80     |  +-----------+
  | ABC API  |----->|    SQL       41   |   React       100     |  | STUDENT   |
  | (planned)|      |    CSS       --   |   SQL          41     |  | sees the  |
  +----------+      |                     |                      |  | outcome    |
       |            |    -> 50% match    |   -> mean 80         |  +-----------+
       v            |                     |                      |
  Institution       |                     |   4 colour tiers     |
  auto-attached     |                     |   on every value     |
```

**The score is a feature, not a summary.**

A single 72 out of 100 tells an employer nothing. RISE stores the subtopic map
`{ React: 100, SQL: 41 }` and derives the mean only for sorting. Every tier
boundary is visual, so a weak subtopic cannot be missed:

| Tier       | Range  | Token                    | Meaning       |
| ---------- | ------ | ------------------------ | ------------- |
| Weak       | 0-39   | `--score-weak` (clay)    | Needs work    |
| Developing | 40-64  | `--score-mid` (amber)    | Getting there |
| Strong     | 65-84  | `--score-good` (pine)    | Reliable      |
| Excellent  | 85-100 | `--score-high` (emerald) | Ready now     |

A student scoring 100 on React and 41 on SQL is not an "80" candidate. They are a
frontend candidate who needs about a week of SQL. The Learning portal uses exactly
that signal, surfacing courses for the weakest subtopics first, which is the
concrete feedback Aarav never received.

## Verification and trust

Verification is the product, not a checkbox on it. A ranking is worthless if the
identity underneath it is fabricated, so each account is anchored to a registry
the actor does not control alone.

| Party        | Anchor                      | Registry                      | Proves       |
| ------------ | --------------------------- | ----------------------------- | ------------ |
| Student      | ABC ID (12 digits)          | Academic Bank of Credits      | The student  |
| Institution  | AISHE code                  | AISHE, Ministry of Education  | The college  |
| Organization | GSTIN or CIN + domain email | GST registry + email delivery | The employer |

```
    Student                   Institution               Organization
    -------                   -----------               ------------
    ABC ID              -->  AISHE code            GSTIN / CIN
        |                     |                        |
        v                     v                        v
   ABC authority        AISHE registry        GST registry
   confirms the    -->  confirms college      + one-time domain
   identity             and its domain            email OTP
        |                     |                        |
        +-------------+-------+--------+------------+
                      v
        trust level gates what each side can see
```

Two details matter more than the rest:

- The institution is taken from the **ABC response**, not from what the student
  typed. A student cannot attach themselves to a college of their choosing.
- An organization needs **both** a valid GSTIN **and** control of the company's
  email domain. Either alone can be faked by copying a real company's details.

Full flow, trust levels, API contracts and failure handling:
**[docs/VERIFICATION.md](docs/VERIFICATION.md)**.

## Feature tour

Every screen listed here is real, running code in `src/routes/`.

### Public

| Route       | Screen       | What it does                                      |
| ----------- | ------------ | ------------------------------------------------- |
| `/`         | Landing      | Hero, role cards, journey band, portal stats, CTA |
| `/auth`     | Sign in      | Role tabs, account picker                         |
| `/register` | Registration | 4 steps: details, ABC verify, college, preview    |

### Student portal

| Route                      | Screen      | What it does                                            |
| -------------------------- | ----------- | ------------------------------------------------------- |
| `/student`                 | Dashboard   | Stat tiles, status donut, skill meters, journey rail    |
| `/student/internships`     | Internships | Skill filter rail, match-score ring, empty/error states |
| `/student/internships/$id` | Role detail | Full posting, match breakdown, apply action             |
| `/student/assessment/$id`  | Assessment  | One question at a time, progress rail per subtopic      |
| `/student/report/$id`      | Report      | Hero score ring, ranked bars, plain-language takeaways  |
| `/student/learning`        | Learning    | NPTEL and Swayam courses, weakest subtopics first       |
| `/student/profile`         | Profile     | Identity panel, skills, links, availability             |

### Institution portal

| Route                   | Screen    | What it does                                     |
| ----------------------- | --------- | ------------------------------------------------ |
| `/institution`          | Dashboard | Cohort stats, subtopic radar, status donut, bars |
| `/institution/students` | Students  | Cohort table with per-student scores             |
| `/institution/profile`  | Profile   | AISHE code, affiliation, placement officer       |

### Organization portal

| Route                      | Screen      | What it does                                            |
| -------------------------- | ----------- | ------------------------------------------------------- |
| `/organization`            | Dashboard   | Pipeline stats, conversion, recent applicants           |
| `/organization/applicants` | Applicants  | Ranked shortlist, subtopic drill-down, shortlist/reject |
| `/organization/post`       | Post a role | Manual form or AI draft, reviewable before publishing   |
| `/organization/profile`    | Profile     | Industry, city, about, hiring contact                   |

## Architecture

```
                       +------------------------------+
   Browser  ---------> |  TanStack Router (SSR)       |  file-based, 22 routes
                       |  QueryClient scoped per req  |
                       +--------------+---------------+
                                      |
                    +-----------------+------------------+
                    v                 v                  v
           +----------------+ +--------------+ +------------------+
           | Local JSON     | | External     | | Server Functions |
           | seeds + Query  | | store        | | (only real I/O)  |
           | ~260ms latency | | localStorage | | LLM via Zod      |
           +----------------+ +--------------+ +------------------+
```

**The important idea:** the data layer is local JSON, but every read is shaped
like a network call and routed through TanStack Query. Loading, error and empty
states are therefore written once and uniform across every screen, so swapping in
a real API later is a change in one file (`src/lib/api.ts`), not twenty-two.

### Tech stack

```
+-------------------------------------------------------------------+
|  RUNTIME                                                            |
|   Bun 1.4  ---->  package manager + task runner                    |
|                  bun.lock, 24h supply-chain age guard              |
+-------------------------------------------------------------------+
          |                                 |
          v                                 v
+-------------------+            +------------------------+
| BUILD             |            | SERVER / SSR           |
| Vite 8            |            | Nitro 3                |
| TanStack Start    |----------> | Cloudflare target      |
| React plugin      |  builds    | h3 request handling    |
| Tailwind v4       |  from      | CSRF + error wrapper   |
| tsconfig paths    |            +------------------------+
+-------------------+                       ^
+-------------------------------------------------------------------+
|  FRONTEND                                                          |
|   React 19          -->  UI runtime, useSyncExternalStore          |
|   TanStack Router    -->  22 typed file-based routes              |
|   TanStack Query     -->  every read async and cached             |
|   TypeScript 5.8     -->  strict + noUncheckedIndexedAccess        |
+-------------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------------+
|  DESIGN SYSTEM (46 shadcn/ui + 9 RISE modules)                     |
|   Tailwind CSS 4.2     -->  CSS-first @theme + @utility           |
|   Radix UI + Lucide    -->  accessible primitives, icons          |
|   src/styles.css       -->  every token, hand-drawn SVG charts   |
+-------------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------------+
|  VALIDATION + DATA                                                  |
|   Zod 3.25            -->  server-fn input AND LLM output         |
|   src/data/*.json     -->  7 seed files simulating the backend   |
+-------------------------------------------------------------------+
```

Each layer depends only on the one below it:

| Layer        | Choice                    | Why it is there                                               |
| ------------ | ------------------------- | ------------------------------------------------------------- |
| Runtime      | Bun                       | Fast installs, committed lockfile                             |
| Build        | Vite 8 + Nitro 3          | Fast SSR dev, Cloudflare-oriented output                      |
| Framework    | TanStack Start 1.168      | Server functions with no framework lock-in                    |
| Routing      | TanStack Router 1.170     | Types flow from the route tree into links and params          |
| Server state | TanStack Query 5.101      | Forces every read async, so loading and error states are real |
| UI           | React 19                  | `useSyncExternalStore` for the local store                    |
| Language     | TypeScript 5.8            | `strict`, plus `noUncheckedIndexedAccess`                     |
| Styling      | Tailwind CSS 4.2          | CSS-first `@theme`, custom `@utility` layer                   |
| Components   | shadcn/ui (46) + RISE (9) | Accessible primitives, then the product's visual language     |
| Validation   | Zod 3.25                  | Both sides of the only network call                           |

> **On Recharts:** it is installed, but `src/components/rise/charts.tsx` is
> deliberately hand-authored SVG, with no chart-library chrome, no default
> palette and no dead plot area. Every value colour is read from the RISE score
> ramp.

### Resilience, not just rendering

SSR failures in TanStack Start are unusually easy to lose, so RISE handles them in
three places:

- `src/server.ts` wraps the server entry and recovers the original stack when h3
  swallows a throw into a generic `{"unhandled":true}` 500.
- `src/start.ts` registers middleware that converts unknown throws into a styled
  HTML error page, while re-throwing anything carrying a `statusCode`.
- `src/lib/error-capture.ts` captures the original `Error` out of band and walks
  up to 5 levels of `cause`, so the log keeps message, stack and chain.

`csrfMiddleware` is re-declared manually in `start.ts`, because defining that file
opts out of Start's automatic installation. Without it, server functions would be
unprotected from cross-site requests.

## Design system

A warm paper canvas with one saturated accent per portal. The tone is closer to
printed matter than to a SaaS dashboard.

| Token                   | Value     | Role                  |
| ----------------------- | --------- | --------------------- |
| `--canvas`              | `#fbf8f2` | Warm paper background |
| `--surface`             | `#ffffff` | Cards                 |
| `--ink`                 | `#141311` | Headings              |
| `--body`                | `#4a463f` | Body copy             |
| `--muted`               | `#8a8478` | Secondary text        |
| `--hairline`            | `#e4decf` | Borders and rules     |
| `--student-accent`      | `#8c7bc9` | Lavender portal       |
| `--institution-accent`  | `#2b4a47` | Pine portal           |
| `--organization-accent` | `#c1502e` | Terracotta portal     |

Type pairs Fraunces (display serif) against Inter (UI sans). Radii step
6, 10, 14, 20, pill. Depth comes from a paper grain overlay, tinted bands,
hairline curves and a two-stop `raised` elevation ramp, never flat grey shadows.

Portals recolour purely by CSS variable swap:

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

Scroll reveals, count-ups, ring fills and card lifts all route through
`useReveal`, which checks `prefers-reduced-motion` first and reveals immediately
when reduced motion is requested. Animation is never a prerequisite for reading
content.

Full token reference and component inventory:
**[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)**.

## Data model

Seven JSON seed files under `src/data/` stand in for the API.

| Entity         | File                 | Seeds   | Key fields                                          |
| -------------- | -------------------- | ------- | --------------------------------------------------- |
| `Student`      | `students.json`      | 10      | `abcId`, `abcVerified`, `institutionId`, `skills[]` |
| `Internship`   | `internships.json`   | 8       | `orgId`, `skillsRequired[]`, `assessmentId`         |
| `Organization` | `organizations.json` | 5       | `industry`, `city`, `about`                         |
| `Institution`  | `institutions.json`  | 3       | `aisheCode`, `affiliation`, placement officer       |
| `Application`  | `applications.json`  | 10      | `status`, `scoreBySubtopic`, `overallScore`         |
| `Assessment`   | `assessments.json`   | 1 track | `subtopics[]` to `questions[]` to `correctIndex`    |
| `LearningLink` | `nptelLinks.json`    | 10      | `provider`, `institute`, `weeks`, `url`             |

The join that makes the platform work is `Application`:

```
  Student 1 ---\
                +----> Application <---- 1 --- Internship N
  Internship 1 -/         |
                          +---> status:         applied | shortlisted | rejected
                          +---> scoreBySubtopic { React: 100, SQL: 41 }
                          +---> overallScore    (mean, for sorting only)

                    one record, read by all three portals
```

Field-by-field reference in **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)**.

## Getting started

Requires Bun 1.4+ (the repo ships `bun.lock`) or Node 20+ with npm.

```bash
git clone https://github.com/ayushjha-dev/RISE.git
cd RISE
bun install          # or: npm install
bun dev              # or: npm run dev
```

Open the printed local URL and sign in as any seeded student, institution or
organization. No password, no backend.

### Environment variables

Every variable is optional. With none set the app runs fully, and the AI
description generator simply reports that it is not configured.

| Variable      | Purpose                                                            |
| ------------- | ------------------------------------------------------------------ |
| `AI_API_KEY`  | Bearer token for an OpenAI-compatible `/chat/completions` endpoint |
| `AI_BASE_URL` | Base URL including `/v1`                                           |
| `AI_MODEL`    | Provider-specific model id, e.g. `gemini-2.0-flash`                |

Copy [`.env.example`](.env.example) to `.env` to get started. The generator works
with any OpenAI-compatible provider: Gemini, OpenAI, OpenRouter, Groq, Together,
or a self-hosted vLLM. The key is read only on the server, and `.env` is gitignored.

### Scripts

| Command             | Action                                      |
| ------------------- | ------------------------------------------- |
| `bun dev`           | Vite dev server with SSR and HMR            |
| `bun run build`     | Production build (Nitro, Cloudflare target) |
| `bun run build:dev` | Development-mode build, unminified          |
| `bun run preview`   | Serve the production build locally          |
| `bun run lint`      | ESLint 9 flat config, including Prettier    |
| `bun run format`    | Prettier write (100 cols, double quotes)    |

### Supply-chain note

`bunfig.toml` enforces a 24-hour supply-chain guard: package versions published
less than a day ago are skipped, with a narrow, explicit allowlist.

## Further reading

| Document                                           | Covers                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**   | Stack rationale, routing, state, data layer, SSR errors  |
| **[docs/VERIFICATION.md](docs/VERIFICATION.md)**   | How each party is verified, trust levels, API contracts  |
| **[docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)** | Every token, type scale, motion utilities, components    |
| **[docs/DATA_MODEL.md](docs/DATA_MODEL.md)**       | Entity-by-entity field reference, relations, score maths |
| **[src/routes/README.md](src/routes/README.md)**   | File-based routing conventions and URL mapping table     |
| **[CONTRIBUTING.md](CONTRIBUTING.md)**             | Setup, conventions, review process                       |
| **[SECURITY.md](SECURITY.md)**                     | Reporting a vulnerability                                |

## Roadmap

- [x] Three portals sharing application records
- [x] ABC ID format check and institution auto-attachment
- [x] Skill-overlap matching with match scores
- [x] Per-subtopic assessment scoring and colour tiers
- [x] Ranked applicant shortlists
- [x] Cohort analytics for institutions
- [x] Adaptive design system, hand-drawn SVG charts, motion pass
- [ ] Real ABC registry verification for students
- [ ] AISHE verification for institutions, GSTIN plus domain for organizations
- [ ] Server-side authentication, sessions and authorization
- [ ] Real persistence, replacing JSON seeds with a database
- [ ] Assessment authoring UI for organizations
- [ ] Assessment tracks beyond Web Development
- [ ] Resume parsing as a supplementary signal, never the primary one
- [ ] Automated tests (Vitest is installed but not yet wired up)

## Project status

This is a working front-end prototype with a simulated data layer. Please be
clear-eyed about what that means:

- There is **no real backend**. Applications persist to `localStorage` only, so
  clearing site data resets the demo.
- **ABC verification is a regex**, not a call to the ABC authority. Any 12 digits
  "verify". Institutions and organizations have no verification at all yet.
- **Sign-in is a role and account picker** with no password, session token or
  real authorization boundary. Portal guards are UX, not security.
- The seed people, colleges and companies are **fictional**.

The verification model is fully specified in
[docs/VERIFICATION.md](docs/VERIFICATION.md), but only the format check runs
today. Treat this as a high-fidelity product prototype and a reference
implementation of the design system, not a deployable production system.

## License

Released under the MIT License (see [LICENSE](LICENSE)).

Technology marks used in the interface come from
[simple-icons](https://simpleicons.org) (CC0-1.0) and remain the property of their
respective owners, used unmodified.

---

<div align="center">

**Built with React, TypeScript and TanStack Start.**

Questions, ideas or bug reports are welcome in the issue tracker.

</div>
