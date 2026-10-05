# Security Policy

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Report it privately through GitHub's
**[Report a vulnerability](https://github.com/<owner>/<repo>/security/advisories/new)**
("Security" → "Report a vulnerability"), which opens a private advisory visible
only to maintainers.

Please include:

- A description of the issue and its impact.
- Steps to reproduce, or a proof of concept.
- Affected route, file or component, if known.
- Any suggested remediation.

We aim to acknowledge reports within **7 days**. Please give maintainers
reasonable time to release a fix before disclosing publicly.

## ⚠️ Current security posture

RISE is a **front-end prototype with a simulated data layer**. It is honest
about this, and so is this document. Concretely:

| Area                | Status                  | What that means                                                                                                                                                              |
| ------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication      | **Not implemented**     | Sign-in is a role + account picker. There is no password, token, session expiry or identity check.                                                                           |
| Authorization       | **Not implemented**     | `PortalShell` compares `session.role` to the required role **in the browser**. It is a UI guard, not a security boundary. Anyone can edit local storage and view any portal. |
| Data storage        | **localStorage only**   | Applications, sessions, posted internships and registered students live in the browser under `rise.state.v1`. Not shared, not durable, not private.                          |
| ABC ID verification | **Format check only**   | `verifyAbcId()` validates `/^\d{12}$/` and simulates a delay. It never contacts the ABC authority, so any well-formed ID "verifies".                                         |
| Resume handling     | **Reference only**      | `resumeUrl` is a string. There is no upload, storage or scanning.                                                                                                            |
| AI generation       | **One server function** | `generateJd` is the only outbound call; input and output are Zod-validated, and the API key stays server-side.                                                               |
| CSRF                | **Partially addressed** | `csrfMiddleware` is declared in `src/start.ts` for server functions.                                                                                                         |

**Do not deploy this as-is.** Running it publicly would expose a portal in which
any visitor can impersonate any student, institution or organization — the three
things the product exists to make trustworthy. The roadmap items that close this
gap are real persistence and a real ABC verification API; **real authentication
and server-side authorization are prerequisites for any production use** and are
tracked as such.

If you are evaluating RISE, treat all displayed data — names, colleges,
companies, assessment scores — as fictional sample content.

## What counts as a vulnerability here

Given the above, genuine issues are mostly about the _code_ rather than the
missing backend:

- **Server-function weaknesses** — bypassing or defeating the CSRF filter,
  injecting unexpected input into `generateJd`, or extracting the API key.
- **XSS** — any path that renders user-controlled input (a posted internship
  description, a registered name, a skill string) as HTML rather than as React
  text.
- **Injection or traversal** — a path or `?edit=` parameter used to reach
  something unintended.
- **Error leakage** — stack traces, internal paths or secrets returned in a
  response. `error-page.ts` should only ever render the friendly page.
- **Dependency compromise** — report via the advisory flow rather than opening
  a PR that silently bumps versions.

**Not vulnerabilities in a prototype:**

- Anyone can sign in as another role or account.
- Clearing `localStorage` resets demo data.
- ABC IDs are only format-checked.
- Score data is client-side and trivially editable.

These are known, documented limitations.

## Hardening path before production

Ordered roughly by how much they matter:

1. **Server-side authentication** — real sessions with expiry; replace the
   client-side role check entirely.
2. **Server-side authorization** — enforce role and ownership checks on every
   read and write. Never trust the client to decide what an identity may see.
3. **Real ABC verification** — validate against the ABC authority so an
   identity is attributable to a person, which is the product's core promise.
4. **Move state server-side** — a database with row-level scoping by
   `institutionId` and `orgId`, instead of one shared client store.
5. **Rate-limit the server function** and cap payload sizes.
6. **Resume handling** — if uploads are added: content-type validation, size
   limits, and malware scanning.
7. **Keep error pages generic** — never reflect exception messages back to the
   client.

## Supply-chain posture

`bunfig.toml` sets `minimumReleaseAge = 86400`: Bun refuses package versions
published less than 24 hours ago, which limits exposure to freshly compromised
releases. `minimumReleaseAgeExcludes` is a deliberate, reviewed escape hatch —
keep it as small as possible.

TanStack Router, Router Plugin and Start are pinned to **exact patch versions**,
and `rolldown` is pinned via `overrides`, because those packages have shipped
breaking changes within a single minor.

---

**See also:** [README](README.md) · [CONTRIBUTING.md](CONTRIBUTING.md) ·
[ARCHITECTURE.md](docs/ARCHITECTURE.md)
