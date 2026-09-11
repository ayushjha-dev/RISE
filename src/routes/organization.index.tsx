import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card, StatusPill, StatTile } from "@/components/rise/primitives";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  ScoreRing,
  SectionHead,
  StatCardSkeleton,
} from "@/components/rise/feedback";
import { RankedBars, SkillMeter } from "@/components/rise/charts";
import { Icon } from "@/components/rise/icons";
import { Monogram } from "@/components/rise/illustrations";
import { scoreTone } from "@/lib/score-color";
import { useStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { studentsQuery } from "@/lib/api";
import { daysAgo, useApplications, useInternships } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/organization/")({
  head: () => ({
    meta: [
      { title: "Hiring dashboard — RISE for organizations" },
      {
        name: "description",
        content:
          "See applicants per posting, which internships are drawing interest, and who arrived most recently.",
      },
      { property: "og:title", content: "Hiring dashboard — RISE for organizations" },
      { property: "og:description", content: "Applicants per posting and the latest arrivals." },
    ],
  }),
  component: OrgDashboard,
});

function OrgDashboard() {
  const session = useStore((s) => s.session);
  const internships = useInternships();
  const applications = useApplications();
  const students = useQuery(studentsQuery());

  const mine = (internships.data ?? []).filter((i) => i.orgId === session?.id);
  const forMine = applications.filter((a) => mine.some((i) => i.id === a.internshipId));
  const shortlisted = forMine.filter((a) => a.status === "shortlisted");

  const perPosting = mine.map((i) => ({
    name: i.title.replace(" Intern", ""),
    value: forMine.filter((a) => a.internshipId === i.id).length,
  }));

  if (internships.isError) return <ErrorState onRetry={() => internships.refetch()} />;

  const assessedApps = forMine.filter((a) => Object.keys(a.scoreBySubtopic).length > 0);
  const avgScore = assessedApps.length
    ? Math.round(assessedApps.reduce((t, a) => t + a.overallScore, 0) / assessedApps.length)
    : 0;

  const stats = [
    { label: "Live postings", value: mine.length, icon: "briefcase" as const, note: mine.length ? "Visible to matched students" : "Nothing posted yet" },
    { label: "Applicants", value: forMine.length, icon: "inbox" as const, note: forMine.length ? "Across all postings" : "No applicants yet" },
    { label: "Shortlisted", value: shortlisted.length, icon: "check-circle" as const, tone: shortlisted.length ? "var(--success)" : undefined, note: shortlisted.length ? "Moved forward by your team" : "None shortlisted yet" },
    { label: "Average score", value: avgScore, icon: "arc" as const, suffix: assessedApps.length ? "%" : "", tone: assessedApps.length ? scoreTone(avgScore).color : undefined, note: assessedApps.length ? `${scoreTone(avgScore).label} applicant pool` : "No assessments yet" },
  ];

  const topSubtopics = Object.entries(
    assessedApps.reduce<Record<string, number[]>>((acc, a) => {
      for (const [k, v] of Object.entries(a.scoreBySubtopic)) (acc[k] ??= []).push(v);
      return acc;
    }, {}),
  )
    .map(([name, vals]) => ({ name, value: Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const recent = [...forMine].sort((a, b) => b.appliedOn.localeCompare(a.appliedOn)).slice(0, 5);

  return (
    <div>
      <PageTitle
        role="organization"
        eyebrow="Organization portal"
        title={session ? `${session.name} hiring` : "Hiring dashboard"}
        note="Applicants are ranked on the same assessment, so scores are comparable across postings."
        actions={
          <>
            <Link to="/organization/applicants">
              <Button size="sm" variant="secondary">
                Applicants
              </Button>
            </Link>
            <Link to="/organization/post">
              <Button size="sm">
                <Icon name="plus" size={16} />
                Post internship
              </Button>
            </Link>
          </>
        }
      />

      <div className="scroll-strip -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
          {internships.isLoading
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

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="display-md text-[21px]">Applicants per posting</h2>
          <div className="mt-5">
            {internships.isLoading ? (
              <ListSkeleton rows={2} />
            ) : perPosting.length === 0 ? (
              <EmptyState
                variant="chart"
                title="No postings yet"
                note="Post an internship and this chart ranks your postings by applicant count."
                action={
                  <Link to="/organization/post">
                    <Button size="sm">Post internship</Button>
                  </Link>
                }
              />
            ) : (
              <RankedBars
                data={perPosting}
                adaptive={false}
                max={Math.max(4, ...perPosting.map((p) => p.value))}
                scrollable={perPosting.length > 3}
              />
            )}
          </div>

          {topSubtopics.length > 0 && (
            <div className="mt-6 border-t border-hairline pt-5">
              <p className="eyebrow">Pool strength by subtopic</p>
              <div className="mt-4 flex flex-col gap-4">
                {topSubtopics.map((s, i) => (
                  <SkillMeter key={s.name} label={s.name} value={s.value} delay={i * 80} />
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionHead title="Latest applicants" />
          <div className="mt-4">
            {students.isLoading ? (
              <ListSkeleton rows={3} />
            ) : recent.length === 0 ? (
              <EmptyState
                variant="applicants"
                title="No applicants yet"
                note={
                  mine.length
                    ? `Posted ${daysAgo(mine[0]!.postedOn)} — no applicants yet. Matched students see this posting as soon as they open the listing.`
                    : "No applicants yet, because there's nothing posted."
                }
                action={
                  <Link to={mine.length ? "/organization/applicants" : "/organization/post"}>
                    <Button size="sm">{mine.length ? "Open applicants" : "Post internship"}</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="flex flex-col divide-y divide-hairline">
                {recent.map((a) => {
                  const student = students.data?.find((s) => s.id === a.studentId);
                  const internship = mine.find((i) => i.id === a.internshipId);
                  return (
                    <li key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 py-3.5">
                      <Monogram name={student?.name ?? "Applicant"} size={40} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{student?.name ?? "Applicant"}</p>
                        <p className="truncate text-[13px] text-muted">
                          {internship?.title} — applied {daysAgo(a.appliedOn)}
                        </p>
                        <div className="mt-2">
                          <StatusPill status={a.status} />
                        </div>
                      </div>
                      {Object.keys(a.scoreBySubtopic).length ? (
                        <ScoreRing value={a.overallScore} size={52} />
                      ) : (
                        <span className="rounded-pill border border-dashed border-hairline px-2.5 py-1 text-[12px] font-semibold text-muted">
                          Not assessed
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="display-md text-[21px]">Your posted internships</h2>
          <Link to="/organization/post">
            <Button size="sm">
              <Icon name="plus" size={16} />
              Post new
            </Button>
          </Link>
        </div>
        <div className="mt-5">
          {internships.isLoading ? (
            <ListSkeleton rows={3} />
          ) : mine.length === 0 ? (
            <EmptyState
              variant="list"
              title="No internships posted yet"
              note="Post your first internship to start receiving applications from matched students."
              action={
                <Link to="/organization/post">
                  <Button size="sm">Post internship</Button>
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {mine.map((internship) => {
                const applicantCount = forMine.filter((a) => a.internshipId === internship.id).length;
                return (
                  <li key={internship.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{internship.title}</p>
                        <p className="mt-1 text-sm text-body">
                          {internship.location} • {internship.duration} • {internship.stipend}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="text-[13px] text-muted">
                            Posted {daysAgo(internship.postedOn)}
                          </span>
                          <span className="text-[13px] font-semibold text-accent">
                            {applicantCount} {applicantCount === 1 ? "applicant" : "applicants"}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {internship.skillsRequired.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-pill border border-hairline bg-surface px-2 py-0.5 text-[12px] text-muted"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to="/organization/post" search={{ edit: internship.id }}>
                        <Button size="sm" variant="secondary">
                          <Icon name="clipboard" size={14} />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
