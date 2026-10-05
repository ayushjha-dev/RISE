# Data Model

Every entity in RISE, field by field, with the relations between them and the
maths behind the scores.

Seven JSON files under `src/data/` act as immutable seed snapshots for what will
eventually be a real database. Types are declared in `src/lib/api.ts` and
`src/lib/store.ts` — there are no runtime schema validators on the read path
(the one place validation matters, the AI server function, uses Zod).

> Note: All names, colleges and companies in the seed data are **fictional**.

## Contents

1. [Entity relationship diagram](#1-entity-relationship-diagram)
2. [Application](#2-application--the-heart-of-the-platform)
3. [Student](#3-student)
4. [Internship](#4-internship)
5. [Assessment](#5-assessment)
6. [Organization](#6-organization)
7. [Institution](#7-institution)
8. [LearningLink](#8-learninglink)
9. [Session](#9-session)
10. [The store shape](#10-the-store-shape)
11. [Score and match mathematics](#11-score-and-match-mathematics)
12. [Seed data inventory](#12-seed-data-inventory)
13. [ID conventions](#13-id-conventions)
14. [Swapping seeds for a real database](#14-swapping-seeds-for-a-real-database)

---

## 1. Entity relationship diagram

```
        ┌──────────────┐
        │ Institution  │  aisheCode, affiliation, placementOfficer
        └──────┬───────┘
               │ 1
               │
               │ N
        ┌──────▼───────┐        ┌───────────────┐        ┌──────────────┐
        │    Student   │───────►│ Application   │◄───────│  Internship  │
        │ abcId      │  N:1   │ scoreBySubtopic│  N:1   │ skillsRequired│
        │ skills[]     │        │ overallScore  │        │ assessmentId │
        │ institutionId│        │ status        │        └──────┬───────┘
        └──────────────┘        └───────┬───────┘               │ N:1
                                       │ N:1                   │
                                       │              ┌─────────▼────────┐
                            ┌──────────▼────────┐     │    Assessment    │
                            │   Organization    │     │ track, minutes   │
                            │ industry, city    │     │ subtopics[]      │
                            └───────────────────┘     └──────────────────┘

        ┌──────────────┐
        │ LearningLink │  skill → courses (weakest-skill recommendations)
        └──────────────┘
```

**The join that makes the platform work is `Application`.** A single record is
read by all three portals simultaneously: the student sees its status, the
organization ranks by its `overallScore`, and the institution aggregates
`scoreBySubtopic` across the cohort.

## 2. Application — the heart of the platform

Declared in `src/lib/store.ts`. Ten seeds.

| Field             | Type                                       | Notes                                            |
| ----------------- | ------------------------------------------ | ------------------------------------------------ |
| `id`              | `string`                                   | `app-N` in seeds; `app-${Date.now()}` at runtime |
| `studentId`       | `string`                                   | → `Student.id`                                   |
| `internshipId`    | `string`                                   | → `Internship.id`                                |
| `status`          | `"applied" \| "shortlisted" \| "rejected"` | Set by the organization                          |
| `appliedOn`       | `string`                                   | ISO date, `YYYY-MM-DD`                           |
| `scoreBySubtopic` | `Record<string, number>`                   | **The real signal.** `{}` until assessed         |
| `overallScore`    | `number`                                   | Arithmetic mean of the above; for sorting only   |

Example seed:

```json
{
  "id": "app-1",
  "studentId": "stu-1",
  "internshipId": "int-1",
  "status": "shortlisted",
  "appliedOn": "2026-08-26",
  "scoreBySubtopic": { "JavaScript": 80, "React": 100, "SQL": 60 },
  "overallScore": 80
}
```

Note the shape: `React: 100` and `SQL: 60`. The mean is 80, which is a fair sort
key and a misleading summary. Every surface that shows 80 also shows the three
numbers behind it.

### Status lifecycle

```
        apply()                  organization reviews
  ○ ──────────────► applied ──────────────────────────► shortlisted
                                  └──────────────────► rejected
```

`apply()` is idempotent — it returns `false` if the pair already exists rather
than creating a duplicate. `setStatus()` moves an application between states.
There is no "withdrawn" state; that is a known gap.

## 3. Student

`src/data/students.json` — 10 seeds. Type inferred from the JSON via
`typeof studentsSeed[number]`.

| Field                     | Type       | Notes                                                           |
| ------------------------- | ---------- | --------------------------------------------------------------- |
| `id`                      | `string`   | `stu-N`                                                         |
| `name`                    | `string`   | Full name; `firstName()` extracts the first token for greetings |
| `email`                   | `string`   | Institutional-looking, but not validated against a domain       |
| `abcId`                   | `string`   | **12 digits**, the Academic Bank of Credits ID                  |
| `abcVerified`             | `boolean`  | Gate for "verified" trust signals in the UI                     |
| `institutionId`           | `string`   | → `Institution.id`; the auto-attachment link                    |
| `year`                    | `string`   | Free text, e.g. "Third year, Computer Science"                  |
| `skills`                  | `string[]` | Drives `matchScore`                                             |
| `resumeUrl`               | `string`   | Filename reference; **no upload exists**                        |
| `availableForInternships` | `boolean`  | Availability flag                                               |
| `linkedinUrl?`            | `string`   | Optional                                                        |
| `githubUrl?`              | `string`   | Optional                                                        |

### ABC ID verification

`verifyAbcId()` in `src/lib/api.ts` is the entire implementation:

## 4. Internship

`src/data/internships.json` — 8 seeds. Type declared in `src/lib/store.ts`.

| Field            | Type       | Notes                                                    |
| ---------------- | ---------- | -------------------------------------------------------- |
| `id`             | `string`   | `int-N`                                                  |
| `orgId`          | `string`   | → `Organization.id`                                      |
| `title`          | `string`   |                                                          |
| `location`       | `string`   | e.g. "Chennai, hybrid"                                   |
| `duration`       | `string`   | e.g. "6 months"                                          |
| `stipend`        | `string`   | e.g. "₹25,000 per month" — display string, not a number  |
| `skillsRequired` | `string[]` | The denominator of `matchScore`                          |
| `description`    | `string`   | 3–5 sentences, written plainly                           |
| `aiGenerated`    | `boolean`  | Whether AI drafted it — surfaced as provenance in the UI |
| `assessmentId`   | `string`   | → `Assessment.id`                                        |
| `postedOn`       | `string`   | ISO date                                                 |

`skillsRequired` is the single most important field on this entity: it is the
only thing that drives ranking, and deliberately nothing about the description
text is ever parsed.

## 5. Assessment

`src/data/assessments.json` — **1 track** (`asmt-web`, "Web Development",
15 minutes). This is the thinnest part of the seed data and the most obvious
place to extend.

| Field       | Type         | Notes                                         |
| ----------- | ------------ | --------------------------------------------- |
| `id`        | `string`     | `asmt-web`                                    |
| `track`     | `string`     | "Web Development"                             |
| `minutes`   | `number`     | Stated duration — **not enforced by a timer** |
| `subtopics` | `Subtopic[]` | The unit of scoring                           |

### Subtopic

| Field       | Type         | Notes                                                             |
| ----------- | ------------ | ----------------------------------------------------------------- |
| `name`      | `string`     | **The key in `scoreBySubtopic`** — must match across the platform |
| `questions` | `Question[]` | 5 in the current track                                            |

### Question

| Field          | Type       | Notes                           |
| -------------- | ---------- | ------------------------------- |
| `q`            | `string`   | Prompt                          |
| `options`      | `string[]` | 4 choices                       |
| `correctIndex` | `number`   | Zero-based index into `options` |

Current subtopics: **JavaScript** (5), **React** (5), **SQL** (5) = 15 questions.

> **Subtopic names are a de facto schema.** `scoreBySubtopic` is keyed by
> `Subtopic.name`, and `nptelLinks.json` is keyed by skill strings that must
> match. Renaming "React" to "React.js" in one file silently breaks the report
> page and the learning recommendations. Change them together.

### Scoring

The assessment flow flattens subtopics into a single ordered question list,
records `{ questionIndex: chosenIndex }`, then computes per-subtopic percentages:

```
subtopicScore = round(correctInSubtopic / totalInSubtopic × 100)
```

`recordScores()` then stores the map and derives `overallScore` as the mean.
Re-taking an assessment overwrites the previous scores.

## 6. Organization

`src/data/organizations.json` — 5 seeds.

| Field      | Type     | Notes                               |
| ---------- | -------- | ----------------------------------- |
| `id`       | `string` | `org-N`                             |
| `name`     | `string` |                                     |
| `industry` | `string` | e.g. "Developer tooling"            |
| `city`     | `string` |                                     |
| `email`    | `string` | Hiring contact                      |
| `about`    | `string` | 1–2 sentences, shown on the profile |

There is no verification analogue to an institution's AISHE code — organizations
are unverified in this prototype, which is a real gap for a hiring product.

## 7. Institution

`src/data/institutions.json` — 3 seeds. Type declared explicitly in
`src/lib/api.ts`.

| Field              | Type     | Notes                                                 |
| ------------------ | -------- | ----------------------------------------------------- |
| `id`               | `string` | `inst-N`                                              |
| `name`             | `string` |                                                       |
| `aisheCode`        | `string` | AISHE code, e.g. `U-0431` — the real-world identifier |
| `city`             | `string` |                                                       |
| `email`            | `string` | Placement cell                                        |
| `studentsEnrolled` | `number` | Total enrolment, independent of RISE                  |
| `affiliation`      | `string` | University affiliation                                |
| `placementOfficer` | `string` | Named human contact                                   |

## 10. The store shape

`src/lib/store.ts` holds one `State` object, persisted whole to `localStorage`
under the key **`rise.state.v1`**.

| Field              | Type            | Seeded?       | Notes                                    |
| ------------------ | --------------- | ------------- | ---------------------------------------- |
| `session`          | `Session`       | `null`        | Signed-in identity                       |
| `applications`     | `Application[]` | yes, 10 seeds | The shared record                        |
| `extraInternships` | `Internship[]`  | `[]`          | Prepended to seeds in `internshipsQuery` |
| `extraStudents`    | `Student[]`     | `[]`          | Appended to seeds in `studentsQuery`     |
| `seenMilestones`   | `string[]`      | `[]`          | Dedupes one-time celebrations            |

`extraInternships` and `extraStudents` exist because the UI can create roles
(`/organization/post`) and accounts (`/register`) but there is no admin CRUD
screen. Reads merge seeds with extras; the JSON files are never written to.

`markMilestone(key)` returns `false` for an already-seen key, which is how
celebration animations fire exactly once.

## 11. Score and match mathematics

### Match score — student ↔ internship

```ts
matchScore(studentSkills: string[], required: string[]): number | null
```

```ts
if (!studentSkills.length || !required.length) return null; // unknown, not zero
const set = new Set(studentSkills.map((s) => s.toLowerCase()));
const hits = required.filter((r) => set.has(r.toLowerCase())).length;
return Math.round((hits / required.length) * 100);
```

- Case-insensitive, **set-based**, so a duplicated skill cannot inflate the score.
- Returns `null` when either side is empty. A 0% match and "we have no data" are
  different facts; conflating them would tell a student they are unqualified
  when the system simply knows nothing.
- Range is `0–100`. The UI renders it as a ring and never as a grade.

Worked example:

```
student.skills             = ["React", "JavaScript", "SQL"]
internship.skillsRequired  = ["React", "JavaScript", "CSS", "Testing"]

set  = { react, javascript, sql }
hits = 2  (React, JavaScript)
matchScore = round(2 / 4 × 100) = 50
```

### Overall score — per subtopic

```ts
overallScore = round(mean(values(scoreBySubtopic)));
```

`{ JavaScript: 80, React: 100, SQL: 60 }` → mean `80` → `round(80) = 80`.

The mean is used **only for sorting and the summary stat**. Any decision a human
makes is shown the subtopic breakdown.

### Tier boundaries

Applied by `scoreTier()` in `src/lib/score-color.ts` after clamping to `0–100`:

```
v < 40        → weak        (Needs work)
v < 65        → developing  (Developing)
v < 85        → strong      (Strong)
otherwise     → excellent   (Excellent)
```

A single threshold function drives every colour in the app, so a ring, a bar, a
donut segment and a table cell can never disagree about how good a number is.

## 12. Seed data inventory

| File                 | Records | Spread                                                   |
| -------------------- | ------- | -------------------------------------------------------- |
| `students.json`      | 10      | All 3 institutions, mixed skills                         |
| `internships.json`   | 8       | All 5 organizations, all pointing at `asmt-web`          |
| `organizations.json` | 5       | Developer tooling, analytics, health, and more           |
| `institutions.json`  | 3       | Pune, Coimbatore, and a third                            |
| `applications.json`  | 10      | All three statuses: `applied`, `shortlisted`, `rejected` |
| `assessments.json`   | 1       | 3 subtopics × 5 questions = 15                           |
| `nptelLinks.json`    | 10      | 7 skills, 2 providers, 7 institutes                      |

No seeded internship has `aiGenerated: true` — all 8 descriptions were written
by hand, which is why they read consistently. AI-posted roles appear only after
you create one via `/organization/post`.

## 13. ID conventions

| Prefix  | Entity       | Example                         |
| ------- | ------------ | ------------------------------- |
| `stu-`  | Student      | `stu-1`                         |
| `inst-` | Institution  | `inst-1`                        |
| `org-`  | Organization | `org-1`                         |
| `int-`  | Internship   | `int-1`                         |
| `asmt-` | Assessment   | `asmt-web`                      |
| `app-`  | Application  | `app-1`, `app-1712…` at runtime |
| `l-`    | LearningLink | `l-1`                           |

Runtime-generated IDs use `Date.now()`, which is collision-safe at demo scale
but **not** suitable for concurrent production writes — a real database would
use UUIDs or sequences.

## 14. Swapping seeds for a real database

The migration path is deliberately short, because every read already passes
through an async, query-shaped boundary:

1. **Replace** the bodies of the `*Query()` factories in `src/lib/api.ts` with
   real fetches, preserving the return types (`Student[]`, `Internship[]`, …).
2. **Replace** the `actions.*` functions in `src/lib/store.ts` with mutations
   that hit the API, and invalidate the corresponding query keys.
3. **Delete** the `latency()` call and the `getState().extra*` merges.
4. **Add** real auth, replacing `Session` with a token and adding server-side
   authorization — the current client-side check is not a security boundary.

Steps 1 and 2 touch exactly two files. Components do not change, because they
already handle loading, error and empty states for asynchronous data.

---

**See also:** [ARCHITECTURE.md](./ARCHITECTURE.md) ·
[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · [root README](../README.md)
| `about` | `string` | |

Institutions are the one entity that _does_ carry a verifiable real-world code
(AISHE), which is what makes a student's `institutionId` attachment trustworthy
in the product model.

## 8. LearningLink

`src/data/nptelLinks.json` — 10 seeds, from **NPTEL** and **Swayam**, run by
IIT Bombay, IIT Madras, IIT Kharagpur, IIT Bangalore, IIIT Bangalore,
IIIT Hyderabad and IIM Bangalore.

| Field       | Type                  | Notes                                              |
| ----------- | --------------------- | -------------------------------------------------- |
| `id`        | `string`              | `l-N`                                              |
| `skill`     | `string`              | **Must match a `Subtopic.name`** to be recommended |
| `title`     | `string`              | Course title                                       |
| `provider`  | `"NPTEL" \| "Swayam"` |                                                    |
| `institute` | `string`              | Delivering institute                               |
| `weeks`     | `number`              | Course length                                      |
| `url`       | `string`              | External link                                      |

Skills covered: JavaScript, React, SQL, Python, Node, Testing, Data analysis.

This is the payoff of per-subtopic scoring: the Learning portal takes the
student's **weakest** subtopics and surfaces courses for exactly those skills.
A single blended score could not do this.

## 9. Session

Declared in `src/lib/store.ts`. The entire auth model:

```ts
type Role = "student" | "institution" | "organization";
type Session = { role: Role; id: string; name: string } | null;
```

Three fields, no token, no expiry. `PortalShell` checks
`session.role === role` before rendering, and shows "Sign in to continue"
otherwise. **This is a UI guard, not an authorization boundary** — see
[SECURITY.md](../SECURITY.md).

```ts
if (!/^\d{12}$/.test(abcId)) {
  return { ok: false, message: "That ID isn't 12 digits — check the number on your ABC card." };
}
return { ok: true };
```

A 12-digit format check with a simulated 1-second delay, structured like a real
endpoint. In production this calls the ABC authority and the identity is
attributable to a real person.
