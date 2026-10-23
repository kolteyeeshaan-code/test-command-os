/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Customer Gains Mapper
 * Operational Purpose: Identify and rank customer gains, desires, and expected outcomes.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { EmptyState } from "../ui";
import { cn } from "../utils/cn";

interface Entry { id: string; description: string; importance: number; type: string; segment: string; notes: string }
interface Data { entries: Entry[] }
const TYPES = ["Required", "Expected", "Desired", "Unexpected"];

const GAIN_TRIGGERS = [
  "Savings that would make them happy (time, money, effort)",
  "Quality levels expected vs wished",
  "How current VPs delight them; features/performance/quality expected",
  "What would make jobs or lives easier (learning curve, services, cost of ownership)",
  "Positive social consequences desired (look good, power, status)",
  "What they look for most (design, guarantees, features)",
  "Dreams / aspirations / big reliefs",
  "How they measure success and failure",
  "What would increase likelihood of adopting a VP (cost, investment, risk, quality)",
];

export function CustomerGainsMapper({ data: raw, onChange, live }: AppProps) {
  const [showTriggers, setShowTriggers] = useState(false);
  const d = (raw as Data)?.entries ? (raw as Data) : { entries: [] };
  const add = () => onChange({ entries: [...d.entries, { id: generateId(), description: "", importance: 3, type: "Expected", segment: "", notes: "" }] });
  const rm = (id: string) => onChange({ entries: d.entries.filter(e => e.id !== id) });
  const upd = (id: string, u: Partial<Entry>) => onChange({ entries: d.entries.map(e => e.id === id ? { ...e, ...u } : e) });

  return (
    <div className="flex flex-col gap-6">
      {!live && (
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Map what customers actually want.</p>
            <p className="mt-2 text-[13px] leading-6 text-subtitle max-w-lg">Gains go beyond fixing pain — they are the outcomes, benefits, and delights customers hope for. Rank by importance to prioritize.</p>
          </div>
          <button onClick={add} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add Gain</button>
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
            {GAIN_TRIGGERS.map((t, idx) => (
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
            icon="🎯"
            title="No gains mapped yet"
            hint="Add customer gains — the outcomes, benefits, and delights they hope for."
            action={<button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add first gain</button>}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {d.entries.map((e, i) => (
          <div key={e.id} className={cn("rounded-2xl bg-card p-5", live && "bg-white border border-[rgba(117,117,117,0.15)]")}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Gain</span>
              </div>
              <button onClick={() => rm(e.id)} className="text-ink/30 transition hover:text-red-500"><IconTrash size={16} /></button>
            </div>
            <textarea autoFocus={!e.description} value={e.description} onChange={v => upd(e.id, { description: v.target.value })} placeholder="Describe the desired outcome or benefit…" rows={2} className="mb-3 w-full resize-none rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-3 text-[15px] leading-6 outline-none focus:border-ink" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Importance</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => upd(e.id, { importance: n })} className={cn("h-8 w-8 rounded-lg text-[13px] font-semibold transition", n <= e.importance ? "bg-ink text-white" : "bg-white border border-[rgba(117,117,117,0.15)] text-ink/50")}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Type</label>
                <select value={e.type} onChange={v => upd(e.id, { type: v.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Segment</label>
                <input value={e.segment} onChange={v => upd(e.id, { segment: v.target.value })} placeholder="e.g. HNW Clients" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Notes</label>
                <input value={e.notes} onChange={v => upd(e.id, { notes: v.target.value })} placeholder="Context or examples" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
            </div>
          </div>
        ))}

        {d.entries.length > 0 && (
          <button onClick={add} className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,117,117,0.3)] py-4 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink"><IconPlus size={14} /> Add another gain</button>
        )}
      </div>
    </div>
  );
}
