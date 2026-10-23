/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Logo Brand Review Logger
 * Operational Purpose: Log review rounds with versions, strengths, concerns, and decision.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Review { id: string; round: number; date: string; versions: string; strengths: string; concerns: string; decision: string }
interface Data { reviews: Review[]; final: string }
const DEFAULT: Data = { reviews: [], final: "" };

export function LogoBrandReviewLogger({ data: raw, onChange }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const add = () => upd({ reviews: [...d.reviews, { id: generateId(), round: d.reviews.length + 1, date: "", versions: "", strengths: "", concerns: "", decision: "" }] });
  const rm = (id: string) => upd({ reviews: d.reviews.filter(r => r.id !== id) });
  const updR = (id: string, u: Partial<Review>) => upd({ reviews: d.reviews.map(r => r.id === id ? { ...r, ...u } : r) });

  return (
    <div className="mx-auto max-w-[860px]">
      <div className="mb-4 flex items-center justify-between"><p className="text-[13px] font-bold uppercase tracking-[0.06em]">Review Rounds</p><button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={12} /> Add Round</button></div>

      {d.reviews.length === 0 && <div className="rounded-2xl bg-card py-10 text-center text-subtitle">No reviews logged yet.</div>}

      {d.reviews.map(r => (
        <div key={r.id} className="mb-4 rounded-2xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><span className="text-[13px] font-bold uppercase tracking-[0.06em]">Round {r.round}</span><button onClick={() => rm(r.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Date</label><input type="date" value={r.date} onChange={e => updR(r.id, { date: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Versions Reviewed</label><input value={r.versions} onChange={e => updR(r.id, { versions: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Strengths</label><textarea value={r.strengths} onChange={e => updR(r.id, { strengths: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Concerns</label><textarea value={r.concerns} onChange={e => updR(r.id, { concerns: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Decision</label><input value={r.decision} onChange={e => updR(r.id, { decision: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-card p-5">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Final Direction</label>
        <textarea value={d.final} onChange={e => upd({ final: e.target.value })} rows={3} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" />
      </div>
    </div>
  );
}
