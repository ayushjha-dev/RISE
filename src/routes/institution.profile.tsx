import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Field, TextArea, TextInput } from "@/components/rise/primitives";
import { ErrorState, Skeleton } from "@/components/rise/feedback";
import { institutionsQuery, studentsQuery } from "@/lib/api";
import { useStore } from "@/lib/store";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/institution/profile")({
  head: () => ({
    meta: [
      { title: "Institution profile — RISE" },
      {
        name: "description",
        content: "Your institution details and the placement contact students and employers can reach.",
      },
      { property: "og:title", content: "Institution profile — RISE" },
      { property: "og:description", content: "Institution details and placement contact." },
    ],
  }),
  component: InstitutionProfile,
});

function InstitutionProfile() {
  const session = useStore((s) => s.session);
  const institutions = useQuery(institutionsQuery());
  const students = useQuery(studentsQuery());

  const institution = institutions.data?.find((i) => i.id === session?.id);
  const count = (students.data ?? []).filter((s) => s.institutionId === session?.id).length;

  if (institutions.isError) return <ErrorState onRetry={() => institutions.refetch()} />;
  if (institutions.isLoading || !institution) {
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
        role="institution"
        eyebrow="Institution portal"
        title="Institution profile"
        note="Employers see this when reviewing your students."
      />

      <Card className="p-5 sm:p-6" active>
        <h2 className="text-[20px] font-semibold text-ink">{institution.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {institution.city} — {institution.affiliation}
        </p>
        <p className="num mt-4 text-sm text-body">
          {count} student{count === 1 ? "" : "s"} registered on RISE
        </p>
      </Card>

      <Card className="mt-6 p-5">
        <div className="flex flex-col gap-5">
          <Field label="Placement cell email" htmlFor="iemail">
            <TextInput id="iemail" defaultValue={institution.email} />
          </Field>
          <Field label="Placement contact" htmlFor="icontact">
            <TextInput id="icontact" defaultValue={institution.placementOfficer} />
          </Field>
          <Field label="About the institution" htmlFor="iabout">
            <TextArea id="iabout" rows={4} defaultValue={institution.about} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
