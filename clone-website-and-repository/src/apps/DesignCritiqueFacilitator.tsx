/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Design Critique Facilitator
 * Operational Purpose: Per deliverable: five critique modes from inspire to polish.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/** Recommended questions per critique mode (Strategyzer / IDEO-style critique). */
export const CRIT_MODES: { name: string; questions: string[] }[] = [
  { name: "Inspire", questions: ["What excites you about this?", "What feels unmistakably right?", "What would you steal for another project?"] },
  { name: "Challenge", questions: ["What's missing?", "Where does this fall short of the brief?", "What would a skeptic say?"] },
  { name: "Decide", questions: ["Which direction moves forward?", "What is the deciding factor?", "What would you need to see to commit?"] },
  { name: "Refine", questions: ["What details need adjustment?", "What is almost right but not yet?", "What is doing too much?"] },
  { name: "Polish", questions: ["What final touches remain?", "Is anything still unresolved?", "Is anything still unresolved?"] },
];

interface ModeEntry { questions: string; answers: string; notes: string }
interface Deliverable { id: string; name: string; modes: Record<string, ModeEntry> }
interface Data { deliverables: Deliverable[] }

function newModes(): Record<string, ModeEntry> {
  const out: Record<string, ModeEntry> = {};
  CRIT_MODES.forEach(m => { out[m.name] = { questions: m.questions.join("\n"), answers: "", notes: "" }; });
  return out;
}
function newDeliverable(): Deliverable { return { id: generateId(), name: "", modes: newModes() }; }

export function DesignCritiqueFacilitator({ data: raw, onChange, live }: AppProps) {
  const d: Data = { deliverables: [], ...(raw as Partial<Data>) };
  if (d.deliverables.length === 0) d.deliverables = [newDeliverable()];

  const [activeId, setActiveId] = useState(d.deliverables[0].id);
  const active = d.deliverables.find(x => x.id === activeId) ?? d.deliverables[0];

  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const updActive = (u: Partial<Deliverable>) => upd({ deliverables: d.deliverables.map(x => x.id === active.id ? { ...x, ...u } : x) });
  const updMode = (modeName: string, u: Partial<ModeEntry>) =>
    updActive({ modes: { ...active.modes, [modeName]: { ...active.modes[modeName], ...u } } });

  const addDeliverable = () => { const nd = newDeliverable(); upd({ deliverables: [...d.deliverables, nd] }); setActiveId(nd.id); };
  const removeDeliverable = (id: string) => {
    const rest = d.deliverables.filter(x => x.id !== id);
    upd({ deliverables: rest.length ? rest : [newDeliverable()] });
    if (activeId === id) setActiveId((rest[0] || newDeliverable()).id);
  };

  const answeredCount = CRIT_MODES.filter(m => (active.modes[m.name]?.answers || "").trim()).length;

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Design Critique Facilitator</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Critique and tacit approval happen per deliverable. Add each deliverable in scope and run the five modes against it.
          </p>
        </div>
      )}

      {/* Deliverable tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {d.deliverables.map(dl => (
          <button key={dl.id} type="button" onClick={() => setActiveId(dl.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition",
              dl.id === active.id ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40"
            )}>{dl.name || "Untitled deliverable"}</button>
        ))}
        <button type="button" onClick={addDeliverable}
          className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] hover:border-ink">
          <IconPlus size={12} /> Add deliverable
        </button>
      </div>

      {/* Deliverable name */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Deliverable in question</label>
        <input value={active.name} onChange={e => updActive({ name: e.target.value })}
          placeholder="e.g. Logo mark, round 2 · Packaging front-of-pack"
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink",
            !active.name.trim() ? "border-[rgba(255,149,0,0.5)]" : "border-[rgba(117,117,117,0.15)]"
          )} />
        <div className="mt-2 flex items-center justify-between">
          {!active.name.trim() && <p className="text-[11px] text-[#c77700]">Required — name the deliverable being critiqued.</p>}
          <span className="ml-auto text-[11px] uppercase tracking-[0.06em] text-subtitle">{answeredCount}/5 modes answered</span>
        </div>
        {d.deliverables.length > 1 && (
          <button type="button" onClick={() => removeDeliverable(active.id)}
            className="mt-3 text-[11px] text-ink/50 underline underline-offset-2 hover:text-red-500">Remove this deliverable</button>
        )}
      </div>

      {/* Modes */}
      <div className="flex flex-col gap-4">
        {CRIT_MODES.map((m, i) => {
          const v = active.modes[m.name] ?? { questions: m.questions.join("\n"), answers: "", notes: "" };
          return (
            <div key={m.name} className="rounded-2xl bg-card p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                <p className="text-[17px] font-semibold tracking-[-0.02em]">{m.name}</p>
              </div>
              <div className="mb-4 flex flex-col gap-1 pl-9">
                {m.questions.map(q => <p key={q} className="text-[13px] italic leading-5 text-subtitle">“{q}”</p>)}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Client answers</label>
                  <textarea value={v.answers} onChange={e => updMode(m.name, { answers: e.target.value })} rows={4}
                    placeholder="Capture what they actually said…"
                    className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Consultant notes</label>
                  <textarea value={v.notes} onChange={e => updMode(m.name, { notes: e.target.value })} rows={4}
                    placeholder="Your read on it, risks, follow-ups…"
                    className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
