import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/rise/shell";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  return (
    <PortalShell
      role="student"
      nav={[
        { to: "/student", label: "Dashboard", icon: "dashboard" },
        { to: "/student/internships", label: "Internships", icon: "briefcase" },
        { to: "/student/learning", label: "Learning", icon: "clipboard" },
        { to: "/student/profile", label: "Profile", icon: "user" },
      ]}
    >
      <Outlet />
    </PortalShell>
  );
}
