/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Design Criteria Canvas
 * Operational Purpose: Per deliverable: MoSCoW prioritisation plus weighted criteria by dimension.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash, IconPalette, IconWrench, IconPuzzle, IconFiles } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

// ── Data shapes ──
interface MoSCoWItem { id: string; text: string; notes: string }
interface MoSCoW { must: MoSCoWItem[]; should: MoSCoWItem[]; could: MoSCoWItem[]; wont: MoSCoWItem[] }
interface WeightedCriterion { id: string; name: string; description: string; weight: number; mustHave: boolean }
interface Dimension { aesthetic: WeightedCriterion[]; functional: WeightedCriterion[]; brand: WeightedCriterion[]; technical: WeightedCriterion[] }
interface Canvas { id: string; deliverable: string; moscow: MoSCoW; dimensions: Dimension }
interface Data { canvases: Canvas[] }

const DEFAULT_MOSCOW: MoSCoW = { must: [], should: [], could: [], wont: [] };
const emptyDims = (): Dimension => ({ aesthetic: [], functional: [], brand: [], technical: [] });

const MOSCOW_BUCKETS: { key: keyof MoSCoW; label: string; hint: string; color: string; letter: string }[] = [
  { key: "must", label: "MUST", hint: "Must-haves & non-negotiables", color: "bg-ink text-white", letter: "M" },
  { key: "should", label: "SHOULD", hint: "Should-haves & important features", color: "bg-[#007aff] text-white", letter: "S" },
  { key: "could", label: "COULD", hint: "Could-haves & optional features", color: "bg-[#e5b838] text-black", letter: "C" },
  { key: "wont", label: "WON'T", hint: "Definitely not on the table", color: "bg-[#ff453a] text-white", letter: "W" },
];

const DIMS: { key: keyof Dimension; label: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "aesthetic", label: "Aesthetic", Icon: IconPalette },
  { key: "functional", label: "Functional", Icon: IconWrench },
  { key: "brand", label: "Brand Alignment", Icon: IconPuzzle },
  { key: "technical", label: "Technical", Icon: IconFiles },
];

export function DesignCriteriaCanvas({ data: raw, onChange, live }: AppProps) {
  const d: Data = { canvases: [], ...(raw as Partial<Data>) };
  if (d.canvases.length === 0) d.canvases = [{ id: generateId(), deliverable: "", moscow: { ...DEFAULT_MOSCOW }, dimensions: emptyDims() }];
  const [activeId, setActiveId] = useState(d.canvases[0].id);

  function upd(u: Partial<Data>) { onChange({ ...d, ...u }); }
  function getCanvas(): Canvas { return d.canvases.find(c => c.id === activeId) ?? d.canvases[0]; }
  function updateCanvas(u: Partial<Canvas>) { upd({ canvases: d.canvases.map(c => c.id === activeId ? { ...c, ...u } : c) }); }

  function addCanvas() { const c: Canvas = { id: generateId(), deliverable: "", moscow: { ...DEFAULT_MOSCOW }, dimensions: emptyDims() }; upd({ canvases: [...d.canvases, c] }); setActiveId(c.id); }
  function removeCanvas(id: string) { upd({ canvases: d.canvases.filter(c => c.id !== id) }); if (activeId === id && d.canvases.length > 1) setActiveId(d.canvases[0].id); }

  function addMoSCoW(bucket: keyof MoSCoW) { const c = getCanvas(); updateCanvas({ moscow: { ...c.moscow, [bucket]: [...c.moscow[bucket], { id: generateId(), text: "", notes: "" }] } }); }
  function rmMoSCoW(bucket: keyof MoSCoW, id: string) { const c = getCanvas(); updateCanvas({ moscow: { ...c.moscow, [bucket]: c.moscow[bucket].filter(i => i.id !== id) } }); }
  function updMoSCoW(bucket: keyof MoSCoW, id: string, u: Partial<MoSCoWItem>) { const c = getCanvas(); updateCanvas({ moscow: { ...c.moscow, [bucket]: c.moscow[bucket].map(i => i.id === id ? { ...i, ...u } : i) } }); }

  function addDim(dim: keyof Dimension) { const c = getCanvas(); updateCanvas({ dimensions: { ...c.dimensions, [dim]: [...c.dimensions[dim], { id: generateId(), name: "", description: "", weight: 3, mustHave: false }] } }); }
  function rmDim(dim: keyof Dimension, id: string) { const c = getCanvas(); updateCanvas({ dimensions: { ...c.dimensions, [dim]: c.dimensions[dim].filter(i => i.id !== id) } }); }
  function updDim(dim: keyof Dimension, id: string, u: Partial<WeightedCriterion>) { const c = getCanvas(); updateCanvas({ dimensions: { ...c.dimensions, [dim]: c.dimensions[dim].map(i => i.id === id ? { ...i, ...u } : i) } }); }

  const canvas = getCanvas();
  const totals = canvas.moscow;
  const total = totals.must.length + totals.should.length + totals.could.length + totals.wont.length;

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Deliverable selector (top-level, primary) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {d.canvases.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)} className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition",
              c.id === activeId ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40"
            )}>{c.deliverable || "Untitled"}</button>
          ))}
          <button onClick={addCanvas} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] hover:border-ink"><IconPlus size={12} /> Add</button>
        </div>
        {d.canvases.length > 1 && (
          <button onClick={() => removeCanvas(activeId)} className="text-[11px] text-ink/50 underline underline-offset-2 hover:text-red-500">Remove this deliverable</button>
        )}
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Deliverable in question</label>
        <input value={canvas.deliverable} onChange={e => updateCanvas({ deliverable: e.target.value })} placeholder="e.g. Logo system for Harvest & Bloom" className="w-full rounded-xl border border-[rgba(117,117,117,0.18)] bg-white px-4 py-3 text-[18px] font-semibold tracking-[-0.02em] outline-none focus:border-ink" />
      </div>

      {/* PRIMARY: MoSCoW */}
      {!live && <p className="mb-4 text-[12px] uppercase tracking-[0.08em] text-subtitle">Primary · MoSCoW Prioritisation</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {MOSCOW_BUCKETS.map(b => {
          const items = totals[b.key];
          const chip = <span className={cn("inline-flex h-6 min-w-[40px] items-center justify-center rounded px-2 text-[11px] font-bold", b.color)}>{b.label} · {items.length}</span>;
          return (
            <div key={b.key} className="rounded-2xl bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {chip}
                  <p className="text-[12px] font-semibold uppercase tracking-[0.04em]">{b.hint}</p>
                </div>
                <button onClick={() => addMoSCoW(b.key)} className="text-ink/40 transition hover:text-ink"><IconPlus size={16} /></button>
              </div>
              {items.length === 0 && <p className="py-4 text-center text-[12px] text-subtitle">Empty</p>}
              {items.map(it => (
                <div key={it.id} className="group mb-2 flex items-start gap-2 rounded-lg bg-white/70 p-2">
                  <input value={it.text} onChange={e => updMoSCoW(b.key, it.id, { text: e.target.value })} placeholder="Criterion" className="flex-1 bg-transparent text-[13px] font-medium outline-none" autoFocus={!it.text} />
                  <input value={it.notes} onChange={e => updMoSCoW(b.key, it.id, { notes: e.target.value })} placeholder="Why / how recognised" className="flex-1 bg-transparent text-[12px] text-subtitle outline-none" />
                  <button onClick={() => rmMoSCoW(b.key, it.id)} className="text-ink/20 opacity-0 transition hover:text-red-500 group-hover:opacity-100"><IconTrash size={14} /></button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* SECONDARY: weighted dimensions */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-[0.08em] text-subtitle">Secondary · Weighted Criteria by Dimension</p>
        <div className="flex gap-4 text-[11px] uppercase tracking-[0.06em] text-subtitle">
          <span>{total} MoSCoW items</span>
          <span>{Object.values(canvas.dimensions).flat().length} weighted</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {DIMS.map(dim => {
          const items = canvas.dimensions[dim.key];
          return (
            <div key={dim.key} className="rounded-2xl bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.04em]"><dim.Icon size={15} /> {dim.label}</span>
                <button onClick={() => addDim(dim.key)} className="text-ink/40 transition hover:text-ink"><IconPlus size={16} /></button>
              </div>
              {items.map(c => (
                <div key={c.id} className="group mb-3 rounded-xl bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <input value={c.name} onChange={e => updDim(dim.key, c.id, { name: e.target.value })} placeholder="Criterion" className="flex-1 bg-transparent text-[13px] font-semibold outline-none" autoFocus={!c.name} />
                    <button onClick={() => rmDim(dim.key, c.id)} className="text-ink/20 opacity-0 transition hover:text-red-500 group-hover:opacity-100"><IconTrash size={14} /></button>
                  </div>
                  <input value={c.description} onChange={e => updDim(dim.key, c.id, { description: e.target.value })} placeholder="How we recognise it" className="mb-2 w-full bg-transparent text-[12px] text-subtitle outline-none" />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium uppercase text-subtitle">Weight</span>
                      {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => updDim(dim.key, c.id, { weight: n })} className={cn("h-5 w-5 rounded text-[10px] font-bold transition", n <= c.weight ? "bg-ink text-white" : "bg-card text-ink/40")}>{n}</button>)}
                    </div>
                    <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-medium uppercase text-subtitle">
                      <input type="checkbox" checked={c.mustHave} onChange={e => updDim(dim.key, c.id, { mustHave: e.target.checked })} className="accent-ink" /> Must-have
                    </label>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="py-3 text-center text-[12px] text-subtitle">No criteria yet</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
