import { useEffect, useRef, type ReactNode } from "react";
import { Logo, IconHome, IconChevronRight, IconSearch } from "./icons";
import { cn } from "./utils/cn";
import { STATUS_META, type ProjectStatus } from "./data";
import { modKey } from "./hooks";

const NAV = [["home", "Command Center", "Home"], ["projects", "Projects", "Projects"], ["apps", "Apps", "Apps"], ["notes", "Notes", "Notes"], ["data", "Data", "Data"]] as const;

export function Topbar({ current }: { current?: string }) {
  return (
    <div className="relative z-10 mb-10 flex items-center justify-between md:mb-[60px]">
      <a href="#/home" className="block"><Logo className="block h-8 w-[111px]" /></a>
      <nav className="flex items-center gap-3 sm:gap-6">
        {NAV.map(([k, l, short]) => (
          <a key={k} href={"#/" + k} className={cn(
            "text-[12px] font-medium uppercase leading-4 tracking-[0.03em] no-underline transition sm:text-[13px]",
            current === k ? "text-ink" : "text-ink/35 hover:text-ink/70"
          )}><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{l}</span></a>
        ))}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("cs:palette"))}
          title="Jump anywhere"
          aria-label="Open command palette"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgba(117,117,117,0.2)] px-2 py-1 text-ink/40 transition hover:border-ink/40 hover:text-ink"
        >
          <IconSearch size={14} />
          <span className="hidden items-center gap-1 sm:inline-flex"><Kbd>{modKey}</Kbd><Kbd>K</Kbd></span>
        </button>
      </nav>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded bg-black/[0.06] px-1 font-[family-name:var(--font-roboto)] text-[10px] font-medium leading-none text-ink/70">{children}</kbd>;
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="relative z-10 mb-7 mt-2 flex flex-wrap items-center gap-3">
      <a href="#/home" className="text-ink" aria-label="Home"><IconHome /></a>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-3">
          <IconChevronRight className="text-[#b3b3b3]" />
          {item.href
            ? <a href={item.href} className="text-[15px] font-medium tracking-[-0.04em] text-ink underline underline-offset-[3px] hover:opacity-70">{item.label}</a>
            : <span className="text-[15px] font-medium tracking-[-0.04em] text-ink">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Badge({ tone, children }: { tone: "green" | "orange" | "gray"; children: ReactNode }) {
  return (
    <span className={cn(
      "inline-flex w-fit items-center rounded px-2 py-1 font-[family-name:var(--font-roboto)] text-[13px] font-medium leading-5 tracking-[0.018em] text-black",
      tone === "green" && "bg-[rgba(52,199,89,0.3)]",
      tone === "orange" && "bg-[rgba(255,149,0,0.3)]",
      tone === "gray" && "bg-card"
    )}>{children}</span>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** Badge-styled inline status control — same look as StatusBadge, but editable. */
export function StatusSelect({ value, onChange }: { value: ProjectStatus; onChange: (s: ProjectStatus) => void }) {
  const meta = STATUS_META[value];
  return (
    <label className={cn(
      "relative inline-flex cursor-pointer items-center rounded pl-2 pr-5 py-1 font-[family-name:var(--font-roboto)] text-[13px] font-medium leading-5 tracking-[0.018em] text-black transition hover:brightness-95",
      meta.tone === "green" && "bg-[rgba(52,199,89,0.3)]",
      meta.tone === "orange" && "bg-[rgba(255,149,0,0.3)]",
      meta.tone === "gray" && "bg-card"
    )} title="Change status">
      <select value={value} onChange={e => onChange(e.target.value as ProjectStatus)} aria-label="Project status" className="cursor-pointer appearance-none bg-transparent outline-none">
        {(Object.keys(STATUS_META) as ProjectStatus[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-[9px] text-black/60">▾</span>
    </label>
  );
}

export function Deco() {
  return (<>
    <div className="pointer-events-none absolute -top-[168px] right-0 z-0 h-[553px] w-[553px] rounded-full bg-[radial-gradient(circle,rgba(21,25,13,0.06)_0%,rgba(21,25,13,0)_70%)] opacity-40" />
    <div className="pointer-events-none absolute -top-[136px] -right-[120px] z-0 h-[729px] w-[729px] rounded-full bg-[radial-gradient(circle,rgba(21,25,13,0.06)_0%,rgba(21,25,13,0)_70%)] opacity-20" />
  </>);
}

/* overflow-x-clip (not hidden) keeps the decorative circles from causing horizontal scroll
   without creating a scroll container — so `position: sticky` toolbars inside still work. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto max-w-[1728px] overflow-x-clip px-5 pb-[120px] pt-8 sm:px-8 md:px-16 md:pt-[60px]">
      <Deco />{children}
    </div>
  );
}

/** Overview / Board / Sprints tab strip shared by the project screens. */
export function ProjectTabs({ projectId, active, clientName, projectName, showHeading = true }: { projectId: string; active: "overview" | "board" | "sprints"; clientName: string; projectName: string; showHeading?: boolean }) {
  const tabs = [
    { id: "overview" as const, label: "Overview", href: `#/project/${projectId}` },
    { id: "board" as const, label: "Board", href: `#/project/${projectId}/board` },
    { id: "sprints" as const, label: "Sprints", href: `#/project/${projectId}/sprints` },
  ];
  return (
    <div className="relative z-10 mb-8">
      {showHeading && (
        <div className="mb-5">
          <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-subtitle">{clientName}</p>
          <h1 className="break-words text-[36px] font-normal leading-[38px] tracking-[-0.04em] sm:text-[48px] sm:leading-[46px]">{projectName || "Untitled Project"}</h1>
        </div>
      )}
      <div className="flex gap-1 border-b border-[rgba(120,120,128,0.16)]">
        {tabs.map(t => (
          <a key={t.id} href={t.href} className={cn(
            "relative -mb-px border-b-2 px-3.5 py-2 text-[13px] font-medium tracking-[-0.01em] no-underline transition",
            active === t.id ? "border-ink text-ink" : "border-transparent text-ink/40 hover:border-ink/30 hover:text-ink/75"
          )}>{t.label}</a>
        ))}
      </div>
    </div>
  );
}

export function Stepper({ steps, done, sollPct }: { steps: string[]; done: number; sollPct: number }) {
  return (
    <div className="relative flex gap-1">
      {steps.map((label, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.02em] text-ink">{label}</span>
          <div className={cn("relative h-5 overflow-hidden rounded", i < done ? "bg-ink" : "pattern-fill")} />
        </div>
      ))}
      {sollPct > 0 && <div className="absolute top-[11px] z-[2] h-[38px] w-0.5 -translate-x-1/2 bg-yellow" style={{ left: sollPct + "%" }} />}
    </div>
  );
}

export function Card({ children, className: c, hover }: { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl bg-card p-7",
      hover && "transition duration-250 hover:-translate-y-1 hover:bg-[#ededed] hover:shadow-[0_12px_28px_rgba(21,25,13,0.1)]",
      c
    )}>{children}</div>
  );
}

/** Compact labelled number, used in tracking summaries. */
export function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="border-b border-dashed border-[rgba(120,120,128,0.12)] pb-1.5">
      <p className="text-[10px] font-medium uppercase tracking-[0.05em] text-subtitle">{label}</p>
      <p className={cn("font-[family-name:var(--font-roboto)] text-[18px] font-medium leading-tight tabular-nums", warn ? "text-[#c77700]" : "text-ink")}>{value}</p>
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[15px] font-bold uppercase leading-6 tracking-[-0.01em]">{children}</p>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <span className="text-4xl opacity-70">{icon}</span>
      <p className="text-[15px] font-semibold">{title}</p>
      {hint && <p className="max-w-sm text-sm text-subtitle">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, href, type, disabled }: { children: ReactNode; onClick?: () => void; href?: string; type?: "button" | "submit"; disabled?: boolean }) {
  const cls = cn("inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink no-underline", disabled && "pointer-events-none opacity-40");
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function GhostButton({ children, onClick, href, danger, disabled }: { children: ReactNode; onClick?: () => void; href?: string; danger?: boolean; disabled?: boolean }) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition no-underline",
    danger
      ? "border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50"
      : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink hover:bg-black/[0.03]",
    disabled && "pointer-events-none opacity-40"
  );
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function TextField({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] outline-none transition focus:border-ink" />
    </div>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3}
        className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] leading-6 outline-none transition focus:border-ink" />
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value as T)}
        className="w-full rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] outline-none transition focus:border-ink">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Confirm({ open, title, message, confirmLabel, onConfirm, onCancel, danger }: { open: boolean; title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      if (e.key === "Enter") { e.preventDefault(); onConfirm(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onConfirm, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="palette-enter max-h-[90dvh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-7" onClick={e => e.stopPropagation()}>
        <p id="confirm-title" className="text-[20px] font-normal tracking-[-0.03em]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-subtitle">{message}</p>
        <div className="mt-6 flex items-center justify-between gap-2">
          <span className="text-[11px] text-subtitle"><Kbd>Esc</Kbd> cancel · <Kbd>↵</Kbd> confirm</span>
          <div className="flex gap-2">
            <GhostButton onClick={onCancel}>Cancel</GhostButton>
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              className={cn(
                "inline-flex items-center rounded-full px-5 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-white transition",
                danger ? "bg-red-600 hover:bg-red-700" : "bg-ink hover:bg-ink/85"
              )}
            >{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
