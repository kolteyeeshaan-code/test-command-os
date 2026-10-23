/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Why They Buy Analyser
 * Operational Purpose: Scope one offer, then score ten buying motivations for it.
 */
import { generateId } from "../data";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

interface Reason { id: string; label: string; score: number; notes: string }
interface Data { offer: string; reasons: Reason[]; summary: string }
const DEFAULT_REASONS = ["Save time", "Avoid pain", "Make money", "Reduce risk", "Gain status", "Feel better", "Learn / grow", "Belong", "Express identity", "Do the right thing"];

export function WhyTheyBuyAnalyser({ data: raw, onChange, live }: AppProps) {
  const d: Data = { offer: "", reasons: [], summary: "", ...(raw as Partial<Data>) };
  if (d.reasons.length === 0) d.reasons = DEFAULT_REASONS.map(l => ({ id: generateId(), label: l, score: 3, notes: "" }));
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const updR = (id: string, u: Partial<Reason>) => upd({ reasons: d.reasons.map(r => r.id === id ? { ...r, ...u } : r) });

  const avg = Math.round(d.reasons.reduce((s, r) => s + r.score, 0) / d.reasons.length * 10) / 10;
  const top = [...d.reasons].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Why They Buy</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            A client often sells more than one thing. Scope this analysis to the single offer under discussion —
            or name the combined package if the motivations are inseparable.
          </p>
        </div>
      )}

      {/* Required primary field */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">
          Product / service / offer in question
        </label>
        <input
          value={d.offer}
          onChange={e => upd({ offer: e.target.value })}
          placeholder="e.g. Club membership + basic room nights (combined resort package)"
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink",
            !d.offer.trim() ? "border-[rgba(255,149,0,0.5)]" : "border-[rgba(117,117,117,0.15)]"
          )}
        />
        {!d.offer.trim() && <p className="mt-1.5 text-[11px] text-[#c77700]">Required — name the offer so the analysis stays scoped.</p>}
      </div>

      <div className="mb-6 flex items-end justify-between">
        <p className="text-[20px] font-normal tracking-[-0.03em]">Purchase Motivations</p>
        <div className="rounded-xl bg-ink px-5 py-3 text-white">
          <div className="text-[11px] uppercase tracking-[0.06em] opacity-60">Average Strength</div>
          <div className="text-[28px] font-normal tabular-nums tracking-[-0.04em]">{avg}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-5">
        {d.reasons.map(r => (
          <div key={r.id} className="mb-3 border-b border-[rgba(120,120,128,0.12)] pb-3 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="flex-1 font-medium">{r.label}</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => updR(r.id, { score: n })} className={"h-7 w-7 rounded text-[12px] font-bold transition " + (n <= r.score ? "bg-ink text-white" : "bg-white border border-[rgba(117,117,117,0.15)]")}>{n}</button>)}
              </div>
            </div>
            <input value={r.notes} onChange={e => updR(r.id, { notes: e.target.value })} placeholder="Evidence, quotes, or angle…" className="mt-1.5 w-full bg-transparent text-[12px] text-subtitle outline-none placeholder:text-black/25" />
          </div>
        ))}
      </div>

      {/* Top drivers */}
      {top.length > 0 && top[0].score > 0 && (
        <div className="mt-6 rounded-2xl bg-ink p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Top drivers</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {top.map((t, i) => (
              <span key={t.id} className="rounded-full bg-white/15 px-3 py-1 text-[14px]">
                <span className="mr-1.5 opacity-50">{i + 1}.</span>{t.label} <span className="opacity-50">· {t.score}/5</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Messaging notes</label>
        <textarea value={d.summary} onChange={e => upd({ summary: e.target.value })} rows={4}
          placeholder="Which motivations lead the story for this offer? Which are support?"
          className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
      </div>
    </div>
  );
}
