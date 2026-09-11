import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button, Card, RadioOption } from "@/components/rise/primitives";
import { ErrorState, Skeleton } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { assessmentQuery } from "@/lib/api";
import { actions } from "@/lib/store";
import { useApplications, useCurrentStudent, useInternships } from "@/lib/portal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/student/assessment/$internshipId")({
  head: () => ({
    meta: [
      { title: "Skill assessment — RISE" },
      {
        name: "description",
        content:
          "Answer a short set of questions per subtopic so organizations can rank you on what you can do.",
      },
      { property: "og:title", content: "Skill assessment — RISE" },
      { property: "og:description", content: "A short assessment, scored per subtopic." },
    ],
  }),
  component: AssessmentFlow,
});

type Flat = { subtopic: string; q: string; options: string[]; correctIndex: number };

function AssessmentFlow() {
  const { internshipId } = Route.useParams();
  const { student } = useCurrentStudent();
  const internships = useInternships();
  const applications = useApplications();
  const navigate = useNavigate();

  const internship = internships.data?.find((i) => i.id === internshipId);
  const assessment = useQuery(assessmentQuery(internship?.assessmentId ?? "asmt-web"));

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finishing, setFinishing] = useState(false);

  const flat: Flat[] = useMemo(() => {
    const list: Flat[] = [];
    for (const st of assessment.data?.subtopics ?? []) {
      for (const q of st.questions) {
        list.push({ subtopic: st.name, q: q.q, options: q.options, correctIndex: q.correctIndex });
      }
    }
    return list;
  }, [assessment.data]);

  const application = applications.find(
    (a) => a.studentId === student?.id && a.internshipId === internshipId,
  );

  if (assessment.isError || internships.isError) {
    return <ErrorState title="Couldn't load the assessment — try again." onRetry={() => assessment.refetch()} />;
  }

  if (assessment.isLoading || internships.isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="h-2 w-full rounded-pill" />
        <Skeleton className="mt-8 h-6 w-3/4" />
        <div className="mt-6 flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <ErrorState
        title="Apply to this internship first — the assessment is scored against that application."
        onRetry={() => navigate({ to: "/student/internships/$internshipId", params: { internshipId } })}
      />
    );
  }

  if (!flat.length) {
    return <ErrorState title="This role has no assessment attached yet." />;
  }

  const current = flat[index]!;
  const subtopics = [...new Set(flat.map((f) => f.subtopic))];
  const answeredAll = Object.keys(answers).length === flat.length;

  const finish = () => {
    if (finishing || !student) return;
    setFinishing(true);
    const scores: Record<string, number> = {};
    for (const st of subtopics) {
      const idxs = flat.map((f, i) => ({ f, i })).filter((x) => x.f.subtopic === st);
      const right = idxs.filter((x) => answers[x.i] === x.f.correctIndex).length;
      scores[st] = Math.round((right / idxs.length) * 100);
    }
    actions.recordScores(student.id, internshipId, scores);
    // A deliberate beat between "you've finished" and "here's how you did".
    setTimeout(() => navigate({ to: "/student/report/$internshipId", params: { internshipId } }), 1300);
  };

  if (finishing) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="anim-in text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent-soft text-accent">
            <Icon name="check-circle" size={34} />
          </span>
          <h1 className="display-md mt-6">Answers recorded</h1>
          <p className="mt-2 text-sm text-muted">Scoring each subtopic, one moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-24 sm:pb-0">
      {/* Mobile: slim progress bar with the current subtopic named */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between">
          <p className="text-[13px] font-semibold text-ink">{current.subtopic}</p>
          <p className="num text-[13px] text-muted">
            {index + 1} of {flat.length}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface-strong">
          <div
            className="h-full rounded-pill bg-accent"
            style={{ width: `${((index + 1) / flat.length) * 100}%`, transition: "width 240ms ease-out" }}
          />
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div>
          <p className="mt-6 hidden text-[13px] font-semibold text-muted sm:block">
            {internship?.title} assessment
          </p>
          <h1 className="display-md mt-3 sm:mt-2">{current.q}</h1>

          <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Answer options">
            {current.options.map((o, i) => (
              <RadioOption
                key={o}
                large
                selected={answers[index] === i}
                onSelect={() => setAnswers((a) => ({ ...a, [index]: i }))}
              >
                {o}
              </RadioOption>
            ))}
          </div>

          <div className="fixed inset-x-0 bottom-[72px] z-40 flex items-center gap-3 border-t border-hairline bg-surface px-5 py-3 sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:px-0">
            {index > 0 && (
              <Button variant="secondary" onClick={() => setIndex((i) => i - 1)}>
                Previous
              </Button>
            )}
            {index < flat.length - 1 ? (
              <Button
                className="flex-1 sm:flex-none"
                disabled={answers[index] === undefined}
                onClick={() => setIndex((i) => i + 1)}
              >
                Next question
              </Button>
            ) : (
              <Button className="flex-1 sm:flex-none" disabled={!answeredAll} onClick={finish}>
                Submit assessment
              </Button>
            )}
          </div>
        </div>

        {/* Desktop: persistent subtopic rail */}
        <aside className="hidden sm:block">
          <Card className="p-4">
            <p className="text-[13px] font-semibold text-muted">Progress</p>
            <ul className="mt-3 flex flex-col gap-3">
              {subtopics.map((st) => {
                const idxs = flat.map((f, i) => ({ f, i })).filter((x) => x.f.subtopic === st);
                const answered = idxs.filter((x) => answers[x.i] !== undefined).length;
                const active = st === current.subtopic;
                return (
                  <li key={st}>
                    <div className="flex items-baseline justify-between">
                      <p className={cn("text-[13px] font-semibold", active ? "text-ink" : "text-muted")}>
                        {st}
                      </p>
                      <p className="num text-[13px] text-muted">
                        {answered}/{idxs.length}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-surface-strong">
                      <div
                        className="h-full rounded-pill bg-accent"
                        style={{
                          width: `${(answered / idxs.length) * 100}%`,
                          transition: "width 240ms ease-out",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-hairline pt-3 text-[13px] text-muted">
              You can move back and change an answer until you submit.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
