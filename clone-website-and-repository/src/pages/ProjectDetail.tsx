import { useRef, useState } from "react";
import { formatCurrency, formatDate, generateId, getApp, getImplementedApps, relativeTime } from "../data";
import { TASK_COLUMNS, TASK_COLUMN_META } from "../db/schema";
import { CATALOG_ICONS, IconArrowRight20, IconClipboard, IconDoc, IconDownload, IconFile, IconPrint, IconStar, IconTrash, IconUpload } from "../icons";
import { useStore } from "../store";
import { useToast } from "../toast";
import { ExportMenu, type ExportAction } from "../components/ExportMenu";
import { copyText, dlJSON, downloadHtml, downloadPdf, downloadText, makeFilename, openPrintView } from "../export";
import { projectContextHtml, projectContextJson, projectContextMarkdown } from "../contextPack";
import { Breadcrumb, Card, Confirm, GhostButton, Metric, PageShell, ProjectTabs, SectionTitle, StatusSelect, Stepper, Topbar } from "../ui";
import { cn } from "../utils/cn";

export function ProjectDetail({ projectId }: { projectId: string }) {
  const store = useStore();
  const toast = useToast();
  const project = store.state.projects.find(p => p.id === projectId);
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<string | null>(null);
  const [confirmClearMethodology, setConfirmClearMethodology] = useState(false);
  const [exportBusy, setExportBusy] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) {
    const trashed = store.state.trash.projects.find(p => p.id === projectId);
    return (
      <PageShell>
        <Topbar current="projects" />
        <div className="relative z-10 rounded-2xl bg-card p-10 text-center">
          <p className="text-[20px] font-normal tracking-[-0.03em]">{trashed ? "This project is in the trash" : "Project not found"}</p>
          <p className="mt-2 text-sm text-subtitle">{trashed ? "Restore it to keep working, or find it under Data & Backup." : "It may have been deleted or the link is out of date."}</p>
          <div className="mt-5 flex justify-center gap-2">
            {trashed && <GhostButton onClick={() => { store.restoreProject(projectId); toast.show("Project restored", { tone: "success" }); }}>Restore project</GhostButton>}
            <GhostButton href="#/projects">Back to projects</GhostButton>
          </div>
        </div>
      </PageShell>
    );
  }

  const sessions = store.sessionsForProject(project.id);
  const m = project.metrics;
  const usedAppIds = Array.from(new Set(sessions.map(s => s.appId)));
  const usedApps = usedAppIds.map(id => getApp(id)).filter(Boolean);
  const otherApps = getImplementedApps().filter(a => !usedAppIds.includes(a.id));

  function onFiles(fs: FileList | null) {
    if (!fs?.length) return;
    Array.from(fs).forEach(f => store.addFile(project!.id, { id: generateId(), name: f.name, meta: "Uploaded · " + formatDate(new Date().toISOString()), size: f.size, mimeType: f.type || undefined }));
    toast.show(fs.length === 1 ? "File added" : `${fs.length} files added`, { tone: "success" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function duplicateSession(sessionId: string) {
    const clone = store.duplicateSession(sessionId);
    if (clone) window.location.hash = `/project/${project!.id}/app/${clone.appId}/${clone.id}`;
  }

  function deleteProject() {
    const id = project!.id;
    const label = project!.clientName;
    store.deleteProject(id);
    setConfirmDelete(false);
    window.location.hash = "/projects";
    toast.show(`${label} moved to trash`, { action: { label: "Undo", onClick: () => store.restoreProject(id) } });
  }

  function deleteSession(id: string) {
    const s = sessions.find(x => x.id === id);
    store.deleteSession(id);
    setConfirmDeleteSession(null);
    toast.show(`“${s?.title ?? "Session"}” moved to trash`, { action: { label: "Undo", onClick: () => store.restoreSession(id) } });
  }

  const packName = makeFilename(project.clientName, project.projectName, "LLM Context Pack");
  const packMarkdown = () => projectContextMarkdown(project, sessions);
  const packHtml = () => projectContextHtml(project, sessions);
  const downloadContextPdf = async () => {
    setExportBusy("Building PDF");
    try {
      await downloadPdf(packName, `${project.clientName} context pack`, packHtml());
      toast.show("Context pack PDF downloaded", { tone: "success" });
    } catch {
      toast.show("Could not build the PDF. Use Print dialog → Save as PDF instead.", { tone: "error" });
    } finally {
      setExportBusy(null);
    }
  };
  const exportActions: ExportAction[] = [
    { id: "context-md", label: "LLM context pack", hint: "Markdown for Claude / Grok", primary: true, icon: <IconDoc size={15} />, onClick: () => downloadText(packName + ".md", packMarkdown(), "text/markdown") },
    { id: "copy-context", label: "Copy context", hint: "Markdown to clipboard", icon: <IconClipboard size={15} />, onClick: async () => { const ok = await copyText(packMarkdown()); toast.show(ok ? "Context copied" : "Could not copy context", { tone: ok ? "success" : "error" }); } },
    { id: "context-json", label: "Context pack JSON", hint: "Clean structured project memory", icon: <IconDownload size={15} />, onClick: () => dlJSON(packName, projectContextJson(project, sessions)) },
    { id: "context-pdf", label: "Download PDF", hint: "Project brief + delivery + sessions", icon: <IconDownload size={15} />, onClick: downloadContextPdf },
    { id: "context-print", label: "Print dialog", hint: "Save project pack as PDF", icon: <IconPrint size={15} />, onClick: () => openPrintView(`${project.clientName} context pack`, packHtml()) },
    { id: "context-html", label: "Download HTML", hint: "Self-contained project pack", icon: <IconFile size={15} />, onClick: () => downloadHtml(packName, `${project.clientName} context pack`, packHtml()) },
    { id: "backup", label: "Full project backup", hint: "Restorable JSON package", icon: <IconDownload size={15} />, onClick: () => { store.exportProject(project.id); toast.show("Project backup exported"); } },
    { id: "clear-methodology", label: "Clear session content", hint: "Keep project + session metadata", danger: true, icon: <IconTrash size={15} />, onClick: () => setConfirmClearMethodology(true) },
  ];

  return (
    <PageShell>
      <Topbar current="projects" />
      <Breadcrumb items={[{ label: "Projects", href: "#/projects" }, { label: project.clientName }]} />

      {/* Header */}
      <div className="relative z-10 mb-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-subtitle">{project.clientName}</p>
          <h1 className="break-words text-[36px] font-normal leading-[38px] tracking-[-0.04em] sm:text-[48px] sm:leading-[46px]">{project.projectName || "Untitled Project"}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.04em] text-subtitle">
            <StatusSelect value={project.status} onChange={s => { store.setProjectStatus(project.id, s); toast.show(`Marked ${s}`); }} />
            <span>{formatDate(project.startDate)} → {formatDate(project.targetEndDate)}</span>
            <span>·</span>
            <span>{formatCurrency(project.fee, project.feeCurrency)} {project.feeType}</span>
            <span>·</span>
            <span>Last activity {relativeTime(project.lastActivityAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GhostButton href={"#/project/" + project.id + "/edit"}>Edit Project</GhostButton>
          <ExportMenu busy={exportBusy ?? undefined} actions={exportActions} />
          <GhostButton danger onClick={() => setConfirmDelete(true)}>Delete</GhostButton>
        </div>
      </div>

      <ProjectTabs projectId={project.id} active="overview" clientName={project.clientName} projectName={project.projectName} showHeading={false} />

      <div className="relative z-10 grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4 rounded-[20px] bg-card p-3">
          <div className="flex flex-col gap-6 rounded-2xl bg-white p-7">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Progress</p>
              <Stepper steps={project.phases} done={project.donePhases} sollPct={project.sollPct} />
              <p className="mt-3 text-[11px] text-subtitle">{project.donePhases} of {project.phases.length} phases complete</p>
            </div>
            {project.scopeSummary && (
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Scope</p>
                <p className="text-[15px] leading-6">{project.scopeSummary}</p>
              </div>
            )}
          </div>

          {/* Delivery tracking summary */}
          <div className="rounded-2xl bg-white p-7">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Delivery tracking</p>
              <div className="flex gap-2">
                <a href={`#/project/${project.id}/board`} className="rounded-full border border-ink px-3 py-1 text-[10px] font-medium uppercase tracking-[0.05em] no-underline transition hover:bg-ink hover:text-white">Board</a>
                <a href={`#/project/${project.id}/sprints`} className="rounded-full border border-[rgba(117,117,117,0.25)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.05em] no-underline transition hover:border-ink">Sprints</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-4">
              <Metric label="Tasks done" value={`${m.done}/${m.total}`} />
              <Metric label="Points" value={m.points ? `${m.pointsDone}/${m.points}` : "—"} />
              <Metric label="In flight" value={String(m.active)} />
              <Metric label="Overdue" value={String(m.overdue)} warn={m.overdue > 0} />
            </div>
            <div className="pattern-fill relative mt-4 h-2 overflow-hidden rounded">
              <div className="absolute inset-y-0 left-0 rounded bg-ink transition-all" style={{ width: (m.points ? Math.round((m.pointsDone / m.points) * 100) : 0) + "%" }} />
            </div>
            {/* Column distribution */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {TASK_COLUMNS.map(c => {
                const n = m.byColumn[c] ?? 0;
                if (!n) return null;
                return (
                  <a key={c} href={`#/project/${project.id}/board`} className="flex items-center gap-1.5 text-[11px] no-underline transition hover:opacity-70">
                    <span className={cn("h-2 w-2 rounded-full", c === "done" ? "bg-[#34c759]" : c === "doing" ? "bg-ink" : c === "review" ? "bg-[#007aff]" : "bg-ink/25")} />
                    <span className="uppercase tracking-[0.04em] text-subtitle">{TASK_COLUMN_META[c].label}</span>
                    <span className="font-semibold tabular-nums text-ink">{n}</span>
                  </a>
                );
              })}
            </div>
            {project.sprints.filter(s => s.status === "active").length > 0 && (
              <div className="mt-4 flex flex-col gap-1.5 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-3">
                {project.sprints.filter(s => s.status === "active").map(s => {
                  const tasks = store.sprintTasks(s.id);
                  const done = tasks.filter(t => t.status === "done").length;
                  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
                  return (
                    <a key={s.id} href={`#/project/${project.id}/sprints`} className="flex items-center gap-2 text-[12px] no-underline transition hover:opacity-70">
                      <span className="rounded bg-[rgba(52,199,89,0.3)] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.04em]">Active</span>
                      <span className="min-w-0 flex-1 truncate text-ink">{s.name}</span>
                      <span className="shrink-0 tabular-nums text-subtitle">{done}/{tasks.length} · {pct}%</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {project.goals.length > 0 && (
            <div className="rounded-2xl bg-white p-7">
              <SectionTitle>Goals</SectionTitle>
              <ul className="mt-4 flex flex-col gap-2.5">
                {project.goals.map((g, i) => (
                  <li key={i} className="relative pl-5 text-[15px] leading-6 tracking-[-0.01em] before:absolute before:top-2.5 before:left-0.5 before:h-[5px] before:w-[5px] before:rounded-full before:bg-ink">{g}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-white p-7">
            <SectionTitle>Files</SectionTitle>
            <div className="mt-3 flex flex-col">
              {project.files.length === 0 && <p className="py-3 text-sm text-subtitle">No files yet.</p>}
              {project.files.map(f => (
                <div key={f.id} className="group flex items-center gap-3 border-b border-dashed border-[rgba(120,120,128,0.16)] py-4 last:border-0">
                  <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-ink p-2.5"><IconFile /></span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-bold leading-5">{f.name}</span>
                    <span className="text-[11px] font-medium text-black/55">{f.meta}</span>
                  </span>
                  <button type="button" onClick={() => store.deleteFile(project.id, f.id)} aria-label="Remove file" className="shrink-0 rounded-lg p-2 text-ink/30 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus-visible:opacity-100"><IconTrash size={16} /></button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
              className="mt-3 flex w-full flex-col items-center gap-3 rounded-[20px] border border-dashed border-[#d9d9d9] py-6 transition hover:border-[#b3b3b3] hover:bg-black/[0.02]"
            >
              <IconUpload />
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em]">Drop file or click to upload</span>
            </button>
            <input ref={fileInputRef} type="file" className="hidden" multiple onChange={e => onFiles(e.target.files)} />
          </div>

          <div className="rounded-2xl bg-white p-7">
            <SectionTitle>Notes</SectionTitle>
            <form className="mt-4 flex flex-col gap-2" onSubmit={e => {
              e.preventDefault();
              if (!noteText.trim()) return;
              store.addNote(project.id, { author: "You", body: noteText.trim() });
              setNoteText("");
            }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit(); }}
                placeholder="Add a note… (⌘↵ to save)"
                rows={2}
                className="w-full resize-none rounded-xl border border-[rgba(117,117,117,0.18)] bg-white p-3 text-sm outline-none focus:border-ink"
              />
              <button type="submit" disabled={!noteText.trim()} className="self-end rounded-full border border-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-40">Save Note</button>
            </form>
            <div className="mt-5 flex flex-col gap-4">
              {project.notes.map(n => (
                <div key={n.id} className="group flex flex-col gap-1 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4 first:border-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-bold">{n.author}</span>
                      <span className="text-[11px] uppercase tracking-[0.04em] text-black/40" title={n.createdAt}>{n.time}</span>
                    </div>
                    <button type="button" onClick={() => store.deleteNote(project.id, n.id)} aria-label="Delete note" className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"><IconTrash size={14} className="text-ink/30 hover:text-red-500" /></button>
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-6 text-ink">{n.body}</p>
                </div>
              ))}
              {project.notes.length === 0 && <p className="text-sm text-subtitle">No notes yet.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle action={sessions.length > 0 ? <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">{sessions.length} session{sessions.length === 1 ? "" : "s"}</span> : undefined}>Session History</SectionTitle>
            <div className="mt-4 flex flex-col">
              {sessions.length === 0 && (
                <div className="rounded-xl bg-white/60 p-6 text-center">
                  <p className="text-sm text-subtitle">No sessions yet. Launch a tool below to start one.</p>
                </div>
              )}
              {sessions.map((s, i) => {
                const app = getApp(s.appId);
                if (!app) return null;
                const Icon = CATALOG_ICONS[app.icon];
                return (
                  <div key={s.id} className={cn("group flex items-center gap-3 py-3", i < sessions.length - 1 && "border-b border-dashed border-[rgba(120,120,128,0.16)]")}>
                    <a href={`#/project/${project.id}/app/${s.appId}/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3 no-underline">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center">{Icon ? <Icon size={20} className="text-ink/70" /> : <IconStar size={18} />}</span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px] font-semibold text-ink">{s.title}</span>
                        <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">{app.name} · {relativeTime(s.updatedAt)} · rev {s.revision}</span>
                      </span>
                    </a>
                    <div className="flex shrink-0 items-center gap-1 opacity-40 transition group-hover:opacity-100 focus-within:opacity-100">
                      <button type="button" title="Duplicate" aria-label="Duplicate session" onClick={() => duplicateSession(s.id)} className="rounded-lg p-2 hover:bg-black/5"><IconStar size={14} className="text-ink/70" /></button>
                      <button type="button" title="Delete" aria-label="Delete session" onClick={() => setConfirmDeleteSession(s.id)} className="rounded-lg p-2 hover:bg-red-50"><IconTrash size={14} className="text-ink/50 hover:text-red-500" /></button>
                      <a title="Open" aria-label="Open session" href={`#/project/${project.id}/app/${s.appId}/${s.id}`} className="rounded-lg p-2 hover:bg-black/5"><IconArrowRight20 size={16} /></a>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <SectionTitle>Launch Tool</SectionTitle>

            {usedApps.length > 0 && (
              <>
                <p className="mt-4 mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Previously used</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {usedApps.map(app => app && (
                    <a key={app.id} href={`#/project/${project.id}/app/${app.id}/new`} title="Start a new session" className="flex items-center gap-2 rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-3 py-2.5 text-[12px] font-medium no-underline transition hover:-translate-y-0.5 hover:border-ink hover:shadow-sm">
                      {(() => { const I = CATALOG_ICONS[app.icon]; return I ? <I size={16} className="shrink-0 text-ink/70" /> : null; })()}
                      <span className="truncate">{app.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            <p className="mt-5 mb-3 text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Other tools</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {otherApps.map(app => {
                const I = CATALOG_ICONS[app.icon];
                return (
                  <a key={app.id} href={`#/project/${project.id}/app/${app.id}/new`} title="Start a new session" className="flex items-center gap-2 rounded-lg border border-[rgba(117,117,117,0.12)] bg-white/70 px-3 py-2.5 text-[12px] font-medium no-underline transition hover:-translate-y-0.5 hover:border-ink hover:bg-white hover:shadow-sm">
                    {I && <I size={16} className="shrink-0 text-ink/60" />}
                    <span className="truncate">{app.name}</span>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4">
              <a href="#/apps" className="text-[12px] font-medium text-ink underline underline-offset-4 hover:opacity-70">Browse full app registry</a>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("cs:palette"))} className="text-[11px] uppercase tracking-[0.06em] text-subtitle hover:text-ink">Or press ⌘K</button>
            </div>
          </Card>
        </div>
      </div>

      <Confirm
        open={confirmDelete}
        title="Move this project to the trash?"
        message={`"${project.clientName} — ${project.projectName}" and its ${sessions.length} session(s), ${project.tasks.length} task(s), and ${project.sprints.length} sprint(s) will be hidden. You can restore everything from Data & Backup for 30 days.`}
        confirmLabel="Move to trash"
        danger
        onConfirm={deleteProject}
        onCancel={() => setConfirmDelete(false)}
      />
      <Confirm
        open={!!confirmDeleteSession}
        title="Move this session to the trash?"
        message="You can restore it from Data & Backup for 30 days."
        confirmLabel="Move to trash"
        danger
        onConfirm={() => { if (confirmDeleteSession) deleteSession(confirmDeleteSession); }}
        onCancel={() => setConfirmDeleteSession(null)}
      />
      <Confirm
        open={confirmClearMethodology}
        title="Clear exported session content?"
        message={`This permanently removes the structured answers from ${sessions.length} session(s) while keeping project details, board, sprints, session titles, and history. Export a Markdown/JSON context pack first. This cannot be undone.`}
        confirmLabel="Clear session content"
        danger
        onConfirm={() => {
          const count = store.clearProjectMethodology(project.id);
          setConfirmClearMethodology(false);
          toast.show(count ? `Cleared content from ${count} session${count === 1 ? "" : "s"}` : "No session content to clear", { tone: count ? "warning" : "default" });
        }}
        onCancel={() => setConfirmClearMethodology(false)}
      />
    </PageShell>
  );
}
