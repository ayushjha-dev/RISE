import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button, Field, Select, Tabs, TextInput } from "@/components/rise/primitives";
import { RiseMark } from "@/components/rise/icons";
import { actions, hydrateStore, type Role } from "@/lib/store";
import { institutionsQuery, organizationsQuery, studentsQuery } from "@/lib/api";
import { useToast } from "@/components/rise/toast";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to RISE" },
      {
        name: "description",
        content:
          "Sign in to the RISE student, institution or organization portal, or register a new student account.",
      },
      { property: "og:title", content: "Sign in to RISE" },
      {
        property: "og:description",
        content: "Sign in to the RISE student, institution or organization portal.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [role, setRole] = useState<Role>("student");
  const [account, setAccount] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    hydrateStore();
  }, []);

  const students = useQuery(studentsQuery());
  const institutions = useQuery(institutionsQuery());
  const organizations = useQuery(organizationsQuery());

  useEffect(() => {
    setAccount("");
  }, [role]);

  const options =
    role === "student"
      ? (students.data ?? []).map((s) => ({ value: s.id, label: s.name, meta: s.email }))
      : role === "institution"
        ? (institutions.data ?? []).map((i) => ({ value: i.id, label: i.name, meta: i.city }))
        : (organizations.data ?? []).map((o) => ({ value: o.id, label: o.name, meta: o.city }));

  const loading = students.isLoading || institutions.isLoading || organizations.isLoading;

  const signIn = () => {
    const found = options.find((o) => o.value === account);
    if (!found) return;
    actions.signIn({ role, id: found.value, name: found.label });
    toast.push("success", "Signed in");
    navigate({ to: role === "student" ? "/student" : role === "organization" ? "/organization" : "/institution" });
  };

  return (
    <div data-portal={role} className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <RiseMark size={28} />
          <span className="font-display text-[19px] font-semibold text-ink">RISE</span>
        </Link>
        <Link to="/register" className="text-[13px] font-semibold text-ink underline">
          Create a student account
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[520px] px-5 pt-6 pb-20 sm:px-8 sm:pt-14">
        <h1 className="display-lg">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Choose your portal, then pick a demonstration account to sign in with.
        </p>

        <div className="mt-7 rounded-[20px] border border-hairline bg-surface p-5 sm:p-7">
          <Tabs
            full
            value={role}
            onChange={(v) => setRole(v as Role)}
            items={[
              { value: "student", label: "Student" },
              { value: "institution", label: "Institution" },
              { value: "organization", label: "Organization" },
            ]}
          />

          <div className="mt-6 flex flex-col gap-5">
            <Field label="Account" hint="Sample accounts from this demonstration dataset.">
              {loading ? (
                <div className="shimmer h-11 rounded-[10px]" />
              ) : (
                <Select
                  searchable
                  value={account}
                  onChange={setAccount}
                  options={options}
                  placeholder="Select an account"
                />
              )}
            </Field>

            <Field label="Password" hint="Any password works in this demonstration.">
              <TextInput type="password" defaultValue="rise-demo-2026" autoComplete="off" />
            </Field>

            <Button full size="lg" disabled={!account} onClick={signIn}>
              Sign in to the {role} portal
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-[13px] text-muted">
          New student?{" "}
          <Link to="/register" className="font-semibold text-ink underline">
            Register in four steps
          </Link>
        </p>
      </main>
    </div>
  );
}
