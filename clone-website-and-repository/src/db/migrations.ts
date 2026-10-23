/**
 * Storage-format migrations.
 *
 *  v1  key "consultancy-os-v1"     { engagements[], sessions[] (engagementId), activity[], globalNotes[] }
 *  v2  key "consultancy-suite-v2"  { projects[] (nested notes/files), sessions[] (projectId), activity[], globalNotes[] }
 *  v3  key "consultancy-suite-db"  normalised tables + meta + schemaVersion
 *  v4  adds tasks[] and sprints[] (delivery tracking: kanban + scrum)   ← current
 *
 * `migrate()` accepts any of these (or a project export package) and returns a valid v4
 * snapshot. v3 → v4 is additive: sanitize() defaults the new tables to empty arrays, so a
 * v3 snapshot upgrades with no data movement. Older keys are left untouched on disk.
 */
import type { DatabaseSnapshot } from "./schema";
import { SCHEMA_VERSION } from "./schema";
import { generateId, nowIso, toIso } from "./ids";
import { sanitize } from "./validate";

export const DB_KEY = "consultancy-suite-db";
export const LEGACY_KEYS = ["consultancy-suite-v2", "consultancy-os-v1"] as const;

type AnyRecord = Record<string, any>;
const arr = (v: unknown): AnyRecord[] => (Array.isArray(v) ? (v as AnyRecord[]) : []);

export type DetectedFormat = "v4" | "v3" | "v2" | "v1" | "package-v4" | "package-v3" | "package-v2" | "package-v1" | "unknown";

export function detectFormat(raw: unknown): DetectedFormat {
  if (!raw || typeof raw !== "object") return "unknown";
  const r = raw as AnyRecord;
  if (r.format === "consultancy-suite/project") return Array.isArray(r.tasks) ? "package-v4" : "package-v3";
  if (r.format === "consultancy-suite/workspace") return Array.isArray(r.tasks) ? "v4" : "v3";
  if (Array.isArray(r.projects)) {
    if (Array.isArray(r.tasks) && Array.isArray(r.sprints)) return "v4";
    if (typeof r.schemaVersion === "number" && r.schemaVersion >= 3) return "v3";
  }
  if (r.engagement && typeof r.engagement === "object") return "package-v1";
  if (r.project && typeof r.project === "object" && Array.isArray(r.sessions)) return "package-v2";
  if (Array.isArray(r.projects) && Array.isArray(r.sessions)) return "v2";
  if (Array.isArray(r.engagements)) return "v1";
  return "unknown";
}

/** Parse legacy activity labels like "6 days ago" so migrated feeds keep sensible timestamps. */
export function parseRelativeMeta(meta: unknown, now = Date.now()): string | null {
  if (typeof meta !== "string") return null;
  const m = meta.trim().toLowerCase();
  if (!m) return null;
  if (m === "just now") return new Date(now).toISOString();
  if (m === "yesterday") return new Date(now - 864e5).toISOString();
  const match = m.match(/(\d+)\s*(min|minute|h|hour|day|week|month)s?/);
  if (!match) return null;
  const n = Number(match[1]);
  const unit = match[2];
  const ms = unit.startsWith("min") ? 6e4 : unit.startsWith("h") ? 36e5 : unit === "day" ? 864e5 : unit === "week" ? 7 * 864e5 : 30 * 864e5;
  return new Date(now - n * ms).toISOString();
}

/** Spread nested project.notes / project.files into tables, preserving their on-screen order. */
function fromV2(raw: AnyRecord): DatabaseSnapshot {
  const now = nowIso();
  const nowMs = Date.now();
  const projects: AnyRecord[] = [];
  const notes: AnyRecord[] = [];
  const files: AnyRecord[] = [];

  arr(raw.projects).forEach((p, pi) => {
    const { notes: pNotes, files: pFiles, badgeLabel: _bl, badgeTone: _bt, linkedApps: _la, ...core } = p;
    const createdAt = toIso(p.createdAt, p.startDate ? toIso(p.startDate + "T09:00:00.000Z", now) : new Date(nowMs - (pi + 1) * 864e5).toISOString());
    projects.push({ ...core, createdAt, updatedAt: toIso(p.updatedAt, createdAt), deletedAt: null });
    // v2 notes were newest-first; give them descending timestamps so ordering survives.
    arr(pNotes).forEach((n, i) => {
      const ts = toIso(n.createdAt, new Date(nowMs - (i + 1) * 6e4).toISOString());
      notes.push({ ...n, projectId: p.id, createdAt: ts, updatedAt: toIso(n.updatedAt, ts) });
    });
    // v2 files were oldest-first.
    const len = arr(pFiles).length;
    arr(pFiles).forEach((f, i) => {
      const ts = toIso(f.createdAt, new Date(nowMs - (len - i) * 6e4).toISOString());
      files.push({ ...f, projectId: p.id, createdAt: ts, updatedAt: toIso(f.updatedAt, ts) });
    });
  });

  arr(raw.globalNotes).forEach((n, i) => {
    const ts = toIso(n.createdAt, new Date(nowMs - (i + 1) * 6e4).toISOString());
    notes.push({ ...n, projectId: null, createdAt: ts, updatedAt: toIso(n.updatedAt, ts) });
  });

  const sessions = arr(raw.sessions).map(s => ({
    ...s,
    projectId: s.projectId ?? s.engagementId ?? null,
    revision: typeof s.revision === "number" ? s.revision : 1,
    dataVersion: typeof s.dataVersion === "number" ? s.dataVersion : 1,
    deletedAt: null,
  }));

  const activity = arr(raw.activity).map((a, i) => {
    const ts = toIso(a.createdAt, parseRelativeMeta(a.meta, nowMs) ?? new Date(nowMs - (i + 1) * 6e4).toISOString());
    return { ...a, createdAt: ts, updatedAt: ts };
  });

  return sanitize({ schemaVersion: SCHEMA_VERSION, meta: raw.meta ?? { deviceId: generateId(), createdAt: now, updatedAt: now }, projects, sessions, notes, files, activity });
}

/** v1 "engagements" → v2 shape, then through the v2 path. */
function fromV1(raw: AnyRecord): DatabaseSnapshot {
  const projects = arr(raw.engagements).map(e => ({
    id: e.id,
    clientName: e.clientName,
    projectName: e.projectName,
    status: e.status === "pipeline" ? "paused" : e.status,
    startDate: e.startDate,
    targetEndDate: e.targetEndDate,
    fee: e.fee,
    feeType: e.feeType,
    feeCurrency: e.feeCurrency,
    scopeSummary: e.scopeSummary,
    phases: e.phases,
    donePhases: e.donePhases,
    sollPct: e.sollPct,
    goals: e.goals,
    notes: e.notes,
    files: e.files,
  }));
  const sessions = arr(raw.sessions).map(s => ({ ...s, projectId: s.engagementId ?? null }));
  return fromV2({ projects, sessions, activity: raw.activity, globalNotes: raw.globalNotes });
}

/** Any supported input → valid v4 snapshot, or null if unrecognisable. */
export function migrate(raw: unknown, source?: string): DatabaseSnapshot | null {
  const format = detectFormat(raw);
  const r = raw as AnyRecord;
  let snap: DatabaseSnapshot | null = null;
  switch (format) {
    case "v4": snap = sanitize(r); break;
    case "v3": snap = sanitize(r); break; // additive upgrade: tasks/sprints arrive empty
    case "v2": snap = fromV2(r); break;
    case "v1": snap = fromV1(r); break;
    case "package-v4":
    case "package-v3": snap = sanitize({ schemaVersion: SCHEMA_VERSION, projects: [r.project], sessions: r.sessions, notes: r.notes, files: r.files, tasks: r.tasks, sprints: r.sprints, activity: [] }); break;
    case "package-v2": snap = fromV2({ projects: [r.project], sessions: r.sessions, activity: [], globalNotes: [] }); break;
    case "package-v1": snap = fromV1({ engagements: [r.engagement], sessions: r.sessions, activity: [], globalNotes: [] }); break;
    default: return null;
  }
  if (format !== "v4" && source) snap.meta.migratedFrom = source;
  return snap;
}
