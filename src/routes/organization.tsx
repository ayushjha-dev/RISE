import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/rise/shell";

export const Route = createFileRoute("/organization")({
  component: OrganizationLayout,
});

function OrganizationLayout() {
  return (
    <PortalShell
      role="organization"
      nav={[
        { to: "/organization", label: "Dashboard", icon: "dashboard" },
        { to: "/organization/applicants", label: "Applicants", icon: "students" },
        { to: "/organization/post", label: "Post", icon: "plus" },
        { to: "/organization/profile", label: "Profile", icon: "building" },
      ]}
    >
      <Outlet />
    </PortalShell>
  );
}
