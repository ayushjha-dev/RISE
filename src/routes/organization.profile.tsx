import { createFileRoute } from "@tanstack/react-router";
import { Card, Chip, Field, TextArea, TextInput, Toggle } from "@/components/rise/primitives";
import { ErrorState, Skeleton } from "@/components/rise/feedback";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useInternships, useOrganizations } from "@/lib/portal";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/organization/profile")({
  head: () => ({
    meta: [
      { title: "Organization profile — RISE" },
      {
        name: "description",
        content: "Your organization details as students see them, plus every posting you have live.",
      },
      { property: "og:title", content: "Organization profile — RISE" },
      { property: "og:description", content: "Your details as students see them, plus live postings." },
    ],
  }),
  component: OrgProfile,
});

function OrgProfile() {
  const session = useStore((s) => s.session);
  const orgs = useOrganizations();
  const internships = useInternships();
  const [accepting, setAccepting] = useState(true);

  const org = orgs.data?.find((o) => o.id === session?.id);
  const mine = (internships.data ?? []).filter((i) => i.orgId === session?.id);

  if (orgs.isError) return <ErrorState onRetry={() => orgs.refetch()} />;
  if (orgs.isLoading || !org) {
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-6 h-48 w-full rounded-[14px]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageTitle
        role="organization"
        eyebrow="Organization portal"
        title="Organization profile"
        note="Students see this alongside every posting you publish."
      />

      <Card className="p-5 sm:p-6" active>
        <h2 className="text-[20px] font-semibold text-ink">{org.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {org.industry} — {org.city}
        </p>
        <p className="mt-4 text-sm text-body">{org.about}</p>
      </Card>

      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-5">
          <Field label="Contact email" htmlFor="oemail">
            <TextInput id="oemail" defaultValue={org.email} />
          </Field>
          <Field label="About your organization" htmlFor="oabout">
            <TextArea id="oabout" rows={4} defaultValue={org.about} />
          </Field>
          <Toggle checked={accepting} onChange={setAccepting} label="Accepting applications is" />
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-[20px] font-semibold text-ink">Your postings</h2>
        <ul className="mt-4 flex flex-col divide-y divide-hairline">
          {mine.map((i) => (
            <li key={i.id} className="py-3.5">
              <p className="truncate font-semibold text-ink">{i.title}</p>
              <p className="text-[13px] text-muted">
                {i.location} — {i.duration}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {i.skillsRequired.slice(0, 4).map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
                {i.skillsRequired.length > 4 && <Chip>{`+${i.skillsRequired.length - 4} more`}</Chip>}
              </div>
            </li>
          ))}
          {mine.length === 0 && (
            <li className="py-3.5 text-sm text-muted">You don't have any live postings yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
