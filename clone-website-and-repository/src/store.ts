/**
 * Application store: a thin React layer over the repository functions in src/db.
 *
 *  - Every mutation goes through `commit()`, which applies a pure repo function to the
 *    current snapshot, stamps meta, persists via the adapter, and updates React state.
 *  - `state` exposes hydrated views (projects with notes/files joined) so pages keep
 *    reading `project.notes` / `project.files` exactly as before.
 *  - Cross-tab: other tabs' writes are picked up through the adapter subscription.
 *  - `subscribeChanges()` emits row-level ChangeEvents after each commit — the hook point
 *    for a future sync/outbox layer.
 */
import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApp } from "./data";
import {
  APP_VERSION, DB_KEY, LEGACY_KEYS, SCHEMA_VERSION, StorageQuotaError, createDefaultAdapter, generateId, migrate, nowIso, seedDatabase, stamp,
  addActivity as repoAddActivity, addFile as repoAddFile, addNote as repoAddNote, diffSnapshots, duplicateSession as repoDuplicateSession,
  globalNotes as selectGlobalNotes, health as repoHealth, hydrateProjects, liveSessions, mergeSnapshot, patchProject, patchSession,
  purgeExpired, purgeProject, purgeSession, removeFile, removeNote, repair as repoRepair, setDeleted, trashOf, upsertProject, upsertSession,
  upsertTask as repoUpsertTask, patchTask as repoPatchTask, moveTask as repoMoveTask, bulkMoveTasks as repoBulkMoveTasks,
  deleteTask as repoDeleteTask, upsertSprint as repoUpsertSprint, patchSprint as repoPatchSprint, deleteSprint as repoDeleteSprint,
  purgeTask as repoPurgeTask, purgeSprint as repoPurgeSprint, openTasksAcrossProjects, tasksForSprint, burndownSeries, liveProjectIds,
  clearProjectSessionData as repoClearProjectSessionData,
  type ActivityItem, type ChangeEvent, type DataHealth, type DatabaseMeta, type DatabaseSnapshot, type FileEntry, type NoteEntry,
  type Project, type ProjectStatus, type ProjectView, type Session, type SessionInput, type StorageAdapter, type Task, type Sprint,
  type TaskInput, type TaskStatus,
} from "./db";
import { dlJSON } from "./export";

/* ───────────── Types ───────────── */

export interface StoreState {
  projects: ProjectView[];
  sessions: Session[];
  activity: ActivityItem[];
  globalNotes: NoteEntry[];
  trash: { projects: Project[]; sessions: Session[]; tasks: Task[]; sprints: Sprint[] };
  meta: DatabaseMeta;
  schemaVersion: number;
  counts: { projects: number; sessions: number; notes: number; files: number; activity: number; tasks: number; sprints: number };
}

export interface ImportResult { ok: boolean; added: number; updated: number; skipped: number; message: string }
export interface StorageInfo { adapter: string; bytesUsed: number; quotaBytes: number; percent: number; lastPersistedAt: string | null; schemaVersion: number; appVersion: string }

type NoteInput = Partial<NoteEntry> & { author: string; body: string };
type FileInput = Partial<FileEntry> & { name: string; meta: string };
type ActivityInput = Partial<ActivityItem> & { icon: ActivityItem["icon"]; title: string; href: string };
type TaskSprintInput = { id?: string; projectId: string; name: string; goal?: string; startDate?: string; endDate?: string; status?: Sprint["status"] };

export interface StoreAPI {
  state: StoreState;
  /** Raw normalised snapshot (read-only; for diagnostics/export). */
  snapshot: DatabaseSnapshot;
  bootNotice: string | null;
  persistError: string | null;

  // Projects
  createProject(seed?: Partial<Project>): Project;
  updateProject(id: string, u: Partial<Project> & { notes?: unknown; files?: unknown }): void;
  setProjectStatus(id: string, status: ProjectStatus): void;
  deleteProject(id: string): void;           // soft delete (undoable)
  restoreProject(id: string): void;
  getProject(id: string): ProjectView | undefined;

  // Sessions
  saveSession(s: SessionInput): Session;
  updateSessionData(id: string, data: unknown): void;
  deleteSession(id: string): void;           // soft delete (undoable)
  restoreSession(id: string): void;
  duplicateSession(id: string): Session | undefined;
  attachSession(sessionId: string, projectId: string | null): void;
  getSession(id: string): Session | undefined;
  sessionsForProject(projectId: string): Session[];
  /** Permanently remove session answers but keep session metadata/history. */
  clearProjectMethodology(projectId: string): number;

  // Notes / files / activity
  addNote(projectId: string | null, n: NoteInput): NoteEntry;
  deleteNote(projectId: string | null, noteId: string): void;
  addFile(projectId: string, f: FileInput): FileEntry;
  deleteFile(projectId: string, fileId: string): void;
  addActivity(a: ActivityInput): void;

  // Delivery tracking — tasks (kanban)
  tasks: Task[];
  openTasks: Task[];
  createTask(t: TaskInput): Task;
  updateTask(id: string, patch: Partial<Task>): void;
  moveTask(id: string, status: TaskStatus, toIndex: number): void;
  clearColumn(projectId: string, status: TaskStatus): void;
  deleteTask(id: string): void;          // soft delete (undoable)
  restoreTask(id: string): void;
  taskProject(id: string): ProjectView | undefined;

  // Delivery tracking — sprints (scrum)
  sprints: Sprint[];
  createSprint(s: TaskSprintInput): Sprint;
  updateSprint(id: string, patch: Partial<Sprint>): void;
  deleteSprint(id: string): void;        // soft delete (undoable)
  restoreSprint(id: string): void;
  sprintTasks(sprintId: string): Task[];
  burndown(sprintId: string): { day: string; remaining: number }[];

  // Data management
  exportProject(id: string): void;
  exportAll(): void;
  importData(json: string): ImportResult;
  dataHealth(): DataHealth;
  repairData(): DataHealth;
  purgeTrash(): void;
  purgeTrashItem(kind: "project" | "session" | "task" | "sprint", id: string): void;
  resetData(): void;
  storageInfo(): StorageInfo;
  subscribeChanges(listener: (events: ChangeEvent[]) => void): () => void;
}

const Ctx = createContext<StoreAPI>(null!);

/* ───────────── Boot ───────────── */

function quarantine(adapter: StorageAdapter, raw: string) {
  try { adapter.write(raw, `${DB_KEY}.corrupt.${Date.now()}`); } catch { /* best effort */ }
}

function boot(adapter: StorageAdapter): { db: DatabaseSnapshot; notice: string | null } {
  const current = adapter.read();
  if (current) {
    try {
      const migrated = migrate(JSON.parse(current), DB_KEY);
      if (migrated) return { db: purgeExpired(migrated), notice: null };
    } catch { /* fall through to quarantine */ }
    quarantine(adapter, current);
    return { db: seedDatabase(), notice: "Stored data was unreadable. A backup copy was kept and the workspace was reset." };
  }
  for (const key of LEGACY_KEYS) {
    const raw = adapter.read(key);
    if (!raw) continue;
    try {
      const migrated = migrate(JSON.parse(raw), key);
      if (migrated) return { db: migrated, notice: "Your workspace was upgraded to the new data format. Nothing was lost." };
    } catch { /* try next key */ }
  }
  return { db: seedDatabase(), notice: null };
}

/* ───────────── Provider ───────────── */

export function StoreProvider({ children, adapter }: { children: ReactNode; adapter?: StorageAdapter }) {
  const adapterRef = useRef<StorageAdapter | null>(null);
  if (!adapterRef.current) adapterRef.current = adapter ?? createDefaultAdapter(DB_KEY);
  const bootRef = useRef<{ db: DatabaseSnapshot; notice: string | null } | null>(null);
  if (!bootRef.current) bootRef.current = boot(adapterRef.current);

  const dbRef = useRef<DatabaseSnapshot>(bootRef.current.db);
  const [db, setDb] = useState<DatabaseSnapshot>(bootRef.current.db);
  const [persistError, setPersistError] = useState<string | null>(null);
  const lastPersistedRef = useRef<string | null>(null);
  const listenersRef = useRef(new Set<(events: ChangeEvent[]) => void>());

  const persist = (next: DatabaseSnapshot) => {
    try {
      adapterRef.current!.write(JSON.stringify(next));
      lastPersistedRef.current = nowIso();
      setPersistError(prev => (prev ? null : prev));
    } catch (e) {
      setPersistError(e instanceof StorageQuotaError
        ? "Local storage is full. Export a backup and empty the trash to free space."
        : "Changes could not be written to local storage.");
    }
  };

  /** Apply a pure mutation, persist, publish. Synchronous against dbRef so chained commits compose. */
  const commit = (fn: (d: DatabaseSnapshot) => DatabaseSnapshot): DatabaseSnapshot => {
    const prev = dbRef.current;
    const next = stamp(fn(prev));
    dbRef.current = next;
    setDb(next);
    persist(next);
    if (listenersRef.current.size) {
      const events = diffSnapshots(prev, next);
      if (events.length) listenersRef.current.forEach(l => { try { l(events); } catch { /* listener error must not break the app */ } });
    }
    return next;
  };

  // Make sure the v3 key exists after boot/migration, then flush on page hide.
  useEffect(() => {
    persist(dbRef.current);
    const flush = () => { try { adapterRef.current!.write(JSON.stringify(dbRef.current)); } catch { /* ignore */ } };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab sync: adopt snapshots written by other tabs.
  useEffect(() => adapterRef.current!.subscribe(() => {
    const raw = adapterRef.current!.read();
    if (!raw) return;
    try {
      const fresh = migrate(JSON.parse(raw), DB_KEY);
      if (fresh && fresh.meta.updatedAt !== dbRef.current.meta.updatedAt) { dbRef.current = fresh; setDb(fresh); }
    } catch { /* ignore malformed external writes */ }
  }), []);

  const state = useMemo<StoreState>(() => {
    const projects = hydrateProjects(db);
    const sessions = liveSessions(db);
    const live = liveProjectIds(db);
    const notes = db.notes.filter(n => n.projectId === null || live.has(n.projectId));
    const files = db.files.filter(f => live.has(f.projectId));
    const activity = db.activity.filter(a => !a.projectId || live.has(a.projectId));
    return {
      projects,
      sessions,
      activity,
      globalNotes: selectGlobalNotes(db),
      trash: trashOf(db),
      meta: db.meta,
      schemaVersion: db.schemaVersion,
      counts: { projects: projects.length, sessions: sessions.length, notes: notes.length, files: files.length, activity: activity.length, tasks: db.tasks.filter(t => !t.deletedAt && live.has(t.projectId)).length, sprints: db.sprints.filter(s => !s.deletedAt && live.has(s.projectId)).length },
    };
  }, [db]);

  const projectLabel = (id: string | null | undefined) => (id ? dbRef.current.projects.find(p => p.id === id)?.clientName ?? "" : "");

  const api: StoreAPI = {
    state,
    snapshot: db,
    bootNotice: bootRef.current.notice,
    persistError,

    /* Projects */
    createProject(seed) {
      const now = nowIso();
      const row: Project = { ...seedProjectDefaults(), ...(seed as Partial<Project>), createdAt: now, updatedAt: now, deletedAt: null };
      const { notes: _n, files: _f, ...core } = row as Project & { notes?: unknown; files?: unknown };
      commit(d => repoAddActivity(upsertProject(d, core as Project), { icon: "project", title: "New project created — " + (core.clientName || "Untitled"), href: "#/project/" + core.id, projectId: core.id }));
      return core as Project;
    },
    updateProject(id, u) {
      // Never persist fields from the hydrated ProjectView back into the projects table.
      const { notes: _n, files: _f, tasks: _t, sprints: _s, metrics: _m, sessionCount: _sc, lastActivityAt: _la, ...core } = u as Partial<ProjectView>;
      commit(d => {
        const existing = d.projects.find(p => p.id === id);
        let next = patchProject(d, id, core as Partial<Project>);
        // phaseIndex is denormalised for fast board display. Reconcile references if phases were removed.
        if (existing && core.phases && core.phases !== existing.phases && core.phases.length < existing.phases.length) {
          next = {
            ...next,
            tasks: next.tasks.map(task => {
              if (task.projectId !== id || task.phaseIndex < 0) return task;
              const oldName = existing.phases[task.phaseIndex];
              const newIndex = core.phases!.indexOf(oldName);
              return { ...task, phaseIndex: newIndex, updatedAt: nowIso() };
            }),
          };
        }
        return next;
      });
    },
    setProjectStatus(id, status) {
      const p = dbRef.current.projects.find(x => x.id === id);
      commit(d => repoAddActivity(patchProject(d, id, { status }), { icon: "status", title: `${p?.clientName ?? "Project"} marked ${status}`, href: "#/project/" + id, projectId: id }));
    },
    deleteProject(id) { commit(d => setDeleted(d, "projects", id, nowIso())); },
    restoreProject(id) { commit(d => setDeleted(d, "projects", id, null)); },
    getProject(id) { return state.projects.find(p => p.id === id); },

    /* Sessions */
    saveSession(input) {
      let saved!: Session;
      commit(d => {
        const r = upsertSession(d, input);
        saved = r.session;
        if (!r.session.projectId) return r.db;
        const app = getApp(r.session.appId);
        return repoAddActivity(r.db, { icon: "session", title: `${app?.name ?? "Session"} saved — ${projectLabel(r.session.projectId)}`, href: `#/project/${r.session.projectId}/app/${r.session.appId}/${r.session.id}`, projectId: r.session.projectId });
      });
      return saved;
    },
    updateSessionData(id, data) { commit(d => patchSession(d, id, { data })); },
    deleteSession(id) { commit(d => setDeleted(d, "sessions", id, nowIso())); },
    restoreSession(id) { commit(d => setDeleted(d, "sessions", id, null)); },
    duplicateSession(id) {
      let clone: Session | undefined;
      commit(d => { const r = repoDuplicateSession(d, id); clone = r.session; return r.db; });
      return clone;
    },
    attachSession(sessionId, projectId) {
      commit(d => {
        const next = patchSession(d, sessionId, { projectId });
        if (!projectId) return next;
        const s = next.sessions.find(x => x.id === sessionId);
        const app = s ? getApp(s.appId) : undefined;
        return repoAddActivity(next, { icon: "session", title: `${app?.name ?? "Session"} attached — ${projectLabel(projectId)}`, href: `#/project/${projectId}/app/${s?.appId}/${sessionId}`, projectId });
      });
    },
    getSession(id) { return dbRef.current.sessions.find(s => s.id === id); },
    sessionsForProject(projectId) {
      return state.sessions.filter(s => s.projectId === projectId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    clearProjectMethodology(projectId) {
      let cleared = 0;
      commit(d => {
        const result = repoClearProjectSessionData(d, projectId);
        cleared = result.cleared;
        return cleared
          ? repoAddActivity(result.db, { icon: "session", title: `Session content cleared — ${projectLabel(projectId)}`, href: "#/project/" + projectId, projectId })
          : result.db;
      });
      return cleared;
    },

    /* Notes / files / activity */
    addNote(projectId, n) {
      let note!: NoteEntry;
      commit(d => {
        const r = repoAddNote(d, { ...n, projectId });
        note = r.note;
        return projectId ? repoAddActivity(r.db, { icon: "note", title: "Note added — " + projectLabel(projectId), href: "#/project/" + projectId, projectId }) : r.db;
      });
      return note;
    },
    deleteNote(_projectId, noteId) { commit(d => removeNote(d, noteId)); },
    addFile(projectId, f) {
      let file!: FileEntry;
      commit(d => {
        const r = repoAddFile(d, { ...f, projectId });
        file = r.file;
        return repoAddActivity(r.db, { icon: "file", title: `${f.name} uploaded — ${projectLabel(projectId)}`, href: "#/project/" + projectId, projectId });
      });
      return file;
    },
    deleteFile(_projectId, fileId) { commit(d => removeFile(d, fileId)); },
    addActivity(a) { commit(d => repoAddActivity(d, a)); },

    /* Tasks (kanban) */
    get tasks() { return db.tasks.filter(t => !t.deletedAt && liveProjectIds(dbRef.current).has(t.projectId)); },
    get openTasks() { return openTasksAcrossProjects(dbRef.current); },
    createTask(input) {
      let task!: Task;
      commit(d => {
        const r = repoUpsertTask(d, input);
        task = r.task;
        return repoAddActivity(r.db, { icon: "task", title: `Task added — ${input.title || "Untitled"}`, href: `#/project/${input.projectId}/board`, projectId: input.projectId });
      });
      return task;
    },
    updateTask(id, patch) {
      commit(d => {
        const existing = d.tasks.find(t => t.id === id);
        if (!existing) return d;
        let next = d;
        if (patch.status && patch.status !== existing.status) {
          const targetIndex = d.tasks.filter(t => t.projectId === existing.projectId && t.status === patch.status && !t.deletedAt).length;
          next = repoMoveTask(next, id, patch.status, targetIndex);
        }
        const { status: _status, order: _order, ...rest } = patch;
        return repoPatchTask(next, id, rest);
      });
    },
    moveTask(id, status, toIndex) {
      commit(d => {
        const task = d.tasks.find(t => t.id === id);
        const next = repoMoveTask(d, id, status, toIndex);
        if (!task || task.status === status) return next;
        return repoAddActivity(next, { icon: "task", title: `${task.title} → ${status}`, href: `#/project/${task.projectId}/board`, projectId: task.projectId });
      });
    },
    clearColumn(projectId, status) { commit(d => repoBulkMoveTasks(d, projectId, status, "done")); },
    deleteTask(id) { commit(d => repoDeleteTask(d, id)); },
    restoreTask(id) { commit(d => setDeleted(d, "tasks", id, null)); },
    taskProject(id) { const t = dbRef.current.tasks.find(x => x.id === id); return t ? state.projects.find(p => p.id === t.projectId) : undefined; },

    /* Sprints (scrum) */
    get sprints() { return db.sprints.filter(s => !s.deletedAt && liveProjectIds(dbRef.current).has(s.projectId)); },
    createSprint(input) {
      let sprint!: Sprint;
      commit(d => {
        const base = input.status === "active"
          ? { ...d, sprints: d.sprints.map(s => s.projectId === input.projectId && s.status === "active" && !s.deletedAt ? { ...s, status: "planned" as const, updatedAt: nowIso() } : s) }
          : d;
        const r = repoUpsertSprint(base, input);
        sprint = r.sprint;
        return repoAddActivity(r.db, { icon: "task", title: `Sprint created — ${input.name}`, href: `#/project/${input.projectId}/sprints`, projectId: input.projectId });
      });
      return sprint;
    },
    updateSprint(id, patch) {
      commit(d => {
        const existing = d.sprints.find(s => s.id === id);
        if (!existing) return d;
        const base = patch.status === "active"
          ? { ...d, sprints: d.sprints.map(s => s.projectId === existing.projectId && s.id !== id && s.status === "active" && !s.deletedAt ? { ...s, status: "planned" as const, updatedAt: nowIso() } : s) }
          : d;
        return repoPatchSprint(base, id, patch);
      });
    },
    deleteSprint(id) { commit(d => repoDeleteSprint(d, id)); },
    restoreSprint(id) {
      commit(d => {
        const target = d.sprints.find(s => s.id === id);
        if (!target) return d;
        let next = setDeleted(d, "sprints", id, null);
        // Restoring an old active sprint must not create two active timeboxes.
        if (target.status === "active" && d.sprints.some(s => s.id !== id && s.projectId === target.projectId && s.status === "active" && !s.deletedAt)) {
          next = repoPatchSprint(next, id, { status: "planned" });
        }
        return next;
      });
    },
    sprintTasks(sprintId) { return tasksForSprint(dbRef.current, sprintId); },
    burndown(sprintId) {
      const sprint = dbRef.current.sprints.find(s => s.id === sprintId);
      return sprint ? burndownSeries(sprint, tasksForSprint(dbRef.current, sprintId)) : [];
    },

    /* Data management */
    exportProject(id) {
      const d = dbRef.current;
      const project = d.projects.find(p => p.id === id);
      if (!project) return;
      const name = (project.clientName || "project").replace(/\s+/g, "-").toLowerCase();
      dlJSON(`${name}-project`, {
        format: "consultancy-suite/project",
        schemaVersion: SCHEMA_VERSION,
        appVersion: APP_VERSION,
        exportedAt: nowIso(),
        project,
        sessions: d.sessions.filter(s => s.projectId === id),
        notes: d.notes.filter(n => n.projectId === id),
        files: d.files.filter(f => f.projectId === id),
        tasks: d.tasks.filter(t => t.projectId === id),
        sprints: d.sprints.filter(s => s.projectId === id),
      });
    },
    exportAll() {
      dlJSON(`consultancy-suite-backup-${new Date().toISOString().slice(0, 10)}`, { format: "consultancy-suite/workspace", ...dbRef.current, exportedAt: nowIso() });
    },
    importData(json) {
      let parsed: unknown;
      try { parsed = JSON.parse(json); } catch { return { ok: false, added: 0, updated: 0, skipped: 0, message: "That file is not valid JSON." }; }
      const incoming = migrate(parsed, "import");
      if (!incoming) return { ok: false, added: 0, updated: 0, skipped: 0, message: "Unrecognised file. Expected a workspace backup or a project export." };
      let result = { added: 0, updated: 0, skipped: 0 };
      commit(d => { const m = mergeSnapshot(d, incoming); result = m.result; return m.db; });
      const total = result.added + result.updated;
      return { ok: true, ...result, message: total ? `Imported ${result.added} new and ${result.updated} updated record${total === 1 ? "" : "s"}${result.skipped ? ` (${result.skipped} already up to date)` : ""}.` : "Everything in that file is already up to date." };
    },
    dataHealth() { return repoHealth(dbRef.current); },
    repairData() { const next = commit(d => repoRepair(d)); return repoHealth(next); },
    purgeTrash() {
      commit(d => {
        let out = d;
        for (const p of d.projects) if (p.deletedAt) out = purgeProject(out, p.id);
        for (const s of d.sessions) if (s.deletedAt) out = purgeSession(out, s.id);
        for (const t of d.tasks) if (t.deletedAt) out = repoPurgeTask(out, t.id);
        for (const s of d.sprints) if (s.deletedAt) out = repoPurgeSprint(out, s.id);
        return out;
      });
    },
    purgeTrashItem(kind, id) {
      commit(d => kind === "project" ? purgeProject(d, id)
        : kind === "session" ? purgeSession(d, id)
        : kind === "task" ? repoPurgeTask(d, id)
        : repoPurgeSprint(d, id));
    },
    resetData() { commit(() => seedDatabase()); },
    storageInfo() {
      const a = adapterRef.current!;
      const bytesUsed = a.bytesUsed();
      const quotaBytes = a.quotaBytes();
      return { adapter: a.name, bytesUsed, quotaBytes, percent: Number.isFinite(quotaBytes) ? Math.min(100, Math.round((bytesUsed / quotaBytes) * 100)) : 0, lastPersistedAt: lastPersistedRef.current, schemaVersion: SCHEMA_VERSION, appVersion: APP_VERSION };
    },
    subscribeChanges(listener) {
      listenersRef.current.add(listener);
      return () => { listenersRef.current.delete(listener); };
    },
  };

  return createElement(Ctx.Provider, { value: api }, children);
}

function seedProjectDefaults(): Project {
  const now = nowIso();
  return {
    id: generateId(), clientName: "", projectName: "", status: "active", startDate: now.slice(0, 10), targetEndDate: "",
    fee: 0, feeType: "fixed", feeCurrency: "USD", vertical: "brand_strategy", scopeSummary: "",
    phases: ["Discovery", "Strategy", "Creative", "Delivery", "Review"], donePhases: 0, sollPct: 0, goals: [],
    createdAt: now, updatedAt: now, deletedAt: null,
  };
}

export function useStore() { return useContext(Ctx); }

/* ───────────── Export utilities ─────────────
   Single source of truth lives in src/export.ts; re-exported here so existing
   imports (AppSession, printRenderers) keep working unchanged. */
export { dlJSON, openPrintView, escapeHtml, docHeader } from "./export";
