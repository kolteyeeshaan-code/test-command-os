/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : B2B Matchmaking/Trading + Micro M&A/Funding Consultancy [M&A & Trading]
 * Domain Key        : micro_ma_matchmaking
 * Official Title    : Micro-M&A & Structuring Suite
 * Operational Purpose: Size the capital stack and earn-out, structure deal terms, and stress the entry multiple against due-diligence red flags — with live MOIC/IRR returns in any currency.
 */
import { useMemo } from "react";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/* ───────────────────────── Fixed baseline metrics ───────────────────────── */
// Injected into the data model: the target's current financials and the
// benchmark competitor trading multiple every calculation anchors to.
export const MICRO_MA_BASELINE = {
  revenue: 10_000_000,
  ebitda: 1_500_000,
  ebitdaMarginPct: 15,
  benchmarkMultiple: 20.0,
} as const;

/* ───────────────────────── Currency & formatting ───────────────────────── */
export const MICRO_MA_CURRENCIES = ["USD", "GBP", "EUR", "AED", "INR", "SGD", "HKD", "JPY", "Custom"] as const;
export type MicroMACurrency = (typeof MICRO_MA_CURRENCIES)[number];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", GBP: "£", EUR: "€", AED: "AED ", INR: "₹", SGD: "S$", HKD: "HK$", JPY: "¥",
};

/** The active currency token: a real currency code, or the custom 3-letter code. */
export function microMaToken(currency: string, customCode: string): string {
  if (currency === "Custom") {
    const c = (customCode || "X-V").trim().toUpperCase();
    return c || "X-V";
  }
  return (MICRO_MA_CURRENCIES as readonly string[]).includes(currency) ? currency : "USD";
}

/** Prefix notation for the active token — every money value in the app renders through this. */
export function microMaSymbol(currency: string, customCode: string): string {
  if (currency === "Custom") return `${microMaToken(currency, customCode)} `;
  return CURRENCY_SYMBOLS[microMaToken(currency, customCode)] ?? "$";
}

/** Locale-grouped, no fractional cents. */
export function microMaMoney(v: number, symbol: string): string {
  return symbol + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
}

/* ───────────────────────── Deal constants ───────────────────────── */
export const MICRO_MA_RED_FLAGS: { id: string; label: string; penalty: number }[] = [
  { id: "auditor-change", label: "Recent Auditor Change or Unaudited Financial Records", penalty: 0.5 },
  { id: "controller-resigned", label: "Key Financial Controller / Senior Operator Resigned within 12 Months", penalty: 1.0 },
  { id: "ar-aging", label: "Accounts Receivable aging indicates slower collections than top-line velocity", penalty: 0.75 },
  { id: "inventory-buildup", label: "Inventory buildup exceeds Cost of Goods Sold (COGS) consumption rates", penalty: 0.5 },
  { id: "masked-decline", label: "Organic revenue performance flat/declining but masked by temporary pricing cuts", penalty: 1.25 },
  { id: "revenue-recognition", label: "Revenue recognition policies adjusted or loosened recently", penalty: 1.0 },
];

export const MICRO_MA_HANDOVER_MODES = [
  "Immediate Clean Break (Chairman Model)",
  "Structured Advisory Transition Window",
  "Equity Roll-Over Partnership",
] as const;

export const MICRO_MA_LEGAL_STRUCTURES = {
  asset: "Asset Purchase Agreement / Business Transfer",
  share: "Entity Share Purchase Agreement",
} as const;

/** Floor for the adjusted entry multiple so red-flag deductions can never invert the valuation. */
const ADJUSTED_MULTIPLE_FLOOR = 0.5;
/** The sponsor GP commits this share of the upfront cash; the rest is sourced from co-investors. */
const SPONSOR_GP_CARRY_FLOOR = 0.10;

/* ───────────────────────── Data model ───────────────────────── */
export interface MicroMAData {
  currency: string;
  customCurrencyCode: string;
  activeTab: "stack" | "terms" | "diligence";
  entryMultiple: number;
  upfrontCashPct: number;
  revenueGrowthPct: number;
  stabilizedMarginPct: number;
  exitMultiple: number;
  legalStructure: "asset" | "share";
  nwcPeg: number;
  leakageGuardrails: string;
  handoverMode: string;
  transitionSequence: string;
  flags: string[];
}

export const MICRO_MA_DEFAULTS: MicroMAData = {
  currency: "USD",
  customCurrencyCode: "X-V",
  activeTab: "stack",
  entryMultiple: 6.5,
  upfrontCashPct: 30,
  revenueGrowthPct: 15,
  stabilizedMarginPct: 25,
  exitMultiple: 8.5,
  legalStructure: "asset",
  nwcPeg: 500_000,
  leakageGuardrails: "",
  handoverMode: MICRO_MA_HANDOVER_MODES[1],
  transitionSequence: "",
  flags: [],
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const num = (v: unknown, def: number, min: number, max: number): number =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, min, max) : def;
const str = (v: unknown, def: string): string => (typeof v === "string" ? v : def);

/** Defensive parse: any stored shape in, a complete validated MicroMAData out. */
export function parseMicroMA(raw: unknown): MicroMAData {
  const src: Record<string, unknown> = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  return {
    currency: (MICRO_MA_CURRENCIES as readonly string[]).includes(src.currency as string) ? (src.currency as string) : MICRO_MA_DEFAULTS.currency,
    customCurrencyCode: str(src.customCurrencyCode, MICRO_MA_DEFAULTS.customCurrencyCode),
    activeTab: src.activeTab === "terms" || src.activeTab === "diligence" ? src.activeTab : MICRO_MA_DEFAULTS.activeTab,
    entryMultiple: num(src.entryMultiple, MICRO_MA_DEFAULTS.entryMultiple, 3.0, 15.0),
    upfrontCashPct: num(src.upfrontCashPct, MICRO_MA_DEFAULTS.upfrontCashPct, 10, 100),
    revenueGrowthPct: num(src.revenueGrowthPct, MICRO_MA_DEFAULTS.revenueGrowthPct, 0, 100),
    stabilizedMarginPct: num(src.stabilizedMarginPct, MICRO_MA_DEFAULTS.stabilizedMarginPct, 10, 75),
    exitMultiple: num(src.exitMultiple, MICRO_MA_DEFAULTS.exitMultiple, 4.0, 25.0),
    legalStructure: src.legalStructure === "share" ? "share" : "asset",
    nwcPeg: num(src.nwcPeg, MICRO_MA_DEFAULTS.nwcPeg, 0, 2_000_000),
    leakageGuardrails: str(src.leakageGuardrails, ""),
    handoverMode: (MICRO_MA_HANDOVER_MODES as readonly string[]).includes(src.handoverMode as string) ? (src.handoverMode as string) : MICRO_MA_DEFAULTS.handoverMode,
    transitionSequence: str(src.transitionSequence, ""),
    flags: Array.isArray(src.flags) ? (src.flags as unknown[]).filter((f): f is string => typeof f === "string" && MICRO_MA_RED_FLAGS.some(r => r.id === f)) : [],
  };
}

/* ───────────────────────── Derived calculations ───────────────────────── */
export interface MicroMAComputed {
  activeFlags: typeof MICRO_MA_RED_FLAGS;
  flagPenalty: number;
  adjustedMultiple: number;
  clamped: boolean;
  initialEV: number;
  upfrontCash: number;
  deferredNote: number;
  y5Revenue: number;
  y5Ebitda: number;
  grossExitEV: number;
  netProceeds: number;
  moic: number;
  irrPct: number | null;
  outsideCoInvestors: number;
}

export function computeMicroMA(d: MicroMAData): MicroMAComputed {
  const activeFlags = MICRO_MA_RED_FLAGS.filter(f => d.flags.includes(f.id));
  const flagPenalty = activeFlags.reduce((s, f) => s + f.penalty, 0);
  const adjustedMultiple = Math.max(ADJUSTED_MULTIPLE_FLOOR, d.entryMultiple - flagPenalty);
  const initialEV = MICRO_MA_BASELINE.ebitda * adjustedMultiple;
  const upfrontCash = initialEV * (d.upfrontCashPct / 100);
  const deferredNote = initialEV - upfrontCash;
  const y5Revenue = MICRO_MA_BASELINE.revenue * Math.pow(1 + d.revenueGrowthPct / 100, 5);
  const y5Ebitda = y5Revenue * (d.stabilizedMarginPct / 100);
  const grossExitEV = y5Ebitda * d.exitMultiple;
  const netProceeds = grossExitEV - deferredNote;
  const moic = upfrontCash > 0 ? netProceeds / upfrontCash : 0;
  const irrPct = moic > 0 ? (Math.pow(moic, 1 / 5) - 1) * 100 : null;
  const outsideCoInvestors = upfrontCash * (1 - SPONSOR_GP_CARRY_FLOOR);
  return { activeFlags, flagPenalty, adjustedMultiple, clamped: d.entryMultiple - flagPenalty < ADJUSTED_MULTIPLE_FLOOR, initialEV, upfrontCash, deferredNote, y5Revenue, y5Ebitda, grossExitEV, netProceeds, moic, irrPct, outsideCoInvestors };
}

/* ───────────────────────── UI primitives ───────────────────────── */
const fmtX1 = (v: number) => `${v.toFixed(1)}x`;
const fmtX2 = (v: number) => `${v.toFixed(2)}x`;

function SliderField({ label, hint, value, display, min, max, step, onChange, warn }: {
  label: string; hint?: string; value: number; display: string;
  min: number; max: number; step: number; onChange: (v: number) => void; warn?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="text-[13px] font-semibold">{label}</label>
        <span className={cn("rounded-md bg-white px-2 py-0.5 text-[13px] font-bold tabular-nums", warn ? "text-[#ff453a]" : "text-ink")}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-[#15190d]"
      />
      <div className="mt-0.5 flex justify-between text-[10px] uppercase tracking-[0.04em] text-subtitle">
        <span>{min}</span><span>{max}</span>
      </div>
      {hint && <p className="mt-1 text-[11px] text-subtitle">{hint}</p>}
      {warn && <p className="mt-1 text-[11px] font-medium text-[#ff453a]">Thesis Warning: Higher cash checks reduce your risk mitigation floor.</p>}
    </div>
  );
}

function StatRow({ label, hint, value, strong }: { label: string; hint?: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-4 py-2.5", strong && "rounded-lg bg-white/70 px-3")}>
      <div className="min-w-0">
        <p className={cn("text-[13px]", strong ? "font-semibold" : "text-subtitle")}>{label}</p>
        {hint && <p className="text-[11px] text-subtitle">{hint}</p>}
      </div>
      <p className={cn("shrink-0 font-bold tabular-nums", strong ? "text-[17px]" : "text-[15px]")}>{value}</p>
    </div>
  );
}

const TABS: { id: MicroMAData["activeTab"]; label: string }[] = [
  { id: "stack", label: "Capital Stack & Earn-Out Sandbox" },
  { id: "terms", label: "Restructuring & Deal Terms" },
  { id: "diligence", label: "Due Diligence & Valuation Guardrails" },
];

/* ───────────────────────── App ───────────────────────── */
export function MicroMASuite({ data: raw, onChange, live }: AppProps) {
  const d = useMemo(() => parseMicroMA(raw), [raw]);
  const upd = (u: Partial<MicroMAData>) => onChange({ ...d, ...u });
  const c = useMemo(() => computeMicroMA(d), [d]);

  const token = microMaToken(d.currency, d.customCurrencyCode);
  const sym = microMaSymbol(d.currency, d.customCurrencyCode);
  const fmt = (v: number) => microMaMoney(v, sym);

  const toggleFlag = (id: string) =>
    upd({ flags: d.flags.includes(id) ? d.flags.filter(f => f !== id) : [...d.flags, id] });

  return (
    <div className="mx-auto max-w-[1100px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Micro-M&amp;A &amp; Structuring Suite — size the capital stack, structure the deal, and stress the entry
          multiple against due-diligence red flags. Every figure recalculates live and reports in your chosen currency.
        </p>
      )}

      {/* ── Global currency & formatting header block ── */}
      <div className="mb-6 rounded-2xl bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Reporting Currency</label>
            <select
              value={d.currency} onChange={e => upd({ currency: e.target.value })}
              aria-label="Reporting currency"
              className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink"
            >
              {MICRO_MA_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {d.currency === "Custom" && (
            <div className="min-w-[180px]">
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Custom 3-Letter Code</label>
              <input
                value={d.customCurrencyCode} onChange={e => upd({ customCurrencyCode: e.target.value })}
                placeholder="X-V" maxLength={8} aria-label="Custom 3-letter code"
                className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-ink"
              />
            </div>
          )}
          <p className="pb-2 text-[12px] text-subtitle">Active token: <span className="font-bold text-ink">{token}</span> · locale grouping, no fractional cents</p>
        </div>
        {/* Fixed baseline metrics — read-only, re-denominated with the active token */}
        <div className="mt-4 grid gap-3 border-t border-[rgba(117,117,117,0.15)] pt-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Target Company Current Revenue</p>
            <p className="mt-1 text-[16px] font-bold tabular-nums">{fmt(MICRO_MA_BASELINE.revenue)}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Target Company Current EBITDA</p>
            <p className="mt-1 text-[16px] font-bold tabular-nums">{fmt(MICRO_MA_BASELINE.ebitda)} <span className="text-[11px] font-medium text-subtitle">· {MICRO_MA_BASELINE.ebitdaMarginPct}% margin</span></p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Benchmark Competitor Trading Multiple</p>
            <p className="mt-1 text-[16px] font-bold tabular-nums">{fmtX1(MICRO_MA_BASELINE.benchmarkMultiple)}</p>
          </div>
        </div>
      </div>

      {/* ── Top navigation bar ── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id} type="button" onClick={() => upd({ activeTab: t.id })}
            aria-pressed={d.activeTab === t.id}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition",
              d.activeTab === t.id ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40"
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Tab A: Capital Stack & Earn-Out Sandbox ── */}
      {d.activeTab === "stack" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-card p-5">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.06em]">Deal Configuration</p>
            <div className="flex flex-col gap-5">
              <SliderField label="Target Base EV/EBITDA Entry Multiple" value={d.entryMultiple} display={fmtX1(d.entryMultiple)}
                min={3} max={15} step={0.5} onChange={v => upd({ entryMultiple: v })}
                hint={`Benchmark competitor trading multiple: ${fmtX1(MICRO_MA_BASELINE.benchmarkMultiple)}`} />
              <SliderField label="Upfront Cash Down Payment %" value={d.upfrontCashPct} display={`${d.upfrontCashPct}%`}
                min={10} max={100} step={5} onChange={v => upd({ upfrontCashPct: v })} warn={d.upfrontCashPct > 30} />
              <SliderField label="Projected Annual Revenue Growth Rate %" value={d.revenueGrowthPct} display={`${d.revenueGrowthPct}%`}
                min={0} max={100} step={5} onChange={v => upd({ revenueGrowthPct: v })} />
              <SliderField label="Target Stabilized Operating Margin %" value={d.stabilizedMarginPct} display={`${d.stabilizedMarginPct}%`}
                min={10} max={75} step={2} onChange={v => upd({ stabilizedMarginPct: v })} />
              <SliderField label="Target Exit Valuation Multiple" value={d.exitMultiple} display={fmtX1(d.exitMultiple)}
                min={4} max={25} step={0.5} onChange={v => upd({ exitMultiple: v })} />
            </div>
          </div>

          <div className="rounded-2xl bg-card p-5">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em]">Real-Time Output</p>
            <div className="divide-y divide-[rgba(117,117,117,0.12)]">
              <StatRow label="Adjusted Entry Multiple" strong value={fmtX1(c.adjustedMultiple)}
                hint={c.activeFlags.length === 0
                  ? "No red-flag deductions active (Tab C)"
                  : c.clamped
                    ? `−${c.flagPenalty.toFixed(2)}x of deductions — floored at ${ADJUSTED_MULTIPLE_FLOOR.toFixed(1)}x`
                    : `Base ${fmtX1(d.entryMultiple)} − ${c.flagPenalty.toFixed(2)}x across ${c.activeFlags.length} active flag${c.activeFlags.length === 1 ? "" : "s"} (Tab C)`} />
              <StatRow label="Initial Enterprise Value (EV)" strong value={fmt(c.initialEV)}
                hint={`Current EBITDA ${fmt(MICRO_MA_BASELINE.ebitda)} × ${fmtX1(c.adjustedMultiple)}`} />
              <StatRow label="Upfront Cash Check Sizing" value={fmt(c.upfrontCash)}
                hint={`Initial EV × ${d.upfrontCashPct}%`} />
              <StatRow label="Deferred Seller Note Sizing" value={fmt(c.deferredNote)}
                hint="Initial EV − Upfront Cash Check" />
              <StatRow label="Projected Year 5 Revenue" value={fmt(c.y5Revenue)}
                hint={`Current revenue × (1 + ${d.revenueGrowthPct}%)⁵`} />
              <StatRow label="Projected Year 5 EBITDA" value={fmt(c.y5Ebitda)}
                hint={`Year 5 Revenue × ${d.stabilizedMarginPct}%`} />
              <StatRow label="Gross Exit Valuation (EV)" strong value={fmt(c.grossExitEV)}
                hint={`Year 5 EBITDA × ${fmtX1(d.exitMultiple)}`} />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab B: Restructuring & Deal Terms ── */}
      {d.activeTab === "terms" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-card p-5">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.06em]">Transaction Legal Structure</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(MICRO_MA_LEGAL_STRUCTURES) as (keyof typeof MICRO_MA_LEGAL_STRUCTURES)[]).map(k => (
                <button key={k} type="button" onClick={() => upd({ legalStructure: k })}
                  aria-pressed={d.legalStructure === k}
                  className={cn("rounded-xl border px-3 py-3 text-left text-[12px] font-semibold transition",
                    d.legalStructure === k ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] bg-white text-ink hover:border-ink/40")}
                >{MICRO_MA_LEGAL_STRUCTURES[k]}</button>
              ))}
            </div>
            <p className={cn("mt-4 rounded-xl px-4 py-3 text-[12px] leading-relaxed",
              d.legalStructure === "asset" ? "bg-[#007aff]/10 text-ink" : "bg-[#ff453a]/10 text-ink")}
            >
              {d.legalStructure === "asset"
                ? "Recommended: Isolates historic corporate entity liabilities and clean-slates operational systems."
                : "Warning: Inherits complete past operational, regulatory, and corporate tax liability history of the legal entity."}
            </p>
          </div>

          <div className="rounded-2xl bg-card p-5">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.06em]">Working Capital Target Peg</p>
            <SliderField label="Net Working Capital (NWC) Peg" value={d.nwcPeg} display={fmt(d.nwcPeg)}
              min={0} max={2_000_000} step={25_000} onChange={v => upd({ nwcPeg: v })} />
            <div className="mt-5">
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Inventory/Receivables Leakage Guardrails</label>
              <textarea value={d.leakageGuardrails} onChange={e => upd({ leakageGuardrails: e.target.value })} rows={5}
                placeholder="Ledger of leakage guardrails — e.g. receivables collected pre-close, inventory write-down triggers, peg true-up mechanics…"
                className="w-full resize-y rounded-xl border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[13px] leading-5 outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-card p-5 lg:col-span-2">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.06em]">Founder Handover &amp; Transition Window</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Transition Model</label>
                <select value={d.handoverMode} onChange={e => upd({ handoverMode: e.target.value })}
                  aria-label="Founder handover transition window"
                  className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink"
                >
                  {MICRO_MA_HANDOVER_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Interim Management Deployment Sequence</label>
                <textarea value={d.transitionSequence} onChange={e => upd({ transitionSequence: e.target.value })} rows={3}
                  placeholder="Map the interim management deployment sequence — who steps in, in what order, for how long…"
                  className="h-full w-full resize-y rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[13px] leading-5 outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab C: Due Diligence & Valuation Guardrails ── */}
      {d.activeTab === "diligence" && (
        <div className="rounded-2xl bg-card p-5">
          <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.06em]">Accounting &amp; Structural Red Flags</p>
          <p className="mb-4 text-[12px] text-subtitle">Click a flag to toggle it. Active flags deduct from the entry valuation multiple on Tab A.</p>
          <div className="flex flex-col gap-2">
            {MICRO_MA_RED_FLAGS.map(f => {
              const on = d.flags.includes(f.id);
              return (
                <button key={f.id} type="button" onClick={() => toggleFlag(f.id)} aria-pressed={on}
                  className={cn("flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition",
                    on ? "border-[#ff453a]/40 bg-white" : "border-[rgba(117,117,117,0.15)] bg-white/50 hover:border-ink/30")}
                >
                  <span className={cn("text-[13px] font-medium", on ? "text-ink" : "text-subtitle")}>{f.label}</span>
                  <span className={cn("flex shrink-0 items-center gap-2 rounded-md px-2 py-0.5 text-[12px] font-bold",
                    on ? "bg-[#ff453a] text-white" : "bg-card text-subtitle")}
                  >
                    {on && <span aria-hidden>✓</span>}−{f.penalty.toFixed(2)}x
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink px-4 py-3 text-white">
            <p className="text-[12px]">
              {c.activeFlags.length === 0
                ? "No red flags active."
                : `${c.activeFlags.length} active flag${c.activeFlags.length === 1 ? "" : "s"} · total deduction −${c.flagPenalty.toFixed(2)}x`}
            </p>
            <p className="text-[12px]">Adjusted entry multiple: <span className="font-bold">{fmtX1(c.adjustedMultiple)}</span></p>
          </div>
        </div>
      )}

      {/* ── Master Return Summary Dashboard (all tabs) ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-ink p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-60">Returns Matrix</p>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] opacity-60">Target MOIC</p>
              <p className="mt-1 text-[26px] font-bold tabular-nums">{fmtX2(c.moic)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.06em] opacity-60">Implied IRR %</p>
              <p className={cn("mt-1 text-[26px] font-bold tabular-nums",
                c.irrPct === null ? "opacity-50" : c.irrPct >= 25 ? "text-[#34c759]" : "text-[#ff9500]")}
              >
                {c.irrPct === null ? "—" : `${c.irrPct.toFixed(1)}%`}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[11px] opacity-70">
            MOIC = Net Sponsor Proceeds ÷ Upfront Cash Check · IRR = (MOIC ^ (1/5)) − 1
          </p>
        </div>
        <div className="rounded-2xl bg-ink p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-60">Net Settlement</p>
          <div className="mt-3">
            <p className="text-[10px] uppercase tracking-[0.06em] opacity-60">Net Sponsor Proceeds on Exit</p>
            <p className="mt-1 text-[26px] font-bold tabular-nums">{fmt(c.netProceeds)}</p>
            <p className="text-[11px] opacity-70">Gross Exit EV − Deferred Seller Note</p>
          </div>
          <p className="mt-3 border-t border-white/10 pt-3 text-[12px] leading-relaxed opacity-90">
            Total Capital Sourced From Outside Co-Investors: <span className="font-bold">{fmt(c.outsideCoInvestors)}</span>
            <span className="block text-[11px] opacity-60">Upfront Cash Check less a 10% Sponsor GP Carry Floor</span>
          </p>
        </div>
      </div>
    </div>
  );
}
