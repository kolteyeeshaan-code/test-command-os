import { seedActivity, seedProjects, seedSessions, seedTasks, seedSprints } from "../data";
import { generateId, nowIso } from "./ids";
import { SCHEMA_VERSION } from "./schema";
import type { DatabaseSnapshot, FileEntry, NoteEntry, Project, Sprint, Task } from "./schema";
import { sanitize } from "./validate";

/** Build a fresh, normalised workspace from the seed content in data.ts. */
export function seedDatabase(): DatabaseSnapshot {
  const now = nowIso();
  const projects: Project[] = [];
  const notes: NoteEntry[] = [];
  const files: FileEntry[] = [];
  for (const sp of seedProjects()) {
    const { notes: pn, files: pf, ...core } = sp;
    projects.push(core);
    pn.forEach(n => notes.push({ ...n, projectId: sp.id }));
    pf.forEach(f => files.push({ ...f, projectId: sp.id }));
  }
  return sanitize({
    schemaVersion: SCHEMA_VERSION,
    meta: { deviceId: generateId(), createdAt: now, updatedAt: now },
    projects,
    sessions: seedSessions(),
    notes,
    files,
    tasks: seedTasks(),
    sprints: seedSprints(),
    activity: seedActivity(),
  });
}

export function emptyDatabase(): DatabaseSnapshot {
  const now = nowIso();
  return sanitize({ schemaVersion: SCHEMA_VERSION, meta: { deviceId: generateId(), createdAt: now, updatedAt: now }, projects: [], sessions: [], notes: [], files: [], activity: [], tasks: [], sprints: [] });
}

/** Stable ids so seed tasks can reference seed sprints. */
export const SEED_SPRINT_IDS = { meridianSprint1: "sprint-meridian-1", harvestSprint1: "sprint-harvest-1" } as const;
export type SeedTask = Omit<Task, "projectId">;
export type SeedSprint = Omit<Sprint, "projectId">;
export { seedTasks, seedSprints };

