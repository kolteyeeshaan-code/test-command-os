import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TASK_COLUMNS, TASK_COLUMN_META, TASK_PRIORITIES, TASK_PRIORITY_META, type Sprint, type Task, type TaskPriority, type TaskStatus } from "../db/schema";
import { formatDate } from "../data";
import { IconDownload, IconGrip, IconPlus, IconPrint, IconTrash } from "../icons";
import { useStore } from "../store";
import { useToast } from "../toast";
import { useGlobalKeydown } from "../hooks";
import { docHeader, openPrintView, downloadPdf, makeFilename, escapeHtml as esc } from "../export";
import { Breadcrumb, Confirm, PageShell, ProjectTabs, Topbar } from "../ui";
import { cn } from "../utils/cn";

const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = (t: Task) => !!t.dueDate && t.dueDate < today() && t.status !== "done";

interface Draft {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  phaseIndex: number;
  sprintId: string;
  dueDate: string;
  estimate: string;
}

const emptyDraft = (status: TaskStatus): Draft => ({ title: "", description: "", status, priority: "medium", assignee: "", phaseIndex: -1, sprintId: "", dueDate: "", estimate: "" });

interface Ghost { id: string; x: number; y: number; w: number; ox: number; oy: number }

export function ProjectBoard({ projectId }: { projectId: string }) {
  const store = useStore();
  const toast = useToast();
  const project = store.state.projects.find(p => p.id === projectId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [drag, setDrag] = useState<Ghost | null>(null);
  const [dropTarget, setDropTarget] = useState<{ status: TaskStatus; index: number } | null>(null);
  const [sprintFilter, setSprintFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");

  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number } | null>(null);
  const movedRef = useRef(false);
  const autoRef = useRef<{ raf: number; x: number } | null>(null);

  useGlobalKeydown(e => {
    if (e.key !== "Escape") return;
    if (dragRef.current) { cancelDrag(); return; }
    if (draft) setDraft(null);
  });

  // Always clean up drag listeners / body lock on unmount.
  useEffect(() => () => endDragListeners(), []);

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

  const sprintName = (id: string | null) => (id ? project.sprints.find(s => s.id === id)?.name ?? "—" : "");
  const liveSprintIds = new Set(project.sprints.map(s => s.id));

  const visible = useMemo(() => {
    return project.tasks.filter(t =>
      (!sprintFilter || (sprintFilter === "none" ? !t.sprintId || !liveSprintIds.has(t.sprintId) : t.sprintId === sprintFilter)) &&
      (!assigneeFilter || (assigneeFilter === "none" ? !t.assignee.trim() : t.assignee.toLowerCase() === assigneeFilter.toLowerCase()))
    );
  }, [project.tasks, sprintFilter, assigneeFilter, project.sprints]);

  const columns = useMemo(() => {
    const map = {} as Record<TaskStatus, Task[]>;
    for (const c of TASK_COLUMNS) map[c] = visible.filter(t => t.status === c).sort((a, b) => a.order - b.order);
    return map;
  }, [visible]);

  const assignees = useMemo(() => {
    const set = new Map<string, number>();
    project.tasks.forEach(t => { if (t.assignee.trim()) set.set(t.assignee.trim(), (set.get(t.assignee.trim()) ?? 0) + 1); });
    return Array.from(set.entries()).sort((a, b) => b[1] - a[1]);
  }, [project.tasks]);

  const m = project.metrics;
  const pointsPct = m.points ? Math.round((m.pointsDone / m.points) * 100) : 0;

  const startAdd = (status: TaskStatus) => setDraft(emptyDraft(status));

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    const estimate = draft.estimate.trim() === "" ? 0 : Math.max(0, Math.min(999, Math.round(Number(draft.estimate) || 0)));
    const payload = {
      id: draft.id,
      projectId: project.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status,
      priority: draft.priority,
      assignee: draft.assignee.trim(),
      phaseIndex: draft.phaseIndex,
      sprintId: draft.sprintId || null,
      dueDate: draft.dueDate,
      estimate,
    };
    if (draft.id) { store.updateTask(draft.id, payload); toast.show("Task updated", { tone: "success" }); }
    else { store.createTask(payload); toast.show("Task added", { tone: "success" }); }
    setDraft(null);
  };

  /* ── Unified pointer drag (mouse + touch) ──────────────────────────────
     Dragging starts from the dedicated grip handle only (touch-action: none),
     so page/board scrolling that begins anywhere else is never hijacked.
     HTML5 drag-and-drop is intentionally not used — it never fires on iPadOS. */
  const startAutoScroll = () => {
    const step = () => {
      const el = boardRef.current;
      const st = autoRef.current;
      if (!el || !st) return;
      const r = el.getBoundingClientRect();
      const edge = 64;
      let dx = 0;
      if (st.x < r.left + edge) dx = -16;
      else if (st.x > r.right - edge) dx = 16;
      if (dx) el.scrollLeft += dx;
      st.raf = requestAnimationFrame(step);
    };
    autoRef.current = { raf: requestAnimationFrame(step), x: 0 };
  }

  const endDragListeners = () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("pointercancel", onPointerCancel);
    if (autoRef.current) cancelAnimationFrame(autoRef.current.raf);
    autoRef.current = null;
    document.body.classList.remove("board-dragging");
  }

  const targetFromPoint = (x: number, y: number): { status: TaskStatus; index: number } | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const zone = el?.closest?.("[data-drop-status]") as HTMLElement | null;
    if (!zone) return null;
    return { status: zone.dataset.dropStatus as TaskStatus, index: Number(zone.dataset.dropIndex ?? 0) };
  }

  const onPointerMove = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    if (e.cancelable) e.preventDefault();
    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY);
    if (dist > 8) movedRef.current = true;
    if (autoRef.current) autoRef.current.x = e.clientX;
    setDrag(prev => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
    const t = targetFromPoint(e.clientX, e.clientY);
    setDropTarget(prev => {
      if (!t && !prev) return prev;
      if (t && prev && t.status === prev.status && t.index === prev.index) return prev;
      return t;
    });
  }

  const commitDrop = (status: TaskStatus, index: number) => {
    const d = dragRef.current;
    if (!d) return;
    const dragged = project.tasks.find(t => t.id === d.id);
    if (!dragged) return;
    const shown = columns[status];
    let visibleIndex = index;
    if (dragged.status === status) {
      const from = shown.findIndex(t => t.id === d.id);
      if (from >= 0 && from < visibleIndex) visibleIndex--;
    }
    const shownWithoutDragged = shown.filter(t => t.id !== d.id);
    const anchor = shownWithoutDragged[Math.max(0, visibleIndex)];
    const completeColumn = project.tasks
      .filter(t => t.status === status && t.id !== d.id)
      .sort((a, b) => a.order - b.order);
    // With filters active, translate the visible insertion point back to the full column.
    const absoluteIndex = anchor ? completeColumn.findIndex(t => t.id === anchor.id) : completeColumn.length;
    store.moveTask(d.id, status, Math.max(0, absoluteIndex));
  }

  const onPointerUp = (e: PointerEvent) => {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const t = targetFromPoint(e.clientX, e.clientY);
    if (movedRef.current && t) commitDrop(t.status, t.index);
    cleanupDrag();
  }

  const onPointerCancel = (e: PointerEvent) => {
    if (dragRef.current && e.pointerId === dragRef.current.pointerId) cleanupDrag();
  }

  const cleanupDrag = () => {
    dragRef.current = null;
    endDragListeners();
    setDrag(null);
    setDropTarget(null);
    // Reset on next tick so the click that follows a real drag is swallowed, not opened.
    window.setTimeout(() => { movedRef.current = false; }, 0);
  }

  const cancelDrag = () => {
    dragRef.current = null;
    endDragListeners();
    setDrag(null);
    setDropTarget(null);
    movedRef.current = false;
  }

  const startDrag = (e: ReactPointerEvent<HTMLButtonElement>, t: Task) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const card = (e.currentTarget as HTMLElement).closest("article");
    const rect = card?.getBoundingClientRect();
    const w = rect?.width ?? 280;
    dragRef.current = { id: t.id, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY };
    movedRef.current = false;
    setDrag({
      id: t.id, x: e.clientX, y: e.clientY, w,
      ox: e.clientX - (rect?.left ?? e.clientX - w / 2),
      oy: Math.min(Math.max(e.clientY - (rect?.top ?? e.clientY - 24), 12), 120),
    });
    setDropTarget({ status: t.status, index: columns[t.status].findIndex(x => x.id === t.id) });
    document.body.classList.add("board-dragging");
    try { (navigator as unknown as { vibrate?: (p: number) => void }).vibrate?.(10); } catch { /* noop */ }
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    startAutoScroll();
    if (autoRef.current) autoRef.current.x = e.clientX;
  }

  const openTask = (t: Task) => {
    if (movedRef.current) return;
    setDraft({
      id: t.id, title: t.title, description: t.description, status: t.status, priority: t.priority,
      assignee: t.assignee, phaseIndex: t.phaseIndex, sprintId: t.sprintId ?? "", dueDate: t.dueDate,
      estimate: t.estimate ? String(t.estimate) : "",
    });
  };

  const cycleStatus = (t: Task) => {
    const i = TASK_COLUMNS.indexOf(t.status);
    store.moveTask(t.id, TASK_COLUMNS[(i + 1) % TASK_COLUMNS.length], 0);
  };

  const ghostTask = drag ? project.tasks.find(t => t.id === drag.id) : undefined;

  /** Printable board report — one table per column, grouped by sprint when set. */
  const boardReportHtml = () => {
    const rows = (c: TaskStatus) => columns[c].map((t, i) => {
      const labels: Record<string, string> = { low: "Low", medium: "Med", high: "High", urgent: "Urgent" };
      return `<tr><td>${i + 1}</td><td><strong>${esc(t.title)}</strong>${t.description ? `<div style="font-size:11px;color:#535862">${esc(t.description)}</div>` : ""}</td><td>${labels[t.priority]}</td><td>${t.estimate || "—"}</td><td>${esc(t.assignee || "Unassigned")}</td><td>${t.dueDate ? formatDate(t.dueDate) : "—"}</td><td>${t.sprintId ? esc(sprintName(t.sprintId)) : "—"}</td></tr>`;
    }).join("");
    const body = TASK_COLUMNS.map(c => columns[c].length
      ? `<h2>${TASK_COLUMN_META[c].label} (${columns[c].length})</h2><table><thead><tr><th>#</th><th>Task</th><th>Priority</th><th>Points</th><th>Assignee</th><th>Due</th><th>Sprint</th></tr></thead><tbody>${rows(c)}</tbody></table>`
      : "").join("");
    const summary = `<h2>Summary</h2><div class="field"><div class="field-value"><strong>${m.done}</strong> of <strong>${m.total}</strong> tasks done · <strong>${m.pointsDone}</strong>/<strong>${m.points}</strong> points (${pointsPct}%)${m.overdue ? ` · <strong>${m.overdue} overdue</strong>` : ""}</div></div>`;
    return docHeader("Delivery Board", { clientName: project.clientName, projectName: project.projectName }, "Delivery board") + summary + body;
  };

  const exportBoard = () => {
    openPrintView("Delivery board", boardReportHtml());
  };

  const downloadBoardPdf = async () => {
    const name = makeFilename(project.clientName, project.projectName, "Delivery Board");
    try {
      await downloadPdf(name, `${project.clientName} Delivery Board`, boardReportHtml());
      toast.show("Board PDF downloaded", { tone: "success" });
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
        { label: "Board" },
      ]} />

      <ProjectTabs projectId={project.id} active="board" clientName={project.clientName} projectName={project.projectName} />

      {/* Summary + filters */}
      <div className="relative z-10 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Delivery</p>
            <p className="text-[32px] font-normal leading-8 tracking-[-0.04em] tabular-nums sm:text-[40px]">
              {m.done}<span className="text-ink/30">/{m.total}</span>
              <span className="ml-2 text-[14px] font-medium text-subtitle">tasks done</span>
            </p>
          </div>
          <div className="hidden h-10 w-px bg-[rgba(117,117,117,0.2)] sm:block" />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline gap-2 text-[12px]">
              <span className="uppercase tracking-[0.04em] text-subtitle">Points</span>
              <span className="font-semibold tabular-nums text-ink">{m.pointsDone}/{m.points}</span>
              <span className="text-subtitle">({pointsPct}%)</span>
            </div>
            <div className="pattern-fill relative h-2 w-40 overflow-hidden rounded">
              <div className="absolute inset-y-0 left-0 rounded bg-ink" style={{ width: pointsPct + "%" }} />
            </div>
            <div className="flex gap-3 text-[11px] uppercase tracking-[0.04em]">
              {m.overdue > 0 && <span className="font-semibold text-[#c77700]">{m.overdue} overdue</span>}
              {m.active > 0 && <span className="text-subtitle">{m.active} in flight</span>}
              {m.unassigned > 0 && <span className="text-subtitle">{m.unassigned} unassigned</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select value={sprintFilter} onChange={e => setSprintFilter(e.target.value)} aria-label="Filter by sprint"
            className="min-h-[44px] rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-3 py-1.5 text-[13px] outline-none focus:border-ink [@media(pointer:fine)]:min-h-0">
            <option value="">All sprints</option>
            <option value="none">Unscheduled</option>
            {project.sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {assignees.length > 0 && (
            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} aria-label="Filter by assignee"
              className="min-h-[44px] rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-3 py-1.5 text-[13px] outline-none focus:border-ink [@media(pointer:fine)]:min-h-0">
              <option value="">Everyone</option>
              <option value="none">Unassigned</option>
              {assignees.map(([name, n]) => <option key={name} value={name}>{name} ({n})</option>)}
            </select>
          )}
          {(sprintFilter || assigneeFilter) && (
            <button type="button" onClick={() => { setSprintFilter(""); setAssigneeFilter(""); }}
              className="touch-hit text-[11px] font-medium uppercase tracking-[0.05em] text-subtitle underline underline-offset-2 hover:text-ink">
              Clear filters
            </button>
          )}
          <button type="button" onClick={downloadBoardPdf} title="Download Board Report as PDF"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink [@media(pointer:fine)]:min-h-0">
            <IconDownload size={14} /> PDF
          </button>
          <button type="button" onClick={exportBoard} title="Print or save the board as a PDF"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink [@media(pointer:fine)]:min-h-0">
            <IconPrint size={14} /> Print
          </button>
          <button type="button" onClick={() => startAdd("backlog")}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink [@media(pointer:fine)]:min-h-0">
            <IconPlus size={14} /> Add task
          </button>
        </div>
      </div>

      {/* Board — swipeable snap columns on touch, full 5-up grid on desktop */}
      <div ref={boardRef} className="touch-scroll relative z-10 -mx-5 flex snap-x snap-proximity gap-3 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 md:-mx-16 md:px-16 lg:grid lg:grid-cols-5 lg:overflow-visible lg:snap-none">
        {TASK_COLUMNS.map(status => {
          const meta = TASK_COLUMN_META[status];
          const items = columns[status];
          return (
            <div key={status} className="flex w-[80vw] max-w-[330px] shrink-0 snap-start flex-col rounded-2xl bg-card/70 p-2.5 sm:w-[300px] lg:w-auto lg:max-w-none lg:shrink lg:snap-align-none">
              <div className="mb-2 flex items-baseline justify-between px-1.5 pt-1">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold uppercase tracking-[0.06em] text-ink">{meta.label}</p>
                  <p className="truncate text-[10px] text-subtitle">{meta.hint}</p>
                </div>
                <span className="shrink-0 rounded bg-white px-1.5 py-0.5 font-[family-name:var(--font-roboto)] text-[11px] font-medium tabular-nums text-ink/60">{items.length}</span>
              </div>

              <div data-drop-status={status} data-drop-index={items.length} className="flex min-h-[80px] flex-col gap-2">
                {items.map((t, i) => (
                  <div key={t.id}>
                    {/* Insert indicator between cards */}
                    <div
                      data-drop-status={status} data-drop-index={i}
                      className={cn("h-0.5 rounded transition-all", dropTarget?.status === status && dropTarget.index === i ? "mb-1.5 bg-ink" : "bg-transparent")}
                    />
                    <article
                      data-task-id={t.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit task: ${t.title}`}
                      onClick={() => openTask(t)}
                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openTask(t); } }}
                      className={cn(
                        "group cursor-pointer rounded-xl border border-[rgba(117,117,117,0.14)] bg-white p-3 transition hover:border-ink/40 hover:shadow-sm",
                        drag?.id === t.id && "opacity-40",
                        t.status === "done" && "opacity-75"
                      )}
                    >
                      <div className="mb-1.5 flex items-start gap-1.5">
                        <button
                          type="button"
                          aria-label={`Drag task: ${t.title}`}
                          title="Drag to move"
                          onPointerDown={e => startDrag(e, t)}
                          onClick={e => e.stopPropagation()}
                          className="drag-handle touch-hit -ml-1 shrink-0 rounded p-1.5 text-ink/30 transition hover:text-ink active:text-ink"
                        >
                          <IconGrip size={15} />
                        </button>
                        <p className={cn("min-w-0 flex-1 text-[13px] font-semibold leading-snug", t.status === "done" && "line-through decoration-ink/40")}>{t.title}</p>
                        <button type="button" onClick={e => { e.stopPropagation(); cycleStatus(t); }}
                          title={`Move to ${TASK_COLUMN_META[TASK_COLUMNS[(TASK_COLUMNS.indexOf(t.status) + 1) % TASK_COLUMNS.length]].label}`}
                          className="touch-hit shrink-0 rounded p-1 text-[9px] font-bold uppercase tracking-[0.04em] text-ink/30 transition hover:text-ink">
                          →
                        </button>
                      </div>

                      {t.description && <p className="mb-2 line-clamp-2 text-[11px] leading-4 text-subtitle">{t.description}</p>}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.04em]",
                          t.priority === "urgent" ? "bg-[rgba(52,199,89,0.3)]" : t.priority === "high" ? "bg-[rgba(255,149,0,0.3)]" : "bg-card text-ink/60")}>
                          {TASK_PRIORITY_META[t.priority].label}
                        </span>
                        {t.estimate > 0 && <span className="rounded bg-card px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-ink/60">{t.estimate}pt</span>}
                        {t.dueDate && (
                          <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums", isOverdue(t) ? "bg-[rgba(255,69,58,0.18)] text-[#b3001b]" : "bg-card text-ink/60")}>
                            {formatDate(t.dueDate).replace(", " + new Date().getFullYear(), "")}
                          </span>
                        )}
                        {t.sprintId && <span className="rounded bg-[rgba(0,122,255,0.12)] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0060c9]">{(liveSprintIds.has(t.sprintId) ? sprintName(t.sprintId) : "Archived sprint").split(" · ")[0]}</span>}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-[rgba(120,120,128,0.14)] pt-1.5">
                        <span className="truncate text-[10px] font-medium uppercase tracking-[0.04em] text-subtitle">{t.assignee || "Unassigned"}</span>
                        {t.phaseIndex >= 0 && project.phases[t.phaseIndex] && (
                          <span className="shrink-0 truncate text-[10px] uppercase tracking-[0.04em] text-subtitle/70">{project.phases[t.phaseIndex]}</span>
                        )}
                      </div>
                    </article>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[rgba(117,117,117,0.2)] py-6 text-center text-[11px] text-subtitle/70">Drop here</div>
                )}
              </div>

              <button type="button" onClick={() => startAdd(status)}
                className="touch-hit relative mt-2 flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgba(117,117,117,0.25)] py-2 text-[10px] font-medium uppercase tracking-[0.05em] text-subtitle transition hover:border-ink hover:text-ink [@media(pointer:fine)]:min-h-0">
                <IconPlus size={11} /> Add
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating drag preview that follows the finger/cursor */}
      {drag && ghostTask && (
        <div
          className="drag-ghost fixed z-[80] rounded-xl border border-ink/40 bg-white p-3 opacity-95 shadow-[0_16px_40px_rgba(21,25,13,0.25)]"
          style={{ left: drag.x - drag.ox, top: drag.y - drag.oy, width: Math.min(drag.w, 320) }}
          aria-hidden
        >
          <p className="text-[13px] font-semibold leading-snug">{ghostTask.title}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.04em] text-subtitle">
            {dropTarget ? `→ ${TASK_COLUMN_META[dropTarget.status].label}` : "Dragging…"}
          </p>
        </div>
      )}

      {draft && (
        <TaskDrawer
          draft={draft}
          setDraft={setDraft}
          phases={project.phases}
          sprints={project.sprints}
          isNew={!draft.id}
          onSave={save}
          onClose={() => setDraft(null)}
          onDelete={draft.id ? () => setConfirmDelete(draft.id!) : undefined}
        />
      )}

      <Confirm
        open={!!confirmDelete}
        title="Move this task to the trash?"
        message="You can restore it from Data & Backup for 30 days."
        confirmLabel="Move to trash"
        danger
        onConfirm={() => {
          if (!confirmDelete) return;
          const id = confirmDelete;
          store.deleteTask(id);
          setConfirmDelete(null);
          setDraft(null);
          toast.show("Task moved to trash", { action: { label: "Undo", onClick: () => store.restoreTask(id) } });
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageShell>
  );
}

/* ───────────── Task editor ───────────── */

function TaskDrawer({ draft, setDraft, phases, sprints, isNew, onSave, onClose, onDelete }: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  phases: string[];
  sprints: Sprint[];
  isNew: boolean;
  onSave: () => void;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });
  const input = "w-full rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2 text-[14px] outline-none focus:border-ink";
  const label = "mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className="palette-enter max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-3xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[18px] font-semibold tracking-[-0.02em]">{isNew ? "New task" : "Edit task"}</p>
          <div className="flex items-center gap-2">
            {onDelete && <button type="button" onClick={onDelete} aria-label="Delete task" className="touch-hit rounded-lg p-2 text-ink/30 transition hover:bg-red-50 hover:text-red-500"><IconTrash size={16} /></button>}
            <button type="button" onClick={onClose} aria-label="Close" className="touch-hit rounded-lg p-2 text-[20px] leading-none text-ink/30 hover:text-ink">×</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className={label}>Title</label>
            <input autoFocus value={draft.title} onChange={e => set("title", e.target.value)} placeholder="What needs to happen?" className={cn(input, "text-[16px] font-semibold")}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(); }} />
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea value={draft.description} onChange={e => set("description", e.target.value)} rows={3} placeholder="Context, acceptance criteria, links…" className={cn(input, "resize-none leading-6")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Column</label>
              <select value={draft.status} onChange={e => set("status", e.target.value as TaskStatus)} className={input}>
                {TASK_COLUMNS.map(c => <option key={c} value={c}>{TASK_COLUMN_META[c].label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Priority</label>
              <select value={draft.priority} onChange={e => set("priority", e.target.value as TaskPriority)} className={input}>
                {TASK_PRIORITIES.map(p => <option key={p} value={p}>{TASK_PRIORITY_META[p].label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Assignee</label>
              <input value={draft.assignee} onChange={e => set("assignee", e.target.value)} placeholder="You, client, vendor…" className={input} />
            </div>
            <div>
              <label className={label}>Estimate (points)</label>
              <input type="number" inputMode="numeric" min={0} max={999} value={draft.estimate} onChange={e => set("estimate", e.target.value)} placeholder="0" className={cn(input, "tabular-nums")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Due date</label>
              <input type="date" value={draft.dueDate} onChange={e => set("dueDate", e.target.value)} className={cn(input, "min-h-[44px]")} />
            </div>
            <div>
              <label className={label}>Phase</label>
              <select value={draft.phaseIndex} onChange={e => set("phaseIndex", Number(e.target.value))} className={cn(input, "min-h-[44px]")}>
                <option value={-1}>No phase</option>
                {phases.map((p, i) => <option key={i} value={i}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={label}>Sprint</label>
            <select value={draft.sprintId} onChange={e => set("sprintId", e.target.value)} className={cn(input, "min-h-[44px]")}>
              <option value="">Unscheduled</option>
              {draft.sprintId && !sprints.some(s => s.id === draft.sprintId) && <option value={draft.sprintId}>Archived sprint (restore from Data)</option>}
              {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4">
          <button type="button" onClick={onClose} className="min-h-[44px] rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:border-ink [@media(pointer:fine)]:min-h-0">Cancel</button>
          <button type="button" onClick={onSave} disabled={!draft.title.trim()}
            className={cn("min-h-[44px] rounded-full border border-ink bg-ink px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink [@media(pointer:fine)]:min-h-0", !draft.title.trim() && "pointer-events-none opacity-40")}>
            {isNew ? "Add task" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
