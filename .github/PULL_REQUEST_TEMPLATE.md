<!--
Thanks for contributing to RISE. Please fill this in — it makes review much
faster. See CONTRIBUTING.md for conventions.

RISE is a front-end prototype with a simulated data layer. Please do not open a
PR that adds real authentication or a database: those are roadmap items with
design decisions still open, and a partial version would be worse than none.
-->

## What this changes

<!-- One or two sentences. What is different after this PR? -->

Closes #

## Type

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] ♻️ Refactor (no behaviour change)
- [ ] 📝 Documentation
- [ ] 🔧 Tooling / CI

## Portal affected

- [ ] 🎓 Student
- [ ] 🏛️ Institution
- [ ] 🏢 Organization
- [ ] 🌐 Public (landing / auth / register)
- [ ] ⚙️ Cross-cutting

## How this was verified

<!--
What you actually clicked through, and at which widths. Wide desktop is a
deliberate design target in RISE, so please check it.
-->

- [ ] `bun run lint` passes
- [ ] `bun run build` passes
- [ ] Checked in the browser at mobile width
- [ ] Checked in the browser at desktop width
- [ ] Checked a loading, empty and error state if this touches data

## Accessibility

- [ ] Any new animation respects `prefers-reduced-motion`
- [ ] Score colours come from `scoreTone()` — never hand-picked
- [ ] Colour is not the only signal; text accompanies it
- [ ] New routes declare `head()` meta
- [ ] Not applicable — no UI change

## Design system

- [ ] Used semantic tokens (`bg-canvas`, `text-ink`, `border-hairline`) and `var(--accent)`
- [ ] No new hex codes or hard-coded portal colours
- [ ] New components live in `src/components/rise/`, not `components/ui/`
- [ ] Not applicable — no styling change

## Docs

- [ ] Updated `docs/` if architecture, data model or design system changed
- [ ] No documentation changes needed

## Notes for the reviewer

<!-- Anything non-obvious, a trade-off you made, or something you deliberately left out. -->

## Screenshots

<!-- Before/after for UI changes. For layout work, include a wide desktop view. -->
