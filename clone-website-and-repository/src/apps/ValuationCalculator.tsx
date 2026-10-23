/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : B2B Matchmaking/Trading + Micro M&A/Funding Consultancy [M&A & Trading]
 * Domain Key        : micro_ma_matchmaking
 * Official Title    : Valuation Multi-Engine Calculator
 * Operational Purpose: Reactive valuation engine modeling 11 variations with a dual-engine dropdown blender and sensitivity matrix.
 */
import { useMemo, useState } from "react";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/* ═══════════════════════════════ Currency ═══════════════════════════════ */
export const VC_CURRENCIES = ["USD", "EUR", "GBP", "SGD", "JPY", "AED", "INR", "HKD", "Custom"] as const;
const VC_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", SGD: "S$", JPY: "¥", AED: "AED ", INR: "₹", HKD: "HK$",
};

export function vcToken(currency: string, customCode: string): string {
  if (currency === "Custom") {
    const c = (customCode || "X-V").trim().toUpperCase();
    return c || "X-V";
  }
  return (VC_CURRENCIES as readonly string[]).includes(currency) ? currency : "USD";
}
export function vcSymbol(currency: string, customCode: string): string {
  if (currency === "Custom") return `${vcToken(currency, customCode)} `;
  return VC_SYMBOLS[vcToken(currency, customCode)] ?? "$";
}
export function vcMoney(v: number, symbol: string): string {
  return symbol + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
}

/* ═══════════════════════════════ Method registry ═══════════════════════════════ */
export type MethodId =
  | "scorecard" | "ev-sales" | "ev-ebitda" | "price-to-book"
  | "berkus" | "dcf" | "liquidation" | "tam" | "replacement-cost"
  | "nbv-replacement" | "nbv-liquidation";

export const VC_METHODS: { id: MethodId; n: number; label: string; tab: string }[] = [
  { id: "scorecard", n: 1, label: "Scorecard Method", tab: "qualitative" },
  { id: "ev-sales", n: 2, label: "EV/Sales Multiple", tab: "multiples" },
  { id: "ev-ebitda", n: 3, label: "EV/EBITDA Multiple", tab: "multiples" },
  { id: "price-to-book", n: 4, label: "Price to Book (Net Book Value)", tab: "assets" },
  { id: "berkus", n: 5, label: "Berkus Method (Scorecard Inverse)", tab: "qualitative" },
  { id: "dcf", n: 6, label: "Discrete 5-Year DCF Engine", tab: "dcf" },
  { id: "liquidation", n: 7, label: "Liquidation Method", tab: "assets" },
  { id: "tam", n: 8, label: "Replacement Cost Method (EV/TAM)", tab: "sensitivity" },
  { id: "replacement-cost", n: 9, label: "Replacement Cost Method", tab: "assets" },
  { id: "nbv-replacement", n: 10, label: "Net Book Value adj. via Replacement Cost", tab: "assets" },
  { id: "nbv-liquidation", n: 11, label: "Net Book Value adj. via Liquidation", tab: "assets" },
];

export const VC_METHOD_LABEL: Record<MethodId, string> = Object.fromEntries(
  VC_METHODS.map(m => [m.id, `${m.n}. ${m.label}`]),
) as Record<MethodId, string>;

export const VC_TERMINAL_MODES = ["EV/Sales", "EV/EBITDA", "P/E Multiple", "Net Book Value"] as const;
export type VcTerminalMode = (typeof VC_TERMINAL_MODES)[number];

export const VC_TABS = [
  { id: "qualitative", label: "Qualitative Scorecards" },
  { id: "multiples", label: "Multiple-Based Sandbox" },
  { id: "assets", label: "Asset & Accounting Floors" },
  { id: "dcf", label: "Discounted Cash Flow (DCF)" },
  { id: "sensitivity", label: "Sensitivity Matrix & TAM" },
] as const;
export type VcTabId = (typeof VC_TABS)[number]["id"];

/* ═══════════════════════════════ Data model ═══════════════════════════════ */
export interface ValuationCalculatorData {
  currency: string;
  customCurrencyCode: string;
  primary: MethodId;
  secondary: MethodId;
  blendWeightPct: number;
  activeTab: VcTabId;

  // Shared fundamentals
  revenue: number;
  ebitda: number;
  netDebt: number;
  totalAssets: number;
  totalLiabilities: number;
  users: number;

  // Method 1 / 5 — Scorecard & Berkus
  scorecardFloor: number;
  berkusFactors: Record<string, number>;
  berkusBenchmark: number;

  // Method 2 / 3 — multiples
  evSalesMultiple: number;
  evPerUser: number;
  evEbitdaMultiple: number;

  // Method 6 — DCF
  dcfFcf: number;
  dcfGrowthPct: number;
  dcfWaccPct: number;
  dcfTerminalMode: VcTerminalMode;
  dcfTerminalMultiple: number;

  // Method 7 — liquidation
  liquidationHaircutPct: number;

  // Method 9 / 10 — replacement cost
  replacementPremiumPct: number;

  // Method 8 — TAM
  tam: number;
  tamPenetrationPct: number;
  tamShareOfEV: number;

  // Sensitivity matrix
  sensBaseWaccPct: number;
  sensBaseGrowthPct: number;
  sensBaseRevenue: number;
}

export const VC_DEFAULTS: ValuationCalculatorData = {
  currency: "USD",
  customCurrencyCode: "X-V",
  primary: "ev-ebitda",
  secondary: "dcf",
  blendWeightPct: 50,
  activeTab: "qualitative",

  revenue: 10_000_000,
  ebitda: 1_500_000,
  netDebt: 2_000_000,
  totalAssets: 12_000_000,
  totalLiabilities: 4_000_000,
  users: 50_000,

  scorecardFloor: 500_000,
  berkusFactors: { team: 0, prototype: 0, partners: 0, scaling: 0, risk: 0 },
  berkusBenchmark: 0,

  evSalesMultiple: 3.0,
  evPerUser: 120,
  evEbitdaMultiple: 8.0,

  dcfFcf: 1_200_000,
  dcfGrowthPct: 12,
  dcfWaccPct: 12,
  dcfTerminalMode: "EV/EBITDA",
  dcfTerminalMultiple: 8.0,

  liquidationHaircutPct: 25,

  replacementPremiumPct: 20,

  tam: 4_000_000_000,
  tamPenetrationPct: 5,
  tamShareOfEV: 10,

  sensBaseWaccPct: 12,
  sensBaseGrowthPct: 12,
  sensBaseRevenue: 10_000_000,
};

/** Berkus calibrations: each layer can add up to 500k on top of the base idea floor value. */
export const VC_BERKUS_LAYERS: { key: string; label: string; max: number }[] = [
  { key: "team", label: "Founding Team", max: 500_000 },
  { key: "prototype", label: "Prototype / IP", max: 500_000 },
  { key: "partners", label: "Strategic Partners", max: 500_000 },
  { key: "scaling", label: "Scaling Leverage", max: 500_000 },
  { key: "risk", label: "Risk Mitigation", max: 500_000 },
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const num = (v: unknown, def: number, lo: number, hi: number): number =>
  typeof v === "number" && Number.isFinite(v) ? clamp(v, lo, hi) : def;
const str = (v: unknown, def: string): string => (typeof v === "string" ? v : def);

/** Strict defensive parse: any stored shape in, a complete validated model out. */
export function normalizeData(raw: unknown): ValuationCalculatorData {
  const s: Record<string, unknown> = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
  const method = (v: unknown, def: MethodId): MethodId =>
    VC_METHODS.some(m => m.id === v) ? (v as MethodId) : def;
  const tab = (v: unknown, def: VcTabId): VcTabId =>
    (VC_TABS as readonly { id: string }[]).some(t => t.id === v) ? (v as VcTabId) : def;
  const berkus: Record<string, number> = {};
  const rawB = (s.berkusFactors && typeof s.berkusFactors === "object" ? s.berkusFactors : {}) as Record<string, unknown>;
  for (const l of VC_BERKUS_LAYERS) berkus[l.key] = num(rawB[l.key], 0, 0, l.max);
  return {
    currency: (VC_CURRENCIES as readonly string[]).includes(s.currency as string) ? (s.currency as string) : VC_DEFAULTS.currency,
    customCurrencyCode: str(s.customCurrencyCode, VC_DEFAULTS.customCurrencyCode),
    primary: method(s.primary, VC_DEFAULTS.primary),
    secondary: method(s.secondary, VC_DEFAULTS.secondary),
    blendWeightPct: num(s.blendWeightPct, VC_DEFAULTS.blendWeightPct, 0, 100),
    activeTab: tab(s.activeTab, VC_DEFAULTS.activeTab),

    revenue: num(s.revenue, VC_DEFAULTS.revenue, 0, 1e12),
    ebitda: num(s.ebitda, VC_DEFAULTS.ebitda, -1e12, 1e12),
    netDebt: num(s.netDebt, VC_DEFAULTS.netDebt, -1e12, 1e12),
    totalAssets: num(s.totalAssets, VC_DEFAULTS.totalAssets, 0, 1e12),
    totalLiabilities: num(s.totalLiabilities, VC_DEFAULTS.totalLiabilities, 0, 1e12),
    users: num(s.users, VC_DEFAULTS.users, 0, 1e12),

    scorecardFloor: num(s.scorecardFloor, VC_DEFAULTS.scorecardFloor, 0, 1e12),
    berkusFactors: berkus,
    berkusBenchmark: num(s.berkusBenchmark, VC_DEFAULTS.berkusBenchmark, 0, 1e12),

    evSalesMultiple: num(s.evSalesMultiple, VC_DEFAULTS.evSalesMultiple, 0, 200),
    evPerUser: num(s.evPerUser, VC_DEFAULTS.evPerUser, 0, 1_000_000),
    evEbitdaMultiple: num(s.evEbitdaMultiple, VC_DEFAULTS.evEbitdaMultiple, 0, 200),

    dcfFcf: num(s.dcfFcf, VC_DEFAULTS.dcfFcf, -1e12, 1e12),
    dcfGrowthPct: num(s.dcfGrowthPct, VC_DEFAULTS.dcfGrowthPct, -50, 200),
    dcfWaccPct: num(s.dcfWaccPct, VC_DEFAULTS.dcfWaccPct, 1, 100),
    dcfTerminalMode: (VC_TERMINAL_MODES as readonly string[]).includes(s.dcfTerminalMode as string)
      ? (s.dcfTerminalMode as VcTerminalMode)
      : VC_DEFAULTS.dcfTerminalMode,
    dcfTerminalMultiple: num(s.dcfTerminalMultiple, VC_DEFAULTS.dcfTerminalMultiple, 0, 200),

    liquidationHaircutPct: num(s.liquidationHaircutPct, VC_DEFAULTS.liquidationHaircutPct, 0, 100),
    replacementPremiumPct: num(s.replacementPremiumPct, VC_DEFAULTS.replacementPremiumPct, 0, 500),

    tam: num(s.tam, VC_DEFAULTS.tam, 0, 1e15),
    tamPenetrationPct: num(s.tamPenetrationPct, VC_DEFAULTS.tamPenetrationPct, 0, 100),
    tamShareOfEV: num(s.tamShareOfEV, VC_DEFAULTS.tamShareOfEV, 0, 100),

    sensBaseWaccPct: num(s.sensBaseWaccPct, VC_DEFAULTS.sensBaseWaccPct, 1, 100),
    sensBaseGrowthPct: num(s.sensBaseGrowthPct, VC_DEFAULTS.sensBaseGrowthPct, -50, 200),
    sensBaseRevenue: num(s.sensBaseRevenue, VC_DEFAULTS.sensBaseRevenue, 0, 1e12),
  };
}

/* ═══════════════════════════════ Valuation engine ═══════════════════════════════ */
export interface VcRow { year: number; fcf: number; discount: number; pv: number }

export interface VcResult {
  value: number;
  /** Short human-readable formula, shown under each output. */
  detail: string;
  /** Present-value rows for the DCF table (only populated by the DCF engine). */
  rows?: VcRow[];
  /** Terminal value share, for the DCF detail line. */
  terminalPv?: number;
}

const NPV_OF_TERMINAL_NOTE = (mode: string, mult: number) => `Terminal factor: ${mode} @ ${mult}x`;

/** Discrete 5-year DCF: projects 5 years of FCF, discounts at WACC, adds a discounted terminal value. */
function dcfEngine(d: ValuationCalculatorData): VcResult {
  const g = d.dcfGrowthPct / 100;
  const r = d.dcfWaccPct / 100;
  let fcf = d.dcfFcf;
  let pvSum = 0;
  const rows: VcRow[] = [];
  for (let y = 1; y <= 5; y++) {
    fcf = fcf * (1 + g);
    const discount = 1 / Math.pow(1 + r, y);
    const pv = fcf * discount;
    pvSum += pv;
    rows.push({ year: y, fcf, discount, pv });
  }
  // Terminal value derived from the selected factor applied to the year-5 metric.
  const year5Fcf = rows[4].fcf;
  const year5Revenue = d.revenue * Math.pow(1 + g, 5);
  const year5Ebitda = d.ebitda * Math.pow(1 + g, 5);
  let terminal: number;
  if (d.dcfTerminalMode === "EV/Sales") terminal = year5Revenue * d.dcfTerminalMultiple;
  else if (d.dcfTerminalMode === "EV/EBITDA") terminal = year5Ebitda * d.dcfTerminalMultiple;
  else if (d.dcfTerminalMode === "P/E Multiple") terminal = year5Fcf * d.dcfTerminalMultiple;
  else terminal = (d.totalAssets - d.totalLiabilities) * d.dcfTerminalMultiple;
  const terminalPv = terminal / Math.pow(1 + r, 5);
  return {
    value: pvSum + terminalPv,
    detail: `Σ PV(5yr FCF @ ${d.dcfWaccPct}% WACC, growth ${d.dcfGrowthPct}%) + PV(Terminal · ${NPV_OF_TERMINAL_NOTE(d.dcfTerminalMode, d.dcfTerminalMultiple)})`,
    rows,
    terminalPv,
  };
}

/** Evaluates one method against the current inputs. Pure and shared by the app and both exporters. */
export function evaluateMethod(id: MethodId, d: ValuationCalculatorData): VcResult {
  switch (id) {
    case "scorecard": {
      const layers = VC_BERKUS_LAYERS.reduce((s, l) => s + (d.berkusFactors[l.key] ?? 0), 0);
      return {
        value: d.scorecardFloor + layers,
        detail: `Base idea floor value + ${VC_BERKUS_LAYERS.length} calibration layers (max ${vcMoney(500_000, vcSymbol(d.currency, d.customCurrencyCode))} each)`,
      };
    }
    case "berkus": {
      // Operational inverse of the scorecard: the benchmark anchors the layers, so the
      // inverse view re-expresses the scorecard as a validation check against it.
      const layers = VC_BERKUS_LAYERS.reduce((s, l) => s + (d.berkusFactors[l.key] ?? 0), 0);
      const scorecardValue = d.scorecardFloor + layers;
      const benchmark = d.berkusBenchmark || scorecardValue;
      return {
        value: benchmark,
        detail: `Inverse validation anchor — benchmark vs. scorecard build of ${vcMoney(scorecardValue, vcSymbol(d.currency, d.customCurrencyCode))}`,
      };
    }
    case "ev-sales": {
      const userValue = d.users * d.evPerUser;
      return {
        value: d.revenue * d.evSalesMultiple,
        detail: d.users > 0
          ? `Revenue × ${d.evSalesMultiple}x  ·  EV/User sub-view: ${vcMoney(userValue, vcSymbol(d.currency, d.customCurrencyCode))} (${d.evPerUser}/user × ${d.users.toLocaleString("en-US")} users)`
          : `Revenue × ${d.evSalesMultiple}x`,
      };
    }
    case "ev-ebitda": {
      const ev = d.ebitda * d.evEbitdaMultiple;
      return { value: ev - d.netDebt, detail: `EV ${vcMoney(ev, vcSymbol(d.currency, d.customCurrencyCode))} (EBITDA × ${d.evEbitdaMultiple}x) − Net Debt ${vcMoney(d.netDebt, vcSymbol(d.currency, d.customCurrencyCode))} = Equity` };
    }
    case "price-to-book": {
      return { value: d.totalAssets - d.totalLiabilities, detail: `Total Assets − Total Liabilities (Net Book Value)` };
    }
    case "liquidation": {
      const haircut = d.totalAssets * (1 - d.liquidationHaircutPct / 100);
      return { value: haircut - d.totalLiabilities, detail: `Assets × (1 − ${d.liquidationHaircutPct}% haircut) − Liabilities = liquidation cash floor` };
    }
    case "tam": {
      const svc = d.tam * (d.tamPenetrationPct / 100);
      return { value: svc * (d.tamShareOfEV / 100), detail: `TAM × ${d.tamPenetrationPct}% penetration × ${d.tamShareOfEV}% share of EV` };
    }
    case "replacement-cost": {
      return { value: (d.totalAssets - d.totalLiabilities) * (1 + d.replacementPremiumPct / 100), detail: `Core Net Book Value × (1 + ${d.replacementPremiumPct}% replication premium)` };
    }
    case "nbv-replacement": {
      return { value: (d.totalAssets - d.totalLiabilities) * (1 + d.replacementPremiumPct / 100), detail: `Replacement Cost value set as the adjusted ceiling anchor` };
    }
    case "nbv-liquidation": {
      const haircut = d.totalAssets * (1 - d.liquidationHaircutPct / 100);
      return { value: haircut - d.totalLiabilities, detail: `Liquidation Value linked as the lower asset-protection floor anchor` };
    }
    case "dcf":
      return dcfEngine(d);
    default:
      return { value: 0, detail: "" };
  }
}

/** Blended valuation from the two engine selections and the weight split. */
export function blendedValuation(d: ValuationCalculatorData): number {
  const p = evaluateMethod(d.primary, d).value;
  const s = evaluateMethod(d.secondary, d).value;
  const w = d.blendWeightPct / 100;
  return p * w + s * (1 - w);
}

/** 5×5 sensitivity grid: WACC columns × growth/revenue rows. */
export interface SensCell { label: string; value: number; isBase: boolean }
export function sensitivityGrid(d: ValuationCalculatorData): { cols: SensCell[]; rows: SensCell[]; cells: SensCell[][] } {
  const waccSteps = [-4, -2, 0, 2, 4];
  const growthSteps = [-8, -4, 0, 4, 8];
  const revShocks = [0.75, 0.9, 1, 1.1, 1.25];
  const cols = waccSteps.map(s => {
    const wacc = clamp(d.sensBaseWaccPct + s, 1, 100);
    return { label: `${wacc.toFixed(0)}%`, value: wacc, isBase: s === 0 };
  });
  const rows = growthSteps.map((s, i) => {
    const growth = d.sensBaseGrowthPct + s;
    return { label: `${growth > 0 ? "+" : ""}${growth}% growth · ${(revShocks[i] * 100).toFixed(0)}% rev`, value: growth, isBase: s === 0 && i === 2 };
  });
  const cells = rows.map((row, ri) => cols.map((col, ci) => {
    const wacc = col.value;
    const growth = row.value;
    const r = wacc / 100, g = growth / 100;
    const rev = d.sensBaseRevenue * revShocks[ri];
    let fcf = d.dcfFcf;
    let pv = 0;
    for (let y = 1; y <= 5; y++) {
      fcf = fcf * (1 + g);
      pv += fcf / Math.pow(1 + r, y);
    }
    const year5Ebitda = d.ebitda * (1 + g) ** 5;
    const terminal = (year5Ebitda * d.dcfTerminalMultiple + rev * d.evSalesMultiple) / 2;
    pv += terminal / Math.pow(1 + r, 5);
    return { label: "", value: pv, isBase: ri === 2 && ci === 2 };
  }));
  return { cols, rows, cells };
}

/* ═══════════════════════════════ UI primitives ═══════════════════════════════ */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-subtitle">{hint}</p>}
    </div>
  );
}

function NumInput({ label, value, onChange, hint, min = 0, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; hint?: string; min?: number; step?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number" min={min} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-ink"
      />
    </Field>
  );
}

function Select<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly T[]; onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value} onChange={e => onChange(e.target.value as T)} aria-label={label}
        className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

function Card({ title, note, children, className }: { title?: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-card p-5", className)}>
      {title && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em]">{title}</p>
          {note && <p className="text-[11px] text-subtitle">{note}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════ App ═══════════════════════════════ */
export function ValuationCalculator({ data: raw, onChange, live }: AppProps) {
  const d = useMemo(() => normalizeData(raw), [raw]);
  const upd = (u: Partial<ValuationCalculatorData>) => onChange({ ...d, ...u });
  const sym = vcSymbol(d.currency, d.customCurrencyCode);
  const token = vcToken(d.currency, d.customCurrencyCode);
  const M = (v: number) => vcMoney(v, sym);

  const [showSens, setShowSens] = useState(false);

  const primary = useMemo(() => evaluateMethod(d.primary, d), [d]);
  const secondary = useMemo(() => evaluateMethod(d.secondary, d), [d]);
  const blend = useMemo(() => blendedValuation(d), [d]);
  const sens = useMemo(() => sensitivityGrid(d), [d]);

  const methodOptions = VC_METHODS.map(m => `${m.n}. ${m.label}`) as string[];
  const toId = (label: string): MethodId => VC_METHODS.find(m => `${m.n}. ${m.label}` === label)!.id;

  return (
    <div className="mx-auto max-w-[1200px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Valuation Multi-Engine Calculator — model 11 valuation variations across five engine blocks, then
          blend any two engines by weight to produce a combined assessment. Every figure recalculates live.
        </p>
      )}

      {/* ── Master selector ── */}
      <Card className="mb-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <Select label="Reporting Currency" value={d.currency} options={VC_CURRENCIES} onChange={v => upd({ currency: v })} />
          <Select label="Primary Method" value={`${VC_METHODS.find(m => m.id === d.primary)!.n}. ${VC_METHODS.find(m => m.id === d.primary)!.label}`}
            options={methodOptions} onChange={v => upd({ primary: toId(v) })} />
          <Select label="Secondary Method" value={`${VC_METHODS.find(m => m.id === d.secondary)!.n}. ${VC_METHODS.find(m => m.id === d.secondary)!.label}`}
            options={methodOptions} onChange={v => upd({ secondary: toId(v) })} />
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Blend Weight</label>
              <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-bold tabular-nums">
                {d.blendWeightPct}% / {100 - d.blendWeightPct}%
              </span>
            </div>
            <input
              type="range" min={0} max={100} step={5} value={d.blendWeightPct}
              onChange={e => upd({ blendWeightPct: Number(e.target.value) })}
              aria-label="Blend weight"
              className="w-full accent-[#15190d]"
            />
            <div className="mt-0.5 flex justify-between text-[10px] uppercase tracking-[0.04em] text-subtitle">
              <span>All Secondary</span><span>50 / 50</span><span>All Primary</span>
            </div>
            <p className="mt-1 text-[11px] text-subtitle">Allocation between Primary and Secondary.</p>
          </div>
        </div>
        {d.currency === "Custom" && (
          <div className="mt-4 max-w-[240px]">
            <Field label="Custom 3-Letter Code" hint="Prefixes every money value in the tool">
              <input
                value={d.customCurrencyCode}
                onChange={e => upd({ customCurrencyCode: e.target.value })}
                placeholder="X-V" maxLength={8} aria-label="Custom 3-letter code"
                className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm uppercase outline-none focus:border-ink"
              />
            </Field>
          </div>
        )}
      </Card>

      {/* ── Engine tabs ── */}
      <div className="mb-6 flex flex-wrap gap-2">
        {VC_TABS.map(t => (
          <button key={t.id} type="button" onClick={() => upd({ activeTab: t.id })} aria-pressed={d.activeTab === t.id}
            className={cn("rounded-full border px-4 py-1.5 text-[12px] font-medium transition",
              d.activeTab === t.id ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40")}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Shared fundamentals ── */}
      <Card title="Shared Fundamentals" note="Feed every engine below" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <NumInput label="Revenue" value={d.revenue} step={100_000} onChange={v => upd({ revenue: v })} />
          <NumInput label="EBITDA" value={d.ebitda} step={100_000} onChange={v => upd({ ebitda: v })} />
          <NumInput label="Net Debt" value={d.netDebt} step={100_000} onChange={v => upd({ netDebt: v })} />
          <NumInput label="Total Assets" value={d.totalAssets} step={100_000} onChange={v => upd({ totalAssets: v })} />
          <NumInput label="Total Liabilities" value={d.totalLiabilities} step={100_000} onChange={v => upd({ totalLiabilities: v })} />
          <NumInput label="Active Users" value={d.users} step={1_000} onChange={v => upd({ users: v })} />
        </div>
      </Card>

      {/* ══ TAB 1 · Qualitative Scorecards ══ */}
      {d.activeTab === "qualitative" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Method 1 · Scorecard Method">
            <NumInput label="Base Idea Floor Value" value={d.scorecardFloor} step={50_000} onChange={v => upd({ scorecardFloor: v })}
              hint="Starting floor before calibrations" />
            <div className="mt-4 flex flex-col gap-3">
              {VC_BERKUS_LAYERS.map(l => (
                <div key={l.key}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <label className="text-[12px] font-semibold">{l.label}</label>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-bold tabular-nums">
                      {M(d.berkusFactors[l.key] ?? 0)}
                    </span>
                  </div>
                  <input type="range" min={0} max={l.max} step={50_000} value={d.berkusFactors[l.key] ?? 0}
                    onChange={e => upd({ berkusFactors: { ...d.berkusFactors, [l.key]: Number(e.target.value) } })}
                    aria-label={l.label} className="w-full accent-[#15190d]" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Scorecard Value</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("scorecard", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">
              Floor + up to {M(500_000)} each for team, prototype/IP, strategic partners, scaling leverage and risk mitigation.
            </p>
          </Card>

          <Card title="Method 5 · Berkus Method (Scorecard Inverse)">
            <p className="mb-4 text-[12px] leading-relaxed text-subtitle">
              Explicitly marks and balances the scorecard framework as an operational inverse view of
              Method 1 — a validation benchmark to check the build against.
            </p>
            <div className="mb-4 rounded-xl bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Method 1 build (from this tab)</p>
              <p className="text-[22px] font-bold tabular-nums">{M(evaluateMethod("scorecard", d).value)}</p>
            </div>
            <NumInput label="Inverse Benchmark Value" value={d.berkusBenchmark} step={100_000}
              onChange={v => upd({ berkusBenchmark: v })}
              hint="0 = mirror the Method 1 build exactly" />
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Berkus Anchor</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("berkus", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">
              Delta vs. Method 1: {M(Math.abs(evaluateMethod("berkus", d).value - evaluateMethod("scorecard", d).value))}
            </p>
          </Card>
        </div>
      )}

      {/* ══ TAB 2 · Multiple-Based Sandbox ══ */}
      {d.activeTab === "multiples" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Method 2 · EV/Sales Multiple">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="Revenue" value={d.revenue} step={100_000} onChange={v => upd({ revenue: v })} />
              <NumInput label="EV/Sales Multiple" value={d.evSalesMultiple} step={0.5} onChange={v => upd({ evSalesMultiple: v })} />
            </div>
            <div className="mt-4 rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.06em]">EV / User Number</p>
                <button type="button" onClick={() => upd({ users: d.users > 0 ? 0 : 50_000 })}
                  aria-pressed={d.users > 0}
                  className={cn("rounded-full border px-3 py-1 text-[11px] font-medium transition",
                    d.users > 0 ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/40")}
                >{d.users > 0 ? "On" : "Off"}</button>
              </div>
              {d.users > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumInput label="EV per User" value={d.evPerUser} step={10} onChange={v => upd({ evPerUser: v })} />
                  <NumInput label="Active Users" value={d.users} step={1_000} onChange={v => upd({ users: v })} />
                </div>
              ) : (
                <p className="text-[12px] text-subtitle">Early-network valuation is switched off. Turn it on to value on active segment scaling.</p>
              )}
              {d.users > 0 && (
                <p className="mt-3 text-[12px] text-subtitle">
                  EV/User value: <span className="font-bold text-ink tabular-nums">{M(d.users * d.evPerUser)}</span>
                  {" "}· blended with revenue multiple below.
                </p>
              )}
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">EV/Sales Value</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("ev-sales", d).value)}</span>
            </div>
          </Card>

          <Card title="Method 3 · EV/EBITDA Multiple">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="EBITDA" value={d.ebitda} step={100_000} onChange={v => upd({ ebitda: v })} />
              <NumInput label="EV/EBITDA Multiple" value={d.evEbitdaMultiple} step={0.5} onChange={v => upd({ evEbitdaMultiple: v })} />
              <NumInput label="Net Debt" value={d.netDebt} step={100_000} onChange={v => upd({ netDebt: v })} />
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Equity Bridge</p>
                <div className="rounded-lg bg-white px-3 py-2 text-sm">
                  <p className="tabular-nums">EV {M(d.ebitda * d.evEbitdaMultiple)}</p>
                  <p className="tabular-nums text-subtitle">− Net Debt {M(d.netDebt)}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Equity Value</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("ev-ebitda", d).value)}</span>
            </div>
          </Card>
        </div>
      )}

      {/* ══ TAB 3 · Asset & Accounting Floors ══ */}
      {d.activeTab === "assets" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Method 4 · Price to Book (Net Book Value)">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="Total Assets" value={d.totalAssets} step={100_000} onChange={v => upd({ totalAssets: v })} />
              <NumInput label="Total Liabilities" value={d.totalLiabilities} step={100_000} onChange={v => upd({ totalLiabilities: v })} />
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Net Book Value</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("price-to-book", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">Direct calculation of Asset Value minus Total Liabilities.</p>
          </Card>

          <Card title="Method 7 · Liquidation Method">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="Total Assets" value={d.totalAssets} step={100_000} onChange={v => upd({ totalAssets: v })} />
              <NumInput label="Total Liabilities" value={d.totalLiabilities} step={100_000} onChange={v => upd({ totalLiabilities: v })} />
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-baseline justify-between">
                <label className="text-[12px] font-semibold">Distressed Asset Haircut</label>
                <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-bold tabular-nums">{d.liquidationHaircutPct}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={d.liquidationHaircutPct}
                onChange={e => upd({ liquidationHaircutPct: Number(e.target.value) })}
                aria-label="Distressed asset haircut" className="w-full accent-[#15190d]" />
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Liquidation Cash Floor</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("liquidation", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">Haircut applied to the asset base before liabilities are subtracted.</p>
          </Card>

          <Card title="Method 9 · Replacement Cost Method">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="Core Net Book Value" value={d.totalAssets - d.totalLiabilities} step={100_000} onChange={() => {}} hint="Assets − Liabilities" />
              <NumInput label="Replication Premium" value={d.replacementPremiumPct} step={5} onChange={v => upd({ replacementPremiumPct: v })} hint="% over NBV" />
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">Replication Cost</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("replacement-cost", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">A premium % applied to the Core Net Book Value.</p>
          </Card>

          <Card title="Methods 10 & 11 · NBV Anchors">
            <p className="mb-4 text-[12px] leading-relaxed text-subtitle">
              Method 10 formally sets the Replacement Cost value as an adjusted ceiling anchor. Method 11
              links the Liquidation Value as the lower asset-protection floor anchor.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-[12px] font-semibold">Ceiling · Method 10 (Replacement)</span>
                <span className="text-[17px] font-bold tabular-nums">{M(evaluateMethod("nbv-replacement", d).value)}</span>
              </div>
              <div className="flex items-baseline justify-between rounded-xl bg-white px-4 py-3">
                <span className="text-[12px] font-semibold">Floor · Method 11 (Liquidation)</span>
                <span className="text-[17px] font-bold tabular-nums">{M(evaluateMethod("nbv-liquidation", d).value)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-subtitle">
              Anchor band: {M(evaluateMethod("nbv-liquidation", d).value)} → {M(evaluateMethod("nbv-replacement", d).value)}
            </p>
          </Card>
        </div>
      )}

      {/* ══ TAB 4 · DCF ══ */}
      {d.activeTab === "dcf" && (
        <Card title="Method 6 · Discrete 5-Year DCF Engine">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <NumInput label="Year-1 Free Cash Flow" value={d.dcfFcf} step={100_000} onChange={v => upd({ dcfFcf: v })} />
            <NumInput label="Annual Growth %" value={d.dcfGrowthPct} step={1} onChange={v => upd({ dcfGrowthPct: v })} />
            <NumInput label="WACC %" value={d.dcfWaccPct} step={1} onChange={v => upd({ dcfWaccPct: v })} />
            <Select label="Terminal Factor" value={d.dcfTerminalMode} options={VC_TERMINAL_MODES} onChange={v => upd({ dcfTerminalMode: v })} />
            <NumInput label="Terminal Multiple" value={d.dcfTerminalMultiple} step={0.5} onChange={v => upd({ dcfTerminalMultiple: v })} />
          </div>

          <div className="mt-5 overflow-x-auto touch-scroll">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[rgba(117,117,117,0.2)]">
                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Year</th>
                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Projected FCF</th>
                  <th className="py-2 pr-4 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Discount Factor</th>
                  <th className="py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Present Value</th>
                </tr>
              </thead>
              <tbody>
                {(evaluateMethod("dcf", d).rows ?? []).map(r => (
                  <tr key={r.year} className="border-b border-[rgba(117,117,117,0.1)]">
                    <td className="py-2 pr-4 text-[13px] font-medium">Year {r.year}</td>
                    <td className="py-2 pr-4 text-[13px] tabular-nums">{M(r.fcf)}</td>
                    <td className="py-2 pr-4 text-[13px] tabular-nums text-subtitle">{r.discount.toFixed(4)}</td>
                    <td className="py-2 text-[13px] tabular-nums font-semibold">{M(r.pv)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-4 text-[13px] font-medium">Terminal (PV)</td>
                  <td className="py-2 pr-4 text-[13px] tabular-nums text-subtitle">—</td>
                  <td className="py-2 pr-4 text-[13px] tabular-nums text-subtitle">Year 5</td>
                  <td className="py-2 text-[13px] tabular-nums font-semibold">{M(evaluateMethod("dcf", d).terminalPv ?? 0)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-2 pr-4 text-[12px] font-bold uppercase tracking-[0.06em]" colSpan={3}>Enterprise Value</td>
                  <td className="py-2 text-[15px] font-bold tabular-nums">{M(evaluateMethod("dcf", d).value)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-subtitle">{dcfEngine(d).detail}</p>
        </Card>
      )}

      {/* ══ TAB 5 · Sensitivity & TAM ══ */}
      {d.activeTab === "sensitivity" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Method 8 · Replacement Cost Method (EV/TAM)">
            <div className="grid gap-4 sm:grid-cols-3">
              <NumInput label="Total Addressable Market" value={d.tam} step={100_000_000} onChange={v => upd({ tam: v })} />
              <NumInput label="Target Penetration %" value={d.tamPenetrationPct} step={1} onChange={v => upd({ tamPenetrationPct: v })} />
              <NumInput label="Share of EV %" value={d.tamShareOfEV} step={1} onChange={v => upd({ tamShareOfEV: v })} />
            </div>
            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Serviceable value (TAM × penetration)</p>
              <p className="text-[18px] font-bold tabular-nums">{M(d.tam * (d.tamPenetrationPct / 100))}</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span className="text-[12px] uppercase tracking-[0.06em]">EV/TAM Value</span>
              <span className="text-[20px] font-bold tabular-nums">{M(evaluateMethod("tam", d).value)}</span>
            </div>
            <p className="mt-2 text-[11px] text-subtitle">Valuation as a function of total addressable market penetration.</p>
          </Card>

          <Card title="Sensitivity Quality Grid" note="WACC × Revenue/Growth shocks">
            <p className="mb-4 text-[12px] leading-relaxed text-subtitle">
              5×5 cross-check matrix for the multiple-based (Method 2) and DCF (Method 6) engines.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumInput label="Base WACC %" value={d.sensBaseWaccPct} step={1} onChange={v => upd({ sensBaseWaccPct: v })} />
              <NumInput label="Base Growth %" value={d.sensBaseGrowthPct} step={1} onChange={v => upd({ sensBaseGrowthPct: v })} />
              <NumInput label="Base Revenue" value={d.sensBaseRevenue} step={100_000} onChange={v => upd({ sensBaseRevenue: v })} />
              <div className="flex items-end">
                <button type="button" onClick={() => setShowSens(s => !s)}
                  className="w-full rounded-full border border-ink bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"
                >{showSens ? "Hide grid" : "Run sensitivity grid"}</button>
              </div>
            </div>
            {showSens && (
              <div className="mt-4 overflow-x-auto touch-scroll">
                <table className="w-full min-w-[520px] border-collapse text-right">
                  <thead>
                    <tr>
                      <th className="pb-2 pr-2 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Growth · Revenue</th>
                      {sens.cols.map(c => (
                        <th key={c.label} className={cn("pb-2 text-[10px] font-bold tabular-nums", c.isBase ? "text-ink" : "text-subtitle")}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sens.rows.map((row, ri) => (
                      <tr key={row.label} className="border-t border-[rgba(117,117,117,0.1)]">
                        <td className={cn("py-2 pr-2 text-left text-[11px] font-medium", row.isBase ? "text-ink" : "text-subtitle")}>{row.label}</td>
                        {sens.cells[ri].map((cell, ci) => (
                          <td key={ci} className={cn("py-2 text-[12px] tabular-nums", cell.isBase ? "font-bold text-ink" : "text-subtitle")}>
                            {M(Math.round(cell.value))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Real-time master dashboard ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card title="Engine Outputs" note="Standalone values for the selected pair">
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Primary · {VC_METHOD_LABEL[d.primary]}</p>
              <p className="mt-1 text-[20px] font-bold tabular-nums">{M(primary.value)}</p>
              <p className="mt-1 text-[11px] text-subtitle">{primary.detail}</p>
            </div>
            <div className="rounded-xl bg-white p-4">
              <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Secondary · {VC_METHOD_LABEL[d.secondary]}</p>
              <p className="mt-1 text-[20px] font-bold tabular-nums">{M(secondary.value)}</p>
              <p className="mt-1 text-[11px] text-subtitle">{secondary.detail}</p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3">
              <span className="text-[12px] font-medium">Weighting split</span>
              <span className="text-[13px] font-bold tabular-nums">{d.blendWeightPct}% / {100 - d.blendWeightPct}%</span>
            </div>
          </div>
        </Card>

        <div className="rounded-2xl bg-ink p-6 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] opacity-60">Blended Combined Valuation Assessment</p>
          <p className="mt-3 text-[34px] font-bold leading-none tabular-nums">{M(blend)}</p>
          <p className="mt-3 border-t border-white/10 pt-3 text-[12px] leading-relaxed opacity-90">
            ({d.blendWeightPct}% × {VC_METHOD_LABEL[d.primary]}) + ({100 - d.blendWeightPct}% × {VC_METHOD_LABEL[d.secondary]})
          </p>
          <p className="mt-1 text-[11px] opacity-60">Reporting currency: {token}</p>
        </div>
      </div>
    </div>
  );
}
