/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Events, Brand Activations & Business Development [Activations]
 * Domain Key        : events_activations
 * Official Title    : Facilitation Log Entry
 * Operational Purpose: Log sessions with outcomes, decisions, and next actions.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Entry { id: string; date: string; session: string; outcomes: string; decisions: string; actions: string }
interface Data { entries: Entry[] }
const DEFAULT: Data = { entries: [] };

export function FacilitationLogEntry({ data: raw, onChange }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const add = () => upd({ entries: [...d.entries, { id: generateId(), date: "", session: "", outcomes: "", decisions: "", actions: "" }] });
  const rm = (id: string) => upd({ entries: d.entries.filter(e => e.id !== id) });
  const updE = (id: string, u: Partial<Entry>) => upd({ entries: d.entries.map(e => e.id === id ? { ...e, ...u } : e) });

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-4 flex items-center justify-between"><p className="text-[13px] font-bold uppercase tracking-[0.06em]">Facilitation Log</p><button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={12} /> Add Entry</button></div>

      {d.entries.length === 0 && <div className="rounded-2xl bg-card py-10 text-center text-subtitle">No facilitation sessions logged.</div>}

      {d.entries.map(e => (
        <div key={e.id} className="mb-4 rounded-2xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><span className="text-[13px] font-bold uppercase tracking-[0.06em]">Session</span><button onClick={() => rm(e.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Date</label><input type="date" value={e.date} onChange={ee => updE(e.id, { date: ee.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Session Name</label><input value={e.session} onChange={ee => updE(e.id, { session: ee.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Outcomes</label><textarea value={e.outcomes} onChange={ee => updE(e.id, { outcomes: ee.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Decisions</label><textarea value={e.decisions} onChange={ee => updE(e.id, { decisions: ee.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Next Actions</label><textarea value={e.actions} onChange={ee => updE(e.id, { actions: ee.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
