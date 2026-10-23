/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Printing & Collateral Manufacturing [Manufacturing]
 * Domain Key        : printing_manufacturing
 * Official Title    : Collaboration Scope Builder
 * Operational Purpose: Map upstream and downstream collaborators for a deliverable you orchestrate.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

// ── Data shapes ──
type Dependency = "blocking" | "important" | "nice-to-have";
type CollaboratorStatus = "not contacted" | "briefed" | "in progress" | "delivered" | "blocked";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  what: string;
  dependency: Dependency;
  status: CollaboratorStatus;
  owner: string;
  notes: string;
  consumption?: string;
  handover?: string;
}
interface Phase { id: string; name: string; timeline: string; fee: number; description: string }
interface Data {
  client: string;
  project: string;
  deliverable: string;
  myRole: string;
  upstream: Collaborator[];
  downstream: Collaborator[];
  phases: Phase[];
  total: number;
  terms: string;
  payment: string;
}
const DEFAULT: Data = { client: "", project: "", deliverable: "", myRole: "", upstream: [], downstream: [], phases: [], total: 0, terms: "", payment: "" };

const DEPS: Dependency[] = ["blocking", "important", "nice-to-have"];
const STATUSES: CollaboratorStatus[] = ["not contacted", "briefed", "in progress", "delivered", "blocked"];
const STATUS_COLOR: Record<CollaboratorStatus, string> = {
  "not contacted": "bg-card text-ink/60",
  "briefed": "bg-[rgba(0,122,255,0.15)] text-[#007aff]",
  "in progress": "bg-[rgba(229,184,56,0.25)] text-black",
  "delivered": "bg-[rgba(52,199,89,0.3)] text-black",
  "blocked": "bg-[rgba(255,69,58,0.2)] text-black",
};

function CollabRow({ c, onChange, rm, showConsumption }: { c: Collaborator; onChange: (u: Partial<Collaborator>) => void; rm: () => void; showConsumption: boolean }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <input value={c.name} onChange={e => onChange({ name: e.target.value })} placeholder="Name / Organisation" className="flex-1 bg-transparent text-[14px] font-semibold outline-none" autoFocus={!c.name} />
        <button onClick={rm} className="text-ink/30 hover:text-red-500"><IconTrash size={15} /></button>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Role / specialty</label><input value={c.role} onChange={e => onChange({ role: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
        <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">What they supply / receive</label><input value={c.what} onChange={e => onChange({ what: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Dependency</label>
            <select value={c.dependency} onChange={e => onChange({ dependency: e.target.value as Dependency })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none">
              {DEPS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Status</label>
            <select value={c.status} onChange={e => onChange({ status: e.target.value as CollaboratorStatus })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Owner on my side</label><input value={c.owner} onChange={e => onChange({ owner: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
        {showConsumption && <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">How they consume it</label><input value={c.consumption} onChange={e => onChange({ consumption: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>}
        {showConsumption && <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Handover requirements</label><input value={c.handover} onChange={e => onChange({ handover: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>}
        <div className={showConsumption ? "" : "sm:col-span-2"}><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Notes</label><input value={c.notes} onChange={e => onChange({ notes: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
      </div>
    </div>
  );
}

export function CollaborationScopeBuilder({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  const addUp = () => upd({ upstream: [...d.upstream, { id: generateId(), name: "", role: "", what: "", dependency: "important", status: "not contacted", owner: "", notes: "" }] });
  const rmUp = (id: string) => upd({ upstream: d.upstream.filter(c => c.id !== id) });
  const updUp = (id: string, u: Partial<Collaborator>) => upd({ upstream: d.upstream.map(c => c.id === id ? { ...c, ...u } : c) });
  const addDown = () => upd({ downstream: [...d.downstream, { id: generateId(), name: "", role: "", what: "", dependency: "important", status: "not contacted", owner: "", notes: "", consumption: "", handover: "" }] });
  const rmDown = (id: string) => upd({ downstream: d.downstream.filter(c => c.id !== id) });
  const updDown = (id: string, u: Partial<Collaborator>) => upd({ downstream: d.downstream.map(c => c.id === id ? { ...c, ...u } : c) });
  const addPhase = () => upd({ phases: [...d.phases, { id: generateId(), name: "", timeline: "", fee: 0, description: "" }] });
  const rmPhase = (id: string) => upd({ phases: d.phases.filter(p => p.id !== id) });
  const updPhase = (id: string, u: Partial<Phase>) => upd({ phases: d.phases.map(p => p.id === id ? { ...p, ...u } : p) });

  const total = d.phases.reduce((s, p) => s + (p.fee || 0), 0);
  const upCounts = d.upstream.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Partial<Record<CollaboratorStatus, number>>);
  const downCounts = d.downstream.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Partial<Record<CollaboratorStatus, number>>);

  return (
    <div className="mx-auto max-w-[960px]">
      {!live && (
        <p className="mb-6 max-w-2xl text-[13px] leading-6 text-subtitle">
          This is the collaborator roster for this deliverable only — a working map of who supplies, depends on, or receives the work. Your firm's long-term vendor catalogue lives outside this OS.
        </p>
      )}
      {/* A. Header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Header</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-[13px] font-semibold">Client</label><input value={d.client} onChange={e => upd({ client: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          <div><label className="mb-1 block text-[13px] font-semibold">Project</label><input value={d.project} onChange={e => upd({ project: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          <div><label className="mb-1 block text-[13px] font-semibold">Deliverable in question</label><input value={d.deliverable} onChange={e => upd({ deliverable: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          <div><label className="mb-1 block text-[13px] font-semibold">My role / orchestration notes</label><input value={d.myRole} onChange={e => upd({ myRole: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        </div>
      </div>

      {/* B. Upstream */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.06em]">Upstream collaborators</p>
            <p className="text-[11px] text-subtitle">Who feeds into this deliverable.</p>
          </div>
          <button onClick={addUp} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add</button>
        </div>
        {d.upstream.length === 0 && <div className="rounded-2xl bg-card py-8 text-center text-subtitle">No upstream collaborators yet.</div>}
        <div className="flex flex-col gap-3">
          {d.upstream.map(c => <CollabRow key={c.id} c={c} onChange={u => updUp(c.id, u)} rm={() => rmUp(c.id)} showConsumption={false} />)}
        </div>
        {d.upstream.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map(s => upCounts[s] ? <span key={s} className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + STATUS_COLOR[s]}>{s} · {upCounts[s]}</span> : null)}
          </div>
        )}
      </div>

      {/* Me divider */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-[rgba(117,117,117,0.25)]" />
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Me (orchestrator)</p>
          <p className="text-[13px] font-semibold text-ink">{d.myRole || "—"}</p>
        </div>
        <div className="h-px flex-1 bg-[rgba(117,117,117,0.25)]" />
      </div>

      {/* C. Downstream */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.06em]">Downstream collaborators</p>
            <p className="text-[11px] text-subtitle">Who receives or uses the deliverable.</p>
          </div>
          <button onClick={addDown} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add</button>
        </div>
        {d.downstream.length === 0 && <div className="rounded-2xl bg-card py-8 text-center text-subtitle">No downstream collaborators yet.</div>}
        <div className="flex flex-col gap-3">
          {d.downstream.map(c => <CollabRow key={c.id} c={c} onChange={u => updDown(c.id, u)} rm={() => rmDown(c.id)} showConsumption={true} />)}
        </div>
        {d.downstream.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map(s => downCounts[s] ? <span key={s} className={"rounded-full px-2 py-0.5 text-[11px] font-medium " + STATUS_COLOR[s]}>{s} · {downCounts[s]}</span> : null)}
          </div>
        )}
      </div>

      {/* D. Phases / fee / terms (light project layer) */}
      <div className="rounded-2xl bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[13px] font-bold uppercase tracking-[0.06em]">Phases & Milestones</p>
          <button onClick={addPhase} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add</button>
        </div>
        {d.phases.length === 0 && <p className="py-4 text-center text-[12px] text-subtitle">No phases defined.</p>}
        {d.phases.map(p => (
          <div key={p.id} className="mb-3 rounded-xl bg-white p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <input value={p.name} onChange={e => updPhase(p.id, { name: e.target.value })} placeholder="Phase name" className="flex-1 bg-transparent text-[14px] font-semibold outline-none" autoFocus={!p.name} />
              <button onClick={() => rmPhase(p.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={15} /></button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Timeline</label><input value={p.timeline} onChange={e => updPhase(p.id, { timeline: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
              <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Fee allocation</label><input type="number" value={p.fee || ""} onChange={e => updPhase(p.id, { fee: +e.target.value || 0 })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
              <div><label className="text-[10px] font-medium uppercase tracking-[0.06em] text-subtitle">Description</label><input value={p.description} onChange={e => updPhase(p.id, { description: e.target.value })} className="mt-1 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1.5 text-sm outline-none" /></div>
            </div>
          </div>
        ))}
        {d.phases.length > 0 && (
          <div className="mt-3 rounded-xl bg-ink p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Total</p>
            <p className="mt-1 text-[28px] font-normal tracking-[-0.04em] tabular-nums">${total.toLocaleString()}</p>
          </div>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-[13px] font-semibold">Terms</label><textarea value={d.terms} onChange={e => upd({ terms: e.target.value })} rows={3} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
          <div><label className="mb-1 block text-[13px] font-semibold">Payment notes</label><textarea value={d.payment} onChange={e => upd({ payment: e.target.value })} rows={3} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none" /></div>
        </div>
      </div>
    </div>
  );
}
