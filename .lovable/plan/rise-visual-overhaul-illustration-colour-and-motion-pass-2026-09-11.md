# RISE visual overhaul — illustration, colour and motion pass

Goal: turn the current clean-but-flat interface into something that feels like a crafted journey — richer artwork, adaptive colour, deliberate use of the wide desktop space, and motion that guides attention.

## 0. Bring in the SVG skill first

Install and read the requested SVG skill (`npx skills use "https://github.com/glincker/thesvg" --skill "thesvg"`), read its full output and supporting files, and follow its authoring rules for every new graphic below. All artwork stays hand-authored SVG tuned for the warm light background — no stock raster images, no purple-gradient stock look.

## 1. Adaptive colour system

Right now every progress ring and bar uses the same accent colour regardless of value, so a 20% score looks identical to a 95% one.

- Add a value-to-colour scale (weak / developing / strong / excellent) as new tokens in the stylesheet, tuned to sit on warm paper: clay red, amber, pine, deep emerald.
- Score rings, subtopic bars, donut segments, ranked bars, status pills and table score cells all read from that scale, with a soft matching track behind each.
- Keep each portal's identity colour for navigation, headings and buttons; the value scale only expresses performance.
- Add gradient stroke and a subtle glow on high scores so a strong result visibly rewards the viewer.

## 2. New artwork set

- A hero illustration for the landing page: layered paper-textured scene of the three-portal idea, with slow drifting accent shapes.
- One illustrated header motif per portal (student, institution, organization), used as a soft, low-contrast background band behind each page title so no page opens on bare canvas.
- Illustrated empty states per context (no applications, no applicants, no students, no search results, no report yet) instead of the single generic outline.
- A celebratory badge/ribbon graphic for finished assessments and shortlist moments.
- Decorative dividers, corner arcs, dot grids and hairline curves to break up the large white card fields.
- Expand the icon set with the missing concepts (calendar, chart, book, target, spark, medal, arrow-trend, mail, link, shield) so text-only rows get meaning-carrying glyphs.

## 3. Fixing the empty desktop space

Each wide screen gets a considered composition rather than one narrow column:

- Landing: full-bleed hero with layered artwork, an animated "how it works" three-step band, a marquee-style partner strip, and a closing call-to-action panel with textured background.
- Student dashboard: two-column layout with the stat strip and status chart on the left and a "next step in your journey" progress rail on the right; recommendations become richer cards with match visualisation.
- Internship list: filter rail keeps a sticky illustrated footer card; result cards get organization mark, meta icons and match ring in a tighter grid.
- Assessment: a wide split — question panel plus a persistent illustrated progress rail with per-subtopic beads.
- Report: hero score panel with large ring and adaptive colour language, then a subtopic grid and a learning band.
- Organization applicants and institution students: filled sidebars with summary panels, so the table never floats alone on a wide screen.
- Profile pages: two-column card grid with an illustrated identity panel.

## 4. Depth instead of pale flatness

- Add layered surface treatments: warm tinted section bands, a very subtle paper grain overlay, soft inner hairlines, and a slightly stronger card elevation ramp (rest / hover / active).
- Section headers gain small accent rules and eyebrow labels.
- Tables and lists get zebra warmth and hover lift rather than plain white rows.

## 5. Motion as a journey

- Section reveal on scroll (fade plus small rise), staggered by index, all respecting reduced-motion.
- Number counters on stats, animated ring fill and bar grow on first view.
- Card hover: lift, hairline warm-up, icon nudge.
- Page transitions between portal routes; step transitions in registration and assessment.
- Small celebration moment (ribbon plus ring flourish) when an assessment completes or an applicant is shortlisted.

## 6. Order of work

1. Install and read the SVG skill.
2. Stylesheet: adaptive colour tokens, surface layers, grain, motion utilities.
3. Icon and illustration modules.
4. Shared components: score ring, bars, charts, cards, empty states, section head, tables.
5. Page-by-page composition: landing, auth, register, then student, organization, institution screens.
6. Full pass over both mobile and desktop widths in the browser, checking every screen for dead space, contrast and motion behaviour.

## Technical notes

- All new colour values live as tokens in `src/styles.css` (oklch/hex tokens exposed through `@theme inline`); components keep using semantic classes, no hardcoded colour utilities.
- New artwork goes into `src/components/rise/illustrations.tsx`; the icon set in `src/components/rise/icons.tsx` gets extended in place.
- Adaptive colour resolved by a helper in `src/lib/score-color.ts`, consumed by `ScoreRing`, `charts.tsx`, `StatusPill` and score cells.
- Reveal-on-scroll implemented with a small `useReveal` IntersectionObserver hook plus CSS utilities, gated behind `prefers-reduced-motion`.
- No data model, store, routing or server-function changes; this is a presentation-layer pass only.
