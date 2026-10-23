/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Events, Brand Activations & Business Development [Activations]
 * Domain Key        : events_activations
 * Official Title    : Consortium Bid Builder
 * Operational Purpose: Build multi-party bids with partner roles, contributions, and fee shares.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Partner { id: string; name: string; role: string; contribution: string; fee: number }
interface Data { bidName: string; client: string; totalBudget: number; partners: Partner[]; notes: string }
const DEFAULT: Data = { bidName: "", client: "", totalBudget: 0, partners: [], notes: "" };

export function ConsortiumBidBuilder({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  const add = () => upd({ partners: [...d.partners, { id: generateId(), name: "", role: "", contribution: "", fee: 0 }] });
  const rm = (id: string) => upd({ partners: d.partners.filter(p => p.id !== id) });
  const updP = (id: string, u: Partial<Partner>) => upd({ partners: d.partners.map(p => p.id === id ? { ...p, ...u } : p) });

  const totalFeeAllocated = d.partners.reduce((s, p) => s + (p.fee || 0), 0);
  const totalBudget = d.totalBudget || totalFeeAllocated || 1;
  const totalPctAllocated = (totalFeeAllocated / totalBudget) * 100;
  const remainingPct = 100 - totalPctAllocated;
  const remainingBudget = (d.totalBudget || 0) - totalFeeAllocated;

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Consortium Bid Builder — Map consortium partner roles, contributions, fee allocations, and reactive fee shares.
        </p>
      )}

      {/* Header info */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em]">Bid Information</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Bid / Project Name</label>
            <input value={d.bidName} onChange={e => upd({ bidName: e.target.value })} placeholder="e.g. Smart City Branding RFP" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Client / Tenderer</label>
            <input value={d.client} onChange={e => upd({ client: e.target.value })} placeholder="e.g. City of Zurich" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Total Bid Budget ($)</label>
            <input type="number" value={d.totalBudget || ""} onChange={e => upd({ totalBudget: +e.target.value || 0 })} placeholder="e.g. 150000" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase tracking-[0.06em]">Consortium Partners</p>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
          <IconPlus size={14} /> Add Partner
        </button>
      </div>

      {d.partners.length === 0 && <div className="rounded-2xl bg-card py-10 text-center text-subtitle">No partners added yet.</div>}

      {d.partners.map((p, idx) => {
        const pSharePct = d.totalBudget > 0 ? ((p.fee || 0) / d.totalBudget) * 100 : (totalFeeAllocated > 0 ? ((p.fee || 0) / totalFeeAllocated) * 100 : 0);
        return (
          <div key={p.id} className="mb-4 rounded-2xl bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{idx + 1}</span>
                <span className="text-[13px] font-bold uppercase tracking-[0.06em]">{idx === 0 ? "Lead Partner / Prime" : "Subcontractor / Partner"}</span>
              </div>
              <button onClick={() => rm(p.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Partner Name / Firm</label>
                <input value={p.name} onChange={e => updP(p.id, { name: e.target.value })} placeholder="e.g. Studio Zurich" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Specialty / Role</label>
                <input value={p.role} onChange={e => updP(p.id, { role: e.target.value })} placeholder="e.g. Lead Brand &amp; Digital Design" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Scope &amp; Contribution</label>
                <textarea value={p.contribution} onChange={e => updP(p.id, { contribution: e.target.value })} rows={2} placeholder="Deliverables contributed by this partner…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Fee Allocation ($)</label>
                <input type="number" value={p.fee || ""} onChange={e => updP(p.id, { fee: +e.target.value || 0 })} placeholder="e.g. 50000" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
                <div className="mt-2 flex items-center justify-between text-xs text-subtitle">
                  <span>Reactive Share:</span>
                  <span className="font-bold text-ink">{pSharePct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {d.partners.length > 0 && (
        <div className="rounded-2xl bg-ink p-6 text-white">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Total Allocated</p>
              <p className="mt-1 text-[28px] font-normal tracking-[-0.04em] tabular-nums">${totalFeeAllocated.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Share Allocated</p>
              <p className="mt-1 text-[28px] font-normal tracking-[-0.04em] tabular-nums">{totalPctAllocated.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Remaining Budget</p>
              <p className="mt-1 text-[24px] font-normal tracking-[-0.04em] tabular-nums">
                {d.totalBudget > 0 ? `$${remainingBudget.toLocaleString()} (${remainingPct.toFixed(1)}%)` : "Set Total Budget"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Consortium Notes &amp; Terms</label>
        <textarea value={d.notes} onChange={e => upd({ notes: e.target.value })} rows={3} placeholder="Sub-contracting terms, payment flow, liability split…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
      </div>
    </div>
  );
}
