/**
 * Repository: pure, immutable operations over a DatabaseSnapshot.
 *
 * Nothing here touches storage or React. Every mutation returns a new snapshot, which
 * keeps the store trivial and makes the whole layer unit-testable. If persistence moves
 * to a row-based database, these functions become the reference for the SQL/RPC layer.
 */
import { APP_VERSION, TABLES, TASK_COLUMNS } from "./schema";
import type { ActivityItem, BaseEntity, ChangeEvent, DatabaseSnapshot, FileEntry, NoteEntry, Project, ProjectView, Session, Sprint, TableName, Task, TaskMetrics, TaskStatus } from "./schema";
import { generateId, isIso, nowIso } from "./ids";
import { currentAppDataVersion } from "./appData";
import { dedupeById, humanTime } from "./validate";

const TODAY = () => new Date().toISOString().slice(0, 10);

export const isLive = (e: { deletedAt?: string | null }) => !e.deletedAt;

export function stamp(db: DatabaseSnapshot): DatabaseSnapshot {
  return { ...db, meta: { ...db.meta, updatedAt: nowIso(), appVersion: APP_VERSION } };
}

function replaceRow<T extends BaseEntity>(rows: T[], row: T): T[] {
  const i = rows.findIndex(r => r.id === row.id);
  if (i < 0) return [...rows, row];
  const next = rows.slice();
  next[i] = row;
  return next;
}

/* ───────────── Projects ───────────── */

export function upsertProject(db: DatabaseSnapshot, p: Project): DatabaseSnapshot {
  const existing = db.projects.find(x => x.id === p.id);
  const now = nowIso();
  const row: Project = { ...p, createdAt: existing?.createdAt ?? p.createdAt ?? now, updatedAt: now, deletedAt: existing?.deletedAt ?? null };
  return { ...db, projects: existing ? replaceRow(db.projects, row) : [row, ...db.projects] };
}

export function patchProject(db: DatabaseSnapshot, id: string, patch: Partial<Project>): DatabaseSnapshot {
  const existing = db.projects.find(x => x.id === id);
  if (!existing) return db;
  const { id: _id, createdAt: _c, deletedAt: _d, ...rest } = patch;
  return { ...db, projects: replaceRow(db.projects, { ...existing, ...rest, updatedAt: nowIso() }) };
}

export function setDeleted(db: DatabaseSnapshot, table: "projects" | "sessions" | "tasks" | "sprints", id: string, deletedAt: string | null): DatabaseSnapshot {
  const rows = db[table] as BaseEntity[];
  const i = rows.findIndex(r => r.id === id);
  if (i < 0) return db;
  const next = rows.slice();
  next[i] = { ...rows[i], deletedAt, updatedAt: nowIso() };
  return { ...db, [table]: next };
}

export function purgeTask(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return { ...db, tasks: db.tasks.filter(t => t.id !== id) };
}

export function purgeSprint(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  // Tasks survive a permanently deleted sprint as unscheduled work.
  return { ...db, sprints: db.sprints.filter(s => s.id !== id), tasks: db.tasks.map(t => (t.sprintId === id ? { ...t, sprintId: null, updatedAt: nowIso() } : t)) };
}

export function purgeProject(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return {
    ...db,
    projects: db.projects.filter(p => p.id !== id),
    sessions: db.sessions.filter(s => s.projectId !== id),
    notes: db.notes.filter(n => n.projectId !== id),
    files: db.files.filter(f => f.projectId !== id),
    tasks: db.tasks.filter(t => t.projectId !== id),
    sprints: db.sprints.filter(s => s.projectId !== id),
  };
}

export function purgeSession(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return { ...db, sessions: db.sessions.filter(s => s.id !== id) };
}

export function purgeExpired(db: DatabaseSnapshot, days = 30): DatabaseSnapshot {
  const cutoff = Date.now() - days * 864e5;
  let out = db;
  for (const p of db.projects) if (p.deletedAt && Date.parse(p.deletedAt) < cutoff) out = purgeProject(out, p.id);
  for (const s of db.sessions) if (s.deletedAt && Date.parse(s.deletedAt) < cutoff) out = purgeSession(out, s.id);
  for (const t of db.tasks) if (t.deletedAt && Date.parse(t.deletedAt) < cutoff) out = purgeTask(out, t.id);
  for (const s of db.sprints) if (s.deletedAt && Date.parse(s.deletedAt) < cutoff) out = purgeSprint(out, s.id);
  return out;
}

/* ───────────── Sessions ───────────── */

export interface SessionInput {
  id?: string;
  appId: string;
  projectId: string | null;
  title: string;
  data: unknown;
  createdAt?: string;
  dataVersion?: number;
}

export function upsertSession(db: DatabaseSnapshot, input: SessionInput): { db: DatabaseSnapshot; session: Session } {
  const existing = input.id ? db.sessions.find(s => s.id === input.id) : undefined;
  const now = nowIso();
  const session: Session = {
    id: input.id ?? generateId(),
    appId: input.appId,
    projectId: input.projectId ?? null,
    title: input.title,
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
    deletedAt: null, // saving resurrects a trashed session
    revision: (existing?.revision ?? 0) + 1,
    dataVersion: input.dataVersion ?? existing?.dataVersion ?? currentAppDataVersion(input.appId),
    data: input.data,
  };
  return { db: { ...db, sessions: existing ? replaceRow(db.sessions, session) : [...db.sessions, session] }, session };
}

export function patchSession(db: DatabaseSnapshot, id: string, patch: Partial<Session>): DatabaseSnapshot {
  const existing = db.sessions.find(s => s.id === id);
  if (!existing) return db;
  const { id: _id, createdAt: _c, ...rest } = patch;
  return { ...db, sessions: replaceRow(db.sessions, { ...existing, ...rest, updatedAt: nowIso() }) };
}

export function duplicateSession(db: DatabaseSnapshot, id: string): { db: DatabaseSnapshot; session?: Session } {
  const src = db.sessions.find(s => s.id === id);
  if (!src) return { db };
  const now = nowIso();
  const session: Session = {
    ...src,
    id: generateId(),
    title: src.title + " (copy)",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    revision: 1,
    data: JSON.parse(JSON.stringify(src.data ?? {})),
  };
  return { db: { ...db, sessions: [...db.sessions, session] }, session };
}

/**
 * Permanently clear methodology answers for every live session in a project while
 * preserving titles, tool ids, timestamps, revisions and history metadata. This is the
 * post-export retention control: the context pack is the durable copy; the OS can keep
 * only a lightweight session register.
 */
export function clearProjectSessionData(db: DatabaseSnapshot, projectId: string): { db: DatabaseSnapshot; cleared: number } {
  const now = nowIso();
  let cleared = 0;
  const sessions = db.sessions.map(session => {
    if (session.projectId !== projectId || session.deletedAt) return session;
    const hasBody = !!session.data && typeof session.data === "object" && Object.keys(session.data as Record<string, unknown>).length > 0;
    if (!hasBody) return session;
    cleared++;
    return { ...session, data: {}, revision: session.revision + 1, updatedAt: now };
  });
  return { db: { ...db, sessions }, cleared };
}

/* ───────────── Notes & files ───────────── */

export function addNote(db: DatabaseSnapshot, n: Partial<NoteEntry> & { projectId: string | null; author: string; body: string }): { db: DatabaseSnapshot; note: NoteEntry } {
  const now = nowIso();
  const note: NoteEntry = { id: n.id ?? generateId(), projectId: n.projectId, author: n.author, body: n.body, time: n.time || humanTime(now), createdAt: now, updatedAt: now, deletedAt: null };
  return { db: { ...db, notes: [note, ...db.notes] }, note };
}

export function removeNote(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return { ...db, notes: db.notes.filter(n => n.id !== id) };
}

export function addFile(db: DatabaseSnapshot, f: Partial<FileEntry> & { projectId: string; name: string; meta: string }): { db: DatabaseSnapshot; file: FileEntry } {
  const now = nowIso();
  const file: FileEntry = { id: f.id ?? generateId(), projectId: f.projectId, name: f.name, meta: f.meta, size: f.size, mimeType: f.mimeType, createdAt: now, updatedAt: now, deletedAt: null };
  return { db: { ...db, files: [...db.files, file] }, file };
}

export function removeFile(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return { ...db, files: db.files.filter(f => f.id !== id) };
}

/* ───────────── Tasks (kanban) ───────────── */

export interface TaskInput {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Task["priority"];
  assignee?: string;
  phaseIndex?: number;
  sprintId?: string | null;
  dueDate?: string;
  estimate?: number;
  order?: number;
}

export function upsertTask(db: DatabaseSnapshot, input: TaskInput): { db: DatabaseSnapshot; task: Task } {
  const existing = input.id ? db.tasks.find(t => t.id === input.id) : undefined;
  const now = nowIso();
  const status = input.status ?? existing?.status ?? "backlog";
  const task: Task = {
    id: input.id ?? generateId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? existing?.description ?? "",
    status,
    priority: input.priority ?? existing?.priority ?? "medium",
    assignee: input.assignee ?? existing?.assignee ?? "",
    phaseIndex: input.phaseIndex ?? existing?.phaseIndex ?? -1,
    sprintId: input.sprintId !== undefined ? input.sprintId : existing?.sprintId ?? null,
    dueDate: input.dueDate ?? existing?.dueDate ?? "",
    estimate: input.estimate ?? existing?.estimate ?? 0,
    order: input.order ?? existing?.order ?? nextOrder(db, input.projectId, status),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
    // Crossing into `done` stamps completion; leaving it clears it.
    completedAt: status === "done" ? existing?.completedAt ?? now : null,
  };
  return { db: { ...db, tasks: existing ? replaceRow(db.tasks, task) : [...db.tasks, task] }, task };
}

export function patchTask(db: DatabaseSnapshot, id: string, patch: Partial<Task>): DatabaseSnapshot {
  const existing = db.tasks.find(t => t.id === id);
  if (!existing) return db;
  const { id: _id, createdAt: _c, ...rest } = patch;
  const next: Task = { ...existing, ...rest, updatedAt: nowIso() };
  if (rest.status !== undefined) next.completedAt = rest.status === "done" ? existing.completedAt ?? nowIso() : null;
  return { ...db, tasks: replaceRow(db.tasks, next) };
}

export function deleteTask(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  return setDeleted(db, "tasks", id, nowIso());
}

/** Move a task to a column at a target position, renumbering the affected columns. */
export function moveTask(db: DatabaseSnapshot, id: string, status: TaskStatus, toIndex: number): DatabaseSnapshot {
  const task = db.tasks.find(t => t.id === id && !t.deletedAt);
  if (!task) return db;
  const now = nowIso();
  const siblings = db.tasks
    .filter(t => t.projectId === task.projectId && t.status === status && t.id !== id && !t.deletedAt)
    .sort((a, b) => a.order - b.order);
  const clamped = Math.max(0, Math.min(toIndex, siblings.length));
  const column = [...siblings.slice(0, clamped), { ...task, status }, ...siblings.slice(clamped)].map((t, i) => ({ ...t, status, order: i, updatedAt: now }));
  const byId = new Map(column.map(t => [t.id, t] as const));
  // Moving out of the source column leaves a gap in its numbering; renumber that too.
  const renumber = (s: TaskStatus) => db.tasks
    .filter(t => t.projectId === task.projectId && t.status === s && !byId.has(t.id) && !t.deletedAt)
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i, updatedAt: now }));
  const moved = byId.get(id)!;
  const done: Task = { ...moved, completedAt: status === "done" ? task.completedAt ?? now : null };
  byId.set(id, done);
  const nextTasks = db.tasks.map(t => byId.get(t.id) ?? t);
  for (const t of [...renumber(task.status), ...renumber(status)]) {
    const i = nextTasks.findIndex(x => x.id === t.id);
    if (i >= 0) nextTasks[i] = t;
  }
  return { ...db, tasks: nextTasks };
}

/** Move every task from one column to another (bulk actions). */
export function bulkMoveTasks(db: DatabaseSnapshot, projectId: string, from: TaskStatus, to: TaskStatus): DatabaseSnapshot {
  if (from === to) return db;
  const now = nowIso();
  let out = db;
  const affected = db.tasks.filter(t => t.projectId === projectId && t.status === from && !t.deletedAt).sort((a, b) => a.order - b.order);
  const base = db.tasks.filter(t => t.projectId === projectId && t.status === to && !t.deletedAt).length;
  affected.forEach((t, i) => {
    out = patchTask(out, t.id, { status: to, order: base + i, completedAt: to === "done" ? t.completedAt ?? now : null } as Partial<Task>);
  });
  return renumberColumn(out, projectId, from);
}

function nextOrder(db: DatabaseSnapshot, projectId: string, status: TaskStatus): number {
  return db.tasks.filter(t => t.projectId === projectId && t.status === status && !t.deletedAt).length;
}

function renumberColumn(db: DatabaseSnapshot, projectId: string, status: TaskStatus): DatabaseSnapshot {
  const now = nowIso();
  const ordered = db.tasks
    .filter(t => t.projectId === projectId && t.status === status && !t.deletedAt)
    .sort((a, b) => a.order - b.order);
  const byId = new Map(ordered.map((t, i) => [t.id, { ...t, order: i, updatedAt: now }] as const));
  return { ...db, tasks: db.tasks.map(t => byId.get(t.id) ?? t) };
}

/* ───────────── Sprints (scrum) ───────────── */

export interface SprintInput {
  id?: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status?: Sprint["status"];
}

export function upsertSprint(db: DatabaseSnapshot, input: SprintInput): { db: DatabaseSnapshot; sprint: Sprint } {
  const existing = input.id ? db.sprints.find(s => s.id === input.id) : undefined;
  const now = nowIso();
  const sprint: Sprint = {
    id: input.id ?? generateId(),
    projectId: input.projectId,
    name: input.name,
    goal: input.goal ?? existing?.goal ?? "",
    startDate: input.startDate ?? existing?.startDate ?? "",
    endDate: input.endDate ?? existing?.endDate ?? "",
    status: input.status ?? existing?.status ?? "planned",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deletedAt: null,
  };
  return { db: { ...db, sprints: existing ? replaceRow(db.sprints, sprint) : [...db.sprints, sprint] }, sprint };
}

export function patchSprint(db: DatabaseSnapshot, id: string, patch: Partial<Sprint>): DatabaseSnapshot {
  const existing = db.sprints.find(s => s.id === id);
  if (!existing) return db;
  const { id: _id, createdAt: _c, ...rest } = patch;
  return { ...db, sprints: replaceRow(db.sprints, { ...existing, ...rest, updatedAt: nowIso() }) };
}

export function deleteSprint(db: DatabaseSnapshot, id: string): DatabaseSnapshot {
  // Keep task links intact while the sprint is in trash so restoring it is lossless.
  // Hard deletion (`purgeSprint`) performs the final detach.
  return setDeleted(db, "sprints", id, nowIso());
}

/* ───────────── Activity ───────────── */

const ACTIVITY_CAP = 50;
const ACTIVITY_DEDUPE_MS = 10 * 60 * 1000;

/** Append to the feed; repeated saves of the same session within 10 min collapse into one entry. */
export function addActivity(db: DatabaseSnapshot, a: Partial<ActivityItem> & { icon: ActivityItem["icon"]; title: string; href: string }): DatabaseSnapshot {
  const now = nowIso();
  const nowMs = Date.now();
  const dupIdx = db.activity.findIndex(x => x.href === a.href && x.icon === a.icon && nowMs - Date.parse(x.createdAt) < ACTIVITY_DEDUPE_MS);
  const row: ActivityItem = { id: a.id ?? generateId(), icon: a.icon, title: a.title, meta: a.meta ?? "", href: a.href, projectId: a.projectId ?? null, createdAt: now, updatedAt: now, deletedAt: null };
  const rest = dupIdx >= 0 ? db.activity.filter((_, i) => i !== dupIdx) : db.activity;
  return { ...db, activity: [row, ...rest].slice(0, ACTIVITY_CAP) };
}

/* ───────────── Selectors ───────────── */

export function liveProjectIds(db: DatabaseSnapshot): Set<string> {
  return new Set(db.projects.filter(isLive).map(p => p.id));
}

export function hydrateProjects(db: DatabaseSnapshot): ProjectView[] {
  return db.projects.filter(isLive).map(p => hydrateProject(db, p));
}

export function hydrateProject(db: DatabaseSnapshot, p: Project): ProjectView {
  const notes = db.notes.filter(n => n.projectId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const files = db.files.filter(f => f.projectId === p.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const sessions = db.sessions.filter(s => s.projectId === p.id && isLive(s));
  const tasks = tasksForProject(db, p.id);
  const sprints = sprintsForProject(db, p.id);
  let lastActivityAt = p.updatedAt;
  for (const s of sessions) if (s.updatedAt > lastActivityAt) lastActivityAt = s.updatedAt;
  for (const n of notes) if (n.updatedAt > lastActivityAt) lastActivityAt = n.updatedAt;
  for (const t of tasks) if (t.updatedAt > lastActivityAt) lastActivityAt = t.updatedAt;
  return { ...p, notes, files, tasks, sprints, sessionCount: sessions.length, metrics: taskMetrics(tasks), lastActivityAt };
}

/** Live tasks for a project, ordered by column then manual order. */
export function tasksForProject(db: DatabaseSnapshot, projectId: string): Task[] {
  return db.tasks
    .filter(t => t.projectId === projectId && isLive(t))
    .sort((a, b) => (TASK_COLUMNS.indexOf(a.status) - TASK_COLUMNS.indexOf(b.status)) || (a.order - b.order));
}

export function sprintsForProject(db: DatabaseSnapshot, projectId: string): Sprint[] {
  const rank = { active: 0, planned: 1, completed: 2 } as const;
  return db.sprints
    .filter(s => s.projectId === projectId && isLive(s))
    .sort((a, b) => (rank[a.status] - rank[b.status]) || (a.startDate || "9999").localeCompare(b.startDate || "9999"));
}

export function tasksForSprint(db: DatabaseSnapshot, sprintId: string): Task[] {
  return db.tasks.filter(t => t.sprintId === sprintId && isLive(t)).sort((a, b) => a.order - b.order);
}

export function taskMetrics(tasks: Task[], today = TODAY()): TaskMetrics {
  const byColumn = { backlog: 0, todo: 0, doing: 0, review: 0, done: 0 } as Record<TaskStatus, number>;
  let points = 0, pointsDone = 0, overdue = 0, unassigned = 0;
  for (const t of tasks) {
    byColumn[t.status] = (byColumn[t.status] ?? 0) + 1;
    points += t.estimate;
    if (t.status === "done") pointsDone += t.estimate;
    else {
      if (t.dueDate && t.dueDate < today) overdue++;
      if (!t.assignee.trim()) unassigned++;
    }
  }
  return { total: tasks.length, done: byColumn.done, active: byColumn.doing + byColumn.review, overdue, unassigned, points, pointsDone, byColumn };
}

/** Every open task across live projects — the consultant's personal to-do list. */
export function openTasksAcrossProjects(db: DatabaseSnapshot, projectIds?: Set<string>): Task[] {
  const live = projectIds ?? new Set(db.projects.filter(p => isLive(p) && p.status !== "completed").map(p => p.id));
  const byOrder = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
  return db.tasks
    .filter(t => isLive(t) && live.has(t.projectId) && t.status !== "done")
    .sort((a, b) => {
      const ao = a.dueDate && a.dueDate < TODAY() ? 0 : 1;
      const bo = b.dueDate && b.dueDate < TODAY() ? 0 : 1;
      if (ao !== bo) return ao - bo;
      if (byOrder[a.priority] !== byOrder[b.priority]) return byOrder[a.priority] - byOrder[b.priority];
      return (a.dueDate || "9999").localeCompare(b.dueDate || "9999");
    });
}

/** Completed points per day over a window — the series behind the burndown/velocity charts. */
export function burndownSeries(sprint: Sprint, tasks: Task[]): { day: string; remaining: number }[] {
  const total = tasks.reduce((s, t) => s + t.estimate, 0);
  if (!sprint.startDate || !sprint.endDate) return [];
  const start = new Date(sprint.startDate + "T00:00:00");
  const end = new Date(sprint.endDate + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return [];
  const days: { day: string; remaining: number }[] = [];
  const doneByDay = new Map<string, number>();
  for (const t of tasks) if (t.status === "done" && t.completedAt) {
    // Work finished before the sprint began is already burned on day one.
    const completed = t.completedAt.slice(0, 10);
    const d = completed < sprint.startDate ? sprint.startDate : completed;
    doneByDay.set(d, (doneByDay.get(d) ?? 0) + t.estimate);
  }
  let burned = 0;
  const cursor = new Date(start);
  for (let i = 0; i <= 60 && cursor <= end; i++) {
    const key = cursor.toISOString().slice(0, 10);
    burned += doneByDay.get(key) ?? 0;
    days.push({ day: key, remaining: Math.max(0, total - burned) });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/** Sessions that are live and whose parent project (if any) is also live. */
export function liveSessions(db: DatabaseSnapshot): Session[] {
  const live = liveProjectIds(db);
  return db.sessions.filter(s => isLive(s) && (s.projectId === null || live.has(s.projectId)));
}

export function globalNotes(db: DatabaseSnapshot): NoteEntry[] {
  return db.notes.filter(n => n.projectId === null).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function trashOf(db: DatabaseSnapshot): { projects: Project[]; sessions: Session[]; tasks: Task[]; sprints: Sprint[] } {
  const live = liveProjectIds(db);
  const byDeleted = (a: BaseEntity, b: BaseEntity) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "");
  return {
    projects: db.projects.filter(p => !!p.deletedAt).sort(byDeleted),
    sessions: db.sessions.filter(s => !!s.deletedAt && (s.projectId === null || live.has(s.projectId))).sort(byDeleted),
    tasks: db.tasks.filter(t => !!t.deletedAt && live.has(t.projectId)).sort(byDeleted),
    sprints: db.sprints.filter(s => !!s.deletedAt && live.has(s.projectId)).sort(byDeleted),
  };
}

/* ───────────── Health & repair ───────────── */

export interface DataHealth {
  orphanSessions: number;
  orphanNotes: number;
  orphanFiles: number;
  orphanTasks: number;
  orphanSprints: number;
  orphanSprintRefs: number;
  duplicateIds: number;
  invalidDates: number;
  trashProjects: number;
  trashSessions: number;
  issues: number;
}

export function health(db: DatabaseSnapshot): DataHealth {
  const ids = new Set(db.projects.map(p => p.id));
  const orphanSessions = db.sessions.filter(s => s.projectId !== null && !ids.has(s.projectId)).length;
  const orphanNotes = db.notes.filter(n => n.projectId !== null && !ids.has(n.projectId)).length;
  const orphanFiles = db.files.filter(f => !ids.has(f.projectId)).length;
  const orphanTasks = db.tasks.filter(t => !ids.has(t.projectId)).length;
  const orphanSprints = db.sprints.filter(s => !ids.has(s.projectId)).length;
  const sprints = new Map(db.sprints.map(s => [s.id, s] as const));
  const orphanSprintRefs = db.tasks.filter(t => {
    if (!t.sprintId) return false;
    const sprint = sprints.get(t.sprintId);
    return !sprint || sprint.projectId !== t.projectId;
  }).length;
  let duplicateIds = 0;
  let invalidDates = 0;
  for (const t of TABLES) {
    const rows = db[t] as BaseEntity[];
    duplicateIds += rows.length - new Set(rows.map(r => r.id)).size;
    for (const r of rows) if (!isIso(r.createdAt) || !isIso(r.updatedAt)) invalidDates++;
  }
  const trash = trashOf(db);
  const issues = orphanSessions + orphanNotes + orphanFiles + orphanTasks + orphanSprints + orphanSprintRefs + duplicateIds + invalidDates;
  return { orphanSessions, orphanNotes, orphanFiles, orphanTasks, orphanSprints, orphanSprintRefs, duplicateIds, invalidDates, trashProjects: trash.projects.length, trashSessions: trash.sessions.length, issues };
}

/** Detach orphan sessions, turn orphan notes into global notes, drop orphan file/task metadata, dedupe ids, fix dates. */
export function repair(db: DatabaseSnapshot): DatabaseSnapshot {
  const ids = new Set(db.projects.map(p => p.id));
  const now = nowIso();
  const fixDates = <T extends BaseEntity>(r: T): T => ({ ...r, createdAt: isIso(r.createdAt) ? r.createdAt : now, updatedAt: isIso(r.updatedAt) ? r.updatedAt : now });
  const validSprints = new Map(db.sprints.filter(s => ids.has(s.projectId)).map(s => [s.id, s] as const));
  return {
    ...db,
    projects: dedupeById(db.projects.map(fixDates)),
    sessions: dedupeById(db.sessions.map(fixDates).map(s => (s.projectId && !ids.has(s.projectId) ? { ...s, projectId: null, updatedAt: now } : s))),
    notes: dedupeById(db.notes.map(fixDates).map(n => (n.projectId && !ids.has(n.projectId) ? { ...n, projectId: null, updatedAt: now } : n))),
    files: dedupeById(db.files.map(fixDates).filter(f => ids.has(f.projectId))),
    tasks: dedupeById(db.tasks.map(fixDates).filter(t => ids.has(t.projectId)).map(t => {
      if (!t.sprintId) return t;
      const sprint = validSprints.get(t.sprintId);
      return !sprint || sprint.projectId !== t.projectId ? { ...t, sprintId: null, updatedAt: now } : t;
    })),
    sprints: dedupeById(db.sprints.map(fixDates).filter(s => ids.has(s.projectId))),
    activity: dedupeById(db.activity.map(fixDates)),
  };
}

/* ───────────── Merge (import) ───────────── */

export interface MergeResult { added: number; updated: number; skipped: number }

/** Last-write-wins merge per table. Incoming rows win only when their updatedAt is newer. */
export function mergeSnapshot(base: DatabaseSnapshot, incoming: DatabaseSnapshot): { db: DatabaseSnapshot; result: MergeResult } {
  const result: MergeResult = { added: 0, updated: 0, skipped: 0 };
  const mergeTable = <T extends BaseEntity>(a: T[], b: T[]): T[] => {
    const map = new Map(a.map(r => [r.id, r] as const));
    for (const row of b) {
      const prev = map.get(row.id);
      if (!prev) { map.set(row.id, row); result.added++; }
      else if (row.updatedAt > prev.updatedAt) { map.set(row.id, row); result.updated++; }
      else result.skipped++;
    }
    return Array.from(map.values());
  };
  const db: DatabaseSnapshot = {
    ...base,
    projects: mergeTable(base.projects, incoming.projects),
    sessions: mergeTable(base.sessions, incoming.sessions),
    notes: mergeTable(base.notes, incoming.notes),
    files: mergeTable(base.files, incoming.files),
    tasks: mergeTable(base.tasks, incoming.tasks),
    sprints: mergeTable(base.sprints, incoming.sprints),
    activity: mergeTable(base.activity, incoming.activity).sort((x, y) => y.createdAt.localeCompare(x.createdAt)).slice(0, ACTIVITY_CAP),
  };
  return { db, result };
}

/* ───────────── Change detection (future sync outbox) ───────────── */

export function diffSnapshots(prev: DatabaseSnapshot, next: DatabaseSnapshot): ChangeEvent[] {
  const events: ChangeEvent[] = [];
  for (const table of TABLES) {
    const before = new Map((prev[table] as BaseEntity[]).map(r => [r.id, r] as const));
    const after = new Map((next[table] as BaseEntity[]).map(r => [r.id, r] as const));
    after.forEach((row, id) => {
      const old = before.get(id);
      if (!old || old.updatedAt !== row.updatedAt || old.deletedAt !== row.deletedAt) events.push({ table: table as TableName, op: "upsert", id, row });
    });
    before.forEach((_, id) => { if (!after.has(id)) events.push({ table: table as TableName, op: "delete", id }); });
  }
  return events;
}
