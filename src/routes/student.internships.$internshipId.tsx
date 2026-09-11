import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Chip } from "@/components/rise/primitives";
import { ErrorState, ScoreRing, Skeleton } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { matchScore } from "@/lib/api";
import { actions } from "@/lib/store";
import { useToast } from "@/components/rise/toast";
import { ActionBar } from "@/components/rise/shell";
import {
  daysAgo,
  useApplications,
  useCurrentStudent,
  useInternships,
  useOrganizations,
} from "@/lib/portal";

export const Route = createFileRoute("/student/internships/$internshipId")({
  head: () => ({
    meta: [
      { title: "Internship details — RISE" },
      {
        name: "description",
        content:
          "Read the full internship brief, see your skill match, and apply in one step.",
      },
      { property: "og:title", content: "Internship details — RISE" },
      { property: "og:description", content: "The full brief, your skill match, and one-step apply." },
    ],
  }),
  component: InternshipDetail,
});

function InternshipDetail() {
  const { internshipId } = Route.useParams();
  const { student } = useCurrentStudent();
  const internships = useInternships();
  const orgs = useOrganizations();
  const applications = useApplications();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const internship = internships.data?.find((i) => i.id === internshipId);
  const org = orgs.data?.find((o) => o.id === internship?.orgId);
  const application = applications.find(
    (a) => a.studentId === student?.id && a.internshipId === internshipId,
  );
  const m = matchScore(student?.skills ?? [], internship?.skillsRequired ?? []);

  if (internships.isError) {
    return <ErrorState onRetry={() => internships.refetch()} />;
  }

  if (internships.isLoading) {
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-9 w-80" />
        <Skeleton className="mt-6 h-40 w-full rounded-[14px]" />
      </div>
    );
  }

  if (!internship) {
    return (
      <ErrorState title="That internship is no longer listed." onRetry={() => navigate({ to: "/student/internships" })} />
    );
  }

  const apply = () => {
    if (submitting || application || !student) return;
    setSubmitting(true);
    const ok = actions.apply(student.id, internship.id);
    toast.push(ok ? "success" : "warning", ok ? "Application sent" : "You've already applied to this role");
    setTimeout(() => setSubmitting(false), 600);
  };

  return (
    <div className="max-w-3xl">
      <Link
        to="/student/internships"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"
      >
        <Icon name="chevron-left" size={16} />
        All internships
      </Link>

      <div className="anim-in mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
        <div className="min-w-0">
          <h1 className="display-lg">{internship.title}</h1>
          <p className="mt-2 text-sm text-body">
            {org?.name} — {org?.industry}, {org?.city}
          </p>
          <p className="mt-1 text-[13px] text-muted">Posted {daysAgo(internship.postedOn)}</p>
        </div>
        {m !== null && <ScoreRing value={m} size={64} label="match" />}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Duration", internship.duration],
          ["Stipend", internship.stipend],
          ["Location", internship.location],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-[13px] font-semibold text-muted">{label}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5" active>
        <h2 className="text-[20px] font-semibold text-ink">About the role</h2>
        <p className="mt-3 text-[15px] leading-relaxed break-words text-body">
          {internship.description}
        </p>
        {internship.aiGenerated && (
          <p className="mt-4 flex items-center gap-1.5 text-[13px] text-muted">
            <Icon name="sparkle" size={14} />
            This description was drafted with AI and reviewed by {org?.name}.
          </p>
        )}
        <h3 className="mt-6 text-[16px] font-semibold text-ink">Skills this role needs</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {internship.skillsRequired.map((s) => (
            <Chip key={s} tone={student?.skills.includes(s) ? "accent" : "neutral"}>
              {s}
            </Chip>
          ))}
        </div>
        {student && !student.skills.length && (
          <p className="mt-4 text-[13px] text-muted">
            Your profile has no skills tagged yet, so we can't show a match for this role.
          </p>
        )}
      </Card>

      {org && (
        <Card className="mt-6 p-5">
          <h2 className="text-[20px] font-semibold text-ink">About {org.name}</h2>
          <p className="mt-3 text-sm text-body">{org.about}</p>
        </Card>
      )}

      <div className="mt-8">
        <ActionBar>
          {application ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
                <Icon name="check-circle" size={16} />
                Applied {daysAgo(application.appliedOn)}
              </p>
              {Object.keys(application.scoreBySubtopic).length ? (
                <Link to="/student/report/$internshipId" params={{ internshipId }}>
                  <Button variant="secondary">See your report</Button>
                </Link>
              ) : (
                <Link to="/student/assessment/$internshipId" params={{ internshipId }} className="flex-1 sm:flex-none">
                  <Button full>Take the assessment</Button>
                </Link>
              )}
            </div>
          ) : (
            <Button full size="lg" disabled={submitting} onClick={apply} className="sm:w-auto">
              {submitting ? "Sending your application" : "Apply to this internship"}
            </Button>
          )}
        </ActionBar>
      </div>
    </div>
  );
}
