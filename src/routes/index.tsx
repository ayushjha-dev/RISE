import { createFileRoute, Link } from "@tanstack/react-router";
import { Icon, RiseMark } from "@/components/rise/icons";
import { Button } from "@/components/rise/primitives";
import { ScoreRing } from "@/components/rise/feedback";
import { Reveal } from "@/components/rise/reveal";
import { SkillChip } from "@/components/rise/brand";
import { SkillMeter } from "@/components/rise/charts";
import {
  CornerArcs,
  HeroScene,
  PortalMotif,
  WaveDivider,
} from "@/components/rise/illustrations";
import { useCountUp } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RISE — Skill-matched internships for verified students" },
      {
        name: "description",
        content:
          "RISE links students, institutions and hiring organizations: verify your academic identity, match to internships by skill, and get ranked by what you can actually do.",
      },
      { property: "og:title", content: "RISE — Skill-matched internships for verified students" },
      {
        property: "og:description",
        content:
          "Verify your academic identity, match to internships by skill, and get ranked by assessment score.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const roles = [
  {
    key: "student" as const,
    title: "Students",
    body: "Verify your ABC ID once, then match to internships by the skills you already have. Take a short assessment and let your score speak first.",
    portal: "Lavender portal",
    icon: "user" as const,
    points: ["One-time identity check", "Skill-matched roles", "Per-subtopic scorecard"],
  },
  {
    key: "institution" as const,
    title: "Institutions",
    body: "See where your students are applying, how they score, and which shortlists are converting — across every department, in one view.",
    portal: "Pine portal",
    icon: "building" as const,
    points: ["Live cohort dashboard", "Subtopic averages", "Top performers surfaced"],
  },
  {
    key: "organization" as const,
    title: "Organizations",
    body: "Post an internship in two minutes, with or without AI help, then review applicants ranked by per-subtopic assessment scores.",
    portal: "Terracotta portal",
    icon: "briefcase" as const,
    points: ["AI-drafted descriptions", "Ranked applicant table", "Evidence before résumé"],
  },
];

const journey = [
  {
    icon: "check-circle" as const,
    title: "Verify once",
    body: "A student confirms their Academic Bank of Credits ID. Their institution is attached automatically.",
  },
  {
    icon: "search" as const,
    title: "Match by skill",
    body: "Openings are ranked against the skills already on the profile — no keyword guessing.",
  },
  {
    icon: "clipboard" as const,
    title: "Prove it",
    body: "A short role-specific assessment scores each subtopic separately, not one blunt number.",
  },
  {
    icon: "sparkle" as const,
    title: "Get seen",
    body: "Organizations review a ranked shortlist. Institutions watch the same record update live.",
  },
];

const skills = [
  "React",
  "JavaScript",
  "TypeScript",
  "SQL",
  "Python",
  "Node",
  "CSS",
  "Docker",
  "Testing",
  "Data analysis",
];

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const v = useCountUp(to, 1200);
  return (
    <span className="num">
      {v.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function Landing() {
  return (
    <div className="grain min-h-screen bg-canvas">
      <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <RiseMark size={30} />
            <span className="font-display text-[20px] font-semibold text-ink">RISE</span>
            <span className="ml-2 hidden rounded-pill border border-hairline bg-surface px-2.5 py-1 text-[12px] font-semibold text-muted sm:inline">
              Academia × Industry
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to="/register" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Create account
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Sign in</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------- Hero ------------------------------- */}
      <section className="band-warm relative overflow-hidden">
        <CornerArcs className="pointer-events-none absolute -top-6 right-0 h-[380px] w-[380px]" />
        <div className="relative mx-auto max-w-[1200px] px-5 pt-12 pb-14 sm:px-8 sm:pt-20 sm:pb-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
            <div className="anim-in">
              <p className="eyebrow rule-accent">Skill-first internship hiring</p>
              <h1 className="display-xl mt-1 max-w-[17ch]">
                Hiring that starts with what you can do.
              </h1>
              <p className="mt-6 max-w-lg text-base text-body">
                RISE connects verified student profiles to internships by skill, scores candidates on
                the subtopics that matter for the role, and gives institutions a live view of how
                their students are doing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Get started
                    <Icon name="chevron-right" size={18} />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="secondary">
                    Sign in to a portal
                  </Button>
                </Link>
              </div>
              <dl className="mt-11 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-6">
                {[
                  { n: 12400, s: "", l: "verified students" },
                  { n: 3, s: "", l: "partner institutions" },
                  { n: 96, s: "%", l: "assessments completed" },
                ].map((x) => (
                  <div key={x.l}>
                    <dt className="font-display text-[26px] leading-none font-semibold text-ink">
                      <Counter to={x.n} suffix={x.s} />
                    </dt>
                    <dd className="mt-1.5 text-[13px] text-muted">{x.l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="anim-in relative" style={{ animationDelay: "90ms" }}>
              <HeroScene className="mx-auto h-auto w-full max-w-[520px]" />
            </div>
          </div>
        </div>
        <WaveDivider className="h-8 w-full" />
      </section>

      {/* --------------------------- Skill marquee -------------------------- */}
      <section className="overflow-hidden border-y border-hairline bg-surface py-4">
        <div className="scroll-strip flex">
          <div className="marquee flex shrink-0 items-center gap-3 pr-3">
            {[...skills, ...skills].map((s, i) => (
              <SkillChip key={`${s}-${i}`} skill={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- Journey ----------------------------- */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <p className="eyebrow rule-accent">How RISE works</p>
          <h2 className="display-lg max-w-[24ch]">Four steps from an ID number to a shortlist.</h2>
        </Reveal>

        <div className="relative mt-12">
          <span className="pointer-events-none absolute top-7 right-0 left-0 hidden border-t border-dashed border-hairline lg:block" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((j, i) => (
              <Reveal key={j.title} delay={i * 90}>
                <li className="relative flex h-full flex-col rounded-[18px] border border-hairline bg-surface p-5">
                  <span className="grid h-14 w-14 place-items-center rounded-[16px] bg-accent-soft text-accent">
                    <Icon name={j.icon} size={26} />
                  </span>
                  <span className="num mt-4 text-[12px] font-bold tracking-[0.14em] text-muted">
                    STEP {i + 1}
                  </span>
                  <h3 className="mt-1 font-display text-[20px] font-semibold text-ink">{j.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-body">{j.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------ Adaptive score demo ---------------------- */}
      <section className="border-y border-hairline bg-surface-soft">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <Reveal>
            <p className="eyebrow rule-accent">Colour that means something</p>
            <h2 className="display-lg max-w-[20ch]">A score you can read at a glance.</h2>
            <p className="mt-4 max-w-lg text-base text-body">
              Every number in RISE is coloured by how good it is — clay for gaps, amber while
              developing, pine for strong, emerald for excellent. Recruiters stop reading digits and
              start reading shape.
            </p>
            <div className="mt-8 flex flex-wrap items-end gap-7">
              {[38, 62, 78, 94].map((v) => (
                <ScoreRing key={v} value={v} size={68} showTier />
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div
              className="raised-lg rounded-[20px] border border-hairline bg-surface p-6"
              data-portal="organization"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="eyebrow">Applicant</p>
                  <h3 className="mt-1.5 truncate font-display text-[22px] font-semibold text-ink">
                    Aarthi Balasubramanian
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-success">
                    <Icon name="check-circle" size={15} />
                    Academic identity verified
                  </p>
                </div>
                <ScoreRing value={80} size={72} />
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <SkillMeter label="React" value={100} />
                <SkillMeter label="JavaScript" value={80} delay={80} />
                <SkillMeter label="SQL" value={58} delay={160} />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
                <p className="text-[13px] text-muted">
                  Frontend Engineering Intern, Thalir Systems
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent-soft px-2.5 py-1 text-[13px] font-semibold text-ink">
                  <Icon name="check" size={14} />
                  Shortlisted 2 Sep
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ Portals ---------------------------- */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-24">
        <Reveal>
          <p className="eyebrow rule-accent">Three portals</p>
          <h2 className="display-lg max-w-[22ch]">One record of a student's work, three lenses.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {roles.map((r, i) => (
            <Reveal key={r.key} delay={i * 100}>
              <article
                data-portal={r.key}
                className="lift relative flex h-full flex-col overflow-hidden rounded-[20px] border border-hairline bg-surface p-6"
              >
                <PortalMotif
                  role={r.key}
                  className="pointer-events-none absolute -top-2 right-0 h-40 w-64 opacity-90"
                />
                <span className="relative grid h-12 w-12 place-items-center rounded-[14px] bg-accent-soft text-accent">
                  <Icon name={r.icon} size={24} />
                </span>
                <h3 className="relative mt-4 font-display text-[22px] font-semibold text-ink">
                  {r.title}
                </h3>
                <p className="relative mt-2 text-sm text-body">{r.body}</p>
                <ul className="relative mt-5 flex flex-1 flex-col gap-2">
                  {r.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[13px] text-body">
                      <span className="mt-0.5 text-accent">
                        <Icon name="check" size={15} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-6 border-t border-hairline pt-4 text-[13px] font-semibold text-accent">
                  {r.portal}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------- CTA ------------------------------ */}
      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 sm:pb-28">
        <Reveal>
          <div className="band relative overflow-hidden rounded-[24px] border border-hairline px-6 py-12 text-center sm:px-12 sm:py-16">
            <CornerArcs className="pointer-events-none absolute -top-8 -left-24 h-[300px] w-[300px] rotate-180" />
            <div className="relative mx-auto max-w-2xl">
              <RiseMark size={40} />
              <h2 className="display-lg mt-5">Start with the skills you already have.</h2>
              <p className="mt-3 text-base text-body">
                Create a student, institution, or organization account and walk the whole flow with
                sample institutional data.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/register">
                  <Button size="lg">Create your account</Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="secondary">
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-hairline bg-surface">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-7 text-[13px] text-muted sm:px-8">
          <div className="flex items-center gap-2.5">
            <RiseMark size={22} />
            <p>RISE, an academia and industry collaboration platform.</p>
          </div>
          <p>Built for demonstration with sample institutional data.</p>
        </div>
      </footer>
    </div>
  );
}
