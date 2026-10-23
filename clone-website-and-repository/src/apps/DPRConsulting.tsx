/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Events, Brand Activations & Business Development [Activations]
 * Domain Key        : events_activations
 * Official Title    : DPR & Principal Project Consulting
 * Operational Purpose: Progress reporting across periods with risks and decisions.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Item { id: string; date: string; update: string; risks: string; decisions: string }
interface Data { project: string; period: string; items: Item[] }
const DEFAULT: Data = { project: "", period: "", items: [] };

export function DPRConsulting({ data: raw, onChange }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const add = () => upd({ items: [...d.items, { id: generateId(), date: "", update: "", risks: "", decisions: "" }] });
  const rm = (id: string) => upd({ items: d.items.filter(i => i.id !== id) });
  const updI = (id: string, u: Partial<Item>) => upd({ items: d.items.map(i => i.id === id ? { ...i, ...u } : i) });

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Project</label><input value={d.project} onChange={e => upd({ project: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Reporting Period</label><input value={d.period} onChange={e => upd({ period: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
      </div>

      <div className="mb-3 flex items-center justify-between"><p className="text-[13px] font-bold uppercase tracking-[0.06em]">Daily / Weekly Updates</p><button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={12} /> Add Entry</button></div>

      {d.items.length === 0 && <div className="rounded-2xl bg-card py-10 text-center text-subtitle">No updates logged.</div>}

      {d.items.map(item => (
        <div key={item.id} className="mb-4 rounded-2xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><span className="text-[13px] font-bold uppercase tracking-[0.06em]">Entry</span><button onClick={() => rm(item.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Date</label><input type="date" value={item.date} onChange={e => updI(item.id, { date: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Update</label><textarea value={item.update} onChange={e => updI(item.id, { update: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Risks / Issues</label><textarea value={item.risks} onChange={e => updI(item.id, { risks: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Decisions</label><textarea value={item.decisions} onChange={e => updI(item.id, { decisions: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
