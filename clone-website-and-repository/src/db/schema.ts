/**
 * Canonical data schema for the Consultancy Suite.
 *
 * Every record is a row in a table, keyed by `id`, with ISO-8601 audit timestamps and
 * soft-delete support. Relations are expressed as foreign-key style `projectId`
 * references (nullable where a row may be unattached). The shape is intentionally
 * relational so it can be mapped 1:1 onto SQL / Supabase / IndexedDB later.
 *
 * See src/db/README.md for the model, migration policy, and the adapter contract.
 */

export const SCHEMA_VERSION = 4 as const;
export const APP_VERSION = "1.4.0";

export interface BaseEntity {
  id: string;
  /** ISO-8601 — set once on insert. */
  createdAt: string;
  /** ISO-8601 — bumped on every write; used for last-write-wins merges. */
  updatedAt: string;
  /** ISO-8601 when soft-deleted; null/undefined means live. */
  deletedAt?: string | null;
}

export type ProjectStatus = "active" | "paused" | "completed";
export type FeeType = "fixed" | "retainer" | "value-based" | "hourly";
export type AppCategory = "discovery" | "strategy" | "creative" | "commercial";
export type BadgeTone = "green" | "orange" | "gray";

/**
 * Operational consulting taxonomy — the 9-domain tag system used to stamp every
 * catalog tool so the workspace can build clean programmatic filters.
 */
export type ConsultingDomain =
  | "brand_strategy"
  | "brand_experience"
  | "innovation_design"
  | "digital_outreach"
  | "events_activations"
  | "tactile_packaging"
  | "printing_manufacturing"
  | "systems_integration"
  | "micro_ma_matchmaking";

/**
 * Vertical-Based classification — a secondary tag layer that sits alongside the
 * Process-Based AppCategory tags. Lets the registry be filtered by what kind of
 * consulting work a tool serves, not just where it sits in the delivery process.
 */
export type AppVertical =
  | "brand_strategy"
  | "brand_experience"
  | "innovation_design"
  | "digital_outreach"
  | "events_activations"
  | "tactile_packaging"
  | "printing_manufacturing"
  | "systems_integration"
  | "micro_ma_matchmaking";

/** Full label + short chip for each of the 9 verticals. */
export const VERTICAL_META: Record<AppVertical, { label: string; short: string }> = {
  brand_strategy: { label: "Brand Strategy (+ Positioning, Messaging)", short: "Strategy" },
  brand_experience: { label: "Brand Experience Design", short: "Experience" },
  innovation_design: { label: "Design Consultancy for Innovation & Experience", short: "Innovation" },
  digital_outreach: { label: "Digital Communication & Marketing Outreach", short: "Digital" },
  events_activations: { label: "Events, Brand Activations & Business Development", short: "Activations" },
  tactile_packaging: { label: "Environmental, Tactile, Packaging & Sensory Brand Collateral", short: "Tactile" },
  printing_manufacturing: { label: "Printing & Collateral Manufacturing", short: "Manufacturing" },
  systems_integration: { label: "Service Category 8 — Sensory Environment & Systems Integration", short: "Systems" },
  micro_ma_matchmaking: { label: "B2B Matchmaking/Trading + Micro M&A/Funding/Structuring Consultancy", short: "M&A & Trading" },
};

/** Table: projects */
export interface Project extends BaseEntity {
  clientName: string;
  projectName: string;
  status: ProjectStatus;
  startDate: string;
  targetEndDate: string;
  fee: number;
  feeType: FeeType;
  feeCurrency: string;
  /** Core consulting vertical this project requires. Falls back to brand_strategy when unset. */
  vertical?: AppVertical;
  scopeSummary: string;
  phases: string[];
  donePhases: number;
  sollPct: number;
  goals: string[];
}

/** Table: sessions — projectId → projects.id (nullable = unattached) */
export interface Session extends BaseEntity {
  appId: string;
  projectId: string | null;
  title: string;
  /** Increments on every persisted save. */
  revision: number;
  /** Version of the per-app `data` shape (see appData.ts). */
  dataVersion: number;
  data: unknown;
}

/** Table: notes — projectId → projects.id (null = global note) */
export interface NoteEntry extends BaseEntity {
  projectId: string | null;
  author: string;
  body: string;
  /** Human label ("Nov 15 · 10:20"). Derived from createdAt for new rows; kept for migrated rows. */
  time: string;
}

/** Table: files — projectId → projects.id (metadata only; no binary storage) */
export interface FileEntry extends BaseEntity {
  projectId: string;
  name: string;
  meta: string;
  size?: number;
  mimeType?: string;
}

/* ───────────── Delivery tracking (kanban / scrum) ───────────── */

/** Kanban columns. Order here is the board order. */
export const TASK_COLUMNS = ["backlog", "todo", "doing", "review", "done"] as const;
export type TaskStatus = typeof TASK_COLUMNS[number];

export const TASK_COLUMN_META: Record<TaskStatus, { label: string; hint: string }> = {
  backlog: { label: "Backlog", hint: "Captured, not yet committed" },
  todo: { label: "To do", hint: "Committed for this cycle" },
  doing: { label: "In progress", hint: "Actively being worked" },
  review: { label: "Review", hint: "Awaiting client or internal review" },
  done: { label: "Done", hint: "Accepted and closed" },
};

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export const TASK_PRIORITY_META: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  low: { label: "Low", tone: "gray" },
  medium: { label: "Medium", tone: "gray" },
  high: { label: "High", tone: "orange" },
  urgent: { label: "Urgent", tone: "green" },
};

export type SprintStatus = "planned" | "active" | "completed";

/** Table: tasks — projectId → projects.id */
export interface Task extends BaseEntity {
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** Free-text owner (consultant, client contact, or vendor). */
  assignee: string;
  /** Index into the owning project's `phases`, or -1 when unassigned. */
  phaseIndex: number;
  /** sprintId → sprints.id (null = not scheduled into a sprint). */
  sprintId: string | null;
  /** yyyy-mm-dd */
  dueDate: string;
  /** Story points / effort estimate. 0 = unestimated. */
  estimate: number;
  /** Sort order within its column. */
  order: number;
  /** Set when the task reaches `done`; drives burndown charts. */
  completedAt: string | null;
}

/** Table: sprints — projectId → projects.id */
export interface Sprint extends BaseEntity {
  projectId: string;
  name: string;
  goal: string;
  /** yyyy-mm-dd */
  startDate: string;
  endDate: string;
  status: SprintStatus;
}

/** Derived, never persisted. */
export interface TaskMetrics {
  total: number;
  done: number;
  active: number;
  overdue: number;
  unassigned: number;
  points: number;
  pointsDone: number;
  byColumn: Record<TaskStatus, number>;
}

export type ActivityIcon = "session" | "status" | "note" | "file" | "project" | "task";

/** Table: activity — append-only feed, capped */
export interface ActivityItem extends BaseEntity {
  icon: ActivityIcon;
  title: string;
  meta: string;
  href: string;
  projectId?: string | null;
}

export interface DatabaseMeta {
  /** Random id for this browser profile; useful for attributing writes when syncing later. */
  deviceId: string;
  createdAt: string;
  updatedAt: string;
  appVersion: string;
  /** Set once when the workspace was upgraded from an older storage format. */
  migratedFrom?: string | null;
}

export interface DatabaseSnapshot {
  schemaVersion: typeof SCHEMA_VERSION;
  meta: DatabaseMeta;
  projects: Project[];
  sessions: Session[];
  notes: NoteEntry[];
  files: FileEntry[];
  activity: ActivityItem[];
  tasks: Task[];
  sprints: Sprint[];
}

/** A project with its related rows joined in — the shape the UI consumes. */
export interface ProjectView extends Project {
  notes: NoteEntry[];
  files: FileEntry[];
  tasks: Task[];
  sprints: Sprint[];
  sessionCount: number;
  metrics: TaskMetrics;
  /** Max updatedAt across the project and its sessions/notes/tasks. */
  lastActivityAt: string;
}

export const TABLES = ["projects", "sessions", "notes", "files", "activity", "tasks", "sprints"] as const;
export type TableName = typeof TABLES[number];

/** Row-level change event — the hook point for a future outbox / sync layer. */
export interface ChangeEvent {
  table: TableName;
  op: "upsert" | "delete";
  id: string;
  row?: BaseEntity;
}
