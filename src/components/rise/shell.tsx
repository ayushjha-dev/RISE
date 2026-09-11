import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, RiseMark, type IconName } from "./icons";
import { PortalMotif } from "./illustrations";
import { actions, hydrateStore, useStore, type Role } from "@/lib/store";
import { Button } from "./primitives";

export function useSession() {
  const session = useStore((s) => s.session);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrateStore();
    setReady(true);
  }, []);
  return { session, ready };
}

type NavItem = { to: string; label: string; icon: IconName };

const roleName: Record<Role, string> = {
  student: "Student",
  institution: "Institution",
  organization: "Organization",
};

export function PortalShell({
  role,
  nav,
  children,
}: {
  role: Role;
  nav: NavItem[];
  children: ReactNode;
}) {
  const { session, ready } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!ready) {
    return (
      <div data-portal={role} className="min-h-screen bg-canvas">
        <div className="mx-auto max-w-[1360px] px-5 py-10">
          <div className="shimmer h-8 w-48 rounded-[10px]" />
          <div className="shimmer mt-6 h-40 w-full rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (!session || session.role !== role) {
    return (
      <div data-portal={role} className="grid min-h-screen place-items-center bg-canvas px-6">
        <div className="max-w-sm rounded-[14px] border border-hairline bg-surface p-7 text-center">
          <RiseMark size={32} />
          <h1 className="display-md mt-4">Sign in to continue</h1>
          <p className="mt-2 text-sm text-muted">
            The {roleName[role].toLowerCase()} portal needs a signed-in {roleName[role].toLowerCase()} account.
          </p>
          <Button className="mt-5" full onClick={() => navigate({ to: "/auth" })}>
            Go to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-portal={role} className="min-h-screen bg-canvas">
      {/* Desktop / tablet side rail */}
      <aside className="fixed top-0 left-0 z-40 hidden h-full w-[76px] flex-col border-r border-hairline bg-surface py-5 sm:flex lg:w-[248px]">
        <div className="flex items-center gap-2.5 px-5 lg:px-6">
          <RiseMark size={28} />
          <div className="hidden min-w-0 lg:block">
            <p className="font-display text-[18px] leading-none font-semibold text-ink">RISE</p>
            <p className="truncate text-[13px] text-muted">{roleName[role]} portal</p>
          </div>
        </div>

        <nav className="mt-7 flex flex-1 flex-col gap-1 px-3 lg:px-4">
          {nav.map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-semibold transition-colors duration-150",
                  active ? "bg-accent-soft text-ink" : "text-muted hover:bg-surface-soft",
                )}
              >
                <span className={active ? "text-accent" : ""}>
                  <Icon name={item.icon} size={20} />
                </span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 lg:px-4">
          <div className="hidden rounded-[10px] bg-surface-soft px-3 py-2.5 lg:block">
            <p className="truncate text-[13px] font-semibold text-ink">{session.name}</p>
            <p className="truncate text-[13px] text-muted">{roleName[role]}</p>
          </div>
          <button
            onClick={() => {
              actions.signOut();
              navigate({ to: "/" });
            }}
            className="mt-2 flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-semibold text-muted transition-colors hover:bg-surface-soft"
          >
            <Icon name="logout" size={20} />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline bg-canvas/95 px-5 py-3 backdrop-blur sm:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <RiseMark size={26} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{session.name}</p>
            <p className="truncate text-[13px] text-muted">{roleName[role]} portal</p>
          </div>
        </div>
        <button
          onClick={() => {
            actions.signOut();
            navigate({ to: "/" });
          }}
          aria-label="Sign out"
          className="grid h-10 w-10 place-items-center rounded-full border border-hairline text-body"
        >
          <Icon name="logout" size={18} />
        </button>
      </header>

      <main className="pb-28 sm:pb-16 sm:pl-[76px] lg:pl-[248px]">
        <div className="mx-auto w-full max-w-[1360px] px-5 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
        <ul className="grid grid-cols-4">
          {nav.slice(0, 4).map((item) => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-semibold",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  <Icon name={item.icon} size={22} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** Bottom-anchored action bar on mobile, inline on desktop. */
export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed inset-x-0 bottom-[72px] z-40 border-t border-hairline bg-surface px-5 py-3 sm:hidden">
        {children}
      </div>
      <div className="hidden sm:block">{children}</div>
    </>
  );
}

/**
 * Page header band: eyebrow, display title, note, right-aligned actions and a
 * low-contrast portal motif so no screen ever opens on blank space.
 */
export function PageTitle({
  title,
  note,
  eyebrow,
  role,
  actions,
}: {
  title: string;
  note?: string | undefined;
  eyebrow?: string | undefined;
  role?: Role | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <header className="band relative mb-7 overflow-hidden rounded-[20px] border border-hairline px-5 py-6 sm:px-7 sm:py-8">
      {role && (
        <PortalMotif
          role={role}
          className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[420px] opacity-55 sm:block lg:opacity-70"
        />
      )}
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="display-lg">{title}</h1>
          {note && <p className="mt-2 max-w-xl text-sm text-body">{note}</p>}
        </div>
        {actions && (
          <div className="relative z-10 flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>
        )}
      </div>
    </header>
  );
}
