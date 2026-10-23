/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Six Ways to Innovate
 * Operational Purpose: Six innovation lenses — baseline, idea, actionability per lens.
 */
import { generateId } from "../data";
import type { AppProps } from "../pages/AppSession";

interface Way { id: string; baseline: string; idea: string; action: string; score: number }
interface Data { ways: Way[] }

const LENSES = [
  { name: "Address more jobs", hint: "Bundle adjacent jobs the customer already has to get done." },
  { name: "Switch to a more important job", hint: "Refocus the offer on a job with higher stakes for the customer." },
  { name: "Go beyond functional jobs", hint: "Serve emotional and social jobs, not just utility." },
  { name: "Help a lot more customers", hint: "Remove barriers of price, skill, or access to expand who can get the job done." },
  { name: "Get a job done incrementally better", hint: "Faster, cheaper, more convenient on the metrics customers already use." },
  { name: "Help a customer get a job done radically better", hint: "Change the method entirely — 10x, not 10%." },
];

export function SixWaysToInnovate({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ways: [], ...(raw as Partial<Data>) };
  if (d.ways.length === 0) {
    d.ways = LENSES.map(() => ({ id: generateId(), baseline: "", idea: "", action: "", score: 3 }));
  }

  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const updW = (id: string, u: Partial<Way>) => upd({ ways: d.ways.map(w => w.id === id ? { ...w, ...u } : w) });

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Explore six distinct innovation lenses to challenge current business thinking. Evaluate baseline, ideate, and rate actionability.
        </p>
      )}

      {d.ways.map((w, i) => {
        const lens = LENSES[i] ?? { name: "Way " + (i + 1), hint: "" };
        return (
          <div key={w.id} className="mb-4 rounded-2xl bg-card p-5">
            <div className="mb-1 flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
              <p className="text-[15px] font-bold uppercase tracking-[0.04em]">{lens.name}</p>
            </div>
            <p className="mb-4 pl-9 text-[12px] leading-relaxed text-subtitle">{lens.hint}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Current baseline</label>
                <textarea value={w.baseline} onChange={e => updW(w.id, { baseline: e.target.value })} rows={2} placeholder="What is true today?" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">New innovation idea</label>
                <textarea value={w.idea} onChange={e => updW(w.id, { idea: e.target.value })} rows={2} placeholder="What could be?" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Action steps</label>
                <input value={w.action} onChange={e => updW(w.id, { action: e.target.value })} placeholder="Next experiments or steps…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Actionability (1–5)</label>
                <div className="flex gap-1 pt-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => updW(w.id, { score: n })} className={"h-8 w-8 rounded-lg text-[12px] font-bold transition " + (n <= w.score ? "bg-ink text-white" : "bg-white border border-[rgba(117,117,117,0.15)] text-ink/50")}>{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
