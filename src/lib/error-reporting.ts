/**
 * Client-side error reporting. Vendor-neutral: no analytics SDK is bundled.
 *
 * Today this writes a structured console entry, which is enough for local
 * debugging and for any host that captures console output (Nitro, Workers,
 * browser devtools). To wire up a real backend later, replace the body of
 * reportClientError with a POST to your error endpoint - callers do not change.
 */

type ClientErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type ErrorPayload = {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  options?: ClientErrorOptions;
};

/**
 * Loaders and server functions commonly throw a raw Response, and
 * String(response) is the opaque "[object Response]". Pull out the status and
 * URL instead so the log says something useful.
 */
function describe(error: unknown): { message: string; stack?: string | undefined } {
  if (error instanceof Response) {
    return {
      message: `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`,
    };
  }
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ClientErrorOptions = {},
) {
  if (typeof window === "undefined") return;

  const { message, stack } = describe(error);

  const payload: ErrorPayload = {
    message,
    ...(stack !== undefined && { stack }),
    context: {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    options: {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
      ...options,
    },
  };

  // Prod React does not rethrow boundary-caught errors to window.onerror, so
  // without this explicit report the failure is lost outside development.
  console.error("[rise] unhandled route error", payload);
}
