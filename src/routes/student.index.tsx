import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Button, StatTile } from "@/components/rise/primitives";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  ScoreRing,
  SectionHead,
  StatCardSkeleton,
} from "@/components/rise/feedback";
import { SkillMeter, StatusDonut } from "@/components/rise/charts";
import { StatusPill } from "@/components/rise/primitives";
import { Icon } from "@/components/rise/icons";
import { Reveal } from "@/components/rise/reveal";
import { SkillChip } from "@/components/rise/brand";
import { Monogram } from "@/components/rise/illustrations";
import { scoreTone } from "@/lib/score-color";
import { matchScore } from "@/lib/api";
import {
  daysAgo,
  firstName,
  useApplications,
  useCurrentStudent,
  useInternships,
  useOrganizations,
} from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Your RISE dashboard" },
      {
        name: "description",
        content:
          "Track your internship applications, shortlists and completed assessments in one student dashboard.",
      },
      { property: "og:title", content: "Your RISE dashboard" },
      {
        property: "og:description",
        content: "Applications, shortlists and assessment results at a glance.",
      },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { student, isLoading, isError, refetch } = useCurrentStudent();
  const internships = useInternships();
  const orgs = useOrganizations();
  const applications = useApplications();

  const mine = applications.filter((a) => a.studentId === student?.id);
  const shortlisted = mine.filter((a) => a.status === "shortlisted");
  const assessed = mine.filter((a) => Object.keys(a.scoreBySubtopic).length > 0);

  const orgName = (id: string) => orgs.data?.find((o) => o.id === id)?.name ?? "";

  const recommended = (internships.data ?? [])
    .filter((i) => !mine.some((a) => a.internshipId === i.id))
    .map((i) => ({ i, m: matchScore(student?.skills ?? [], i.skillsRequired) }))
    .filter((x) => x.m !== null && x.m > 0)
    .sort((a, b) => (b.m ?? 0) - (a.m ?? 0))
    .slice(0, 3);

  if (isError) return <ErrorState title="Couldn't load your dashboard — try again." onRetry={() => refetch()} />;

  const bestScore = assessed.length ? Math.max(...assessed.map((a) => a.overallScore)) : 0;

  const stats = [
    {
      label: "Applications sent",
      value: mine.length,
      icon: "briefcase" as const,
      note: mine.length ? `Latest ${daysAgo(mine[mine.length - 1]!.appliedOn)}` : "None yet",
    },
    {
      label: "Shortlisted",
      value: shortlisted.length,
      icon: "check-circle" as const,
      tone: shortlisted.length ? "var(--success)" : undefined,
      note: shortlisted.length ? "An organization moved you forward" : "No shortlists yet",
    },
    {
      label: "Assessments done",
      value: assessed.length,
      icon: "clipboard" as const,
      note: assessed.length ? "Scores are visible to organizations" : "Take one to rank higher",
    },
    {
      label: "Best score",
      value: bestScore,
      icon: "arc" as const,
      suffix: assessed.length ? "%" : "",
      tone: assessed.length ? scoreTone(bestScore).color : undefined,
      note: assessed.length ? scoreTone(bestScore).label : "No assessment yet",
    },
  ];

  return (
    <div>
      <PageTitle
        role="student"
        eyebrow="Student portal"
        title={student ? `Good to see you, ${firstName(student.name)}` : "Your dashboard"}
        note={
          student
            ? `${student.year}. ${student.skills.length} skills on your profile.`
            : undefined
        }
        actions={
          <Link to="/student/internships">
            <Button size="sm">
              Browse internships
              <Icon name="chevron-right" size={16} />
            </Button>
          </Link>
        }
      />

      {/* The product knows what chapter this student is in */}
      {student && !student.abcVerified && (
        <Card className="mb-6 p-5" active>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-ink">Verify your ABC ID to start applying</p>
              <p className="mt-1 text-[13px] text-muted">
                Organizations only see verified profiles in their applicant lists.
              </p>
            </div>
            <Link to="/student/profile">
              <Button size="sm">Verify now</Button>
            </Link>
          </div>
        </Card>
      )}
      {student && student.abcVerified && student.skills.length === 0 && (
        <Card className="mb-6 p-5" active>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-ink">Add your skills to get matched</p>
              <p className="mt-1 text-[13px] text-muted">
                Matching runs on skill overlap, so an empty skill list means no matches.
              </p>
            </div>
            <Link to="/student/profile">
              <Button size="sm">Add skills</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stat strip: swipeable on mobile, row on desktop */}
      <div className="scroll-strip -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
          {isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="w-[240px] shrink-0 sm:w-auto">
                  <StatCardSkeleton />
                </div>
              ))
            : stats.map((s, i) => (
                <div key={s.label} className="w-[240px] shrink-0 sm:w-auto">
                  <StatTile
                    label={s.label}
                    value={s.value}
                    note={s.note}
                    delay={i * 70}
                    icon={<Icon name={s.icon} size={18} />}
                    {...(s.tone ? { tone: s.tone } : {})}
                    {...(s.suffix ? { suffix: s.suffix } : {})}
                  />
                </div>
              ))}
        </div>
      </div>

      {student && student.skills.length > 0 && (
        <Card className="mt-6 grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="eyebrow">Your skill profile</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {student.skills.map((s) => (
                <SkillChip key={s} skill={s} size="sm" />
              ))}
            </div>
          </div>
          <Link to="/student/profile" className="justify-self-start sm:justify-self-end">
            <Button size="sm" variant="secondary">
              Edit skills
            </Button>
          </Link>
        </Card>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="p-5">
          <h2 className="display-md text-[21px]">Where your applications stand</h2>
          <div className="mt-5">
            {mine.length === 0 ? (
              <EmptyState
                variant="applications"
                title="No applications yet"
                note="Once you apply, this chart tracks how every application is moving."
                action={
                  <Link to="/student/internships">
                    <Button size="sm">Browse internships</Button>
                  </Link>
                }
              />
            ) : (
              <>
                <StatusDonut
                  centerLabel="applications"
                  data={[
                    { name: "Applied", value: mine.filter((a) => a.status === "applied").length, color: "var(--series-1)" },
                    { name: "Shortlisted", value: shortlisted.length, color: "var(--score-high)" },
                    { name: "Not selected", value: mine.filter((a) => a.status === "rejected").length, color: "var(--score-weak)" },
                  ].filter((d) => d.value > 0)}
                />
                {assessed.length > 0 && (
                  <div className="mt-6 border-t border-hairline pt-5">
                    <p className="eyebrow">Your strongest subtopics</p>
                    <div className="mt-4 flex flex-col gap-4">
                      {Object.entries(
                        assessed.reduce<Record<string, number[]>>((acc, a) => {
                          for (const [k, v] of Object.entries(a.scoreBySubtopic)) {
                            (acc[k] ??= []).push(v);
                          }
                          return acc;
                        }, {}),
                      )
                        .map(([name, vals]) => ({
                          name,
                          value: Math.round(vals.reduce((x, y) => x + y, 0) / vals.length),
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 4)
                        .map((s, i) => (
                          <SkillMeter key={s.name} label={s.name} value={s.value} delay={i * 80} />
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="display-md text-[21px]">Recent applications</h2>
          <div className="mt-4">
            {internships.isLoading ? (
              <ListSkeleton rows={2} />
            ) : mine.length === 0 ? (
              <EmptyState
                variant="applications"
                title="Nothing here yet"
                note="Apply to an internship and it shows up here with its live status."
                action={
                  <Link to="/student/internships">
                    <Button size="sm">Browse internships</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-hairline">
                {[...mine].reverse().slice(0, 4).map((a) => {
                  const int = internships.data?.find((i) => i.id === a.internshipId);
                  const scored = Object.keys(a.scoreBySubtopic).length > 0;
                  return (
                    <li key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{int?.title ?? "Internship"}</p>
                        <p className="truncate text-[13px] text-muted">
                          {int ? orgName(int.orgId) : ""} — applied {daysAgo(a.appliedOn)}
                        </p>
                        <div className="mt-2">
                          <StatusPill status={a.status} />
                        </div>
                      </div>
                      {scored ? (
                        <Link
                          to="/student/report/$internshipId"
                          params={{ internshipId: a.internshipId }}
                          aria-label="Open assessment report"
                        >
                          <ScoreRing value={a.overallScore} size={52} />
                        </Link>
                      ) : (
                        <Link
                          to="/student/assessment/$internshipId"
                          params={{ internshipId: a.internshipId }}
                        >
                          <Button size="sm" variant="secondary">
                            Take assessment
                          </Button>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {mine.length > 0 && (
            <div className="band-warm mt-6 rounded-[14px] border border-hairline p-4">
              <p className="eyebrow">Your next step</p>
              <p className="mt-2 text-sm text-body">
                {mine.some((a) => Object.keys(a.scoreBySubtopic).length === 0)
                  ? "One application is still waiting on its assessment — finish it so organizations can rank you."
                  : bestScore !== null && bestScore < 70
                    ? "Your strongest score has room to grow. Brush up on your weakest subtopic, then apply again."
                    : "Everything is assessed. Keep applying — each new role reuses the score you already earned."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Link to="/student/internships">
                  <Button size="sm">Browse internships</Button>
                </Link>
                <Link to="/student/learning">
                  <Button size="sm" variant="secondary">
                    Open learning
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <section className="mt-10">
        <SectionHead
          title="Recommended for you"
          note="Ranked by how much each role overlaps with the skills on your profile."
          action={
            <Link to="/student/internships" className="hidden text-[13px] font-semibold text-ink underline sm:inline">
              See all internships
            </Link>
          }
        />
        <div className="mt-5">
          {internships.isLoading ? (
            <ListSkeleton rows={3} />
          ) : recommended.length === 0 ? (
            <EmptyState
              variant="search"
              title={
                student?.skills.length
                  ? "No new matches right now. You've applied to everything that overlaps your skills."
                  : "No matches yet because your profile has no skills tagged. Add a few and matching starts working."
              }
              action={
                <Link to={student?.skills.length ? "/student/internships" : "/student/profile"}>
                  <Button size="sm">
                    {student?.skills.length ? "Browse all internships" : "Update your skills"}
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommended.map(({ i, m }, idx) => (
                <Reveal key={i.id} delay={idx * 90} as="li">
                  <Card className="h-full p-5" hover>
                    <Link
                      to="/student/internships/$internshipId"
                      params={{ internshipId: i.id }}
                      className="block"
                    >
                      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                        <Monogram name={orgName(i.orgId) || i.title} size={40} />
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold text-ink">{i.title}</p>
                          <p className="truncate text-[13px] text-muted">{orgName(i.orgId)}</p>
                        </div>
                        <ScoreRing value={m ?? 0} size={48} />
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
                        <Icon name="location" size={14} />
                        {i.location}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {i.skillsRequired.slice(0, 3).map((s) => (
                          <SkillChip
                            key={s}
                            skill={s}
                            size="sm"
                            matched={Boolean(student?.skills.includes(s))}
                          />
                        ))}
                        {i.skillsRequired.length > 3 && (
                          <span className="num self-center text-[12px] font-semibold text-muted">
                            +{i.skillsRequired.length - 3}
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-4 border-t border-hairline pt-3 text-[13px] font-semibold"
                        style={{ color: scoreTone(m ?? 0).color }}
                      >
                        {scoreTone(m ?? 0).label} skill match
                      </p>
                    </Link>
                  </Card>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
