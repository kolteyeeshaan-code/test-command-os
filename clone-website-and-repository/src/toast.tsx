import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";

export type ToastTone = "default" | "success" | "warning" | "error";

export interface ToastOptions {
  tone?: ToastTone;
  /** ms; defaults to 2600, or 6000 when an action is present. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends ToastOptions { id: string; message: string }

interface ToastAPI {
  show(message: string, opts?: ToastOptions): string;
  dismiss(id: string): void;
}

const Ctx = createContext<ToastAPI>({ show: () => "", dismiss: () => {} });

const DOT: Record<ToastTone, string> = {
  default: "bg-ink/40",
  success: "bg-[#34c759]",
  warning: "bg-[#ff9f0a]",
  error: "bg-[#ff453a]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setItems(list => list.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { window.clearTimeout(t); timers.current.delete(id); }
  }, []);

  const show = useCallback((message: string, opts: ToastOptions = {}) => {
    const id = Math.random().toString(36).slice(2, 10);
    const duration = opts.duration ?? (opts.action ? 6000 : 2600);
    setItems(list => [...list.slice(-3), { id, message, ...opts }]);
    timers.current.set(id, window.setTimeout(() => dismiss(id), duration));
    return id;
  }, [dismiss]);

  useEffect(() => {
    const map = timers.current;
    return () => { map.forEach(t => window.clearTimeout(t)); map.clear(); };
  }, []);

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-6 bottom-6 z-[70] flex flex-col items-end gap-2" aria-live="polite">
        {items.map(t => (
          <div key={t.id} role="status" className="toast-enter pointer-events-auto flex max-w-[420px] items-center gap-3 rounded-xl border border-[rgba(117,117,117,0.16)] bg-white px-4 py-3 text-sm text-ink shadow-[0_12px_40px_rgba(21,25,13,0.12)]">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[t.tone ?? "default"])} />
            <span className="leading-5">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => { t.action?.onClick(); dismiss(t.id); }}
                className="ml-1 shrink-0 text-[11px] font-medium uppercase tracking-[0.06em] text-ink underline underline-offset-2 hover:opacity-70"
              >{t.action.label}</button>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="ml-1 shrink-0 text-[16px] leading-none text-ink/30 hover:text-ink">×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() { return useContext(Ctx); }
