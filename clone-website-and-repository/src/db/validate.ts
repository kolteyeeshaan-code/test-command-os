/**
 * Runtime validation & repair. Every snapshot that enters the app (boot, import,
 * cross-tab refresh) passes through `sanitize`, which guarantees the invariants the
 * UI relies on: ids present, timestamps valid, enums in range, arrays are arrays,
 * per-app data upgraded to the current shape, and no duplicate ids.
 */
import { APP_VERSION, SCHEMA_VERSION, TASK_COLUMNS, TASK_PRIORITIES, VERTICAL_META } from "./schema";
import type { ActivityIcon, ActivityItem, AppVertical, BaseEntity, DatabaseMeta, DatabaseSnapshot, FeeType, FileEntry, NoteEntry, Project, ProjectStatus, Session, Sprint, SprintStatus, Task, TaskPriority, TaskStatus } from "./schema";
import { generateId, nowIso, toIso } from "./ids";
import { currentAppDataVersion, migrateAppData } from "./appData";

const STATUSES: ProjectStatus[] = ["active", "paused", "completed"];
const FEE_TYPES: FeeType[] = ["fixed", "retainer", "value-based", "hourly"];
const ICONS: ActivityIcon[] = ["session", "status", "note", "file", "project", "task"];
const SPRINT_STATUSES: SprintStatus[] = ["planned", "active", "completed"];
/** Only yyyy-mm-dd is accepted for user-facing dates. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const dateOrBlank = (v: unknown): string => (typeof v === "string" && DATE_RE.test(v) ? v : "");
export const DEFAULT_PHASES = ["Discovery", "Strategy", "Creative", "Delivery", "Review"];

const str = (v: unknown, fb = ""): string => (typeof v === "string" ? v : v == null ? fb : String(v));
const num = (v: unknown, fb = 0, min = -Infinity, max = Infinity): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fb;
  return Math.min(max, Math.max(min, n));
};
const arr = <T = unknown>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const strArr = (v: unknown): string[] => arr(v).map(x => str(x)).filter(x => x.trim().length > 0);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

function base(raw: Record<string, unknown>, now: string): BaseEntity {
  const createdAt = toIso(raw.createdAt, now);
  return {
    id: str(raw.id) || generateId(),
    createdAt,
    updatedAt: toIso(raw.updatedAt, createdAt),
    deletedAt: raw.deletedAt ? toIso(raw.deletedAt, now) : null,
  };
}

export function humanTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function sanitizeProject(input: unknown, now = nowIso()): Project | null {
  const r = obj(input);
  if (!r.id && !r.clientName && !r.projectName) return null;
  const phases = strArr(r.phases);
  const finalPhases = phases.length ? phases : [...DEFAULT_PHASES];
  const status = STATUSES.includes(r.status as ProjectStatus) ? (r.status as ProjectStatus) : r.status === "pipeline" ? "paused" : "active";
  return {
    ...base(r, now),
    clientName: str(r.clientName),
    projectName: str(r.projectName),
    status,
    startDate: str(r.startDate),
    targetEndDate: str(r.targetEndDate),
    fee: num(r.fee, 0, 0),
    feeType: FEE_TYPES.includes(r.feeType as FeeType) ? (r.feeType as FeeType) : "fixed",
    feeCurrency: str(r.feeCurrency, "USD") || "USD",
    vertical: (str(r.vertical) in VERTICAL_META ? str(r.vertical) : "brand_strategy") as AppVertical,
    scopeSummary: str(r.scopeSummary),
    phases: finalPhases,
    donePhases: Math.round(num(r.donePhases, 0, 0, finalPhases.length)),
    sollPct: Math.round(num(r.sollPct, 0, 0, 100)),
    goals: strArr(r.goals),
  };
}

export function sanitizeSession(input: unknown, now = nowIso()): Session | null {
  const r = obj(input);
  const appId = str(r.appId);
  if (!appId) return null;
  const fromVersion = Math.max(1, Math.round(num(r.dataVersion, 1, 1)));
  const rawData = r.data && typeof r.data === "object" ? r.data : {};
  const target = currentAppDataVersion(appId);
  const migrated = fromVersion < target ? migrateAppData(appId, rawData, fromVersion) : { data: rawData, version: fromVersion };
  return {
    ...base(r, now),
    appId,
    projectId: typeof r.projectId === "string" && r.projectId ? r.projectId : null,
    title: str(r.title),
    revision: Math.max(0, Math.round(num(r.revision, 1, 0))),
    dataVersion: migrated.version,
    data: migrated.data,
  };
}

export function sanitizeNote(input: unknown, now = nowIso()): NoteEntry | null {
  const r = obj(input);
  const body = str(r.body);
  if (!body && !r.id) return null;
  const b = base(r, now);
  return {
    ...b,
    projectId: typeof r.projectId === "string" && r.projectId ? r.projectId : null,
    author: str(r.author, "You") || "You",
    body,
    time: str(r.time) || humanTime(b.createdAt),
  };
}

export function sanitizeFile(input: unknown, now = nowIso()): FileEntry | null {
  const r = obj(input);
  const projectId = str(r.projectId);
  if (!projectId) return null;
  return {
    ...base(r, now),
    projectId,
    name: str(r.name, "Untitled file") || "Untitled file",
    meta: str(r.meta),
    size: r.size != null ? num(r.size, 0, 0) : undefined,
    mimeType: r.mimeType != null ? str(r.mimeType) : undefined,
  };
}

export function sanitizeTask(input: unknown, now = nowIso()): Task | null {
  const r = obj(input);
  const projectId = str(r.projectId);
  const title = str(r.title);
  if (!projectId || (!title && !r.id)) return null;
  const status = TASK_COLUMNS.includes(r.status as TaskStatus) ? (r.status as TaskStatus) : "backlog";
  const priority = TASK_PRIORITIES.includes(r.priority as TaskPriority) ? (r.priority as TaskPriority) : "medium";
  const completedAt = status === "done" ? toIso(r.completedAt, now) : null;
  return {
    ...base(r, now),
    projectId,
    title,
    description: str(r.description),
    status,
    priority,
    assignee: str(r.assignee),
    phaseIndex: Math.round(num(r.phaseIndex, -1, -1, 200)),
    sprintId: typeof r.sprintId === "string" && r.sprintId ? r.sprintId : null,
    dueDate: dateOrBlank(r.dueDate),
    estimate: Math.round(num(r.estimate, 0, 0, 999)),
    order: Math.round(num(r.order, 0, 0, 1e6)),
    completedAt,
  };
}

export function sanitizeSprint(input: unknown, now = nowIso()): Sprint | null {
  const r = obj(input);
  const projectId = str(r.projectId);
  const name = str(r.name);
  if (!projectId || (!name && !r.id)) return null;
  const status = SPRINT_STATUSES.includes(r.status as SprintStatus) ? (r.status as SprintStatus) : "planned";
  let start = dateOrBlank(r.startDate);
  let end = dateOrBlank(r.endDate);
  // Keep the window coherent: an end before the start is treated as unset.
  if (start && end && end < start) end = "";
  return {
    ...base(r, now),
    projectId,
    name,
    goal: str(r.goal),
    startDate: start,
    endDate: end,
    status,
  };
}

export function sanitizeActivity(input: unknown, now = nowIso()): ActivityItem | null {
  const r = obj(input);
  const title = str(r.title);
  if (!title) return null;
  return {
    ...base(r, now),
    icon: ICONS.includes(r.icon as ActivityIcon) ? (r.icon as ActivityIcon) : "session",
    title,
    meta: str(r.meta),
    href: str(r.href, "#/home") || "#/home",
    projectId: typeof r.projectId === "string" ? r.projectId : null,
  };
}

/** Keep one row per id — the most recently updated one wins. */
export function dedupeById<T extends BaseEntity>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) {
    const prev = map.get(row.id);
    if (!prev || row.updatedAt >= prev.updatedAt) map.set(row.id, row);
  }
  return Array.from(map.values());
}

export function sanitizeMeta(input: unknown, now = nowIso()): DatabaseMeta {
  const r = obj(input);
  return {
    deviceId: str(r.deviceId) || generateId(),
    createdAt: toIso(r.createdAt, now),
    updatedAt: toIso(r.updatedAt, now),
    appVersion: APP_VERSION,
    migratedFrom: r.migratedFrom ? str(r.migratedFrom) : null,
  };
}

/** Normalise any supported object into a guaranteed-valid current snapshot. */
export function sanitize(input: unknown): DatabaseSnapshot {
  const now = nowIso();
  const r = obj(input);
  const notNull = <T,>(x: T | null): x is T => x !== null;
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: sanitizeMeta(r.meta, now),
    projects: dedupeById(arr(r.projects).map(p => sanitizeProject(p, now)).filter(notNull)),
    sessions: dedupeById(arr(r.sessions).map(s => sanitizeSession(s, now)).filter(notNull)),
    notes: dedupeById(arr(r.notes).map(n => sanitizeNote(n, now)).filter(notNull)),
    files: dedupeById(arr(r.files).map(f => sanitizeFile(f, now)).filter(notNull)),
    activity: dedupeById(arr(r.activity).map(a => sanitizeActivity(a, now)).filter(notNull))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 50),
    // v3 snapshots predate these tables; arr(undefined) → [] so they arrive empty.
    tasks: dedupeById(arr(r.tasks).map(t => sanitizeTask(t, now)).filter(notNull)),
    sprints: dedupeById(arr(r.sprints).map(s => sanitizeSprint(s, now)).filter(notNull)),
  };
}
