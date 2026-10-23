import { useState } from "react";
import { formatCurrency, type ProjectStatus } from "../data";
import { IconArrowRight20, IconPlus, IconSearch } from "../icons";
import { useStore } from "../store";
import { Breadcrumb, EmptyState, PageShell, PrimaryButton, StatusBadge, Stepper, Topbar } from "../ui";
import { cn } from "../utils/cn";

const FILTERS: (ProjectStatus | "all")[] = ["all", "active", "paused", "completed"];

export function Projects() {
  const { state } = useStore();
  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [q, setQ] = useState("");
  const filtered = state.projects
    .filter(p =>
      (filter === "all" || p.status === filter) &&
      (!q || p.clientName.toLowerCase().includes(q.toLowerCase()) || p.projectName.toLowerCase().includes(q.toLowerCase()))
    )
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  return (
    <PageShell>
      <Topbar current="projects" />
      <Breadcrumb items={[{ label: "Projects" }]} />

      <div className="relative z-10 mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-[36px] font-normal tracking-[-0.04em] sm:text-[48px] sm:leading-[44px]">Projects</h1>
        <PrimaryButton href="#/new-project"><IconPlus size={14} /> New Project</PrimaryButton>
      </div>

      <div className="relative z-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] transition",
              filter === f ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] text-ink hover:border-ink/40"
            )}>
              {f === "all" ? `All (${state.projects.length})` : `${f} (${state.projects.filter(p => p.status === f).length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[rgba(117,117,117,0.18)] px-3 py-2">
          <IconSearch size={16} className="text-subtitle" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects…" className="bg-transparent text-sm outline-none" />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="relative z-10 rounded-2xl bg-card">
          <EmptyState
            icon="📁"
            title={state.projects.length === 0 ? "No projects yet" : "No matching projects"}
            hint={state.projects.length === 0 ? "Create your first project to get started." : "Try a different filter or search."}
            action={state.projects.length === 0 ? <PrimaryButton href="#/new-project"><IconPlus size={14} /> Create First Project</PrimaryButton> : undefined}
          />
        </div>
      )}

      <div className="relative z-10 grid gap-4 md:grid-cols-2">
        {filtered.map(project => (
          <a key={project.id} href={"#/project/" + project.id} className="flex flex-col justify-between gap-5 rounded-2xl bg-card p-7 text-ink no-underline transition hover:-translate-y-1 hover:bg-[#ededed] hover:shadow-[0_12px_28px_rgba(21,25,13,0.1)]">
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-[13px] font-medium uppercase tracking-[0.02em] text-subtitle">{project.clientName}</p>
                <p className="text-[26px] font-normal leading-[28px] tracking-[-0.04em] sm:text-[32px] sm:leading-[34px]">{project.projectName || "Untitled Project"}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <Stepper steps={project.phases} done={project.donePhases} sollPct={project.sollPct} />
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.02em]">{formatCurrency(project.fee, project.feeCurrency)} · {project.feeType} · {project.metrics.done}/{project.metrics.total} tasks{project.metrics.overdue ? ` · ${project.metrics.overdue} overdue` : ""}</p>
              <span className="inline-flex shrink-0 items-center gap-1 rounded border border-ink px-2 py-1 text-[11px] font-medium uppercase tracking-[0.02em]">Open <IconArrowRight20 size={16} /></span>
            </div>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
