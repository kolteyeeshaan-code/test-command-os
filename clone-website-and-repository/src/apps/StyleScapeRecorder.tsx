/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Style Scape Session Recorder
 * Operational Purpose: Record visual direction, references, do/don't, and selected direction.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Ref { id: string; name: string; comment: string }
interface Data { date: string; direction: string; dos: string; donts: string; references: Ref[]; summary: string }
const DEFAULT: Data = { date: "", direction: "", dos: "", donts: "", references: [], summary: "" };

export function StyleScapeSessionRecorder({ data: raw, onChange }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const addRef = () => upd({ references: [...d.references, { id: generateId(), name: "", comment: "" }] });
  const rmRef = (id: string) => upd({ references: d.references.filter(r => r.id !== id) });
  const updRef = (id: string, u: Partial<Ref>) => upd({ references: d.references.map(r => r.id === id ? { ...r, ...u } : r) });

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Date</label><input type="date" value={d.date} onChange={e => upd({ date: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Overall Direction</label><input value={d.direction} onChange={e => upd({ direction: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
      </div>

      <div className="mb-4 rounded-2xl bg-card p-5">
        <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em]">Do / Don’t</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Do</label><textarea value={d.dos} onChange={e => upd({ dos: e.target.value })} rows={4} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Don’t</label><textarea value={d.donts} onChange={e => upd({ donts: e.target.value })} rows={4} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-card p-5">
        <div className="mb-3 flex items-center justify-between"><p className="text-[13px] font-bold uppercase tracking-[0.06em]">Reference List</p><button onClick={addRef} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={12} /> Add</button></div>
        {d.references.length === 0 && <p className="text-sm text-subtitle">No references yet.</p>}
        {d.references.map(r => (
          <div key={r.id} className="mb-2 flex gap-2"><input value={r.name} onChange={e => updRef(r.id, { name: e.target.value })} placeholder="Reference name / URL" className="flex-1 rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /><input value={r.comment} onChange={e => updRef(r.id, { comment: e.target.value })} placeholder="Comment" className="flex-1 rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /><button onClick={() => rmRef(r.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button></div>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-5">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Selected Direction Summary</label>
        <textarea value={d.summary} onChange={e => upd({ summary: e.target.value })} rows={4} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
      </div>
    </div>
  );
}
