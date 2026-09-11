import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, Chip, Dropzone, Field, TextInput, Toggle } from "@/components/rise/primitives";
import { DigitInput, ErrorState, Skeleton } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { verifyAbcId } from "@/lib/api";
import { actions, useStore } from "@/lib/store";
import { useCurrentStudent } from "@/lib/portal";
import { useToast } from "@/components/rise/toast";
import { PageTitle } from "@/components/rise/shell";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "Your RISE profile" },
      {
        name: "description",
        content:
          "Keep your skills, resume and availability current — matching and applicant ranking run on this profile.",
      },
      { property: "og:title", content: "Your RISE profile" },
      { property: "og:description", content: "Skills, resume and availability in one place." },
    ],
  }),
  component: ProfilePage,
});

const skillChoices = ["React", "JavaScript", "TypeScript", "Node", "SQL", "Python", "CSS", "Testing", "Docker", "Data analysis"];

function ProfilePage() {
  const { student, isLoading, isError, refetch } = useCurrentStudent();
  const extras = useStore((s) => s.extraStudents);
  const toast = useToast();

  const [skills, setSkills] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [resume, setResume] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [abcId, setAbcId] = useState("");
  const [abcState, setAbcState] = useState<"idle" | "checking" | "verified" | "failed">("idle");
  const [abcError, setAbcError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!student) return;
    setSkills(student.skills);
    setAvailable(student.availableForInternships);
    setResume(student.resumeUrl);
    setLinkedinUrl(student.linkedinUrl || "");
    setGithubUrl(student.githubUrl || "");
    setAbcId(student.abcId);
    setAbcState(student.abcVerified ? "verified" : "idle");
  }, [student?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !student) {
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-6 h-48 w-full rounded-[14px]" />
      </div>
    );
  }

  const isLocal = extras.some((e) => e.id === student.id);

  const save = () => {
    if (saving) return;
    setSaving(true);
    if (isLocal) {
      actions.updateStudent(student.id, {
        skills,
        availableForInternships: available,
        resumeUrl: resume,
        linkedinUrl,
        githubUrl,
        abcVerified: abcState === "verified",
        abcId,
      });
    }
    toast.push("success", "Profile saved");
    setTimeout(() => setSaving(false), 400);
  };

  const verify = async () => {
    setAbcState("checking");
    setAbcError("");
    const res = await verifyAbcId(abcId);
    if (res.ok) {
      setAbcState("verified");
      toast.push("success", "ABC ID verified");
    } else {
      setAbcState("failed");
      setAbcError(res.message ?? "We couldn't verify that ID.");
    }
  };

  return (
    <div className="max-w-3xl pb-24 sm:pb-0">
      <PageTitle
        role="student"
        eyebrow="Student portal"
        title="Your profile"
        note="This is what organizations see when you apply."
      />

      <Card className="p-5 sm:p-6" active>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-semibold text-ink">{student.name}</h2>
            <p className="truncate text-sm text-muted">{student.email}</p>
            <p className="mt-2 text-sm text-body">{student.year}</p>
          </div>
          {abcState === "verified" && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-pill border border-hairline bg-surface px-3 py-1.5 text-[13px] font-semibold text-success">
              <Icon name="check-circle" size={15} />
              Verified
            </span>
          )}
        </div>
      </Card>

      {abcState !== "verified" && (
        <Card className="mt-6 p-5">
          <h2 className="text-[20px] font-semibold text-ink">Verify your ABC ID</h2>
          <p className="mt-1.5 text-sm text-muted">
            Twelve digits, as printed on your Academic Bank of Credits card.
          </p>
          <div className="mt-5">
            <DigitInput value={abcId} onChange={setAbcId} state={abcState} />
          </div>
          {abcState === "failed" && (
            <p className="mt-3 flex items-center gap-1.5 text-[13px] text-error">
              <Icon name="alert" size={14} />
              {abcError}
            </p>
          )}
          <div className="mt-5">
            <Button
              onClick={verify}
              disabled={abcId.replace(/\D/g, "").length !== 12 || abcState === "checking"}
            >
              {abcState === "checking" ? "Checking your ID" : "Verify ID"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="mt-6 p-5">
        <h2 className="text-[20px] font-semibold text-ink">Skills</h2>
        <p className="mt-1.5 text-sm text-muted">
          Matching is skill overlap, so keep this list honest and current.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {skillChoices.map((s) => {
            const on = skills.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setSkills((cur) => (on ? cur.filter((x) => x !== s) : [...cur, s]))}
                className={
                  "min-h-11 rounded-pill border px-3.5 text-[13px] font-semibold transition-colors duration-150 " +
                  (on
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-hairline bg-surface text-body hover:bg-surface-soft")
                }
              >
                {s}
              </button>
            );
          })}
        </div>
        {skills.length === 0 && (
          <p className="mt-4 text-[13px] text-warning">
            With no skills selected you won't be matched to any internship.
          </p>
        )}
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-[20px] font-semibold text-ink">Resume</h2>
        <div className="mt-4">
          <Dropzone fileName={resume || undefined} onFile={setResume} />
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-[20px] font-semibold text-ink">Professional profiles</h2>
        <p className="mt-1.5 text-sm text-muted">
          Organizations can view your LinkedIn and GitHub profiles to better assess your work.
        </p>
        <div className="mt-5 space-y-4">
          <Field label="LinkedIn profile URL" htmlFor="linkedin">
            <TextInput
              id="linkedin"
              placeholder="https://linkedin.com/in/your-profile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
            />
          </Field>
          <Field label="GitHub profile URL" htmlFor="github">
            <TextInput
              id="github"
              placeholder="https://github.com/your-username"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="mt-6 p-5">
        <h2 className="text-[20px] font-semibold text-ink">Availability</h2>
        <div className="mt-3">
          <Toggle
            checked={available}
            onChange={setAvailable}
            label="Available for internships is"
          />
        </div>
        <div className="mt-5">
          <Field label="Contact email" htmlFor="pemail">
            <TextInput id="pemail" defaultValue={student.email} />
          </Field>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-[72px] z-40 border-t border-hairline bg-surface px-5 py-3 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0">
        <Button full className="sm:w-auto" disabled={saving} onClick={save}>
          {saving ? "Saving your profile" : "Save profile"}
        </Button>
      </div>
    </div>
  );
}
