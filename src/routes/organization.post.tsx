import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Card, Chip, Field, Select, TextArea, TextInput } from "@/components/rise/primitives";
import { Icon } from "@/components/rise/icons";
import { generateJd } from "@/lib/jd.functions";
import { actions, useStore } from "@/lib/store";
import { useToast } from "@/components/rise/toast";
import { PageTitle } from "@/components/rise/shell";
import { useInternships } from "@/lib/portal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/organization/post")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      edit: typeof search.edit === "string" ? search.edit : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Post an internship — RISE" },
      {
        name: "description",
        content:
          "Write an internship posting yourself or draft it with AI, then review and edit every field before it goes live.",
      },
      { property: "og:title", content: "Post an internship — RISE" },
      { property: "og:description", content: "Write it yourself or draft with AI, then review before posting." },
    ],
  }),
  component: PostInternship,
});

const skillChoices = ["React", "JavaScript", "TypeScript", "Node", "SQL", "Python", "CSS", "Testing", "Docker", "Data analysis"];

function PostInternship() {
  const session = useStore((s) => s.session);
  const navigate = useNavigate();
  const toast = useToast();
  const { edit } = Route.useSearch();
  const internships = useInternships();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [stipend, setStipend] = useState("");
  const [aiDrafted, setAiDrafted] = useState(false);
  const [posting, setPosting] = useState(false);

  const editingInternship = edit
    ? (internships.data ?? []).find((i) => i.id === edit && i.orgId === session?.id)
    : null;

  useEffect(() => {
    if (editingInternship) {
      setTitle(editingInternship.title);
      setDescription(editingInternship.description);
      setSkills(editingInternship.skillsRequired);
      setLocation(editingInternship.location);
      setDuration(editingInternship.duration);
      setStipend(editingInternship.stipend);
      setAiDrafted(editingInternship.aiGenerated);
    }
  }, [editingInternship?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = useServerFn(generateJd);
  const draft = useMutation({
    mutationFn: (input: { role: string; skills: string[] }) => generate({ data: input }),
    onSuccess: (data) => {
      setTitle(data.title);
      setDescription(data.description);
      setSkills((cur) => [...new Set([...cur, ...data.skills])].slice(0, 8));
      setAiDrafted(true);
    },
  });

  const ready = title.trim().length > 2 && description.trim().length > 30 && skills.length > 0;

  const post = () => {
    if (posting || !ready || !session) return;
    setPosting(true);
    
    if (editingInternship) {
      actions.updateInternship(editingInternship.id, {
        title: title.trim(),
        location: location || "Remote",
        duration: duration || "6 months",
        stipend: stipend || "Stipend on discussion",
        skillsRequired: skills,
        description: description.trim(),
        aiGenerated: aiDrafted,
      });
      toast.push("success", "Internship updated");
    } else {
      actions.addInternship({
        id: `int-new-${Date.now()}`,
        orgId: session.id,
        title: title.trim(),
        location: location || "Remote",
        duration: duration || "6 months",
        stipend: stipend || "Stipend on discussion",
        skillsRequired: skills,
        description: description.trim(),
        aiGenerated: aiDrafted,
        assessmentId: "asmt-web",
        postedOn: new Date().toISOString().slice(0, 10),
      });
      toast.push("success", "Internship posted");
    }
    
    setTimeout(() => navigate({ to: "/organization" }), 400);
  };

  return (
    <div className="max-w-3xl pb-24 sm:pb-0">
      <PageTitle
        title={editingInternship ? "Edit internship" : "Post an internship"}
        note={
          editingInternship
            ? "Update any field and save changes. The posting remains live while you edit."
            : "Draft it with AI or write it yourself. Either way you review and edit every field before it goes live."
        }
      />

      <Card className="p-5 sm:p-6" active>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 font-semibold text-ink">
              <Icon name="sparkle" size={18} />
              Draft with AI
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Give a role name and the skills, and we'll draft a description you can edit.
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={draft.isPending || title.trim().length < 3 || skills.length === 0}
            onClick={() => draft.mutate({ role: title.trim(), skills })}
          >
            {draft.isPending ? (
              <>
                <span
                  className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                  style={{ animation: "spin 700ms linear infinite" }}
                />
                Generating
              </>
            ) : (
              "Generate with AI"
            )}
          </Button>
        </div>
        {draft.isError && (
          <p className="mt-4 flex items-start gap-2 text-[13px] text-error">
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            {(draft.error as Error).message ||
              "Couldn't generate a description — try again, or write it manually below."}
          </p>
        )}
        {title.trim().length < 3 && (
          <p className="mt-4 text-[13px] text-muted">
            Enter a role title and at least one skill below to enable AI drafting.
          </p>
        )}
      </Card>

      <div className={cn("mt-6 transition-opacity duration-200", draft.isPending && "opacity-60")}>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <Field label="Role title" htmlFor="title">
              <TextInput
                id="title"
                value={title}
                placeholder="Frontend Engineering Intern"
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <div>
              <p className="text-[13px] font-semibold tracking-[0.2px] text-ink">Skills required</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[...new Set([...skillChoices, ...skills])].map((s) => {
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
            </div>

            <Field
              label="Description"
              htmlFor="description"
              hint={
                aiDrafted
                  ? undefined
                  : "Describe the actual work: what the intern will own, and who they'll work with."
              }
            >
              <TextArea
                id="description"
                rows={7}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                placeholder="You will work on…"
              />
            </Field>
            {aiDrafted && (
              <div className="-mt-2 flex flex-wrap items-center gap-3">
                <p className="flex items-center gap-1.5 text-[13px] text-muted">
                  <Icon name="sparkle" size={14} />
                  Drafted with AI — edit anything before posting.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={draft.isPending}
                  onClick={() => draft.mutate({ role: title.trim(), skills })}
                >
                  Regenerate
                </Button>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Location">
                <Select
                  value={location}
                  onChange={setLocation}
                  placeholder="Select a work location"
                  options={[
                    { value: "Chennai, hybrid", label: "Chennai, hybrid" },
                    { value: "Pune, on-site", label: "Pune, on-site" },
                    { value: "Bengaluru, hybrid", label: "Bengaluru, hybrid" },
                    { value: "Hyderabad, on-site", label: "Hyderabad, on-site" },
                    { value: "Remote", label: "Remote" },
                  ]}
                />
              </Field>
              <Field label="Duration">
                <Select
                  value={duration}
                  onChange={setDuration}
                  placeholder="Select a duration"
                  options={[
                    { value: "3 months", label: "3 months" },
                    { value: "4 months", label: "4 months" },
                    { value: "6 months", label: "6 months" },
                  ]}
                />
              </Field>
            </div>

            <Field label="Monthly stipend" htmlFor="stipend">
              <TextInput
                id="stipend"
                value={stipend}
                placeholder="₹25,000 per month"
                onChange={(e) => setStipend(e.target.value)}
              />
            </Field>
          </div>
        </Card>

        <Card className="mt-6 p-5">
          <h2 className="text-[20px] font-semibold text-ink">Preview</h2>
          <p className="mt-1 text-[13px] text-muted">Exactly what students will see in the listing.</p>
          <div className="mt-4 rounded-[14px] border border-hairline bg-canvas p-5">
            <p className="text-[16px] font-semibold text-ink">{title || "Your role title"}</p>
            <p className="text-[13px] text-muted">{session?.name}</p>
            <p className="mt-3 text-sm break-words text-body">
              {description || "Your description will appear here."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((s) => <Chip key={s}>{s}</Chip>)
              ) : (
                <p className="text-[13px] text-muted">No skills selected yet.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-[72px] z-40 border-t border-hairline bg-surface px-5 py-3 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0">
        <div className="flex gap-3">
          <Button full className="sm:w-auto" disabled={!ready || posting} onClick={post}>
            {posting
              ? editingInternship
                ? "Saving changes"
                : "Posting internship"
              : editingInternship
                ? "Save changes"
                : "Post internship"}
          </Button>
          {editingInternship && (
            <Button
              variant="secondary"
              onClick={() => navigate({ to: "/organization" })}
              disabled={posting}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
