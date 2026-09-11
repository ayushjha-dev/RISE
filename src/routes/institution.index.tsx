import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, StatTile } from "@/components/rise/primitives";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  ScoreRing,
  SectionHead,
  StatCardSkeleton,
} from "@/components/rise/feedback";
import { RankedBars, SubtopicRadar, StatusDonut } from "@/components/rise/charts";
import { Icon } from "@/components/rise/icons";
import { Monogram } from "@/components/rise/illustrations";
import { scoreTone } from "@/lib/score-color";
import { studentsQuery } from "@/lib/api";
import { useStore } from "@/lib/store";
import { useApplications, useInternships } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/institution/")({
  head: () => ({
    meta: [
      { title: "Placement overview — RISE for institutions" },
      {
        name: "description",
        content:
          "Track how your students are progressing through applications, assessments and shortlists in one view.",
      },
      { property: "og:title", content: "Placement overview — RISE for institutions" },
      { property: "og:description", content: "Applications, assessments and shortlists in one view." },
    ],
  }),
  component: InstitutionDashboard,
});

function InstitutionDashboard() {
  const session = useStore((s) => s.session);
  const students = useQuery(studentsQuery());
  const applications = useApplications();
  const internships = useInternships();

  const mine = (students.data ?? []).filter((s) => s.institutionId === session?.id);
  const ids = new Set(mine.map((s) => s.id));
  const apps = applications.filter((a) => ids.has(a.studentId));
  const assessed = apps.filter((a) => Object.keys(a.scoreBySubtopic).length > 0);
  const shortlisted = apps.filter((a) => a.status === "shortlisted");
  const avg = assessed.length
    ? Math.round(assessed.reduce((t, a) => t + a.overallScore, 0) / assessed.length)
    : null;

  const statuses = [
    {
      name: "Applied",
      value: apps.filter((a) => a.status === "applied").length,
      color: "var(--series-1)",
    },
    { name: "Shortlisted", value: shortlisted.length, color: "var(--score-high)" },
    {
      name: "Not selected",
      value: apps.filter((a) => a.status === "rejected").length,
      color: "var(--score-weak)",
    },
  ].filter((s) => s.value > 0);

  const subtopics = ["JavaScript", "React", "SQL"];
  const bySubtopic = subtopics
    .map((name) => {
      const scores = assessed.map((a) => a.scoreBySubtopic[name]).filter((v): v is number => v != null);
      return {
        name,
        value: scores.length ? Math.round(scores.reduce((t, v) => t + v, 0) / scores.length) : 0,
      };
    })
    .filter((s) => s.value > 0);

  if (students.isError || internships.isError) {
    return (
      <ErrorState
        onRetry={() => {
          students.refetch();
          internships.refetch();
        }}
      />
    );
  }

  const stats = [
    { label: "Students on RISE", value: mine.length, icon: "students" as const, note: mine.length ? "Registered from your institution" : "No students registered yet" },
    { label: "Applications", value: apps.length, icon: "briefcase" as const, note: apps.length ? "Submitted by your students" : "No applications yet" },
    { label: "Shortlisted", value: shortlisted.length, icon: "check-circle" as const, tone: shortlisted.length ? "var(--success)" : undefined, note: shortlisted.length ? "Moved forward by employers" : "None shortlisted yet" },
    {
      label: "Average score",
      value: avg == null ? "—" : avg,
      icon: "arc" as const,
      suffix: avg == null ? "" : "%",
      tone: avg == null ? undefined : scoreTone(avg).color,
      note: avg == null ? "No assessments completed yet" : `${scoreTone(avg).label} across ${assessed.length} assessments`,
    },
  ];

  const top = [...assessed].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);

  return (
    <div>
      <PageTitle
        role="institution"
        eyebrow="Institution portal"
        title={session?.name ?? "Placement overview"}
        note="Scores come from the same assessment every employer sees, so they're comparable across students."
        actions={
          <Link to="/institution/students">
            <Button size="sm">
              All students
              <Icon name="chevron-right" size={16} />
            </Button>
          </Link>
        }
      />

      <div className="scroll-strip -mx-5 px-5 sm:mx-0 sm:px-0">
        <div className="flex gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {students.isLoading
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="w-[220px] shrink-0 sm:w-auto">
                  <StatCardSkeleton />
                </div>
              ))
            : stats.map((s, i) => (
                <div key={s.label} className="w-[220px] shrink-0 sm:w-auto">
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
          <h2 className="display-md text-[21px]">Where applications stand</h2>
          <div className="mt-5">
            {students.isLoading ? (
              <ListSkeleton rows={2} />
            ) : statuses.length === 0 ? (
              <EmptyState
                variant="chart"
                title="No applications yet"
                note="Once your students start applying, this chart shows how many are waiting, shortlisted and passed over."
              />
            ) : (
              <>
                <StatusDonut data={statuses} centerLabel="total" />
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-hairline pt-5">
                  <div>
                    <p className="eyebrow">Shortlist rate</p>
                    <p className="num mt-1 font-display text-[24px] font-semibold text-ink">
                      {Math.round((shortlisted.length / Math.max(1, apps.length)) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Assessments done</p>
                    <p className="num mt-1 font-display text-[24px] font-semibold text-ink">
                      {assessed.length}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="display-md text-[21px]">Average score by subtopic</h2>
          <p className="mt-1 text-[13px] text-muted">Where your cohort is strongest and weakest.</p>
          <div className="mt-5">
            {students.isLoading ? (
              <ListSkeleton rows={2} />
            ) : bySubtopic.length === 0 ? (
              <EmptyState
                variant="report"
                title="Nothing to average yet"
                note="Subtopic averages appear as soon as a student completes an assessment."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
                <RankedBars data={bySubtopic} />
                <SubtopicRadar data={bySubtopic} size={220} />
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <SectionHead
          title="Highest scoring students"
          action={
            <Link to="/institution/students">
              <Button size="sm" variant="ghost">
                All students
              </Button>
            </Link>
          }
        />
        <div className="mt-4">
          {students.isLoading ? (
            <ListSkeleton rows={3} />
          ) : top.length === 0 ? (
            <EmptyState
              variant="students"
              title="No assessments completed yet"
              note="As soon as a student finishes one, your top performers appear here."
            />
          ) : (
            <ul className="flex flex-col">
              {top.map((a) => {
                const student = mine.find((s) => s.id === a.studentId);
                const internship = internships.data?.find((i) => i.id === a.internshipId);
                return (
                  <li key={a.id} className="zebra grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[10px] px-2 py-3.5">
                    <span className="num w-6 text-center text-[13px] font-bold text-muted">
                      {top.indexOf(a) + 1}
                    </span>
                    <Monogram name={student?.name ?? "Student"} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{student?.name}</p>
                      <p className="truncate text-[13px] text-muted">
                        {internship?.title ?? "Assessment completed"}
                      </p>
                    </div>
                    <ScoreRing value={a.overallScore} size={52} />
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
