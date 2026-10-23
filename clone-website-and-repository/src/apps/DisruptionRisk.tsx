/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Disruption Risk Assessment
 * Operational Purpose: Bipolar performance and trend assessment across 20 Strategyzer statements.
 */
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/** A bipolar statement row: left pole = −3 (threat), right pole = +3 (opportunity). */
interface Row { left: string; right: string }
interface Domain { title: string; hint: string; rows: Row[] }

/** Strategyzer business model PERFORMANCE rows (current health). */
export const PERFORMANCE_DOMAINS: Domain[] = [
  {
    title: "Frontstage",
    hint: "Value proposition, channels, customer relationships",
    rows: [
      { left: "Products/services clearly outperformed by competition", right: "Products/services clearly outperform competition" },
      { left: "Customer base shrinking or eroding", right: "Customer base growing and loyal" },
      { left: "Losing market access / disintermediated", right: "Strong, defensible market access" },
      { left: "No switching costs — customers leave freely", right: "High switching costs — customers locked in" },
    ],
  },
  {
    title: "Backstage",
    hint: "Key resources, activities, and partners",
    rows: [
      { left: "Key resources inferior or degrading", right: "Key resources superior and durable" },
      { left: "Key activities inefficient or outdated", right: "Key activities efficient and hard to copy" },
      { left: "Weak or replaceable partner network", right: "Strong, committed partner network" },
    ],
  },
  {
    title: "Profit Formula",
    hint: "Revenue model, cost structure, margins",
    rows: [
      { left: "Revenue declining or under pressure", right: "Revenue growing predictably" },
      { left: "Cost structure bloated and rigid", right: "Cost structure lean and flexible" },
      { left: "Margins compressing", right: "Margins expanding" },
    ],
  },
];

/** Strategyzer business model TREND rows (future trajectory). */
export const TREND_DOMAINS: Domain[] = [
  {
    title: "Frontstage",
    hint: "Demand-side trajectory",
    rows: [
      { left: "New entrants will erode our position", right: "New entrants cannot touch our position" },
      { left: "Market is shrinking", right: "Market is growing" },
      { left: "Switching friction is disappearing", right: "Switching friction is increasing" },
      { left: "Cultural trends moving away from us", right: "Cultural trends moving toward us" },
    ],
  },
  {
    title: "Backstage",
    hint: "Supply-side trajectory",
    rows: [
      { left: "Technology will obsolete our approach", right: "Technology strengthens our position" },
      { left: "Regulation will restrict us", right: "Regulation will protect or favour us" },
      { left: "Suppliers gaining power over us", right: "Suppliers losing power / many options" },
    ],
  },
  {
    title: "Profit Formula",
    hint: "Economic trajectory",
    rows: [
      { left: "Business model not resilient to shocks", right: "Business model highly resilient" },
      { left: "Geopolitical exposure is high", right: "Geopolitical exposure is minimal" },
      { left: "Funding / capital environment turning against us", right: "Funding / capital environment favourable" },
    ],
  },
];

export type Track = "performance" | "trend";
const TRACKS: { key: Track; label: string; hint: string; domains: Domain[] }[] = [
  { key: "performance", label: "Business Model Performance", hint: "Current health of the business model", domains: PERFORMANCE_DOMAINS },
  { key: "trend", label: "Business Model Trend", hint: "Future trajectory of the business model", domains: TREND_DOMAINS },
];

export function rowKey(track: Track, domainIdx: number, rowIdx: number): string {
  return track + ".d" + domainIdx + "r" + rowIdx;
}

interface Data {
  offer: string;
  /** scores[rowKey] = −3…+3 */
  scores: Record<string, number>;
  mitigation: string;
  synthesis: string;
}
const DEFAULT: Data = { offer: "", scores: {}, mitigation: "", synthesis: "" };

export function trackAverage(domains: Domain[], track: Track, scores: Record<string, number>): number {
  const vals: number[] = [];
  domains.forEach((_, di) => domains[di].rows.forEach((_, ri) => {
    const v = scores[rowKey(track, di, ri)];
    if (typeof v === "number" && v !== 0) vals.push(v);
  }));
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

export function overallLabel(perfAvg: number, trendAvg: number): string {
  const overall = (perfAvg + trendAvg) / 2;
  if (overall === 0) return "Not assessed";
  if (overall <= -1.5) return "Critical risk";
  if (overall <= -0.75) return "Elevated risk";
  if (overall < 0.75) return "Monitor";
  return "Strong position";
}

function Bipolar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[-3, -2, -1, 0, 1, 2, 3].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={cn(
            "h-7 w-7 rounded text-[11px] font-bold tabular-nums transition",
            n === value
              ? n < 0 ? "bg-[#ff453a] text-white"
                : n > 0 ? "bg-[#34c759] text-white"
                : "bg-ink text-white"
              : "bg-white text-ink/30 hover:bg-black/5"
          )}>{n > 0 ? "+" + n : n}</button>
      ))}
    </div>
  );
}

export function DisruptionRiskAssessment({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const setScore = (key: string, v: number) => upd({ scores: { ...d.scores, [key]: v } });

  const perfAvg = trackAverage(PERFORMANCE_DOMAINS, "performance", d.scores);
  const trendAvg = trackAverage(TREND_DOMAINS, "trend", d.scores);
  const overall = (perfAvg + trendAvg) / 2;
  const label = overallLabel(perfAvg, trendAvg);

  return (
    <div className="mx-auto max-w-[1000px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Strategyzer Disruption Risk Assessment</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Score each statement from −3 (left pole, a threat or weakness) to +3 (right pole, an opportunity or strength).
            Performance reads the business model today; trend reads where it is heading.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Business / offer being assessed</label>
        <input value={d.offer} onChange={e => upd({ offer: e.target.value })}
          placeholder="e.g. Clubhouse — combined club membership and resort room nights"
          className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink" />
      </div>

      {/* Tracks */}
      {TRACKS.map(track => {
        const trackAvg = trackAverage(track.domains, track.key, d.scores);
        return (
          <div key={track.key} className="mb-6">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold uppercase tracking-[0.02em]">{track.label}</p>
                <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">{track.hint}</p>
              </div>
              {trackAvg !== 0 && (
                <span className="rounded bg-ink px-2 py-0.5 font-[family-name:var(--font-roboto)] text-[13px] font-medium tabular-nums text-white">
                  avg {trackAvg.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {track.domains.map((domain, di) => (
                <div key={domain.title} className="rounded-2xl bg-card p-5">
                  <div className="mb-3 border-b border-dashed border-[rgba(120,120,128,0.2)] pb-2">
                    <p className="text-[13px] font-bold uppercase tracking-[0.04em]">{domain.title}</p>
                    <p className="text-[11px] text-subtitle">{domain.hint}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {domain.rows.map((row, ri) => {
                      const key = rowKey(track.key, di, ri);
                      const val = d.scores?.[key] ?? 0;
                      return (
                        <div key={key} className="grid items-center gap-2 rounded-xl bg-white px-3 py-2.5 lg:grid-cols-[1fr_auto_1fr]">
                          <p className={cn("text-[12px] leading-5", val < 0 ? "font-semibold text-ink" : "text-subtitle")}>{row.left}</p>
                          <Bipolar value={val} onChange={v => setScore(key, v)} />
                          <p className={cn("text-right text-[12px] leading-5", val > 0 ? "font-semibold text-ink" : "text-subtitle")}>{row.right}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div className="rounded-2xl bg-ink p-6 text-white">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Performance avg</p>
            <p className="mt-1 text-[24px] font-normal tabular-nums">{perfAvg ? perfAvg.toFixed(2) : "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Trend avg</p>
            <p className="mt-1 text-[24px] font-normal tabular-nums">{trendAvg ? trendAvg.toFixed(2) : "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Overall</p>
            <p className="mt-1 text-[24px] font-normal tabular-nums">{overall ? overall.toFixed(2) : "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Position</p>
            <p className={cn("mt-1 inline-flex rounded px-2 py-0.5 text-[15px] font-semibold",
              label === "Critical risk" ? "bg-[#ff453a]" : label === "Elevated risk" ? "bg-[#ff9f0a] text-black"
              : label === "Strong position" ? "bg-[#34c759]" : "bg-white/20")}>{label}</p>
          </div>
        </div>
      </div>

      {/* Footer fields */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Mitigation notes</label>
          <textarea value={d.mitigation} onChange={e => upd({ mitigation: e.target.value })} rows={5}
            placeholder="How could the client defend, hedge, or self-disrupt?"
            className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Synthesis</label>
          <textarea value={d.synthesis} onChange={e => upd({ synthesis: e.target.value })} rows={5}
            placeholder="What does this mean for the strategy?"
            className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
        </div>
      </div>
    </div>
  );
}
