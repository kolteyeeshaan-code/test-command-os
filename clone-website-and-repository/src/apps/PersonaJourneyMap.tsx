/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Customer Persona Journey Map
 * Operational Purpose: Persona profile plus stage-by-stage actions, thoughts, emotions, and jobs.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

export interface Stage {
  id: string;
  name: string;
  actions: string;
  thoughts: string;
  emotionVal: "Positive" | "Neutral" | "Negative";
  emotionDesc: string;
  pains: string;
  jobs: string;
}

export interface Persona { name: string; demographics: string; background: string; goals: string; frustrations: string }
export interface Data { persona: Persona; stages: Stage[] }
const DEFAULT_STAGES = ["Awareness", "Consideration", "Signup", "Exploration", "Transaction"];

export function CustomerPersonaJourneyMap({ data: raw, onChange }: AppProps) {
  const d: Data = { persona: { name: "", demographics: "", background: "", goals: "", frustrations: "" }, stages: [], ...(raw as Partial<Data>) };

  if (d.stages.length === 0) {
    d.stages = DEFAULT_STAGES.map(n => ({ id: generateId(), name: n, actions: "", thoughts: "", emotionVal: "Neutral", emotionDesc: "", pains: "", jobs: "" }));
  }

  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const updPersona = (u: Partial<Persona>) => upd({ persona: { ...d.persona, ...u } });
  const updStage = (id: string, u: Partial<Stage>) => upd({ stages: d.stages.map(s => s.id === id ? { ...s, ...u } : s) });
  const addStage = () => upd({ stages: [...d.stages, { id: generateId(), name: "New Stage", actions: "", thoughts: "", emotionVal: "Neutral", emotionDesc: "", pains: "", jobs: "" }] });
  const rmStage = (id: string) => upd({ stages: d.stages.filter(s => s.id !== id) });

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8 rounded-2xl bg-card p-6">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Persona Profile</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input value={d.persona.name} onChange={e => updPersona({ name: e.target.value })} placeholder="Name / Archetype (e.g. Sarah, Marketing Director)" className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
          <input value={d.persona.demographics} onChange={e => updPersona({ demographics: e.target.value })} placeholder="Demographics (Age, Location, Role)" className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
          <textarea value={d.persona.background} onChange={e => updPersona({ background: e.target.value })} placeholder="Background" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none sm:col-span-2" />
          <textarea value={d.persona.goals} onChange={e => updPersona({ goals: e.target.value })} placeholder="Goals & Motivations" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
          <textarea value={d.persona.frustrations} onChange={e => updPersona({ frustrations: e.target.value })} placeholder="Frustrations & Pain points" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase tracking-[0.06em]">Journey Stages</p>
        <button onClick={addStage} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
          <IconPlus size={14} /> Add Stage
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {d.stages.map((s, i) => {
          const val = s.emotionVal || "Neutral";
          return (
            <div key={s.id} className="rounded-2xl bg-card p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                  <input value={s.name} onChange={e => updStage(s.id, { name: e.target.value })} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-1.5 text-sm font-semibold outline-none" />
                </div>
                <button onClick={() => rmStage(s.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <textarea value={s.actions} onChange={e => updStage(s.id, { actions: e.target.value })} placeholder="Actions taken in this stage" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
                <textarea value={s.thoughts} onChange={e => updStage(s.id, { thoughts: e.target.value })} placeholder="Thoughts & mindsets" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />

                {/* Emotion block with Positive/Negative toggle + description */}
                <div className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-3">
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Emotion State</label>
                  <div className="mb-2 flex gap-1.5">
                    {(["Positive", "Neutral", "Negative"] as const).map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updStage(s.id, { emotionVal: opt })}
                        className={cn(
                          "rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] transition",
                          val === opt
                            ? opt === "Positive" ? "bg-[rgba(52,199,89,0.3)] text-black" : opt === "Negative" ? "bg-[rgba(255,149,0,0.3)] text-black" : "bg-ink text-white"
                            : "bg-card text-subtitle hover:bg-black/10"
                        )}
                      >
                        {opt === "Positive" ? "Positive 🟢" : opt === "Negative" ? "Negative 🔴" : "Neutral ⚪"}
                      </button>
                    ))}
                  </div>
                  <input
                    value={s.emotionDesc ?? (s as any).emotions ?? ""}
                    onChange={e => updStage(s.id, { emotionDesc: e.target.value })}
                    placeholder="Describe emotion & triggers (e.g. Delighted by instant setup)"
                    className="w-full bg-transparent text-xs text-subtitle outline-none placeholder:text-black/25"
                  />
                </div>

                <textarea value={s.pains} onChange={e => updStage(s.id, { pains: e.target.value })} placeholder="Pain points & friction" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
                <textarea value={s.jobs} onChange={e => updStage(s.id, { jobs: e.target.value })} placeholder="Jobs-to-be-Done at this stage" rows={2} className="rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none sm:col-span-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
