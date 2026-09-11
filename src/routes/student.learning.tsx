import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Chip } from "@/components/rise/primitives";
import { EmptyState, ErrorState, ListSkeleton, ScoreRing } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { learningQuery } from "@/lib/api";
import { useApplications, useCurrentStudent } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";
import { Reveal } from "@/components/rise/reveal";
import { SkillMark } from "@/components/rise/brand";
import { scoreTone } from "@/lib/score-color";

export const Route = createFileRoute("/student/learning")({
  head: () => ({
    meta: [
      { title: "Learning, ordered by your weakest subtopics — RISE" },
      {
        name: "description",
        content:
          "NPTEL and Swayam courses grouped by skill, with the subtopics you scored lowest on surfaced first.",
      },
      { property: "og:title", content: "Learning, ordered by your weakest subtopics" },
      {
        property: "og:description",
        content: "NPTEL and Swayam courses, weakest subtopics first.",
      },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  const { student } = useCurrentStudent();
  const applications = useApplications();
  const links = useQuery(learningQuery());

  const scored = applications
    .filter((a) => a.studentId === student?.id && Object.keys(a.scoreBySubtopic).length > 0)
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
  const latest = scored[0];
  const scores = latest?.scoreBySubtopic ?? {};

  const groups = Object.entries(
    (links.data ?? []).reduce<Record<string, typeof links.data>>((acc, l) => {
      acc[l.skill] = [...(acc[l.skill] ?? []), l];
      return acc;
    }, {}),
  ).sort((a, b) => {
    const sa = scores[a[0]];
    const sb = scores[b[0]];
    if (sa !== undefined && sb !== undefined) return sa - sb;
    if (sa !== undefined) return -1;
    if (sb !== undefined) return 1;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div>
      <PageTitle
        role="student"
        eyebrow="Student portal"
        title="Learning"
        note={
          latest
            ? "Ordered by your most recent assessment: the subtopics you scored lowest on come first."
            : "Courses from NPTEL and Swayam, grouped by skill. Take an assessment and this list reorders around your weak areas."
        }
      />

      {links.isError ? (
        <ErrorState
          title="Couldn't load the course list — check your connection and try again."
          onRetry={() => links.refetch()}
        />
      ) : links.isLoading ? (
        <ListSkeleton rows={3} />
      ) : groups.length === 0 ? (
        <EmptyState
          variant="learning"
          title="No courses listed yet"
          note="Curated NPTEL and Swayam courses appear here once your skill gaps are known."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([skill, items], i) => {
            const score = scores[skill];
            return (
              <Reveal as="section" key={skill} delay={i * 70}>
                <div className="band grain grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[16px] border border-hairline px-4 py-4">
                  <SkillMark skill={skill} size={30} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="display-md">{skill}</h2>
                      {score !== undefined && score < 60 && (
                        <span
                          className="rounded-pill px-2.5 py-1 text-[12px] font-semibold"
                          style={{ background: scoreTone(score).soft, color: scoreTone(score).color }}
                        >
                          Focus area
                        </span>
                      )}
                    </div>
                    {score !== undefined && (
                      <p className="mt-1 text-[13px] text-muted">
                        You scored {score} on this subtopic in your last assessment.
                      </p>
                    )}
                  </div>
                  {score !== undefined ? (
                    <ScoreRing value={score} size={52} showTier />
                  ) : (
                    <span className="rounded-pill border border-dashed border-hairline px-2.5 py-1 text-[12px] font-semibold text-muted">
                      Not assessed
                    </span>
                  )}
                </div>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {(items ?? []).map((l) => (
                    <Card as="li" hover key={l.id} className="p-4">
                      <a href={l.url} target="_blank" rel="noreferrer" className="block">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 font-semibold text-ink">{l.title}</p>
                          <span className="shrink-0 text-muted">
                            <Icon name="external" size={16} />
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] text-muted">
                          {l.institute} — {l.weeks} weeks
                        </p>
                        <div className="mt-3">
                          <Chip>{l.provider}</Chip>
                        </div>
                      </a>
                    </Card>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
