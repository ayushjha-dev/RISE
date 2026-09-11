import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/rise/shell";

export const Route = createFileRoute("/institution")({
  component: InstitutionLayout,
});

function InstitutionLayout() {
  return (
    <PortalShell
      role="institution"
      nav={[
        { to: "/institution", label: "Dashboard", icon: "dashboard" },
        { to: "/institution/students", label: "Students", icon: "students" },
        { to: "/institution/profile", label: "Profile", icon: "building" },
      ]}
    >
      <Outlet />
    </PortalShell>
  );
}
