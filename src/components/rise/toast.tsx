import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./icons";

type ToastKind = "success" | "warning" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

const ToastContext = createContext<{ push: (kind: ToastKind, message: string) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const edge: Record<ToastKind, string> = {
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-24 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-in raised pointer-events-auto w-full max-w-sm overflow-hidden rounded-[14px] bg-surface"
            style={{ borderLeft: `3px solid ${edge[t.kind]}` }}
          >
            <div className="flex items-start gap-2.5 px-4 py-3">
              <span style={{ color: edge[t.kind] }} className="mt-0.5 shrink-0">
                <Icon
                  name={
                    t.kind === "success" ? "check-circle" : t.kind === "error" ? "cross-circle" : "alert"
                  }
                  size={18}
                />
              </span>
              <p className="min-w-0 text-[13px] font-medium text-ink">{t.message}</p>
            </div>
            <div
              className="h-[2px] origin-left"
              style={{
                background: edge[t.kind],
                animation: "rise-countdown 4s linear forwards",
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
