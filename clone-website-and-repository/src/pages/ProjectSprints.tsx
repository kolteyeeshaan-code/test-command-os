import { useState } from "react";
import type { Sprint, SprintStatus, Task } from "../db/schema";
import { formatDate } from "../data";
import { IconDownload, IconPlus, IconPrint, IconTrash } from "../icons";
import { useStore } from "../store";
import { useToast } from "../toast";
import { docHeader, escapeHtml as esc, openPrintView, downloadPdf, makeFilename } from "../export";
import { Badge, Breadcrumb, Confirm, PageShell, ProjectTabs, Topbar } from "../ui";
import { cn } from "../utils/cn";

const SPRINT_META: Record<SprintStatus, { label: string; tone: "green" | "orange" | "gray" }> = {
  active: { label: "Active", tone: "green" },
  planned: { label: "Planned", tone: "orange" },
  completed: { label: "Completed", tone: "gray" },
};

const today = () => new Date().toISOString().slice(0, 10);

interface Draft { id?: string; name: string; goal: string; startDate: string; endDate: string; status: SprintStatus }
const addDays = (date: string, days: number) => {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const emptyDraft = (): Draft => { const start = today(); return { name: "", goal: "", startDate: start, endDate: addDays(start, 13), status: "planned" }; };

const daysBetween = (a: string, b: string) => Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 864e5));

export function ProjectSprints({ projectId }: { projectId: string }) {
  const store = useStore();
  const toast = useToast();
  const project = store.state.projects.find(p => p.id === projectId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (!project) {
    return (
      <PageShell>
        <Topbar current="projects" />
        <div className="relative z-10 rounded-2xl bg-card p-10 text-center">
          <p className="text-[20px] font-normal tracking-[-0.03em]">Project not found</p>
          <a href="#/projects" className="mt-2 inline-block text-sm text-ink underline underline-offset-4">Back to projects</a>
        </div>
      </PageShell>
    );
  }

  const sprintStats = (s: Sprint) => {
    const tasks = store.sprintTasks(s.id);
    const done = tasks.filter(t => t.status === "done");
    const points = tasks.reduce((n, t) => n + t.estimate, 0);
    const pointsDone = done.reduce((n, t) => n + t.estimate, 0);
    return { tasks, done: done.length, total: tasks.length, points, pointsDone, pct: points ? Math.round((pointsDone / points) * 100) : (tasks.length ? Math.round((done.length / tasks.length) * 100) : 0) };
  };

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      toast.show("Sprint end date must be on or after the start date.", { tone: "error" });
      return;
    }
    const payload = { id: draft.id, projectId: project.id, name: draft.name.trim(), goal: draft.goal.trim(), startDate: draft.startDate, endDate: draft.endDate, status: draft.status };
    if (draft.id) { store.updateSprint(draft.id, payload); toast.show("Sprint updated", { tone: "success" }); }
    else { store.createSprint(payload); toast.show("Sprint created", { tone: "success" }); }
    setDraft(null);
  };

  // Velocity: completed points per sprint, oldest → newest.
  const velocity = project.sprints
    .filter(s => s.status === "completed")
    .map(s => ({ name: s.name, points: sprintStats(s).pointsDone }))
    .reverse();
  const maxVelocity = Math.max(1, ...velocity.map(v => v.points));
  const avgVelocity = velocity.length ? Math.round(velocity.reduce((n, v) => n + v.points, 0) / velocity.length) : 0;

  const sprintReportHtml = () => {
    const body = project.sprints.map(s => {
      const st = sprintStats(s);
      const rows = st.tasks.map((t, i) => `<tr><td>${i + 1}</td><td><strong>${esc(t.title)}</strong></td><td>${esc(t.status)}</td><td>${esc(t.assignee || "Unassigned")}</td><td>${t.estimate || "—"}</td><td>${t.dueDate ? formatDate(t.dueDate) : "—"}</td></tr>`).join("");
      return `<h2>${esc(s.name)} · ${esc(SPRINT_META[s.status].label)}</h2>${s.goal ? `<div class="field"><div class="field-label">Sprint goal</div><div class="field-value">${esc(s.goal)}</div></div>` : ""}<p><strong>${st.done}/${st.total}</strong> tasks · <strong>${st.pointsDone}/${st.points}</strong> points · ${st.pct}% complete · ${s.startDate ? formatDate(s.startDate) : "—"} → ${s.endDate ? formatDate(s.endDate) : "—"}</p>${rows ? `<table><thead><tr><th>#</th><th>Task</th><th>Status</th><th>Assignee</th><th>Points</th><th>Due</th></tr></thead><tbody>${rows}</tbody></table>` : ""}`;
    }).join("");
    return docHeader("Sprint Report", { clientName: project.clientName, projectName: project.projectName }, "Sprint delivery report") + body;
  };

  const printSprints = () => {
    openPrintView("Sprint report", sprintReportHtml());
  };

  const downloadSprintPdf = async () => {
    const name = makeFilename(project.clientName, project.projectName, "Sprint Report");
    try {
      await downloadPdf(name, `${project.clientName} Sprint Report`, sprintReportHtml());
      toast.show("Sprint PDF downloaded", { tone: "success" });
    } catch {
      toast.show("Could not generate PDF — use Print dialog instead", { tone: "error" });
    }
  };

  return (
    <PageShell>
      <Topbar current="projects" />
      <Breadcrumb items={[
        { label: "Projects", href: "#/projects" },
        { label: project.clientName, href: `#/project/${project.id}` },
        { label: "Sprints" },
      ]} />

      <ProjectTabs projectId={project.id} active="sprints" clientName={project.clientName} projectName={project.projectName} />

      <div className="relative z-10 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Scrum</p>
          <p className="text-[32px] font-normal leading-8 tracking-[-0.04em] sm:text-[40px]">
            {project.sprints.length} sprint{project.sprints.length === 1 ? "" : "s"}
            <span className="ml-2 text-[14px] font-medium text-subtitle">{project.sprints.filter(s => s.status === "active").length} active</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {project.sprints.length > 0 && (
            <>
              <button type="button" onClick={downloadSprintPdf} title="Download Sprint Report as PDF" className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink">
                <IconDownload size={14} /> PDF
              </button>
              <button type="button" onClick={printSprints} title="Print Sprint Report" className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink">
                <IconPrint size={14} /> Print
              </button>
            </>
          )}
          <button type="button" onClick={() => setDraft(emptyDraft())}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
            <IconPlus size={14} /> New sprint
          </button>
        </div>
      </div>

      {project.sprints.length === 0 && (
        <div className="relative z-10 rounded-2xl bg-card py-14 text-center">
          <p className="text-[15px] font-semibold">No sprints yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-subtitle">Sprints group board tasks into a fixed timebox with a single goal, so you can see progress and velocity per client.</p>
          <button type="button" onClick={() => setDraft(emptyDraft())} className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
            <IconPlus size={14} /> Create first sprint
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-4">
        {project.sprints.map(s => {
          const st = sprintStats(s);
          const series = store.burndown(s.id);
          const meta = SPRINT_META[s.status];
          const length = s.startDate && s.endDate ? daysBetween(s.startDate, s.endDate) : 0;
          const signedDaysLeft = s.endDate ? Math.ceil((Date.parse(s.endDate + "T23:59:59") - Date.now()) / 864e5) : 0;
          const isRunning = s.status === "active";
          return (
            <div key={s.id} className="rounded-2xl bg-card p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-[rgba(120,120,128,0.2)] pb-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[18px] font-bold tracking-[-0.02em]">{s.name}</p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  {s.goal && <p className="mt-1 text-[13px] leading-5 text-subtitle">{s.goal}</p>}
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.04em] text-subtitle">
                    {s.startDate ? formatDate(s.startDate) : "—"} → {s.endDate ? formatDate(s.endDate) : "—"}
                    {length > 0 && <> · {length} day{length === 1 ? "" : "s"}</>}
                    {isRunning && s.endDate && <> · <span className={cn(signedDaysLeft <= 2 ? "font-semibold text-[#c77700]" : "text-ink")}>
                      {signedDaysLeft < 0 ? `${Math.abs(signedDaysLeft)} day${Math.abs(signedDaysLeft) === 1 ? "" : "s"} overdue`
                        : signedDaysLeft === 0 ? "ends today"
                        : `${signedDaysLeft} day${signedDaysLeft === 1 ? "" : "s"} left`}
                    </span></>}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <select value={s.status} onChange={e => store.updateSprint(s.id, { status: e.target.value as SprintStatus })} aria-label="Sprint status"
                    className="cursor-pointer rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-ink">
                    {(Object.keys(SPRINT_META) as SprintStatus[]).map(k => <option key={k} value={k}>{SPRINT_META[k].label}</option>)}
                  </select>
                  <button type="button" onClick={() => setDraft({ id: s.id, name: s.name, goal: s.goal, startDate: s.startDate, endDate: s.endDate, status: s.status })}
                    className="rounded-lg border border-[rgba(117,117,117,0.2)] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.05em] transition hover:border-ink">Edit</button>
                  <button type="button" onClick={() => setConfirmDelete(s.id)} aria-label="Delete sprint" className="rounded-lg p-2 text-ink/30 transition hover:bg-red-50 hover:text-red-500"><IconTrash size={15} /></button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
                {/* Progress + task list */}
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="text-[24px] font-normal tracking-[-0.03em] tabular-nums">{st.done}<span className="text-ink/30">/{st.total}</span>
                      <span className="ml-1.5 text-[12px] font-medium text-subtitle">tasks</span></span>
                    <span className="text-[13px] text-subtitle"><strong className="tabular-nums text-ink">{st.pointsDone}</strong>/{st.points} points · {st.pct}%</span>
                  </div>
                  <div className="pattern-fill relative mb-4 h-2 overflow-hidden rounded">
                    <div className="absolute inset-y-0 left-0 rounded bg-ink transition-all" style={{ width: st.pct + "%" }} />
                  </div>

                  {st.tasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[rgba(117,117,117,0.2)] py-5 text-center text-[12px] text-subtitle">
                      No tasks scheduled. Assign tasks to this sprint from the <a href={`#/project/${project.id}/board`} className="text-ink underline underline-offset-2">board</a>.
                    </p>
                  ) : (
                    <div className="flex flex-col">
                      {st.tasks.map((t, i) => <SprintRow key={t.id} task={t} phase={t.phaseIndex >= 0 ? project.phases[t.phaseIndex] : undefined} last={i === st.tasks.length - 1} />)}
                    </div>
                  )}
                </div>

                {/* Burndown */}
                <div className="rounded-xl bg-white p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Burndown</p>
                  {series.length > 1 ? (
                    <>
                      <BurndownChart series={series} />
                      <div className="mt-2 flex items-baseline justify-between text-[10px] uppercase tracking-[0.04em] text-subtitle">
                        <span>{formatDate(series[0].day).slice(0, 6)}</span>
                        <span className="tabular-nums text-ink">{series[series.length - 1].remaining} pts left</span>
                        <span>{formatDate(series[series.length - 1].day).slice(0, 6)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="py-4 text-[11px] leading-4 text-subtitle">Set a start and end date to chart the burndown.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Velocity */}
      {velocity.length > 0 && (
        <div className="relative z-10 mt-4 rounded-2xl bg-card p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Velocity — completed points per sprint</p>
            {avgVelocity > 0 && <span className="text-[12px] text-subtitle">avg <strong className="tabular-nums text-ink">{avgVelocity}</strong> pts</span>}
          </div>
          <div className="flex items-end gap-2">
            {velocity.map(v => (
              <div key={v.name} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold tabular-nums text-ink">{v.points}</span>
                <div className="w-full rounded-t bg-ink transition-all" style={{ height: Math.max(4, (v.points / maxVelocity) * 110) + "px" }} />
                <span className="w-full truncate text-center text-[10px] uppercase tracking-[0.03em] text-subtitle" title={v.name}>{v.name.split(" · ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={() => setDraft(null)}>
          <div role="dialog" aria-modal="true" className="palette-enter w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
            <p className="mb-4 text-[18px] font-semibold tracking-[-0.02em]">{draft.id ? "Edit sprint" : "New sprint"}</p>
            <div className="flex flex-col gap-4">
              <Field label="Name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} placeholder="Sprint 2 · Visual identity" autoFocus />
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Sprint goal</label>
                <textarea value={draft.goal} onChange={e => setDraft({ ...draft, goal: e.target.value })} rows={2} placeholder="The single outcome this sprint delivers…" className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.18)] px-3 py-2 text-[14px] leading-6 outline-none focus:border-ink" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start" type="date" value={draft.startDate} onChange={v => setDraft({ ...draft, startDate: v })} />
                <Field label="End" type="date" value={draft.endDate} onChange={v => setDraft({ ...draft, endDate: v })} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Status</label>
                <select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as SprintStatus })} className="w-full rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] outline-none focus:border-ink">
                  {(Object.keys(SPRINT_META) as SprintStatus[]).map(k => <option key={k} value={k}>{SPRINT_META[k].label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4">
              <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink">Cancel</button>
              <button type="button" onClick={save} disabled={!draft.name.trim()}
                className={cn("rounded-full border border-ink bg-ink px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink", !draft.name.trim() && "pointer-events-none opacity-40")}>
                {draft.id ? "Save changes" : "Create sprint"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={!!confirmDelete}
        title="Move this sprint to the trash?"
        message="Its tasks stay on the board and keep their sprint link, so restoring the sprint is lossless."
        confirmLabel="Move to trash"
        danger
        onConfirm={() => {
          if (!confirmDelete) return;
          const id = confirmDelete;
          store.deleteSprint(id);
          setConfirmDelete(null);
          toast.show("Sprint moved to trash", { action: { label: "Undo", onClick: () => store.restoreSprint(id) } });
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}

function SprintRow({ task: t, phase, last }: { task: Task; phase?: string; last: boolean }) {
  const store = useStore();
  const overdue = !!t.dueDate && t.dueDate < today() && t.status !== "done";
  return (
    <div className={cn("group flex items-center gap-3 py-2.5", !last && "border-b border-dashed border-[rgba(120,120,128,0.14)]")}>
      <button
        type="button"
        aria-label={t.status === "done" ? "Reopen task" : "Mark done"}
        onClick={() => store.moveTask(t.id, t.status === "done" ? "todo" : "done", 0)}
        className={cn("touch-hit flex h-5 w-5 shrink-0 items-center justify-center rounded border transition",
          t.status === "done" ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.4)] hover:border-ink")}
      >
        {t.status === "done" && <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
      </button>
      <span className={cn("min-w-0 flex-1 truncate text-[13px]", t.status === "done" ? "text-subtitle line-through decoration-ink/40" : "text-ink")}>{t.title}</span>
      {t.estimate > 0 && <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-ink/60">{t.estimate}pt</span>}
      {phase && <span className="hidden shrink-0 text-[10px] uppercase tracking-[0.04em] text-subtitle/70 sm:inline">{phase}</span>}
      <span className={cn("w-16 shrink-0 text-right text-[10px] font-semibold tabular-nums", overdue ? "text-[#b3001b]" : "text-subtitle")}>{t.dueDate ? formatDate(t.dueDate).slice(0, 6) : ""}</span>
      <span className="hidden w-20 shrink-0 truncate text-right text-[10px] uppercase tracking-[0.04em] text-subtitle sm:block" title={t.updatedAt}>{t.assignee || "—"}</span>
    </div>
  );
}

/** Pure-CSS burndown: a stepped area of remaining points per day. */
function BurndownChart({ series }: { series: { day: string; remaining: number }[] }) {
  const max = Math.max(1, ...series.map(p => p.remaining));
  // Ideal line runs from max to 0 across the window.
  return (
    <div className="relative h-[120px] w-full">
      <div className="flex h-full items-end gap-px">
        {series.map(p => (
          <div key={p.day} className="relative flex-1">
            <div className="w-full rounded-t bg-ink/85 transition-all" style={{ height: Math.max(1, (p.remaining / max) * 112) + "px" }} title={`${formatDate(p.day)} · ${p.remaining} pts remaining`} />
            {/* Marker for today */}
            {p.day === today() && <div className="absolute -bottom-1 left-0 h-[124px] w-0.5 bg-[rgba(229,184,56,0.7)]" />}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 origin-left" style={{ height: "112px" }}>
        <svg viewBox={`0 0 ${series.length} 10`} preserveAspectRatio="none" className="h-full w-full">
          <line x1="0" y1="0" x2={series.length} y2="10" stroke="#e5b838" strokeWidth="0.15" strokeDasharray="0.4 0.4" />
        </svg>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      <input autoFocus={autoFocus} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] outline-none focus:border-ink" />
    </div>
  );
}

