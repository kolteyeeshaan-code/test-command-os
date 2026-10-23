/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Customer Pains Mapper
 * Operational Purpose: Map and prioritize customer pain points by intensity and frequency.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { EmptyState } from "../ui";
import { cn } from "../utils/cn";

interface Entry { id: string; description: string; intensity: number; frequency: string; segment: string; context: string }
interface Data { entries: Entry[] }
const FREQ = ["Rare", "Occasional", "Frequent", "Constant"];

const PAIN_TRIGGERS = [
  "How do customers define too costly? (time, money, effort)",
  "What makes them feel bad? Frustrations, annoyances, headaches",
  "How are current value propositions underperforming? Missing features, performance issues, malfunctions",
  "Main difficulties and challenges; resistance to particular jobs",
  "Negative social consequences feared (face, power, trust, status)",
  "Risks feared (financial, social, technical, what could go wrong)",
  "What keeps them awake at night? Big issues, concerns, worries",
  "Common mistakes (using a solution the wrong way)",
  "Barriers to adopting a value proposition (upfront cost, learning curve, other obstacles)",
];

export function CustomerPainsMapper({ data: raw, onChange, live }: AppProps) {
  const [showTriggers, setShowTriggers] = useState(false);
  const d = (raw as Data)?.entries ? (raw as Data) : { entries: [] };
  const add = () => onChange({ entries: [...d.entries, { id: generateId(), description: "", intensity: 3, frequency: "Frequent", segment: "", context: "" }] });
  const rm = (id: string) => onChange({ entries: d.entries.filter(e => e.id !== id) });
  const upd = (id: string, u: Partial<Entry>) => onChange({ entries: d.entries.map(e => e.id === id ? { ...e, ...u } : e) });

  const sorted = [...d.entries]; // preserve entry order

  return (
    <div className="flex flex-col gap-6">
      {!live && (
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Prioritize what actually hurts.</p>
            <p className="mt-2 text-[13px] leading-6 text-subtitle max-w-lg">Capture each pain point with intensity, frequency, and evidence. Higher intensity + higher frequency = closer to the top of the priority list.</p>
          </div>
          <button onClick={add} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add Pain</button>
        </div>
      )}

      {/* Strategyzer Trigger Questions Panel */}
      <div className="rounded-2xl border border-[rgba(117,117,117,0.18)] bg-card p-4">
        <button
          type="button"
          onClick={() => setShowTriggers(!showTriggers)}
          className="flex w-full items-center justify-between text-left text-[12px] font-bold uppercase tracking-[0.06em] text-subtitle"
        >
          <span>Strategyzer Facilitation Triggers ({showTriggers ? "Hide" : "Show 9 Prompts"})</span>
          <span>{showTriggers ? "▲" : "▼"}</span>
        </button>
        {showTriggers && (
          <ul className="mt-3 flex flex-col gap-2 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-3 text-[13px] leading-relaxed text-ink/80">
            {PAIN_TRIGGERS.map((t, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-semibold text-subtitle">{idx + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {d.entries.length === 0 && (
        <div className="rounded-2xl bg-card">
          <EmptyState
            icon="😣"
            title="No pains mapped yet"
            hint="Add the customer pain points you're hearing in interviews, calls, and observations."
            action={<button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add first pain</button>}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((e, i) => (
          <div key={e.id} className={cn("rounded-2xl bg-card p-5 transition", live && "bg-white border border-[rgba(117,117,117,0.15)]")}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Pain point</span>
              </div>
              <button onClick={() => rm(e.id)} className="text-ink/30 transition hover:text-red-500"><IconTrash size={16} /></button>
            </div>
            <textarea autoFocus={!e.description} value={e.description} onChange={v => upd(e.id, { description: v.target.value })} placeholder="Describe the pain point in plain language…" rows={2} className="mb-3 w-full resize-none rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-3 text-[15px] leading-6 outline-none focus:border-ink" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Intensity</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => upd(e.id, { intensity: n })} className={cn("h-8 w-8 rounded-lg text-[13px] font-semibold transition", n <= e.intensity ? "bg-ink text-white" : "bg-white border border-[rgba(117,117,117,0.15)] text-ink/50")}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Frequency</label>
                <select value={e.frequency} onChange={v => upd(e.id, { frequency: v.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
                  {FREQ.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Segment</label>
                <input value={e.segment} onChange={v => upd(e.id, { segment: v.target.value })} placeholder="e.g. HNW Clients" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Evidence</label>
                <input value={e.context} onChange={v => upd(e.id, { context: v.target.value })} placeholder="Source, quote, data…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
            </div>
          </div>
        ))}

        {d.entries.length > 0 && (
          <button onClick={add} className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,117,117,0.3)] py-4 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink"><IconPlus size={14} /> Add another pain</button>
        )}
      </div>
    </div>
  );
}
