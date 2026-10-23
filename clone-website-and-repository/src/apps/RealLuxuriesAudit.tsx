/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Real Luxuries Audit
 * Operational Purpose: Audit product delivery and marketing expression against the 12 real luxuries.
 */
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/** The 12 Real Luxuries. */
export const LUXURIES: { key: string; label: string; desc: string }[] = [
  { key: "time", label: "Time", desc: "Freedom to spend your days as you choose" },
  { key: "health", label: "Health", desc: "A strong body and mind, free from illness" },
  { key: "quietMind", label: "Quiet Mind", desc: "Inner peace and the absence of mental clutter" },
  { key: "slowMorning", label: "Slow Morning", desc: "Starting the day without rushing" },
  { key: "travel", label: "Ability to Travel", desc: "Exploring places and cultures" },
  { key: "peopleYouLove", label: "People You Love", desc: "Cherished relationships" },
  { key: "restWithoutGuilt", label: "Rest Without Guilt", desc: "Recharging without feeling unproductive" },
  { key: "goodSleep", label: "A Good Night's Sleep", desc: "Genuinely restorative sleep" },
  { key: "homeCooked", label: "Home-cooked Meals", desc: "Nourishing food made with care" },
  { key: "calmDays", label: "Calm and “Boring” Days", desc: "Joy in simplicity and routine" },
  { key: "meaningfulConversations", label: "Meaningful Conversations", desc: "Deep, shared thinking" },
  { key: "lovedBack", label: "People Who Love You Back", desc: "Knowing you are valued" },
];

export const RELEVANCE_LEVELS = ["None", "Low", "Medium", "High"] as const;
export type Relevance = typeof RELEVANCE_LEVELS[number];
export const RELEVANCE_NUM: Record<Relevance, number> = { "None": 0, "Low": 1, "Medium": 2, "High": 3 };

interface Luxury {
  relevance: Relevance;
  product: number;   // 0–5 how well the product delivers it
  marketing: number; // 0–5 how well marketing expresses it
  notes: string;     // opportunity notes
}
interface Data { offer: string; lens: string; luxuries: Record<string, Luxury>; summary: string }

const DEFAULT_LUX: Luxury = { relevance: "Medium", product: 0, marketing: 0, notes: "" };

function getLux(d: Data, key: string): Luxury { return d.luxuries?.[key] ?? DEFAULT_LUX; }

/** Luxuries ranked by (relevance + product + marketing) — the strongest overall. */
export function strongestLuxuries(d: Data): { key: string; label: string; score: number }[] {
  return LUXURIES.map(l => {
    const v = getLux(d, l.key);
    return { key: l.key, label: l.label, score: RELEVANCE_NUM[v.relevance] * 2 + v.product + v.marketing };
  }).sort((a, b) => b.score - a.score);
}

/** Luxuries where marketing lags product delivery — under-communicated value. */
export function marketingGaps(d: Data): { key: string; label: string; gap: number }[] {
  return LUXURIES.map(l => {
    const v = getLux(d, l.key);
    return { key: l.key, label: l.label, gap: v.product - v.marketing };
  }).filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap);
}

/** Luxuries where the product lags the claim — over-promising. */
export function productGaps(d: Data): { key: string; label: string; gap: number }[] {
  return LUXURIES.map(l => {
    const v = getLux(d, l.key);
    return { key: l.key, label: l.label, gap: v.marketing - v.product };
  }).filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap);
}

function ScoreRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">{label}</span>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={cn(
              "h-7 w-7 rounded text-[11px] font-bold tabular-nums transition",
              n === value
                ? n === 0 ? "bg-[rgba(117,117,117,0.25)] text-ink" : "bg-ink text-white"
                : n <= value ? "bg-ink/15 text-ink" : "bg-white text-ink/30 hover:bg-black/5"
            )}>{n}</button>
        ))}
      </div>
    </div>
  );
}

export function RealLuxuriesAudit({ data: raw, onChange, live }: AppProps) {
  const d: Data = { offer: "", lens: "", luxuries: {}, summary: "", ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const setLux = (key: string, u: Partial<Luxury>) =>
    upd({ luxuries: { ...d.luxuries, [key]: { ...getLux(d, key), ...u } } });

  const strongest = strongestLuxuries(d).slice(0, 3).filter(x => x.score > 0);
  const mktGaps = marketingGaps(d).slice(0, 3);
  const prodGaps = productGaps(d).slice(0, 3);

  return (
    <div className="mx-auto max-w-[1000px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Real Luxuries Audit</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Audit the offer against the 12 real luxuries — twice. How well does the <strong>product</strong> actually
            deliver each one, and how well does the <strong>marketing</strong> express it? The gap between the two is
            where money is left on the table or promises get broken.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Offer / brand / product in question</label>
            <input value={d.offer} onChange={e => upd({ offer: e.target.value })}
              placeholder="e.g. The Clubhouse — membership + resort room nights"
              className={cn(
                "w-full rounded-lg border bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink",
                !d.offer.trim() ? "border-[rgba(255,149,0,0.5)]" : "border-[rgba(117,117,117,0.15)]"
              )} />
            {!d.offer.trim() && <p className="mt-1.5 text-[11px] text-[#c77700]">Required — scope the audit to a specific offer.</p>}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Audit lens notes (optional)</label>
            <input value={d.lens} onChange={e => upd({ lens: e.target.value })}
              placeholder="e.g. Focus on the membership tier only; ignore F&B."
              className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
        </div>
      </div>

      {/* The 12 luxuries */}
      <div className="grid gap-4 lg:grid-cols-2">
        {LUXURIES.map((l, i) => {
          const v = getLux(d, l.key);
          return (
            <div key={l.key} className={cn("rounded-2xl bg-card p-5", v.relevance === "None" && "opacity-60")}>
              <div className="mb-3 flex items-start justify-between gap-2 border-b border-dashed border-[rgba(120,120,128,0.2)] pb-3">
                <div>
                  <p className="text-[15px] font-bold tracking-[-0.01em]">
                    <span className="mr-1.5 text-[11px] font-medium text-ink/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </p>
                  <p className="text-[12px] leading-5 text-subtitle">{l.desc}</p>
                </div>
              </div>

              {/* Relevance */}
              <div className="mb-3">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Relevance to this offer</span>
                <div className="flex flex-wrap gap-1.5">
                  {RELEVANCE_LEVELS.map(r => (
                    <button key={r} type="button" onClick={() => setLux(l.key, { relevance: r })}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] transition",
                        v.relevance === r
                          ? r === "High" ? "border-transparent bg-[rgba(52,199,89,0.35)]"
                          : r === "None" ? "border-transparent bg-[rgba(117,117,117,0.25)]"
                          : "border-transparent bg-ink text-white"
                          : "border-[rgba(117,117,117,0.2)] text-ink/50 hover:border-ink/40"
                      )}>{r}</button>
                  ))}
                </div>
              </div>

              <div className="mb-3 flex flex-col gap-2.5 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-3">
                <ScoreRow label="Product delivers" value={v.product} onChange={n => setLux(l.key, { product: n })} />
                <ScoreRow label="Marketing expresses" value={v.marketing} onChange={n => setLux(l.key, { marketing: n })} />
              </div>

              {(v.product > 0 || v.marketing > 0) && (
                <p className={cn("mb-2 text-[11px] font-medium uppercase tracking-[0.04em]",
                  v.product > v.marketing ? "text-[#007aff]" : v.marketing > v.product ? "text-[#c77700]" : "text-subtitle")}>
                  {v.product > v.marketing ? "Under-communicated — product leads" : v.marketing > v.product ? "Over-promised — marketing leads" : "Aligned"}
                </p>
              )}

              <input value={v.notes} onChange={e => setLux(l.key, { notes: e.target.value })}
                placeholder="Opportunity — product innovation and/or marketing…"
                className="w-full bg-transparent text-[12px] text-subtitle outline-none placeholder:text-black/25" />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-ink p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Strongest luxuries</p>
          {strongest.length ? strongest.map((s, i) => (
            <p key={s.key} className="mt-1.5 text-[14px]"><span className="mr-1.5 opacity-50">{i + 1}.</span>{s.label}</p>
          )) : <p className="mt-2 text-[13px] opacity-60">Not scored yet</p>}
        </div>
        <div className="rounded-2xl bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Under-communicated</p>
          <p className="mt-1 text-[11px] leading-4 text-subtitle/70">Product leads, marketing lags</p>
          {mktGaps.length ? mktGaps.map(g => (
            <p key={g.key} className="mt-1.5 text-[14px]">{g.label} <span className="text-[12px] text-[#007aff]">+{g.gap}</span></p>
          )) : <p className="mt-2 text-[13px] text-subtitle">None — no gaps</p>}
        </div>
        <div className="rounded-2xl bg-card p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Over-promised</p>
          <p className="mt-1 text-[11px] leading-4 text-subtitle/70">Marketing leads, product lags</p>
          {prodGaps.length ? prodGaps.map(g => (
            <p key={g.key} className="mt-1.5 text-[14px]">{g.label} <span className="text-[12px] text-[#c77700]">+{g.gap}</span></p>
          )) : <p className="mt-2 text-[13px] text-subtitle">None — no gaps</p>}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Audit summary</label>
        <textarea value={d.summary} onChange={e => upd({ summary: e.target.value })} rows={4}
          placeholder="Where should the offer invest, and where should it stop claiming?"
          className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
      </div>
    </div>
  );
}
