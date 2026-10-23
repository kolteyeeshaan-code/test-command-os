import { useRef, useState } from "react";
import { formatBytes, formatDateTime, getApp, relativeTime } from "../data";
import { TASK_COLUMN_META } from "../db/schema";
import { IconDownload, IconTrash, IconUpload } from "../icons";
import { useStore } from "../store";
import { useToast } from "../toast";
import { Badge, Breadcrumb, Card, Confirm, GhostButton, PageShell, PrimaryButton, SectionTitle, Topbar } from "../ui";
import { cn } from "../utils/cn";

export function DataPage() {
  const store = useStore();
  const toast = useToast();
  const info = store.storageInfo();
  const health = store.dataHealth();
  const { trash, counts, meta } = store.state;
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const r = store.importData(text);
    toast.show(r.message, { tone: r.ok ? "success" : "error", duration: 5000 });
    if (fileRef.current) fileRef.current.value = "";
  };

  const barTone = info.percent >= 90 ? "bg-[#ff453a]" : info.percent >= 75 ? "bg-[#ff9f0a]" : "bg-ink";
  const trashCount = trash.projects.length + trash.sessions.length + trash.tasks.length + trash.sprints.length;

  return (
    <PageShell>
      <Topbar current="data" />
      <Breadcrumb items={[{ label: "Data & Backup" }]} />

      <div className="relative z-10 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-normal tracking-[-0.04em] sm:text-[48px] sm:leading-[44px]">Data &amp; Backup</h1>
          <p className="mt-3 max-w-xl text-[13px] leading-6 text-subtitle">
            Everything lives in this browser. Export a backup before switching devices or clearing site data; imports merge by id and keep whichever copy was edited last.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => store.exportAll()}><IconDownload size={14} /> Export workspace</PrimaryButton>
          <GhostButton onClick={() => fileRef.current?.click()}><IconUpload size={14} /> Import</GhostButton>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e => onImport(e.target.files?.[0])} />
        </div>
      </div>

      <div className="relative z-10 grid gap-4 lg:grid-cols-2">
        {/* Storage */}
        <Card className="flex flex-col gap-5">
          <SectionTitle action={<Badge tone={info.percent >= 75 ? "orange" : "green"}>{info.adapter}</Badge>}>Storage</SectionTitle>
          <div>
            <p className="text-[36px] font-normal leading-[36px] tracking-[-0.04em] sm:text-[44px] sm:leading-[42px]">{formatBytes(info.bytesUsed)}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.06em] text-subtitle">of ~{formatBytes(info.quotaBytes)} available · {info.percent}% used</p>
          </div>
          <div className="pattern-fill relative h-5 overflow-hidden rounded">
            <div className={cn("absolute inset-y-0 left-0 rounded transition-all", barTone)} style={{ width: Math.max(1, info.percent) + "%" }} />
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-3">
            <Stat label="Projects" value={counts.projects} />
            <Stat label="Sessions" value={counts.sessions} />
            <Stat label="Tasks" value={counts.tasks} />
            <Stat label="Sprints" value={counts.sprints} />
            <Stat label="Notes" value={counts.notes} />
            <Stat label="Files" value={counts.files} />
            <Stat label="Activity" value={counts.activity} />
            <Stat label="In trash" value={trashCount} />
          </div>
          <div className="border-t border-dashed border-[rgba(120,120,128,0.16)] pt-4 text-[11px] uppercase tracking-[0.04em] text-subtitle">
            Schema v{info.schemaVersion} · App {info.appVersion} · Device {meta.deviceId.slice(0, 8)}<br />
            Last written {info.lastPersistedAt ? relativeTime(info.lastPersistedAt) : "—"} · Workspace created {formatDateTime(meta.createdAt)}
            {meta.migratedFrom && <> · Upgraded from <span className="text-ink">{meta.migratedFrom}</span></>}
          </div>
        </Card>

        {/* Health */}
        <Card className="flex flex-col gap-5">
          <SectionTitle action={<Badge tone={health.issues ? "orange" : "green"}>{health.issues ? `${health.issues} issue${health.issues === 1 ? "" : "s"}` : "Healthy"}</Badge>}>Data health</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-3">
            <Stat label="Orphan sessions" value={health.orphanSessions} warn />
            <Stat label="Orphan notes" value={health.orphanNotes} warn />
            <Stat label="Orphan files" value={health.orphanFiles} warn />
            <Stat label="Orphan tasks" value={health.orphanTasks} warn />
            <Stat label="Orphan sprints" value={health.orphanSprints} warn />
            <Stat label="Broken sprint links" value={health.orphanSprintRefs} warn />
            <Stat label="Duplicate ids" value={health.duplicateIds} warn />
            <Stat label="Invalid dates" value={health.invalidDates} warn />
          </div>
          <p className="text-[13px] leading-6 text-subtitle">
            Integrity checks run on every load. Repair detaches sessions whose project no longer exists, turns orphaned notes into global notes, removes stale file and task metadata, repairs sprint links, and de-duplicates ids.
          </p>
          <div>
            <GhostButton disabled={!health.issues} onClick={() => { const h = store.repairData(); toast.show(h.issues ? `Repaired — ${h.issues} issue(s) remain.` : "Data repaired. No issues remain.", { tone: "success" }); }}>Repair data</GhostButton>
          </div>
        </Card>

        {/* Trash */}
        <Card className="flex flex-col gap-4 lg:col-span-2">
          <SectionTitle action={trashCount > 0 ? <GhostButton danger onClick={() => setConfirmEmpty(true)}>Empty trash</GhostButton> : undefined}>Recently deleted</SectionTitle>
          {trashCount === 0 && <p className="py-6 text-sm text-subtitle">Nothing in the trash. Deleted projects, sessions, tasks, and sprints are kept here for 30 days.</p>}
          {trash.projects.map(p => (
            <div key={p.id} className="flex items-center gap-3 border-b border-dashed border-[rgba(120,120,128,0.16)] py-3 last:border-0">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold uppercase text-white">{(p.clientName || "?").slice(0, 2)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{p.clientName || "Untitled client"} <span className="font-normal text-subtitle">— {p.projectName || "Untitled project"}</span></span>
                <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">Project · deleted {p.deletedAt ? relativeTime(p.deletedAt) : ""}</span>
              </span>
              <GhostButton onClick={() => { store.restoreProject(p.id); toast.show("Project restored", { tone: "success" }); }}>Restore</GhostButton>
              <button type="button" title="Delete forever" onClick={() => store.purgeTrashItem("project", p.id)} className="rounded-lg p-2 text-ink/30 hover:bg-red-50 hover:text-red-500"><IconTrash size={16} /></button>
            </div>
          ))}
          {trash.tasks.map(t => (
            <div key={t.id} className="flex items-center gap-3 border-b border-dashed border-[rgba(120,120,128,0.16)] py-3 last:border-0">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-[10px] font-semibold uppercase text-ink/60">T</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{t.title}</span>
                <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">Task · {TASK_COLUMN_META[t.status].label} · deleted {t.deletedAt ? relativeTime(t.deletedAt) : ""}</span>
              </span>
              <GhostButton onClick={() => { store.restoreTask(t.id); toast.show("Task restored", { tone: "success" }); }}>Restore</GhostButton>
              <button type="button" title="Delete forever" onClick={() => store.purgeTrashItem("task", t.id)} className="rounded-lg p-2 text-ink/30 hover:bg-red-50 hover:text-red-500"><IconTrash size={16} /></button>
            </div>
          ))}
          {trash.sprints.map(s => (
            <div key={s.id} className="flex items-center gap-3 border-b border-dashed border-[rgba(120,120,128,0.16)] py-3 last:border-0">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-[10px] font-semibold uppercase text-ink/60">S</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{s.name}</span>
                <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">Sprint · {s.status} · deleted {s.deletedAt ? relativeTime(s.deletedAt) : ""}</span>
              </span>
              <GhostButton onClick={() => { store.restoreSprint(s.id); toast.show("Sprint restored", { tone: "success" }); }}>Restore</GhostButton>
              <button type="button" title="Delete forever" onClick={() => store.purgeTrashItem("sprint", s.id)} className="rounded-lg p-2 text-ink/30 hover:bg-red-50 hover:text-red-500"><IconTrash size={16} /></button>
            </div>
          ))}
          {trash.sessions.map(s => {
            const app = getApp(s.appId);
            const project = store.state.projects.find(p => p.id === s.projectId);
            return (
              <div key={s.id} className="flex items-center gap-3 border-b border-dashed border-[rgba(120,120,128,0.16)] py-3 last:border-0">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-[10px] font-semibold uppercase text-ink/60">S</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{s.title || app?.name}</span>
                  <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">{app?.name}{project ? ` · ${project.clientName}` : " · unattached"} · deleted {s.deletedAt ? relativeTime(s.deletedAt) : ""}</span>
                </span>
                <GhostButton onClick={() => { store.restoreSession(s.id); toast.show("Session restored", { tone: "success" }); }}>Restore</GhostButton>
                <button type="button" title="Delete forever" onClick={() => store.purgeTrashItem("session", s.id)} className="rounded-lg p-2 text-ink/30 hover:bg-red-50 hover:text-red-500"><IconTrash size={16} /></button>
              </div>
            );
          })}
        </Card>

        {/* Danger zone */}
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <SectionTitle>Reset</SectionTitle>
          <p className="text-[13px] leading-6 text-subtitle">Replace everything with the sample workspace. Export first — this cannot be undone.</p>
          <div><GhostButton danger onClick={() => setConfirmReset(true)}>Reset to sample data</GhostButton></div>
        </Card>
      </div>

      <Confirm
        open={confirmEmpty}
        title="Empty the trash?"
        message={`${trashCount} item(s) will be permanently removed, including sessions, tasks, and sprints belonging to trashed projects.`}
        confirmLabel="Empty trash"
        danger
        onConfirm={() => { store.purgeTrash(); setConfirmEmpty(false); toast.show("Trash emptied"); }}
        onCancel={() => setConfirmEmpty(false)}
      />
      <Confirm
        open={confirmReset}
        title="Reset the workspace?"
        message="All projects, sessions, tasks, sprints, notes, and files in this browser will be replaced by the sample data."
        confirmLabel="Reset workspace"
        danger
        onConfirm={() => { store.resetData(); setConfirmReset(false); toast.show("Workspace reset to sample data", { tone: "warning" }); }}
        onCancel={() => setConfirmReset(false)}
      />
    </PageShell>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-[rgba(120,120,128,0.12)] pb-1.5">
      <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">{label}</span>
      <span className={cn("font-[family-name:var(--font-roboto)] text-[14px] font-medium tabular-nums", warn && value > 0 ? "text-[#c77700]" : "text-ink")}>{value}</span>
    </div>
  );
}
