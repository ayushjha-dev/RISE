import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button, Card, Chip, Select, StatusPill } from "@/components/rise/primitives";
import {
  Drawer,
  EmptyState,
  ErrorState,
  ListSkeleton,
  ScoreRing,
} from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { studentsQuery, institutionsQuery } from "@/lib/api";
import { actions, useStore, type Application } from "@/lib/store";
import { daysAgo, useApplications, useInternships } from "@/lib/portal";
import { useToast } from "@/components/rise/toast";
import { PageTitle } from "@/components/rise/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/organization/applicants")({
  head: () => ({
    meta: [
      { title: "Applicants ranked by score — RISE" },
      {
        name: "description",
        content:
          "Review every applicant with per-subtopic assessment scores, then shortlist or pass in one action.",
      },
      { property: "og:title", content: "Applicants ranked by score — RISE" },
      { property: "og:description", content: "Per-subtopic scores, shortlist in one action." },
    ],
  }),
  component: Applicants,
});

function Applicants() {
  const session = useStore((s) => s.session);
  const internships = useInternships();
  const applications = useApplications();
  const students = useQuery(studentsQuery());
  const institutions = useQuery(institutionsQuery());
  const toast = useToast();

  const [postingId, setPostingId] = useState("all");
  const [sortBy, setSortBy] = useState("overall");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = (internships.data ?? []).filter((i) => i.orgId === session?.id);
  const subtopics = ["JavaScript", "React", "SQL"];

  const rows = useMemo(() => {
    const list = applications.filter(
      (a) =>
        mine.some((i) => i.id === a.internshipId) &&
        (postingId === "all" || a.internshipId === postingId),
    );
    return list.sort((a, b) =>
      sortBy === "overall"
        ? b.overallScore - a.overallScore
        : (b.scoreBySubtopic[sortBy] ?? -1) - (a.scoreBySubtopic[sortBy] ?? -1),
    );
  }, [applications, mine, postingId, sortBy]);

  const open = rows.find((r) => r.id === openId);
  const studentOf = (a: Application) => students.data?.find((s) => s.id === a.studentId);
  const collegeOf = (a: Application) => {
    const s = studentOf(a);
    return institutions.data?.find((i) => i.id === s?.institutionId)?.name ?? "";
  };
  const postingOf = (a: Application) => mine.find((i) => i.id === a.internshipId)?.title ?? "";

  const decide = (a: Application, status: Application["status"]) => {
    if (busy) return;
    setBusy(true);
    actions.setStatus(a.id, status);
    toast.push(
      status === "shortlisted" ? "success" : "warning",
      status === "shortlisted" ? "Applicant shortlisted" : "Applicant passed over",
    );
    setTimeout(() => setBusy(false), 500);
  };

  if (internships.isError || students.isError) {
    return (
      <ErrorState
        title="Couldn't load applicants — check your connection and try again."
        onRetry={() => {
          internships.refetch();
          students.refetch();
        }}
      />
    );
  }

  return (
    <div>
      <PageTitle
        title="Applicants"
        note="Every applicant took the same assessment, so subtopic scores are directly comparable."
      />

      <div className="mb-5 grid gap-3 sm:flex sm:items-center">
        <div className="sm:w-72">
          <Select
            value={postingId}
            onChange={setPostingId}
            options={[
              { value: "all", label: "All postings" },
              ...mine.map((i) => ({ value: i.id, label: i.title })),
            ]}
          />
        </div>
        <div className="sm:w-56">
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "overall", label: "Sort by overall score" },
              ...subtopics.map((s) => ({ value: s, label: `Sort by ${s}` })),
            ]}
          />
        </div>
      </div>

      {students.isLoading || internships.isLoading ? (
        <ListSkeleton rows={4} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            mine.length
              ? `${postingId === "all" ? "None of your postings have" : "This posting has"} applicants yet. Matched students see it in their listing as soon as they open RISE.`
              : "There's nothing posted yet, so no one can apply."
          }
          action={
            <Link to={mine.length ? "/organization" : "/organization/post"}>
              <Button size="sm">{mine.length ? "Back to dashboard" : "Post internship"}</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden sm:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-surface-soft">
                  {["Applicant", "Posting", "Overall", ...subtopics, "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-[13px] font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setOpenId(a.id)}
                    className={cn(
                      "cursor-pointer border-b border-hairline transition-colors last:border-0",
                      openId === a.id ? "bg-accent-soft" : "hover:bg-surface-soft",
                    )}
                  >
                    <td className="max-w-[220px] px-4 py-3">
                      <p className="truncate font-semibold text-ink">{studentOf(a)?.name}</p>
                      <p className="truncate text-[13px] text-muted">{collegeOf(a)}</p>
                    </td>
                    <td className="max-w-[180px] px-4 py-3">
                      <p className="truncate text-sm text-body">{postingOf(a)}</p>
                    </td>
                    <td className="px-4 py-3">
                      {Object.keys(a.scoreBySubtopic).length ? (
                        <ScoreRing value={a.overallScore} size={44} animate={false} />
                      ) : (
                        <span className="text-[13px] text-muted">Pending</span>
                      )}
                    </td>
                    {subtopics.map((s) => (
                      <td key={s} className="num px-4 py-3 text-sm text-body">
                        {a.scoreBySubtopic[s] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          aria-label="Shortlist applicant"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(a, "shortlisted");
                          }}
                          disabled={busy || a.status === "shortlisted"}
                          className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-success disabled:opacity-40"
                        >
                          <Icon name="check" size={16} />
                        </button>
                        <button
                          aria-label="Pass over applicant"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(a, "rejected");
                          }}
                          disabled={busy || a.status === "rejected"}
                          className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted disabled:opacity-40"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {rows.map((a) => (
              <Card as="li" key={a.id} className="p-4">
                <button className="w-full text-left" onClick={() => setOpenId(a.id)}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{studentOf(a)?.name}</p>
                      <p className="truncate text-[13px] text-muted">{postingOf(a)}</p>
                      <div className="mt-2">
                        <StatusPill status={a.status} />
                      </div>
                    </div>
                    {Object.keys(a.scoreBySubtopic).length ? (
                      <ScoreRing value={a.overallScore} size={48} animate={false} />
                    ) : (
                      <span className="text-[13px] text-muted">Pending</span>
                    )}
                  </div>
                </button>
                <div className="mt-3 flex gap-2 border-t border-hairline pt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={busy || a.status === "shortlisted"}
                    onClick={() => decide(a, "shortlisted")}
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy || a.status === "rejected"}
                    onClick={() => decide(a, "rejected")}
                  >
                    Pass
                  </Button>
                </div>
              </Card>
            ))}
          </ul>
        </>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? (studentOf(open)?.name ?? "Applicant") : ""}
        subtitle={open ? `${postingOf(open)} — applied ${daysAgo(open.appliedOn)}` : undefined}
        footer={
          open && (
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={busy || open.status === "shortlisted"}
                onClick={() => decide(open, "shortlisted")}
              >
                Shortlist applicant
              </Button>
              <Button
                variant="danger"
                disabled={busy || open.status === "rejected"}
                onClick={() => decide(open, "rejected")}
              >
                Pass
              </Button>
            </div>
          )
        }
      >
        {open && (
          <div>
            <div className="flex items-center justify-between gap-4">
              <StatusPill status={open.status} />
              {studentOf(open)?.abcVerified && (
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-success">
                  <Icon name="check-circle" size={15} />
                  Identity verified
                </span>
              )}
            </div>

            <div className="mt-5 rounded-[14px] border border-hairline bg-canvas p-4">
              <p className="text-[13px] text-muted">{collegeOf(open)}</p>
              <p className="mt-1 text-sm text-body break-words">{studentOf(open)?.year}</p>
              <p className="mt-1 text-[13px] break-all text-muted">{studentOf(open)?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(studentOf(open)?.skills ?? []).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
                {!(studentOf(open)?.skills ?? []).length && (
                  <p className="text-[13px] text-muted">No skills tagged on this profile.</p>
                )}
              </div>
            </div>

            <h3 className="mt-6 text-[16px] font-semibold text-ink">Assessment</h3>
            {Object.keys(open.scoreBySubtopic).length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                This applicant hasn't taken the assessment yet, so there's no score to compare.
              </p>
            ) : (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <ScoreRing value={open.overallScore} size={72} />
                  <p className="text-sm text-body">
                    Overall score across {Object.keys(open.scoreBySubtopic).length} subtopics.
                  </p>
                </div>
                <ul className="mt-5 flex flex-col gap-4">
                  {Object.entries(open.scoreBySubtopic).map(([name, value]) => (
                    <li key={name} className="flex items-center gap-4">
                      <ScoreRing value={value} size={48} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{name}</p>
                        <p className="text-[13px] text-muted">
                          {value >= 80 ? "Strong" : value >= 60 ? "Adequate" : "Needs work"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(studentOf(open)?.resumeUrl || studentOf(open)?.linkedinUrl || studentOf(open)?.githubUrl) && (
              <div className="mt-6">
                <h3 className="text-[16px] font-semibold text-ink">Profile & Resume</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {studentOf(open)?.resumeUrl && (
                    <a
                      href={`/resumes/${studentOf(open)?.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-[10px] border border-hairline bg-surface px-3 py-2.5 text-sm text-body transition-colors hover:bg-surface-soft"
                    >
                      <Icon name="clipboard" size={16} className="text-accent" />
                      <span className="flex-1 truncate">{studentOf(open)?.resumeUrl}</span>
                      <Icon name="external" size={14} className="shrink-0 text-muted" />
                    </a>
                  )}
                  {studentOf(open)?.linkedinUrl && (
                    <a
                      href={studentOf(open)?.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-[10px] border border-hairline bg-surface px-3 py-2.5 text-sm text-body transition-colors hover:bg-surface-soft"
                    >
                      <Icon name="external" size={16} className="text-accent" />
                      <span className="flex-1 truncate">LinkedIn Profile</span>
                      <Icon name="external" size={14} className="shrink-0 text-muted" />
                    </a>
                  )}
                  {studentOf(open)?.githubUrl && (
                    <a
                      href={studentOf(open)?.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-[10px] border border-hairline bg-surface px-3 py-2.5 text-sm text-body transition-colors hover:bg-surface-soft"
                    >
                      <Icon name="external" size={16} className="text-accent" />
                      <span className="flex-1 truncate">GitHub Profile</span>
                      <Icon name="external" size={14} className="shrink-0 text-muted" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
