import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ToastProvider } from "@/components/rise/toast";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="max-w-md text-center">
        <p className="num text-sm font-semibold text-muted">404</p>
        <h1 className="display-md mt-3">This page doesn't exist</h1>
        <p className="mt-2 text-[13px] text-muted">
          The link may be out of date, or the page has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-[14px] bg-ink px-5 text-sm font-semibold text-on-dark"
        >
          Back to RISE
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="max-w-md text-center">
        <h1 className="display-md">This page didn't load</h1>
        <p className="mt-2 text-[13px] text-muted">
          Something failed while loading. Try again, or go back to the start.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center rounded-[14px] bg-ink px-5 text-sm font-semibold text-on-dark"
          >
            Try again
          </button>
          <a
            href="/"
            className="hairline inline-flex h-11 items-center rounded-[14px] bg-surface px-5 text-sm font-semibold text-ink"
          >
            Back to RISE
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RISE — Academia and industry, working together" },
      {
        name: "description",
        content:
          "RISE connects verified students, their institutions, and hiring organizations through skill-matched internships and assessments.",
      },
      { property: "og:title", content: "RISE — Academia and industry, working together" },
      {
        property: "og:description",
        content:
          "Verified student profiles, skill-matched internships, and score-ranked shortlists in one platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {/* Required: nested routes render here. */}
        <Outlet />
      </ToastProvider>
    </QueryClientProvider>
  );
}
