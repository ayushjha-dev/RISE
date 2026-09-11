import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card, StatusPill } from "@/components/rise/primitives";
import { EmptyState, ScoreRing, SectionHead } from "@/components/rise/feedback";
import { RankedBars } from "@/components/rise/charts";
import { Icon } from "@/components/rise/icons";
import { useApplications, useCurrentStudent, useInternships, useOrganizations } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/student/report/$internshipId")({
  head: () => ({
    meta: [
      { title: "Your assessment report — RISE" },
      {
        name: "description",
        content:
          "See how you scored on each subtopic, with a plain-language takeaway and courses for the weakest areas.",
      },
      { property: "og:title", content: "Your assessment report — RISE" },
      { property: "og:description", content: "Per-subtopic scores with a plain-language takeaway." },
    ],
  }),
  component: ReportPage,
});

function takeaway(subtopic: string, score: number) {
  if (score >= 80) return `Strong in ${subtopic}. Nothing to revise here before an interview.`;
  if (score >= 60) return `${subtopic} is solid, with a gap or two worth a quick revision.`;
  if (score >= 40) return `${subtopic} needs work — start with the fundamentals in the learning list.`;
  return `${subtopic} is the weakest area. Treat it as your first priority.`;
}

function ReportPage() {
  const { internshipId } = Route.useParams();
  const { student } = useCurrentStudent();
  const applications = useApplications();
  const internships = useInternships();
  const orgs = useOrganizations();

  const application = applications.find(
    (a) => a.studentId === student?.id && a.internshipId === internshipId,
  );
  const internship = internships.data?.find((i) => i.id === internshipId);
  const org = orgs.data?.find((o) => o.id === internship?.orgId);

  const entries = Object.entries(application?.scoreBySubtopic ?? {});

  if (!application || entries.length === 0) {
    return (
      <div>
        <PageTitle title="Assessment report" />
        <EmptyState
          variant="chart"
          title="There's no report for this role yet — take the assessment and your per-subtopic scores appear here."
          action={
            <Link to="/student/assessment/$internshipId" params={{ internshipId }}>
              <Button size="sm">Take the assessment</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const weakest = [...entries].sort((a, b) => a[1] - b[1])[0]!;

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="How you did"
        note={`${internship?.title ?? "Internship"} at ${org?.name ?? "this organization"}. Organizations see these subtopic scores next to your application.`}
      />

      <Card className="p-5 sm:p-6" active>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-muted">Overall score</p>
            <h2 className="display-md mt-1">
              {application.overallScore >= 70
                ? "A competitive result"
                : application.overallScore >= 45
                  ? "A workable result with clear gaps"
                  : "Room to improve before your next application"}
            </h2>
            <div className="mt-3">
              <StatusPill status={application.status} />
            </div>
          </div>
          <ScoreRing value={application.overallScore} size={84} />
        </div>
      </Card>

      <section className="mt-8">
        <SectionHead title="Subtopic breakdown" />
        <Card className="mt-4 p-5">
          <RankedBars
            data={entries.map(([name, value]) => ({ name, value }))}
            suffix="%"
            scrollable={entries.length > 3}
          />
          {entries.length > 3 && (
            <p className="mt-3 text-[13px] text-muted sm:hidden">Scroll sideways to see every subtopic.</p>
          )}
        </Card>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {entries.map(([name, value]) => (
            <Card as="li" key={name} className="flex items-start gap-4 p-5">
              <ScoreRing value={value} size={56} />
              <div className="min-w-0">
                <p className="font-semibold text-ink">{name}</p>
                <p className="mt-1 text-[13px] text-body">{takeaway(name, value)}</p>
              </div>
            </Card>
          ))}
        </ul>
      </section>

      <Card className="mt-8 p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="clipboard" size={18} />
              Courses for {weakest[0]}
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Your learning page now puts {weakest[0]} first, based on this report.
            </p>
          </div>
          <Link to="/student/learning">
            <Button size="sm" variant="secondary">
              Open learning
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
