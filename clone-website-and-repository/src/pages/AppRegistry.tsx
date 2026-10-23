import { useState } from "react";
import { APP_CATALOG, CATEGORY_META, type AppCategory } from "../data";
import { VERTICAL_META, type AppVertical } from "../db/schema";
import { IconSearch, CATALOG_ICONS } from "../icons";
import { Breadcrumb, PageShell, Topbar } from "../ui";
import { useStore } from "../store";
import { useEscape } from "../hooks";
import { cn } from "../utils/cn";

const CATS: (AppCategory | "all")[] = ["all", "discovery", "strategy", "creative", "commercial"];
// Secondary vertical filter row, driven by the 9-vertical taxonomy in VERTICAL_META.
const VERTICALS: (AppVertical | "all")[] = ["all", ...(Object.keys(VERTICAL_META) as AppVertical[])];

export function AppRegistry() {
  const { state } = useStore();
  const [cat, setCat] = useState<AppCategory | "all">("all");
  const [vertical, setVertical] = useState<AppVertical | "all">("all");
  const [q, setQ] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const selectedApp = selectedAppId ? APP_CATALOG.find(a => a.id === selectedAppId) : undefined;
  useEscape(!!selectedAppId, () => setSelectedAppId(null));
  const filtered = APP_CATALOG.filter(a =>
    (cat === "all" || a.category === cat) &&
    (vertical === "all" || a.verticals.includes(vertical)) &&
    (!q || a.name.toLowerCase().includes(q.toLowerCase()) || a.description.toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <PageShell>
      <Topbar current="apps" />
      <Breadcrumb items={[{ label: "App Registry" }]} />

      <div className="relative z-10 mb-8">
        <h1 className="text-[36px] font-normal tracking-[-0.04em] sm:text-[48px] sm:leading-[44px]">App Registry</h1>
        <p className="mt-3 text-[13px] text-subtitle">{APP_CATALOG.length} tools, organized by discipline. Launch one inside a project to keep every session attached to the work.</p>
      </div>

      <div className="relative z-10 mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-subtitle">By Process</span>
            <div className="flex flex-wrap gap-2">
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] transition",
                  cat === c ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] text-ink hover:border-ink/40"
                )}>{c === "all" ? "All Tools" : CATEGORY_META[c].label}</button>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-[rgba(117,117,117,0.18)] px-3 py-2 sm:self-end">
            <IconSearch size={16} className="text-subtitle" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tools…" className="bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-[rgba(117,117,117,0.12)] pt-4">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-subtitle">By Vertical</span>
          <div className="flex flex-wrap gap-2">
            {VERTICALS.map(v => (
              <button key={v} onClick={() => setVertical(v)} title={v === "all" ? "All Verticals" : VERTICAL_META[v].label} className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] transition",
                vertical === v ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] text-ink hover:border-ink/40"
              )}>{v === "all" ? "All Verticals" : VERTICAL_META[v].short}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(app => (
          <a
            key={app.id}
            href={state.projects.length ? "#/apps" : "#/new-project"}
            onClick={e => {
              if (!state.projects.length) return;
              e.preventDefault();
              setSelectedAppId(app.id);
            }}
            className={cn(
              "flex flex-col gap-3 rounded-2xl bg-card p-5 text-left no-underline transition",
              "hover:-translate-y-1 hover:bg-[#ededed] hover:shadow-[0_12px_28px_rgba(21,25,13,0.1)]",
              !app.implemented && "opacity-70"
            )}
          >
            <div className="flex items-start justify-between">
              {(() => {
                const Icon = CATALOG_ICONS[app.icon];
                return Icon ? <Icon size={26} className="text-ink" /> : <span className="text-2xl">🔧</span>;
              })()}
              <span className="font-[family-name:var(--font-roboto)] text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle tabular-nums">{String(app.num).padStart(2, "0")}</span>
            </div>
            <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em]">{app.name}</p>
            <p className="text-[13px] leading-5 text-subtitle">{app.description}</p>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="relative z-10 mt-4 rounded-2xl bg-card py-14 text-center text-subtitle">No tools match your search.</div>
      )}

      <p className="relative z-10 mt-8 text-[12px] text-subtitle">Tip: launch tools from inside a project to keep session history attached to your work.</p>

      {selectedApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={() => setSelectedAppId(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="launch-title" className="palette-enter max-h-[85vh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {(() => { const Icon = CATALOG_ICONS[selectedApp.icon]; return Icon ? <Icon size={24} className="shrink-0 text-ink" /> : null; })()}
                <div>
                  <p id="launch-title" className="text-[18px] font-semibold tracking-[-0.02em]">Start {selectedApp.name}</p>
                  <p className="mt-0.5 text-[12px] text-subtitle">Choose the client project this session belongs to.</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedAppId(null)} aria-label="Close" className="text-[20px] leading-none text-ink/30 hover:text-ink">×</button>
            </div>

            <div className="flex flex-col">
              {state.projects.length === 0 && (
                <div className="rounded-xl bg-card p-6 text-center">
                  <p className="text-[14px] font-semibold">Create a project first</p>
                  <p className="mt-1 text-[12px] leading-5 text-subtitle">Client context, sessions, tasks, and exports stay together at the project level.</p>
                </div>
              )}
              {[...state.projects].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt)).map((project, i, arr) => (
                <a key={project.id} href={`#/project/${project.id}/app/${selectedApp.id}/new`}
                  className={cn("flex items-center gap-3 py-3 no-underline transition hover:opacity-70", i < arr.length - 1 && "border-b border-dashed border-[rgba(120,120,128,0.16)]")}>
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold uppercase text-white">{(project.clientName || "?").slice(0, 2)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink">{project.clientName || "Untitled client"}</span>
                    <span className="block truncate text-[11px] uppercase tracking-[0.04em] text-subtitle">{project.projectName || "Untitled project"} · {project.status}</span>
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink/40">Start</span>
                </a>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4">
              <button type="button" onClick={() => setSelectedAppId(null)} className="text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle hover:text-ink">Cancel</button>
              <a href="#/new-project" className="rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white no-underline transition hover:bg-white hover:text-ink">New project</a>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
