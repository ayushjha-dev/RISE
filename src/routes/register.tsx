import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button, Chip, Field, Select, TextInput } from "@/components/rise/primitives";
import {
  DigitInput,
  PasswordStrength,
  passwordTier,
  Stepper,
} from "@/components/rise/feedback";
import { Icon, RiseMark } from "@/components/rise/icons";
import { institutionsQuery, verifyAbcId } from "@/lib/api";
import { actions } from "@/lib/store";
import { useToast } from "@/components/rise/toast";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your RISE student account" },
      {
        name: "description",
        content:
          "Register on RISE in four steps: your details, ABC ID verification, your college, and a profile preview.",
      },
      { property: "og:title", content: "Create your RISE student account" },
      {
        property: "og:description",
        content: "Register in four steps and start matching to internships by skill.",
      },
    ],
  }),
  component: RegisterPage,
});

const steps = ["Your details", "Verify ABC ID", "Your college", "Preview"];
const skillChoices = ["React", "JavaScript", "TypeScript", "Node", "SQL", "Python", "CSS", "Testing", "Docker", "Data analysis"];

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [abcId, setAbcId] = useState("");
  const [abcState, setAbcState] = useState<"idle" | "checking" | "verified" | "failed">("idle");
  const [abcError, setAbcError] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [year, setYear] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const institutions = useQuery(institutionsQuery());
  const institution = (institutions.data ?? []).find((i) => i.id === institutionId);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const detailsOk = name.trim().length > 1 && emailValid && passwordTier(password).score >= 2;

  const verify = async () => {
    setAbcState("checking");
    setAbcError("");
    const res = await verifyAbcId(abcId);
    if (res.ok) {
      setAbcState("verified");
    } else {
      setAbcState("failed");
      setAbcError(res.message ?? "We couldn't verify that ID.");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    const id = `stu-new-${Date.now()}`;
    actions.addStudent({
      id,
      name: name.trim(),
      email: email.trim(),
      abcId,
      abcVerified: abcState === "verified",
      institutionId,
      year: year || "Third year, Computer Science",
      skills,
      resumeUrl: "",
      availableForInternships: true,
    });
    actions.signIn({ role: "student", id, name: name.trim() });
    setDone(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.push("success", "Account created");
    navigate({ to: "/student" });
  };

  if (done) {
    return (
      <div data-portal="student" className="grid min-h-screen place-items-center bg-canvas px-6">
        <div className="anim-in max-w-sm text-center">
          <span className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-accent-soft text-accent">
            <Icon name="check-circle" size={34} />
          </span>
          <h1 className="display-md mt-6">You're on RISE, {name.trim().split(" ")[0]}</h1>
          <p className="mt-2 text-sm text-muted">
            Your academic identity is verified and your profile is live. Opening your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-portal="student" className="min-h-screen bg-canvas pb-32 sm:pb-16">
      <header className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <RiseMark size={28} />
          <span className="font-display text-[19px] font-semibold text-ink">RISE</span>
        </Link>
        <Link to="/auth" className="text-[13px] font-semibold text-ink underline">
          I already have an account
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 sm:px-8">
        <h1 className="display-lg">Create your student account</h1>
        <div className="mt-7">
          <Stepper steps={steps} current={step} />
        </div>

        <div className="mt-7 rounded-[20px] border border-hairline bg-surface p-5 sm:p-7">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <Field
                label="Full name"
                htmlFor="name"
                error={touched["name"] && name.trim().length < 2 ? "Enter your full name as it appears on your college record." : undefined}
              >
                <TextInput
                  id="name"
                  value={name}
                  placeholder="Aarthi Balasubramanian"
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  invalid={Boolean(touched["name"]) && name.trim().length < 2}
                />
              </Field>
              <Field
                label="College email"
                htmlFor="email"
                hint="Use the address issued by your institution."
                error={touched["email"] && !emailValid ? "That doesn't look like a complete email address." : undefined}
              >
                <TextInput
                  id="email"
                  type="email"
                  value={email}
                  placeholder="you@college.ac.in"
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  invalid={Boolean(touched["email"]) && !emailValid}
                />
              </Field>
              <div>
                <Field label="Password" htmlFor="password">
                  <TextInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <PasswordStrength password={password} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-[20px] font-semibold text-ink">Verify your ABC ID</h2>
              <p className="mt-1.5 text-sm text-muted">
                Enter the twelve digit Academic Bank of Credits ID printed on your card. We check it
                against your institution's record.
              </p>
              <div className="mt-6">
                <DigitInput value={abcId} onChange={setAbcId} state={abcState} />
              </div>
              {abcState === "verified" && (
                <p className="anim-in mt-4 flex items-center gap-2 text-sm font-semibold text-success">
                  <Icon name="check-circle" size={18} />
                  Verified against your institution's record
                </p>
              )}
              {abcState === "failed" && (
                <p className="mt-4 flex items-center gap-2 text-sm text-error">
                  <Icon name="alert" size={16} />
                  {abcError}
                </p>
              )}
              <div className="mt-6">
                {abcState !== "verified" && (
                  <Button
                    onClick={verify}
                    disabled={abcId.replace(/\D/g, "").length !== 12 || abcState === "checking"}
                  >
                    {abcState === "checking" ? "Checking your ID" : "Verify ID"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <Field label="College" hint="Search by name if your college isn't listed first.">
                {institutions.isLoading ? (
                  <div className="shimmer h-11 rounded-[10px]" />
                ) : (
                  <Select
                    searchable
                    value={institutionId}
                    onChange={setInstitutionId}
                    placeholder="Select your college"
                    options={(institutions.data ?? []).map((i) => ({
                      value: i.id,
                      label: i.name,
                      meta: `${i.city} · code ${i.aisheCode}`.replace(" · ", " — "),
                    }))}
                  />
                )}
              </Field>
              <Field label="Year and branch">
                <Select
                  value={year}
                  onChange={setYear}
                  placeholder="Select your year and branch"
                  options={[
                    { value: "Second year, Computer Science", label: "Second year, Computer Science" },
                    { value: "Third year, Computer Science", label: "Third year, Computer Science" },
                    { value: "Third year, Information Technology", label: "Third year, Information Technology" },
                    { value: "Final year, Computer Science", label: "Final year, Computer Science" },
                    { value: "Final year, Information Technology", label: "Final year, Information Technology" },
                  ]}
                />
              </Field>
              <div>
                <p className="text-[13px] font-semibold tracking-[0.2px] text-ink">Skills</p>
                <p className="mt-1 text-[13px] text-muted">
                  Pick what you can already work with. This drives your internship matches.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skillChoices.map((s) => {
                    const on = skills.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          setSkills((cur) => (on ? cur.filter((x) => x !== s) : [...cur, s]))
                        }
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
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-[20px] font-semibold text-ink">Check your profile</h2>
              <p className="mt-1.5 text-sm text-muted">
                This is what organizations will see when you apply.
              </p>
              <div className="mt-5 rounded-[14px] border border-hairline bg-canvas p-5">
                <p className="truncate text-[18px] font-semibold text-ink">{name.trim() || "Your name"}</p>
                <p className="truncate text-sm text-muted">{email.trim()}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-success">
                  <Icon name="check-circle" size={15} />
                  ABC ID {abcId} verified
                </p>
                <p className="mt-3 text-sm text-body">
                  {year || "Year and branch not set"}
                  {institution ? ` at ${institution.name}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.length ? (
                    skills.map((s) => <Chip key={s}>{s}</Chip>)
                  ) : (
                    <p className="text-[13px] text-muted">
                      No skills selected yet — you can add them from your profile later.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface px-5 py-3 sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <div className="mx-auto flex max-w-[760px] items-center gap-3">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="flex-1 sm:flex-none"
                disabled={
                  (step === 0 && !detailsOk) ||
                  (step === 1 && abcState !== "verified") ||
                  (step === 2 && (!institutionId || !year))
                }
                onClick={() => setStep((s) => s + 1)}
              >
                Continue
              </Button>
            ) : (
              <Button className="flex-1 sm:flex-none" disabled={submitting} onClick={submit}>
                {submitting ? "Creating your account" : "Create account"}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
