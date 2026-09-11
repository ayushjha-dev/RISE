import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, Chip, StatusPill, TextInput } from "@/components/rise/primitives";
import { Drawer, EmptyState, ErrorState, ListSkeleton, ScoreRing } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { studentsQuery } from "@/lib/api";
import { useStore } from "@/lib/store";
import { daysAgo, useApplications, useInternships } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/institution/students")({
  head: () => ({
    meta: [
      { title: "Students — RISE for institutions" },
      {
        name: "description",
        content:
          "Search your students, open any profile, and see their applications and assessment scores side by side.",
      },
      { property: "og:title", content: "Students — RISE for institutions" },
      { property: "og:description", content: "Search students and review applications and scores." },
    ],
  }),
  component: InstitutionStudents,
});

function InstitutionStudents() {
  const session = useStore((s) => s.session);
  const students = useQuery(studentsQuery());
  const applications = useApplications();
  const internships = useInternships();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const mine = useMemo(
    () => (students.data ?? []).filter((s) => s.institutionId === session?.id),
    [students.data, session?.id],
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return mine;
    return mine.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.skills.some((k) => k.toLowerCase().includes(term)) ||
        s.year.toLowerCase().includes(term),
    );
  }, [mine, q]);

  const appsOf = (id: string) => applications.filter((a) => a.studentId === id);
  const scoreOf = (id: string) => {
    const scored = appsOf(id).filter((a) => Object.keys(a.scoreBySubtopic).length > 0);
    if (!scored.length) return null;
    return Math.round(scored.reduce((t, a) => t + a.overallScore, 0) / scored.length);
  };
  const open = mine.find((s) => s.id === openId);

  if (students.isError) return <ErrorState onRetry={() => students.refetch()} />;

  return (
    <div>
      <PageTitle
        role="institution"
        eyebrow="Institution portal"
        title="Students"
        note="Open any student to see their applications and assessment detail."
      />

      <div className="mb-5 max-w-md">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, year or skill"
          aria-label="Search students"
        />
      </div>

      {students.isLoading ? (
        <ListSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={
            mine.length
              ? `No student matches "${q.trim()}". Try a different name, year or skill.`
              : "No students from your institution have registered on RISE yet."
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => {
            const score = scoreOf(s.id);
            const apps = appsOf(s.id);
            return (
              <Card as="li" key={s.id} className={cn("p-0", openId === s.id && "border-accent")}>
                <button className="w-full p-5 text-left" onClick={() => setOpenId(s.id)}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <p className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate font-semibold text-ink">{s.name}</span>
                        {s.abcVerified && (
                          <Icon name="check-circle" size={15} className="shrink-0 text-success" />
                        )}
                      </p>
                      <p className="truncate text-[13px] text-muted">{s.year}</p>
                    </div>
                    {score == null ? (
                      <span className="shrink-0 text-[13px] text-muted">No score</span>
                    ) : (
                      <ScoreRing value={score} size={52} animate={false} />
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.skills.slice(0, 3).map((k) => (
                      <Chip key={k}>{k}</Chip>
                    ))}
                    {s.skills.length === 0 && (
                      <p className="text-[13px] text-muted">No skills tagged yet.</p>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] text-muted">
                    {apps.length === 0
                      ? "Hasn't applied anywhere yet"
                      : `${apps.length} application${apps.length > 1 ? "s" : ""}`}
                  </p>
                </button>
              </Card>
            );
          })}
        </ul>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ""}
        subtitle={open?.year}
      >
        {open && (
          <div>
            <p className="text-[13px] break-all text-muted">{open.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {open.skills.map((k) => (
                <Chip key={k}>{k}</Chip>
              ))}
              {open.skills.length === 0 && (
                <p className="text-[13px] text-muted">This student hasn't tagged any skills yet.</p>
              )}
            </div>

            <h3 className="mt-6 text-[16px] font-semibold text-ink">Applications</h3>
            {appsOf(open.id).length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                This student hasn't applied to any internship yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-hairline">
                {appsOf(open.id).map((a) => {
                  const internship = internships.data?.find((i) => i.id === a.internshipId);
                  const scored = Object.keys(a.scoreBySubtopic).length > 0;
                  return (
                    <li key={a.id} className="py-4">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {internship?.title ?? "Internship"}
                          </p>
                          <p className="text-[13px] text-muted">Applied {daysAgo(a.appliedOn)}</p>
                          <div className="mt-2">
                            <StatusPill status={a.status} />
                          </div>
                        </div>
                        {scored ? (
                          <ScoreRing value={a.overallScore} size={52} />
                        ) : (
                          <span className="text-[13px] text-muted">Not assessed</span>
                        )}
                      </div>
                      {scored && (
                        <ul className="mt-3 flex flex-wrap gap-4">
                          {Object.entries(a.scoreBySubtopic).map(([name, value]) => (
                            <li key={name} className="flex items-center gap-2">
                              <ScoreRing value={value} size={40} animate={false} />
                              <span className="text-[13px] text-body">{name}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
