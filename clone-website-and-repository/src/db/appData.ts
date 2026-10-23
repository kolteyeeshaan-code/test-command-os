/**
 * Per-app data-shape versioning.
 *
 * Each tool owns the shape of `session.data`. When a tool's shape changes, bump its
 * version here and add a step that upgrades from the previous version. Steps run at
 * load time (sanitize) and on import, so old sessions always open with the current
 * shape. Components keep their own defensive defaults as a second line of defence.
 */
import { generateId } from "./ids";

type Step = (data: any) => any;

export const APP_DATA_VERSIONS: Record<string, number> = {
  "jobs-ranker": 2,
  "persona-journey": 2,
  "design-criteria": 2,
};

const clamp4 = (n: number) => Math.min(4, Math.max(1, Math.round(n)));

const STEPS: Record<string, Record<number, Step>> = {
  /* v1 (importance/satisfaction 1–10) → v2 (Important/Tangible/Unsatisfied/Lucrative 1–4) */
  "jobs-ranker": {
    1: (d) => {
      if (!d || !Array.isArray(d.jobs)) return d;
      return {
        ...d,
        jobs: d.jobs.map((j: any) => ({
          id: j.id ?? generateId(),
          description: j.description ?? "",
          category: j.category ?? "Functional",
          important: typeof j.important === "number" ? j.important : typeof j.importance === "number" ? clamp4(j.importance / 2.5) : 3,
          tangible: typeof j.tangible === "number" ? j.tangible : 3,
          unsatisfied: typeof j.unsatisfied === "number" ? j.unsatisfied : typeof j.satisfaction === "number" ? clamp4((11 - j.satisfaction) / 2.5) : 3,
          lucrative: typeof j.lucrative === "number" ? j.lucrative : 3,
        })),
      };
    },
  },
  /* v1 (free-text emotions) → v2 (emotionVal + emotionDesc) */
  "persona-journey": {
    1: (d) => {
      if (!d || !Array.isArray(d.stages)) return d;
      return {
        ...d,
        stages: d.stages.map((s: any) => ({
          ...s,
          emotionVal: s.emotionVal ?? "Neutral",
          emotionDesc: s.emotionDesc ?? s.emotions ?? "",
        })),
      };
    },
  },
  /* v1 (flat weighted dimensions) → v2 (multi-deliverable canvases with MoSCoW) */
  "design-criteria": {
    1: (d) => {
      if (!d || Array.isArray(d.canvases)) return d;
      const hasLegacy = ["aesthetic", "functional", "brand", "technical"].some(k => Array.isArray(d[k]) && d[k].length);
      if (!hasLegacy) return d;
      return {
        canvases: [{
          id: generateId(),
          deliverable: "",
          moscow: { must: [], should: [], could: [], wont: [] },
          dimensions: {
            aesthetic: d.aesthetic ?? [],
            functional: d.functional ?? [],
            brand: d.brand ?? [],
            technical: d.technical ?? [],
          },
        }],
      };
    },
  },
};

export function currentAppDataVersion(appId: string): number {
  return APP_DATA_VERSIONS[appId] ?? 1;
}

export function migrateAppData(appId: string, data: unknown, fromVersion: number): { data: unknown; version: number } {
  const target = currentAppDataVersion(appId);
  let v = Math.max(1, Math.floor(fromVersion || 1));
  let d = data;
  const steps = STEPS[appId] ?? {};
  while (v < target) {
    const step = steps[v];
    if (step) {
      try { d = step(d); } catch { /* keep data as-is; component defaults will cope */ }
    }
    v++;
  }
  return { data: d, version: target };
}
