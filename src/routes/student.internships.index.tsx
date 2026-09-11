import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button, Card, Checkbox, Chip, Tabs } from "@/components/rise/primitives";
import {
  EmptyState,
  ErrorState,
  ListSkeleton,
  ScoreRing,
} from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { matchScore } from "@/lib/api";
import { useApplications, useCurrentStudent, useInternships, useOrganizations } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/student/internships/")({
  head: () => ({
    meta: [
      { title: "Internships matched to your skills — RISE" },
      {
        name: "description",
        content:
          "Browse open internships, filtered by skill, and see how closely each role matches your profile.",
      },
      { property: "og:title", content: "Internships matched to your skills" },
      {
        property: "og:description",
        content: "Filter open internships by skill and see your match on each role.",
      },
    ],
  }),
  component: InternshipList,
});

const allSkills = ["React", "JavaScript", "TypeScript", "Node", "SQL", "Python", "CSS", "Testing", "Docker", "Data analysis"];

function InternshipList() {
  const { student } = useCurrentStudent();
  const internships = useInternships();
  const orgs = useOrganizations();
  const applications = useApplications();
  const [filters, setFilters] = useState<string[]>([]);
  const [sort, setSort] = useState("match");
  const [sheetOpen, setSheetOpen] = useState(false);

  const orgName = (id: string) => orgs.data?.find((o) => o.id === id)?.name ?? "";

  const rows = useMemo(() => {
    const list = (internships.data ?? [])
      .filter((i) => !filters.length || filters.some((f) => i.skillsRequired.includes(f)))
      .map((i) => ({ i, m: matchScore(student?.skills ?? [], i.skillsRequired) }));
    return sort === "match"
      ? list.sort((a, b) => (b.m ?? -1) - (a.m ?? -1))
      : list.sort((a, b) => b.i.postedOn.localeCompare(a.i.postedOn));
  }, [internships.data, filters, sort, student?.skills]);

  const filterPanel = (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-ink">Filter by skill</p>
        {filters.length > 0 && (
          <button onClick={() => setFilters([])} className="text-[13px] font-semibold text-ink underline">
            Clear all
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-col">
        {allSkills.map((s) => (
          <Checkbox
            key={s}
            label={s}
            checked={filters.includes(s)}
            onChange={(v) => setFilters((cur) => (v ? [...cur, s] : cur.filter((x) => x !== s)))}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <PageTitle
        title="Open internships"
        note="Match is the share of a role's required skills that are already on your profile."
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <Tabs
          value={sort}
          onChange={setSort}
          items={[
            { value: "match", label: "Best match" },
            { value: "recent", label: "Most recent" },
          ]}
        />
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
          <Icon name="filter" size={16} />
          Filters{filters.length ? ` (${filters.length})` : ""}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card className="p-5">{filterPanel}</Card>
        </aside>

        <div>
          {internships.isError ? (
            <ErrorState
              title="Couldn't load internships — check your connection and try again."
              onRetry={() => internships.refetch()}
            />
          ) : internships.isLoading ? (
            <ListSkeleton rows={4} />
          ) : rows.length === 0 ? (
            <EmptyState
              variant="search"
              title="No internships match those filters. Clear a filter to widen the search."
              action={
                <Button size="sm" onClick={() => setFilters([])}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {rows.map(({ i, m }) => {
                const applied = applications.some(
                  (a) => a.studentId === student?.id && a.internshipId === i.id,
                );
                return (
                  <Card as="li" key={i.id} className="transition-colors hover:bg-surface-soft">
                    <Link
                      to="/student/internships/$internshipId"
                      params={{ internshipId: i.id }}
                      className="block p-5"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-[16px] font-semibold text-ink">{i.title}</p>
                          <p className="truncate text-[13px] text-muted">{orgName(i.orgId)}</p>
                        </div>
                        {m === null ? (
                          <span className="text-[13px] text-muted">Match unavailable</span>
                        ) : (
                          <ScoreRing value={m} size={48} label="match" />
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                        <span className="flex items-center gap-1.5">
                          <Icon name="location" size={14} />
                          {i.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="clock" size={14} />
                          {i.duration}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-body">{i.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {i.skillsRequired.slice(0, 3).map((s) => (
                          <Chip key={s} tone={student?.skills.includes(s) ? "accent" : "neutral"}>
                            {s}
                          </Chip>
                        ))}
                        {i.skillsRequired.length > 3 && <Chip>{`+${i.skillsRequired.length - 3} more`}</Chip>}
                        {applied && (
                          <span className="ml-auto flex items-center gap-1.5 text-[13px] font-semibold text-success">
                            <Icon name="check-circle" size={14} />
                            Applied
                          </span>
                        )}
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="anim-fade absolute inset-0 bg-[rgba(20,19,17,0.35)]"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="raised absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[20px] bg-surface p-5"
            style={{ animation: "rise-slide-up 280ms cubic-bezier(0.16,1,0.3,1)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Filter internships"
          >
            {filterPanel}
            <div className="mt-5">
              <Button full onClick={() => setSheetOpen(false)}>
                Show {rows.length} internships
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
