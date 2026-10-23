/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Innovation Project Scorecard
 * Operational Purpose: Score 17 Strategyzer criteria with evidence; get Pursue / Explore / Kill.
 */
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/** One scoreable Strategyzer criterion. */
interface Criterion { label: string; desc: string }
interface Section { title: string; subtitle: string; criteria: Criterion[] }

/** Strategyzer Innovation Project Scorecard structure. */
export const SCORECARD_SECTIONS: Section[] = [
  {
    title: "Strategic Fit",
    subtitle: "Alignment",
    criteria: [
      { label: "Corporate identity", desc: "Does the project fit who we are and how we want to be seen?" },
      { label: "Innovation guidance", desc: "Does it fit where we have decided to play and how we intend to win?" },
      { label: "Leadership support", desc: "Will leadership actively back this with budget, air cover, and patience?" },
    ],
  },
  {
    title: "Opportunity",
    subtitle: "Value",
    criteria: [
      { label: "Expected return", desc: "How attractive is the potential return relative to the investment required?" },
    ],
  },
  {
    title: "Risk Reduction · Desirability",
    subtitle: "Evidence & confidence",
    criteria: [
      { label: "Customer segment", desc: "Do we have real evidence the segment exists, is reachable, and is worth serving?" },
      { label: "Value proposition", desc: "Does the evidence show customers actually want this and will pay for it?" },
      { label: "Channels", desc: "Do we know how to reach the segment at an acceptable cost?" },
      { label: "Customer relationship", desc: "Do we understand how to acquire, retain, and grow these customers?" },
    ],
  },
  {
    title: "Risk Reduction · Feasibility",
    subtitle: "Evidence & confidence",
    criteria: [
      { label: "Key resources", desc: "Can we access or build the resources this requires?" },
      { label: "Key activities", desc: "Can we perform the activities required to deliver the value proposition?" },
      { label: "Key partners", desc: "Can we secure the partners and supplies we depend on?" },
    ],
  },
  {
    title: "Risk Reduction · Viability",
    subtitle: "Evidence & confidence",
    criteria: [
      { label: "Revenues", desc: "Is there credible evidence of a revenue model that scales?" },
      { label: "Costs", desc: "Do we understand the cost structure and can it support a healthy margin?" },
    ],
  },
  {
    title: "Risk Reduction · Adaptability",
    subtitle: "Evidence & confidence",
    criteria: [
      { label: "Industry forces", desc: "How exposed are we to competitors, substitutes, and value chain power?" },
      { label: "Market forces", desc: "How exposed are we to customer segments, needs, and switching behaviour?" },
      { label: "Key trends", desc: "Which technology, regulatory, or cultural trends could reshape this?" },
      { label: "Macroeconomic forces", desc: "How exposed are we to global market, capital, and economic conditions?" },
    ],
  },
];

export const ALL_CRITERIA: Criterion[] = SCORECARD_SECTIONS.flatMap(s => s.criteria);

/** Maps a section index + criterion index to a flat storage key. */
export function critKey(sectionIdx: number, critIdx: number): string {
  return "s" + sectionIdx + "c" + critIdx;
}

interface Data {
  project: string;
  description: string;
  /** scores[critKey] = 0..5 */
  scores: Record<string, number>;
  /** notes[critKey] = evidence */
  notes: Record<string, string>;
  recommendation: string;
}

const DEFAULT: Data = { project: "", description: "", scores: {}, notes: {}, recommendation: "" };

/** Overall average across every criterion that has been scored. */
export function scorecardAverage(scores: Record<string, number>): number {
  const vals = Object.values(scores || {}).filter(v => typeof v === "number" && v > 0);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

export function scorecardRecommendation(scores: Record<string, number>): string {
  const avg = scorecardAverage(scores);
  if (avg === 0) return "Not scored";
  if (avg >= 4) return "Pursue";
  if (avg >= 2.75) return "Explore further";
  return "Kill · Pivot";
}

export function InnovationProjectScorecard({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  const avg = scorecardAverage(d.scores);
  const rec = d.recommendation || scorecardRecommendation(d.scores);
  const scoredCount = Object.values(d.scores || {}).filter(v => typeof v === "number" && v > 0).length;

  const setScore = (key: string, n: number) => upd({ scores: { ...d.scores, [key]: n } });
  const setNote = (key: string, v: string) => upd({ notes: { ...d.notes, [key]: v } });

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Strategyzer Innovation Project Scorecard</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Score each criterion 0–5 with evidence. Strategic Fit and Opportunity are scored on alignment and value;
            the Risk Reduction dimensions are scored on how much evidence you actually have.
          </p>
        </div>
      )}

      {/* Project header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <div className="grid gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Project name</label>
            <input value={d.project} onChange={e => upd({ project: e.target.value })} placeholder="e.g. Members-only clubhouse app"
              className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Short description</label>
            <input value={d.description} onChange={e => upd({ description: e.target.value })} placeholder="What is the bet, in one sentence?"
              className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
        </div>
      </div>

      {/* Scorecard sections */}
      <div className="flex flex-col gap-6">
        {SCORECARD_SECTIONS.map((section, si) => {
          const sectionKeys = section.criteria.map((_, ci) => critKey(si, ci));
          const sectionScored = sectionKeys.filter(k => (d.scores?.[k] || 0) > 0);
          const sectionAvg = sectionScored.length
            ? sectionScored.reduce((s, k) => s + (d.scores[k] || 0), 0) / sectionScored.length
            : 0;
          return (
            <div key={section.title} className="rounded-2xl bg-card p-5">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-dashed border-[rgba(120,120,128,0.2)] pb-3">
                <div>
                  <p className="text-[15px] font-bold tracking-[-0.01em]">{section.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">{section.subtitle}</p>
                </div>
                {sectionAvg > 0 && (
                  <span className="rounded bg-ink px-2 py-0.5 font-[family-name:var(--font-roboto)] text-[13px] font-medium tabular-nums text-white">
                    {sectionAvg.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {section.criteria.map((c, ci) => {
                  const key = critKey(si, ci);
                  const val = d.scores?.[key] || 0;
                  return (
                    <div key={key} className="rounded-xl bg-white p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-[200px] flex-1">
                          <p className="text-[13px] font-semibold">{c.label}</p>
                          <p className="text-[12px] leading-5 text-subtitle">{c.desc}</p>
                        </div>
                        <div className="flex gap-1">
                          {[0, 1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setScore(key, n)}
                              className={cn(
                                "h-8 w-8 rounded-lg text-[12px] font-bold tabular-nums transition",
                                n === val
                                  ? n === 0 ? "bg-[rgba(117,117,117,0.25)] text-ink" : "bg-ink text-white"
                                  : n === 0 ? "text-ink/25 hover:bg-black/5"
                                  : n <= val ? "bg-ink/15 text-ink" : "bg-card text-ink/40 hover:bg-black/10"
                              )}>{n}</button>
                          ))}
                        </div>
                      </div>
                      <input
                        value={d.notes?.[key] || ""}
                        onChange={e => setNote(key, e.target.value)}
                        placeholder="Evidence / notes — what do we actually know?"
                        className="mt-2 w-full bg-transparent text-[12px] text-subtitle outline-none placeholder:text-black/25"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-2xl bg-ink p-6 text-white">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Criteria scored</p>
            <p className="mt-1 text-[28px] font-normal tracking-[-0.04em] tabular-nums">{scoredCount}<span className="text-[16px] opacity-50">/{ALL_CRITERIA.length}</span></p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Average score</p>
            <p className="mt-1 text-[28px] font-normal tracking-[-0.04em] tabular-nums">{avg ? avg.toFixed(1) : "—"}<span className="text-[16px] opacity-50">/5</span></p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Recommendation</p>
            <p className="mt-1 text-[20px] font-normal tracking-[-0.03em]">{rec}</p>
          </div>
        </div>
      </div>

      {/* Recommendation override */}
      <div className="mt-4">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Final recommendation (override if needed)</label>
        <div className="flex flex-wrap gap-2">
          {["Pursue", "Explore further", "Kill · Pivot"].map(r => (
            <button key={r} type="button" onClick={() => upd({ recommendation: r })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition",
                rec === r ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40"
              )}>{r}</button>
          ))}
          {d.recommendation && (
            <button type="button" onClick={() => upd({ recommendation: "" })}
              className="text-[11px] text-ink/50 underline underline-offset-2 hover:text-ink">Use suggested</button>
          )}
        </div>
      </div>
    </div>
  );
}
