# Verification and Trust

How RISE establishes that the people and organisations on the platform are
real. This is the core of the product: RISE ranks students on skill, but a
ranking is worthless if the identity underneath it is fabricated.

**Current state:** this document describes the _designed_ verification model.
The prototype ships with format checks only — every registry call below is a
roadmap item, and [the honesty table](#10-what-is-actually-implemented-today)
says exactly what runs today.

## Contents

1. [Why verification is the product](#1-why-verification-is-the-product)
2. [The trust chain](#2-the-trust-chain)
3. [Student verification](#3-student-verification)
4. [Institution verification](#4-institution-verification)
5. [Organization verification](#5-organization-verification)
6. [Trust levels](#6-trust-levels)
7. [API contracts](#7-api-contracts)
8. [Where verification data lives](#8-where-verification-data-lives)
9. [Failure and edge cases](#9-failure-and-edge-cases)
10. [What is actually implemented today](#10-what-is-actually-implemented-today)

---

## 1. Why verification is the product

RISE replaces résumé parsing with evidence. That only works if three things are
true at once:

1. **The student is real.** Verified through their Academic Bank of Credits
   (ABC) ID, which is issued by their institution and is government-backed.
2. **The institution is real.** Confirmed against the AISHE registry, so
   `institutionId` on a profile cannot point at a college that does not exist.
3. **The employer is real.** Confirmed through a business identifier (GSTIN)
   plus a domain-backed contact email, so a "company" cannot be a student's
   alt-account posing as an employer.

Each link is anchored to a registry the actor does not control alone. That is
what makes the resulting ranking trustworthy, and it is why verification is
built as a chain rather than three independent flags.

## 2. The trust chain

```
   Student                  Institution                  Organization
   -------                  -----------                  ------------
   ABC ID (12 digits) -->  AISHE code   <-- student's  GSTIN / CIN
        |                        |            college email      |
        |                        |                  |            |
        v                        v                  |            v
  ABC authority           AISHE registry            |      GST registry
  registry lookup         (Ministry of Edu.)        |      + domain OTP
        |                        |                  |            |
        +------------+-----------+------------------+------------+
                     v
        Trust level gates visibility (section 6)
```

Arrows mean "an anchor the actor cannot forge alone". A student's own ABC ID
proves the student; the institution's AISHE code proves the college; the
employer's GSTIN plus domain email proves the company. Any one alone would be
weak — together they form a chain.

## 3. Student verification

### Step 1 — Format check (implemented today)

`verifyAbcId()` in `src/lib/api.ts` validates shape before any network call:

```ts
if (!/^\d{12}$/.test(abcId)) {
  return { ok: false, message: "That ID isn't 12 digits — check the number on your ABC card." };
}
```

A UX guard against obviously-wrong input. It is **not** proof.

### Step 2 — Registry lookup (planned)

Call the ABC authority with the ID, plus name and institution for matching:

```
POST {ABC_API_BASE}/verify
{ "abcId": "482913076541", "name": "Aarthi Balasubramanian",
  "institutionAisheCode": "C-11784" }

200 -> { "verified": true,
         "institution": { "aisheCode": "C-11784", "name": "Sree Kamakshi College..." } }
```

The authoritative `institution` in the **response** — not the value the student
typed — populates `institutionId`. That is the whole point: a student cannot
attach themselves to a college of their choosing.

## 4. Institution verification

Institutions are registered with the Ministry of Education and hold an **AISHE
code** (`All India Survey on Higher Education`), already a field in
`src/data/institutions.json`.

### Intended flow

1. Institution registers and enters its AISHE code.
2. RISE calls the AISHE registry; the code must resolve to that legal name in
   that city.
3. RISE sends an email to the institution's official domain — derived from its
   verified web domain, never user-supplied.
4. That mailbox clicks a one-time link, proving domain control.
5. Only then may the institution view cohort data or act for that college.

### Why this matters

An institution sees aggregated student performance — the most sensitive data in
the system. Letting an unverified account reach `/institution` would let anyone
scrape profiles. AISHE lookup plus domain confirmation is what makes "this is
really the placement cell of that college" a defensible claim.

```
POST {AISHE_API_BASE}/institutions/verify
{ "aisheCode": "C-11784" }

200 -> { "verified": true, "name": "...", "city": "...", "affiliation": "..." }
404 -> { "verified": false, "reason": "aishe_code_not_found" }
```

## 5. Organization verification

Organizations have no government student-registry equivalent, so verification
combines a **business identifier** with **domain control**.

### Intended flow

1. Organization enters its **GSTIN** (15 characters) or **CIN**.
2. RISE calls the GST/CIN registry; the number must resolve to that legal name.
3. RISE requires a hiring contact at the organization's **own domain**
   (e.g. `hiring@thalirsystems.in`), verified by a one-time email link.
4. A verified organization can post internships and view applicant shortlists.

```
POST {GSTIN_API_BASE}/organizations/verify
{ "gstin": "33AABCT1234C1Z5", "legalName": "Thalir Systems Private Limited" }

200 -> { "verified": true, "legalName": "...", "registrationStatus": "active" }
409 -> { "verified": false, "reason": "name_mismatch" }
404 -> { "verified": false, "reason": "gstin_not_found" }
```

### Two independent facts

- **The GSTIN proves the entity exists.** A student cannot invent one.
- **The domain email proves the poster works there.** Someone may know a valid
  GSTIN, but they cannot receive mail at the company's domain.

Requiring both closes the gap where a valid GSTIN was simply copied from a real
company. `registrationStatus: "active"` also catches deregistered entities.

### Why organizations are held to this

An organization sees ranked applicant scores and student profiles, and could
misuse that to poach. Verification keeps the door narrow to real employers and
is the basis for rate limits and abuse reporting.

## 6. Trust levels

Verification is not binary. Each account carries a level controlling what it
can see and do.

| Level        | Requirement               | Student can               | Institution can       | Organization can           |
| ------------ | ------------------------- | ------------------------- | --------------------- | -------------------------- |
| `unverified` | Email confirmed           | Edit profile, browse      | Nothing               | Nothing                    |
| `pending`    | Submitted, awaiting check | Browse, apply             | Nothing               | Nothing                    |
| `verified`   | Registry + domain match   | Apply, see ranked results | View cohort dashboard | Post roles, see shortlists |
| `suspended`  | Failed check or abuse     | Read-only                 | Read-only             | Read-only                  |

Rules that follow:

- An unverified student can still build a profile and take assessments — the
  work should not be blocked — but applications carry no ranking weight.
- A `pending` organization can draft a posting but not publish it.
- Every transition is **logged with actor, timestamp and the evidence returned
  by the registry**, because a verification decision is appealable.

## 7. API contracts

All three registries sit behind server functions, never called from the browser.

| Purpose                     | Variables                         | Endpoint shape               |
| --------------------------- | --------------------------------- | ---------------------------- |
| ABC (students)              | `ABC_API_BASE`, `ABC_API_KEY`     | `POST /verify`               |
| AISHE (institutions)        | `AISHE_API_BASE`, `AISHE_API_KEY` | `POST /institutions/verify`  |
| GSTIN / CIN (organizations) | `GSTIN_API_BASE`, `GSTIN_API_KEY` | `POST /organizations/verify` |

Implementation notes:

## 8. Where verification data lives

Verification results belong on the server, attached to an account — not in the
`Session` type, which today holds only `{ role, id, name }` and lives in
`localStorage`.

A production schema would add:

```
verification
  accountId
  kind          -- student | institution | organization
  status        -- unverified | pending | verified | suspended
  identifier    -- ABC id | AISHE code | GSTIN
  checkedAt
  evidence      -- JSON snapshot of the registry response
  checkedBy     -- actor who ran the check
```

The client should receive a **status only** — never the evidence, never the raw
registry response, never a credential.

## 9. Failure and edge cases

| Case                          | Behaviour                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| Registry unreachable          | Mark `pending`, show "verification temporarily unavailable", allow retry. Never `verified`. |
| Timeout / 5xx                 | Same as above, plus an operational alert.                                                   |
| Rate limited                  | Back off with a clear message; do not hammer the registry.                                  |
| Name mismatch                 | Show the registry's name so the user can correct their entry.                               |
| Registry says not found       | Reject with the exact reason. Do not auto-retry; the input is wrong.                        |
| Institution email bounces     | Stay `pending`; allow a different official domain.                                          |
| User disputes a rejection     | Appealable: record the decision, allow one re-submission, escalate to manual review.        |
| Entity's status later changes | Re-verify on a schedule; `suspended` if it becomes inactive.                                |

## 10. What is actually implemented today

Being explicit, because this document describes an intended model.

| Capability                      | Status              | Detail                                              |
| ------------------------------- | ------------------- | --------------------------------------------------- |
| ABC format check                | **Implemented**     | `/^\d{12}$/` in `verifyAbcId()`                     |
| ABC registry call               | **Not implemented** | Returns `ok: true` for any 12 digits                |
| Institution AISHE verification  | **Not implemented** | `aisheCode` is a plain seed field                   |
| Organization GSTIN verification | **Not implemented** | No organization onboarding exists                   |
| Domain email confirmation       | **Not implemented** | No email is sent                                    |
| Trust levels                    | **Not implemented** | `Session` is `{ role, id, name }` in `localStorage` |
| Server-side verification state  | **Not implemented** | No database                                         |
| Authentication at all           | **Not implemented** | Sign-in is a role and account picker                |

The prototype demonstrates the _shape_ of the flow and the data model. Building
it requires the authentication and server-side state described in
[ARCHITECTURE.md](./ARCHITECTURE.md) and [SECURITY.md](../SECURITY.md) —
verification without server-side authorization would be decoration, since the
client could simply claim a verified status.

---

**See also:** [ARCHITECTURE.md](./ARCHITECTURE.md) ·
[DATA_MODEL.md](./DATA_MODEL.md) · [SECURITY.md](../SECURITY.md) ·
[README](../README.md)

- **Server-side only.** Keys live in the server environment; a browser call
  would leak both the credential and the logic.
- **Fail closed.** A registry timeout must produce "unverified", never
  "verified". Availability is not evidence.
- **Fail loud.** A 5xx from a registry is an operational alert, not a user error.
- **Rate limit** by account and IP; registry lookups are metered and often paid.
- **Cache** successful lookups. Verification rarely reverses, and re-checking on
  every page load is wasteful.
- **Log, never store, raw payloads** where they contain personal data.

### Step 3 — Session binding (planned)

Once verified, the ABC ID binds to the authenticated account and `abcVerified`
becomes server-owned — never settable by a client payload.
