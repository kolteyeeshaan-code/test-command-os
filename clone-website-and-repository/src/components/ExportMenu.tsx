import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useEscape } from "../hooks";
import { Kbd } from "../ui";
import { cn } from "../utils/cn";

export interface ExportAction {
  id: string;
  label: string;
  hint?: string;
  kbd?: string;
  icon: ReactNode;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}

export function ExportMenu({ label = "Export", actions, busy }: { label?: string; actions: ExportAction[]; busy?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  useEscape(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  /** Position menu below button, clamped to viewport. */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuW = 268;
    const gap = 8;
    const vpW = window.innerWidth;
    let left = rect.right - menuW;
    if (left < 16) left = 16;
    if (left + menuW > vpW - 16) left = vpW - menuW - 16;
    let top = rect.bottom + gap;
    const maxTop = window.innerHeight - 16;
    if (top + 520 > maxTop) top = Math.max(16, maxTop - 520);
    setMenuPos({ left, top });
  }, []);

  // Recalculate position whenever menu opens or window resizes.
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, updatePosition]);

  const menu = open ? (
    createPortal(
      <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
        <div
          ref={menuRef}
          role="menu"
          className="palette-enter fixed z-50 w-[268px] max-h-[68vh] overflow-y-auto rounded-2xl border border-[rgba(117,117,117,0.16)] bg-white p-1.5 shadow-[0_16px_50px_rgba(21,25,13,0.18)]"
          style={{ left: menuPos.left, top: menuPos.top }}
        >
          {actions.map(a => (
            <button
              key={a.id}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); a.onClick(); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                a.primary ? "bg-card" : a.danger ? "text-red-600 hover:bg-red-50" : "hover:bg-black/[0.04]"
              )}
            >
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center", a.primary ? "text-ink" : a.danger ? "text-red-500" : "text-ink/50")}>{a.icon}</span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] leading-4", a.primary ? "font-semibold" : "font-medium")}>{a.label}</span>
                {a.hint && <span className="block text-[11px] leading-4 text-subtitle">{a.hint}</span>}
              </span>
              {a.kbd && <Kbd>{a.kbd}</Kbd>}
            </button>
          ))}
        </div>
      </>,
      document.body
    )
  ) : null;

  return (
    <div className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) updatePosition();
          setOpen(o => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!!busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-70"
      >
        {busy ? busy + "…" : label}
        <span className={cn("text-[9px] leading-none transition", open ? "rotate-180" : "")}>▼</span>
      </button>
      {menu}
    </div>
  );
}
