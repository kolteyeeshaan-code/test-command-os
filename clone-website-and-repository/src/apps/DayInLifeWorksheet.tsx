/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Day in the Life Worksheet
 * Operational Purpose: Chronological capture of a customer's day with activity/tag columns.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Row { id: string; time: string; activity: string; notes: string; tag: string }
interface Data { customer: string; observer: string; date: string; setting: string; rows: Row[] }
const TAGS = ["Job", "Pain", "Gain"];

export function DayInLifeWorksheet({ data: raw, onChange }: AppProps) {
  const d: Data = { customer: "", observer: "", date: "", setting: "", rows: [], ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  const addRow = () => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    upd({ rows: [...d.rows, { id: generateId(), time: now, activity: "", notes: "", tag: "Job" }] });
  };
  const rm = (id: string) => upd({ rows: d.rows.filter(r => r.id !== id) });
  const updRow = (id: string, u: Partial<Row>) => upd({ rows: d.rows.map(r => r.id === id ? { ...r, ...u } : r) });

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Target Customer</label><input value={d.customer} onChange={e => upd({ customer: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Observer / Date</label><input value={d.observer} onChange={e => upd({ observer: e.target.value })} placeholder="Observer" className="mb-2 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /><input type="date" value={d.date} onChange={e => upd({ date: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        <div className="sm:col-span-2"><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Setting / Context</label><input value={d.setting} onChange={e => upd({ setting: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
      </div>

      <div className="mb-3 flex items-center justify-between"><p className="text-[13px] font-bold uppercase tracking-[0.06em]">Day in the Life</p><button onClick={addRow} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add Row</button></div>

      {d.rows.length === 0 && <div className="rounded-2xl bg-card py-10 text-center text-subtitle">Add rows to capture the customer's day.</div>}

      {d.rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[rgba(120,120,128,0.16)]"><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Time</th><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">What I See / Do</th><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Notes / Thoughts</th><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Tag</th><th className="px-2 py-3" /></tr></thead>
            <tbody>
              {d.rows.map(r => (
                <tr key={r.id} className="border-b border-[rgba(120,120,128,0.08)] last:border-0">
                  <td className="px-4 py-2"><input value={r.time} onChange={e => updRow(r.id, { time: e.target.value })} className="w-20 rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-ink" /></td>
                  <td className="px-4 py-2"><input value={r.activity} onChange={e => updRow(r.id, { activity: e.target.value })} placeholder="Activity observed" className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-ink" /></td>
                  <td className="px-4 py-2"><input value={r.notes} onChange={e => updRow(r.id, { notes: e.target.value })} placeholder="Thoughts / insight" className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-ink" /></td>
                  <td className="px-4 py-2"><select value={r.tag} onChange={e => updRow(r.id, { tag: e.target.value })} className="rounded border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-ink">{TAGS.map(t => <option key={t}>{t}</option>)}</select></td>
                  <td className="px-2 py-2"><button onClick={() => rm(r.id)} className="text-ink/20 hover:text-red-500"><IconTrash size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
