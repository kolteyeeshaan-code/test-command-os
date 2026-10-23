/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : B2B Matchmaking/Trading + Micro M&A/Funding Consultancy [M&A & Trading]
 * Domain Key        : micro_ma_matchmaking
 * Official Title    : Valuation Method Selector
 * Operational Purpose: Select primary and secondary valuation methods by stage and purpose.
 */
import type { AppProps } from "../pages/AppSession";

interface Data {
  stage: string;
  purpose: string;
  primary: string;
  secondary: string;
  chosenMethod: string;
  rationale: string;
  keyAssumptions: string;
  multiplesDiscountInputs: string;
  comparablesNotes: string;
  valuationRange: string;
  conclusion: string;
}

const STAGES = ["Pre-revenue", "Early revenue", "Growth", "Mature", "Distressed"];
const PURPOSES = ["Fundraising", "M&A / Exit", "Internal planning", "Litigation", "Tax / Compliance"];

const MATRIX: Record<string, { primary: string; secondary: string; rationale: string }> = {
  "Pre-revenue|Fundraising": {
    primary: "Scorecard / Berkus Method",
    secondary: "VC Method",
    rationale: "With no financial history, value qualitative risk factors, founding team, and prototype milestones before cross-checking with target VC returns.",
  },
  "Pre-revenue|M&A / Exit": {
    primary: "Cost-to-Duplicate / IP Replacement",
    secondary: "Scorecard Method",
    rationale: "Acquirers pay for R&D time saved or proprietary assets. Calculate replacement cost as the valuation floor.",
  },
  "Early revenue|Fundraising": {
    primary: "VC Method",
    secondary: "ARR / Revenue Multiples",
    rationale: "Back out valuation from expected exit multiple and required investor ROI, then sanity-check against early ARR comps.",
  },
  "Early revenue|M&A / Exit": {
    primary: "ARR Multiples (Comparables)",
    secondary: "DCF (Probability-weighted)",
    rationale: "Recent transaction multiples for early ARR peers provide the market anchor; probability-weighted cash flow provides internal backing.",
  },
  "Growth|Fundraising": {
    primary: "ARR / EBITDA Multiples",
    secondary: "Discounted Cash Flow (DCF)",
    rationale: "Growth-stage companies price on top-line or EBITDA multiples; build a 5-year DCF to validate growth trajectory.",
  },
  "Growth|M&A / Exit": {
    primary: "Comparable Transactions",
    secondary: "EBITDA Multiples",
    rationale: "Strategic buyer M&A relies heavily on precedent transactions with synergy premiums.",
  },
  "Mature|Fundraising": {
    primary: "EBITDA Multiples",
    secondary: "DCF",
    rationale: "Stable cash flows support traditional EBITDA multiples and rigorous DCF modeling.",
  },
  "Mature|M&A / Exit": {
    primary: "EBITDA / LBO Multiples",
    secondary: "Comparable Transactions",
    rationale: "Financial buyers (PE) value mature targets on debt capacity and EBITDA cash flow.",
  },
  "Distressed|Fundraising": {
    primary: "Liquidation Value",
    secondary: "Adjusted Net Asset Value",
    rationale: "High risk requires asset-backed downside protection.",
  },
  "Distressed|M&A / Exit": {
    primary: "Liquidation Value",
    secondary: "Comparable Distressed Deals",
    rationale: "Distressed M&A is anchored by net asset liquidation value.",
  },
};

export function ValuationMethodSelector({ data: raw, onChange, live }: AppProps) {
  const d: Data = {
    stage: STAGES[0],
    purpose: PURPOSES[0],
    primary: "",
    secondary: "",
    chosenMethod: "",
    rationale: "",
    keyAssumptions: "",
    multiplesDiscountInputs: "",
    comparablesNotes: "",
    valuationRange: "",
    conclusion: "",
    ...(raw as Partial<Data>),
  };

  const key = `${d.stage}|${d.purpose}`;
  const rec = MATRIX[key] || { primary: "Revenue Multiple", secondary: "DCF", rationale: "Standard market multiple combined with DCF validation." };

  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  // Update recommendation when stage or purpose changes if not manually locked
  const handleStageChange = (stage: string) => {
    const newKey = `${stage}|${d.purpose}`;
    const newRec = MATRIX[newKey] || rec;
    upd({ stage, primary: newRec.primary, secondary: newRec.secondary, rationale: newRec.rationale });
  };

  const handlePurposeChange = (purpose: string) => {
    const newKey = `${d.stage}|${purpose}`;
    const newRec = MATRIX[newKey] || rec;
    upd({ purpose, primary: newRec.primary, secondary: newRec.secondary, rationale: newRec.rationale });
  };

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Valuation Method Selector — Select company stage and purpose to view recommended valuation methodologies, then document key assumptions, multiples, and estimated range.
        </p>
      )}

      {/* Stage & Purpose Selection */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em]">Company Context</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Company Stage</label>
            <select value={d.stage} onChange={e => handleStageChange(e.target.value)} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Valuation Purpose</label>
            <select value={d.purpose} onChange={e => handlePurposeChange(e.target.value)} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
              {PURPOSES.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Rationale Banner */}
      <div className="mb-6 rounded-2xl bg-ink p-6 text-white">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] opacity-60">Matrix Recommendation</p>
          <span className="text-[11px] uppercase tracking-[0.04em] opacity-60">{d.stage} · {d.purpose}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.04em] opacity-60">Primary Method</p>
            <p className="text-[18px] font-semibold">{d.primary || rec.primary}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.04em] opacity-60">Secondary Method</p>
            <p className="text-[18px] font-semibold">{d.secondary || rec.secondary}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-white/10 pt-3 text-[13px] leading-relaxed opacity-80">
          <strong>Rationale:</strong> {d.rationale || rec.rationale}
        </p>
      </div>

      {/* Structured Analysis Fields */}
      <div className="rounded-2xl bg-card p-6">
        <p className="mb-4 text-[13px] font-bold uppercase tracking-[0.06em]">Valuation Execution</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Chosen Primary Method (Override if needed)</label>
            <input value={d.chosenMethod} onChange={e => upd({ chosenMethod: e.target.value })} placeholder={`Default: ${d.primary || rec.primary}`} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Key Assumptions</label>
              <textarea value={d.keyAssumptions} onChange={e => upd({ keyAssumptions: e.target.value })} rows={3} placeholder="Growth rates, margin expansion, terminal growth..." className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Multiples / Discount Inputs</label>
              <textarea value={d.multiplesDiscountInputs} onChange={e => upd({ multiplesDiscountInputs: e.target.value })} rows={3} placeholder="WACC %, Exit Multiple (e.g., 8x EV/ARR), Discount Rate..." className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Comparables & Market Benchmarks</label>
            <textarea value={d.comparablesNotes} onChange={e => upd({ comparablesNotes: e.target.value })} rows={3} placeholder="Recent relevant transaction comps or public peer multiples..." className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Estimated Valuation Range</label>
              <input value={d.valuationRange} onChange={e => upd({ valuationRange: e.target.value })} placeholder="e.g. $12M – $15M Pre-Money" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Valuation Conclusion</label>
              <input value={d.conclusion} onChange={e => upd({ conclusion: e.target.value })} placeholder="Final recommended figure or guidance" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
