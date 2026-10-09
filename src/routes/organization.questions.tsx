import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/components/rise/primitives";
import { EmptyState, SectionHead } from "@/components/rise/feedback";
import { Icon } from "@/components/rise/icons";
import { assessmentsQuery } from "@/lib/api";
import { actions, useStore, type Question, type Subtopic } from "@/lib/store";
import { useToast } from "@/components/rise/toast";
import { PageTitle } from "@/components/rise/shell";
import { useInternships } from "@/lib/portal";

export const Route = createFileRoute("/organization/questions")({
  head: () => ({
    meta: [
      { title: "Prarambh — upload questions — RISE" },
      { name: "description", content: "Upload Prarambh questions for your roles." },
      { property: "og:title", content: "Prarambh — upload questions — RISE" },
    ],
  }),
  component: UploadQuestions,
});

type DraftQuestion = {
  key: string;
  q: string;
  options: [string, string, string, string];
  correctIndex: number;
};

const newQuestion = (): DraftQuestion => ({
  key: `q-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
  q: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

const TRACK_CHOICES = ["Web Development", "Data Analytics", "Design", "Marketing", "Operations"];

function UploadQuestions() {
  const session = useStore((s) => s.session);
  const toast = useToast();
  const internships = useInternships();
  const assessments = useQuery(assessmentsQuery());

  const [track, setTrack] = useState(TRACK_CHOICES[0]!);
  const [customTrack, setCustomTrack] = useState("");
  const [minutes, setMinutes] = useState("15");
  const [internshipId, setInternshipId] = useState("");
  const [subtopicName, setSubtopicName] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);
  const [saving, setSaving] = useState(false);

  const mine = (internships.data ?? []).filter((i) => i.orgId === session?.id);
  const mySets = useMemo(
    () => (assessments.data ?? []).filter((a) => !a.orgId || a.orgId === session?.id),
    [assessments.data, session?.id],
  );

  const resolvedTrack = track === "Other…" ? customTrack.trim() : track;
  const resolvedMinutes = Number.parseInt(minutes, 10);

  const validQuestions: Question[] = questions
    .map((d) => ({
      q: d.q.trim(),
      options: d.options.map((o) => o.trim()),
      correctIndex: d.correctIndex,
    }))
    .filter((d) => d.q.length > 3 && d.options.every((o) => o.length > 0));

  const ready =
    resolvedTrack.length > 1 &&
    Number.isFinite(resolvedMinutes) &&
    resolvedMinutes >= 5 &&
    resolvedMinutes <= 120 &&
    subtopicName.trim().length > 1 &&
    validQuestions.length > 0;

  const setOption = (key: string, idx: number, value: string) =>
    setQuestions((qs) =>
      qs.map((d) =>
        d.key === key
          ? {
              ...d,
              options: d.options.map((o, i) => (i === idx ? value : o)) as DraftQuestion["options"],
            }
          : d,
      ),
    );

  const publish = () => {
    if (!ready || saving) return;
    setSaving(true);
    const subtopic: Subtopic = { name: subtopicName.trim(), questions: validQuestions };
    const id = `asmt-${Date.now().toString(36)}`;
    actions.addAssessment({
      id,
      track: resolvedTrack,
      minutes: Number.isFinite(resolvedMinutes) ? resolvedMinutes : 15,
      subtopics: [subtopic],
      orgId: session?.id,
    });
    const attached = internshipId ? mine.find((i) => i.id === internshipId) : null;
    if (attached) actions.setInternshipAssessment(attached.id, id);
    toast.push(
      "success",
      attached
        ? `Prarambh set published and attached to “${attached.title}” — applicants take these ${validQuestions.length} question${validQuestions.length === 1 ? "" : "s"}.`
        : `Prarambh set published — ${validQuestions.length} question${validQuestions.length === 1 ? "" : "s"} in ${subtopic.name}.`,
    );
    setSubtopicName("");
    setQuestions([newQuestion()]);
    setSaving(false);
  };

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="Prarambh — upload questions"
        note="Build the assessment students take before they can be ranked. One subtopic per set; students see one question at a time."
      />
      <UploadForm
        track={track}
        setTrack={setTrack}
        customTrack={customTrack}
        setCustomTrack={setCustomTrack}
        minutes={minutes}
        setMinutes={setMinutes}
        internshipId={internshipId}
        setInternshipId={setInternshipId}
        mine={mine}
        subtopicName={subtopicName}
        setSubtopicName={setSubtopicName}
        questions={questions}
        setQuestions={setQuestions}
        setOption={setOption}
        validQuestions={validQuestions}
        ready={ready}
        saving={saving}
        publish={publish}
      />
      <PublishedSets assessments={assessments} mySets={mySets} />
    </div>
  );
}
type FormProps = {
  track: string;
  setTrack: (v: string) => void;
  customTrack: string;
  setCustomTrack: (v: string) => void;
  minutes: string;
  setMinutes: (v: string) => void;
  internshipId: string;
  setInternshipId: (v: string) => void;
  mine: { id: string; title: string }[];
  subtopicName: string;
  setSubtopicName: (v: string) => void;
  questions: DraftQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<DraftQuestion[]>>;
  setOption: (key: string, idx: number, value: string) => void;
  validQuestions: Question[];
  ready: boolean;
  saving: boolean;
  publish: () => void;
};

function UploadForm(p: FormProps) {
  return (
    <>
      <Card className="p-5">
        <SectionHead
          title="1 · Where does this set belong?"
          note="Pick the track and, optionally, attach it to one of your postings."
        />
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Field label="Track">
            <Select
              value={p.track}
              onChange={p.setTrack}
              options={[
                ...TRACK_CHOICES.map((t) => ({ value: t, label: t })),
                { value: "Other…", label: "Other…" },
              ]}
            />
          </Field>
          <Field label="Time limit (minutes)">
            <Select
              value={p.minutes}
              onChange={p.setMinutes}
              options={["10", "15", "20", "30", "45", "60"].map((m) => ({
                value: m,
                label: `${m} minutes`,
              }))}
            />
          </Field>
        </div>
        {p.track === "Other…" && (
          <div className="mt-5">
            <Field label="Custom track name" htmlFor="custom-track">
              <TextInput
                id="custom-track"
                value={p.customTrack}
                onChange={(e) => p.setCustomTrack(e.target.value)}
                placeholder="e.g. Backend APIs"
              />
            </Field>
          </div>
        )}
        <div className="mt-5">
          <Field label="Attach to a posting (optional)">
            <Select
              value={p.internshipId}
              onChange={p.setInternshipId}
              placeholder={
                p.mine.length
                  ? "Leave unattached, or pick a posting"
                  : "Post a role first, then attach"
              }
              options={p.mine.map((i) => ({ value: i.id, label: i.title }))}
            />
          </Field>
        </div>
      </Card>
      <QuestionCards
        subtopicName={p.subtopicName}
        setSubtopicName={p.setSubtopicName}
        questions={p.questions}
        setQuestions={p.setQuestions}
        setOption={p.setOption}
        validQuestions={p.validQuestions}
        ready={p.ready}
        saving={p.saving}
        publish={p.publish}
      />
    </>
  );
}

function QuestionCards(props: {
  subtopicName: string;
  setSubtopicName: (v: string) => void;
  questions: DraftQuestion[];
  setQuestions: React.Dispatch<React.SetStateAction<DraftQuestion[]>>;
  setOption: (key: string, idx: number, value: string) => void;
  validQuestions: Question[];
  ready: boolean;
  saving: boolean;
  publish: () => void;
}) {
  const { subtopicName, setSubtopicName, questions, setQuestions, setOption } = props;
  return (
    <>
      <Card className="mt-6 p-5">
        <SectionHead
          title="2 · Subtopic + questions"
          note="Name the subtopic (must match a skill, e.g. React), then add at least one question with 4 options."
        />
        <div className="mt-4">
          <Field label="Subtopic name" htmlFor="subtopic">
            <TextInput
              id="subtopic"
              value={subtopicName}
              onChange={(e) => setSubtopicName(e.target.value)}
              placeholder="e.g. React"
            />
          </Field>
        </div>
        <ul className="mt-5 flex flex-col gap-5">
          {questions.map((d, n) => (
            <li key={d.key} className="rounded-[14px] border border-hairline bg-canvas p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">Question {n + 1}</p>
                {questions.length > 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuestions((qs) => qs.filter((x) => x.key !== d.key))}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="mt-3">
                <Field label="Question">
                  <TextArea
                    value={d.q}
                    onChange={(e) =>
                      setQuestions((qs) =>
                        qs.map((x) => (x.key === d.key ? { ...x, q: e.target.value } : x)),
                      )
                    }
                    placeholder="e.g. When does a useEffect with an empty dependency array run?"
                    rows={2}
                  />
                </Field>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {d.options.map((o, i) => (
                  <Field
                    key={i}
                    label={`Option ${String.fromCharCode(65 + i)}${d.correctIndex === i ? " · correct" : ""}`}
                  >
                    <TextInput
                      value={o}
                      onChange={(e) => setOption(d.key, i, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </Field>
                ))}
              </div>
              <div className="mt-3">
                <Field label="Correct answer">
                  <Select
                    value={String(d.correctIndex)}
                    onChange={(v) =>
                      setQuestions((qs) =>
                        qs.map((x) => (x.key === d.key ? { ...x, correctIndex: Number(v) } : x)),
                      )
                    }
                    options={[0, 1, 2, 3].map((i) => ({
                      value: String(i),
                      label: `Option ${String.fromCharCode(65 + i)}`,
                    }))}
                  />
                </Field>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
            <Icon name="plus" size={16} />
            Add another question
          </Button>
        </div>
      </Card>
      <PublishPreview
        questions={questions}
        validQuestions={props.validQuestions}
        ready={props.ready}
        saving={props.saving}
        publish={props.publish}
      />
    </>
  );
}

function PublishPreview(props: {
  questions: DraftQuestion[];
  validQuestions: Question[];
  ready: boolean;
  saving: boolean;
  publish: () => void;
}) {
  return (
    <Card className="mt-6 p-5">
      <SectionHead
        title="3 · Preview & publish"
        note={`${props.validQuestions.length} of ${props.questions.length} ready — a question counts when it has text and all 4 options filled.`}
      />
      {props.validQuestions.length ? (
        <ul className="mt-4 flex flex-col gap-3">
          {props.validQuestions.map((q, i) => (
            <li key={i} className="rounded-[12px] border border-hairline bg-surface p-4">
              <p className="font-semibold text-ink">
                {i + 1}. {q.q}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((o, j) => (
                  <Chip key={j}>
                    {`${String.fromCharCode(65 + j)}. ${o}`}
                    {j === q.correctIndex ? " ✓" : ""}
                  </Chip>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] text-muted">
          Fill in a question above to see the student-side preview here.
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button disabled={!props.ready || props.saving} onClick={props.publish}>
          <Icon name="upload" size={16} />
          {props.saving ? "Publishing…" : `Publish Prarambh set (${props.validQuestions.length})`}
        </Button>
        {!props.ready && (
          <p className="text-[13px] text-muted">
            Name the track, subtopic and one complete question to publish.
          </p>
        )}
      </div>
    </Card>
  );
}

function PublishedSets(props: {
  assessments: { isLoading: boolean };
  mySets: {
    id: string;
    track: string;
    minutes: number;
    subtopics: { name: string; questions: unknown[] }[];
  }[];
}) {
  return (
    <Card className="mt-6 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-semibold text-ink">Published Prarambh sets</h2>
        <span className="text-[13px] text-muted">{props.mySets.length} total</span>
      </div>
      <div className="mt-4">
        {props.assessments.isLoading ? (
          <p className="text-[13px] text-muted">Loading sets…</p>
        ) : props.mySets.length === 0 ? (
          <EmptyState
            variant="list"
            title="No Prarambh sets yet"
            note="Publish your first set above — students on this track take it before they can be ranked."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-hairline">
            {props.mySets.map((a) => (
              <li key={a.id} className="py-4">
                <p className="font-semibold text-ink">{a.track}</p>
                <p className="mt-1 text-sm text-body">
                  {a.subtopics.length} subtopic{a.subtopics.length === 1 ? "" : "s"} ·{" "}
                  {a.subtopics.reduce((n, s) => n + s.questions.length, 0)} questions · {a.minutes}{" "}
                  min
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
