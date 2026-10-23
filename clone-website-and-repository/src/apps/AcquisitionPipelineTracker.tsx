/**
 * ────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy
 * ────────────────────────────────────────────────────────────────────
 * Consulting Domain : B2B Matchmaking/Trading + Micro M&A/Funding Consultancy [M&A & Trading]
 * Domain Key        : micro_ma_matchmaking
 * Official Title    : Acquisition Pipeline & Deal Tracker Engine
 * Operational Purpose: 5-stage buyout pipeline: calibrate the buy box, track sourcing funnel, evaluate targets via CIM, structure LOIs, and close through diligence.
 */

import { useMemo } from "react";
import { formatCurrency } from "../data";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { useStore } from "../store";
import { cn } from "../utils/cn";

// ── Types ──

type SourcingChannel = "Off-Market" | "Broker";
type MaturityLevel = "Owner-Dependent" | "Key-Person Risk" | "Delegated Team" | "Autonomous";
type ConcentrationRisk = "Low" | "Moderate" | "High" | "Critical";
type HandoverMode = "Immediate" | "Transition (3-6mo)" | "Earn-Out (12mo+)" | "Equity Roll-Over";

interface BuyBox {
  downPayment: number;
  targetCashFlow: number;
  hoursPerWeek: number;
  geography: string;
  industry: string;
  timeDedication: string;
}

interface SourcingFunnel {
  marketVolume: number;
  fitsBuyBox: number;
  passesQuestions: number;
  worthOffer: number;
}

interface CimChecks {
  financials3yr: boolean;
  managementAnalysis: boolean;
  fluffIdentifier: boolean;
}

interface AcquisitionTarget {
  id: string;
  companyName: string;
  channel: SourcingChannel;
  retirementMotivation: string;
  managementMaturity: MaturityLevel;
  concentrationRisk: ConcentrationRisk;
  cim: CimChecks;
  notes: string;
}

interface DealStructure {
  sellerPainPoint: string;
  loiSolution: string;
  handoverMode: HandoverMode;
}

interface DiligenceChecklist {
  // Free diligence
  siteVisit: boolean;
  employeeInterviews: boolean;
  customerEmulation: boolean;
  // Professional diligence
  cpaQofE: boolean;
  legalContracts: boolean;
  bankDocs: boolean;
  // Closing bank ledger
  closingStep1: boolean;
  closingStep2: boolean;
  closingStep3: boolean;
}

export type ConciergePaidBy = "lender" | "buyer" | "none";

export interface VettingChecklist {
  rateBaselineLocked: boolean;
  industryOpenLenders: boolean;
  referralFeeFlowClear: boolean;
  termSheetTimed: boolean;
  preQualLetter: boolean;
}

export interface DebtStressTest {
  loanPrincipal: number;
  termYears: number;
  rateA: number;
  rateB: number;
  conciergeFeePct: number;
  conciergePaidBy: ConciergePaidBy;
  vettingChecklist: VettingChecklist;
}

export interface AcquisitionPipelineData {
  currency: string;
  customCurrency: string;
  activeTab: string;
  buyBox: BuyBox;
  prepMilestones: boolean[];
  sourcingFunnel: SourcingFunnel;
  activeTargets: AcquisitionTarget[];
  dealStructure: DealStructure;
  diligence: DiligenceChecklist;
  debtStressTest: DebtStressTest;
}

// ── Constants ──

const TABS = [
  { id: "strategy", label: "Strategy & Buy Box" },
  { id: "sourcing", label: "Sourcing Funnel" },
  { id: "targets", label: "Target Analysis" },
  { id: "debt", label: "Debt Optimization & Stress Test" },
  { id: "closing", label: "LOI & Diligence" },
] as const;

/** The 5 deal-structuring gates to clear before going under contract. */
export const VETTING_GATES: { key: keyof VettingChecklist; label: string; hint: string }[] = [
  { key: "rateBaselineLocked", label: "Rate Quote Baseline Locked?", hint: "On an un-shopped 10-year term, verify you are not being quoted an unoptimized premium baseline rate." },
  { key: "industryOpenLenders", label: "Industry-Open Lenders Identified?", hint: "Verify your specific target niche (e.g. laundromat, industrial facility) matches the lender's focus profile." },
  { key: "referralFeeFlowClear", label: "Referral Fee Flow Clear?", hint: "Disclose whether the capital arranger's fee is built into the bank's volume pricing or paid directly." },
  { key: "termSheetTimed", label: "Term Sheet Delivery Timed?", hint: "Term sheet must arrive during initial underwriting, not late into phase 3 diligence under contract." },
  { key: "preQualLetter", label: "Pre-Qualification Letter Generated?", hint: "Lock pricing leverage with a formal pre-qualification file before making active purchase offers." },
];

export const CONCIERGE_PAID_BY: { value: ConciergePaidBy; label: string; hint: string }[] = [
  { value: "lender", label: "Lender-Paid", hint: "Built into the bank's volume pricing" },
  { value: "buyer", label: "Buyer-Paid", hint: "Paid directly out of pocket at close" },
  { value: "none", label: "No Fee", hint: "Direct-to-lender, no arranger in the flow" },
];

/** Finder / concierge fee steps, 1.0% → 1.5%. */
export const CONCIERGE_FEE_STEPS = [1.0, 1.25, 1.5] as const;

const PREP_MILESTONES = [
  "Define Buy Box & Capital Stack",
  "Build Sourcing Channels & Broker Network",
  "Prepare Diligence Framework & Team",
  "Secure Financing Pre-Approval & LOI Template",
];

const HANDOVER_MODES: HandoverMode[] = ["Immediate", "Transition (3-6mo)", "Earn-Out (12mo+)", "Equity Roll-Over"];

const CHANNELS: SourcingChannel[] = ["Off-Market", "Broker"];
const MATURITIES: MaturityLevel[] = ["Owner-Dependent", "Key-Person Risk", "Delegated Team", "Autonomous"];
const CONCENTRATIONS: ConcentrationRisk[] = ["Low", "Moderate", "High", "Critical"];

// Currency config
const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "INR", "SGD", "AED"] as const;

// Default data
const DEFAULT_DATA: AcquisitionPipelineData = {
  currency: "",
  customCurrency: "",
  activeTab: "strategy",
  buyBox: {
    downPayment: 250000,
    targetCashFlow: 500000,
    hoursPerWeek: 20,
    geography: "Southeast US",
    industry: "B2B Services, recurring revenue",
    timeDedication: "Nights & weekends + 1 day/week",
  },
  prepMilestones: [false, false, false, false],
  sourcingFunnel: {
    marketVolume: 200,
    fitsBuyBox: 40,
    passesQuestions: 12,
    worthOffer: 3,
  },
  activeTargets: [],
  dealStructure: {
    sellerPainPoint: "",
    loiSolution: "",
    handoverMode: "Transition (3-6mo)",
  },
  diligence: {
    siteVisit: false,
    employeeInterviews: false,
    customerEmulation: false,
    cpaQofE: false,
    legalContracts: false,
    bankDocs: false,
    closingStep1: false,
    closingStep2: false,
    closingStep3: false,
  },
  debtStressTest: {
    loanPrincipal: 3000000,
    termYears: 10,
    rateA: 9,
    rateB: 6,
    conciergeFeePct: 1.25,
    conciergePaidBy: "lender",
    vettingChecklist: {
      rateBaselineLocked: false,
      industryOpenLenders: false,
      referralFeeFlowClear: false,
      termSheetTimed: false,
      preQualLetter: false,
    },
  },
};

// ── Formatting helpers ──

export function pipelineMoney(v: number, code: string): string {
  if (!v && v !== 0) return "—";
  if (v === 0) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 0 }).format(0);
    } catch {
      return `${code || "USD"} 0`;
    }
  }
  try {
    return formatCurrency(v, code);
  } catch {
    const c = (code || "").trim().toUpperCase() || "USD";
    return `${c} ` + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
  }
}

export function resolvePipelineCurrency(override: string, inherited: string): string {
  const o = (override || "").trim().toUpperCase();
  if (o) return o;
  const i = (inherited || "").trim().toUpperCase();
  return i || "USD";
}

export function effectivePipelineCurrency(d: AcquisitionPipelineData, inherited = "USD"): string {
  const cur = (d.currency || "").trim().toUpperCase();
  if (cur === "CUSTOM" || cur === "CUSTOM_CURRENCY") {
    const custom = (d.customCurrency || "").trim().toUpperCase();
    return custom || inherited || "USD";
  }
  if (cur && cur !== "INHERIT") return cur;
  return (inherited || "USD").trim().toUpperCase() || "USD";
}

// ── Defensive parsing ──

export function normalizeAcquisitionPipeline(raw: unknown): AcquisitionPipelineData {
  const s: Record<string, unknown> = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const num = (v: unknown, def: number, lo = -1e12, hi = 1e15): number => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def;
  };
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const bool = (v: unknown) => v === true;

  const buyBoxRaw = (s.buyBox && typeof s.buyBox === "object" ? s.buyBox : {}) as Record<string, unknown>;
  const funnelRaw = (s.sourcingFunnel && typeof s.sourcingFunnel === "object" ? s.sourcingFunnel : {}) as Record<string, unknown>;
  const dealRaw = (s.dealStructure && typeof s.dealStructure === "object" ? s.dealStructure : {}) as Record<string, unknown>;
  const dilRaw = (s.diligenceChecklist || s.diligence) && typeof (s.diligenceChecklist || s.diligence) === "object" ? (s.diligenceChecklist || s.diligence) as Record<string, unknown> : (s.diligence && typeof s.diligence === "object" ? s.diligence as Record<string, unknown> : {});

  // Legacy key mapping for activeTargets items
  let rawTargets: unknown[] = [];
  if (Array.isArray(s.activeTargets)) rawTargets = s.activeTargets;
  else if (Array.isArray(s.targets)) rawTargets = s.targets as unknown[];

  const activeTargets: AcquisitionTarget[] = rawTargets.flatMap((it, i): AcquisitionTarget[] => {
    if (!it || typeof it !== "object") return [];
    const o = it as Record<string, unknown>;
    const cimRaw = (o.cim || o.readingCim || {}) as Record<string, unknown>;
    return [{
      id: typeof o.id === "string" && o.id ? o.id : `tgt-${i}`,
      companyName: str(o.companyName) || str(o.name) || str(o.targetName),
      channel: CHANNELS.includes(o.channel as SourcingChannel) ? o.channel as SourcingChannel : "Off-Market",
      retirementMotivation: str(o.retirementMotivation) || str(o.retirement) || str(o.motivation),
      managementMaturity: MATURITIES.includes(o.managementMaturity as MaturityLevel) ? o.managementMaturity as MaturityLevel : "Owner-Dependent",
      concentrationRisk: CONCENTRATIONS.includes(o.concentrationRisk as ConcentrationRisk) ? o.concentrationRisk as ConcentrationRisk : "Moderate",
      cim: {
        financials3yr: bool(cimRaw.financials3yr),
        managementAnalysis: bool(cimRaw.managementAnalysis),
        fluffIdentifier: bool(cimRaw.fluffIdentifier),
      },
      notes: str(o.notes),
    }];
  });

  const mipRaw = s.prepMilestones;
  let prepMilestones: boolean[] = [...DEFAULT_DATA.prepMilestones];
  if (Array.isArray(mipRaw)) {
    prepMilestones = PREP_MILESTONES.map((_, i) => mipRaw[i] === true);
  }

  // Debt stress test — tolerates absent/legacy sessions and clamps every numeric to a sane band.
  const debtRaw = (s.debtStressTest && typeof s.debtStressTest === "object" ? s.debtStressTest : {}) as Record<string, unknown>;
  const vetRaw = (debtRaw.vettingChecklist && typeof debtRaw.vettingChecklist === "object" ? debtRaw.vettingChecklist : {}) as Record<string, unknown>;
  const paidByRaw = debtRaw.conciergePaidBy;
  const debtStressTest: DebtStressTest = {
    loanPrincipal: num(debtRaw.loanPrincipal, DEFAULT_DATA.debtStressTest.loanPrincipal, 0, 1e15),
    termYears: num(debtRaw.termYears, DEFAULT_DATA.debtStressTest.termYears, 1, 50),
    rateA: num(debtRaw.rateA, DEFAULT_DATA.debtStressTest.rateA, 0, 100),
    rateB: num(debtRaw.rateB, DEFAULT_DATA.debtStressTest.rateB, 0, 100),
    conciergeFeePct: num(debtRaw.conciergeFeePct, DEFAULT_DATA.debtStressTest.conciergeFeePct, 0, 100),
    conciergePaidBy: paidByRaw === "lender" || paidByRaw === "buyer" || paidByRaw === "none"
      ? paidByRaw
      : DEFAULT_DATA.debtStressTest.conciergePaidBy,
    vettingChecklist: {
      rateBaselineLocked: bool(vetRaw.rateBaselineLocked),
      industryOpenLenders: bool(vetRaw.industryOpenLenders),
      referralFeeFlowClear: bool(vetRaw.referralFeeFlowClear),
      termSheetTimed: bool(vetRaw.termSheetTimed),
      preQualLetter: bool(vetRaw.preQualLetter),
    },
  };

  return {
    currency: typeof s.currency === "string" ? s.currency.slice(0, 8) : "",
    customCurrency: typeof s.customCurrency === "string" ? s.customCurrency.slice(0, 8) : "",
    activeTab: typeof s.activeTab === "string" && TABS.some(t => t.id === s.activeTab) ? s.activeTab as string : "strategy",
    buyBox: {
      downPayment: num(buyBoxRaw.downPayment, DEFAULT_DATA.buyBox.downPayment),
      targetCashFlow: num(buyBoxRaw.targetCashFlow, DEFAULT_DATA.buyBox.targetCashFlow),
      hoursPerWeek: num(buyBoxRaw.hoursPerWeek, DEFAULT_DATA.buyBox.hoursPerWeek, 0, 168),
      geography: str(buyBoxRaw.geography) || str(buyBoxRaw.targetGeography) || DEFAULT_DATA.buyBox.geography,
      industry: str(buyBoxRaw.industry) || str(buyBoxRaw.targetIndustry) || DEFAULT_DATA.buyBox.industry,
      timeDedication: str(buyBoxRaw.timeDedication) || DEFAULT_DATA.buyBox.timeDedication,
    },
    prepMilestones,
    sourcingFunnel: {
      marketVolume: num(funnelRaw.marketVolume ?? funnelRaw.totalMarketVolume, DEFAULT_DATA.sourcingFunnel.marketVolume, 0),
      fitsBuyBox: num(funnelRaw.fitsBuyBox, DEFAULT_DATA.sourcingFunnel.fitsBuyBox, 0),
      passesQuestions: num(funnelRaw.passesQuestions ?? funnelRaw.passesInitialQuestions, DEFAULT_DATA.sourcingFunnel.passesQuestions, 0),
      worthOffer: num(funnelRaw.worthOffer ?? funnelRaw.worthActiveOffer, DEFAULT_DATA.sourcingFunnel.worthOffer, 0),
    },
    activeTargets,
    dealStructure: {
      sellerPainPoint: str(dealRaw.sellerPainPoint) || str(dealRaw.sellerPrimaryPainPoint),
      loiSolution: str(dealRaw.loiSolution) || str(dealRaw.howLoiSolvesIt),
      handoverMode: HANDOVER_MODES.includes(dealRaw.handoverMode as HandoverMode) ? dealRaw.handoverMode as HandoverMode : DEFAULT_DATA.dealStructure.handoverMode,
    },
    diligence: {
      siteVisit: bool(dilRaw.siteVisit),
      employeeInterviews: bool(dilRaw.employeeInterviews),
      customerEmulation: bool(dilRaw.customerEmulation),
      cpaQofE: bool(dilRaw.cpaQofE),
      legalContracts: bool(dilRaw.legalContracts),
      bankDocs: bool(dilRaw.bankDocs),
      closingStep1: bool(dilRaw.closingStep1),
      closingStep2: bool(dilRaw.closingStep2),
      closingStep3: bool(dilRaw.closingStep3),
    },
    debtStressTest,
  };
}

// ── Amortization math engine ──

/**
 * Standard amortizing payment: P = L * [r(1+r)^n] / [(1+r)^n − 1].
 * Degrades to straight-line principal ÷ months when the annual rate is 0,
 * and returns 0 for non-positive principal or term so the UI never shows NaN.
 */
export function computeMonthlyPayment(principal: number, annualRate: number, years: number): number {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate) || !Number.isFinite(years)) return 0;
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r <= 0) return principal / n;
  const growth = Math.pow(1 + r, n);
  const denom = growth - 1;
  if (!Number.isFinite(growth) || denom <= 0) return principal / n;
  return (principal * (r * growth)) / denom;
}

export interface DebtScenario {
  rate: number;
  monthlyPayment: number;
  totalCost: number;
  totalInterest: number;
}

export interface DebtComparison {
  scenarioA: DebtScenario;
  scenarioB: DebtScenario;
  monthlyDelta: number;
  /** Scenario A total cost − Scenario B total cost. */
  totalSpread: number;
  interestSpread: number;
  conciergeFeeAmount: number;
  /** Out-of-pocket fee: zero unless the buyer pays it directly. */
  conciergeOutOfPocket: number;
  netSavings: number;
  gatesPassed: number;
}

export function computeDebtComparison(t: DebtStressTest): DebtComparison {
  const months = Math.max(0, t.termYears * 12);
  const build = (rate: number): DebtScenario => {
    const monthlyPayment = computeMonthlyPayment(t.loanPrincipal, rate, t.termYears);
    const totalCost = monthlyPayment * months;
    return { rate, monthlyPayment, totalCost, totalInterest: Math.max(0, totalCost - t.loanPrincipal) };
  };
  const scenarioA = build(t.rateA);
  const scenarioB = build(t.rateB);
  const conciergeFeeAmount = t.loanPrincipal * (t.conciergeFeePct / 100);
  const conciergeOutOfPocket = t.conciergePaidBy === "buyer" ? conciergeFeeAmount : 0;
  const totalSpread = scenarioA.totalCost - scenarioB.totalCost;
  return {
    scenarioA,
    scenarioB,
    monthlyDelta: scenarioA.monthlyPayment - scenarioB.monthlyPayment,
    totalSpread,
    interestSpread: scenarioA.totalInterest - scenarioB.totalInterest,
    conciergeFeeAmount,
    conciergeOutOfPocket,
    netSavings: totalSpread - conciergeOutOfPocket,
    gatesPassed: VETTING_GATES.filter(g => t.vettingChecklist[g.key]).length,
  };
}

// ── Funnel computation ──

interface FunnelBar { label: string; value: number; pct: number; color: string }

export function computeFunnelBars(f: SourcingFunnel): FunnelBar[] {
  const max = Math.max(f.marketVolume, 1);
  return [
    { label: "Market Volume Assessed", value: f.marketVolume, pct: (f.marketVolume / max) * 100, color: "bg-ink" },
    { label: "Fits Buy Box Filter", value: f.fitsBuyBox, pct: (f.fitsBuyBox / max) * 100, color: "bg-[#535862]" },
    { label: "Passes Initial Questions", value: f.passesQuestions, pct: (f.passesQuestions / max) * 100, color: "bg-[#9a9a9a]" },
    { label: "Worth an Active Offer", value: f.worthOffer, pct: (f.worthOffer / max) * 100, color: "bg-[#e5b838]" },
  ];
}

// ── CIM helpers ──

export function cimProgress(cim: CimChecks): number {
  return [cim.financials3yr, cim.managementAnalysis, cim.fluffIdentifier].filter(Boolean).length;
}

export function cimStageLabel(c: CimChecks): string {
  const n = cimProgress(c);
  if (n === 0) return "Not started";
  if (n === 1) return "In review";
  if (n === 2) return "Nearly done";
  return "Verified";
}

// ── UI atoms ──

const INPUT = "w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const LABEL = "mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle";

function Card({ title, note, children, className, action }: { title?: string; note?: React.ReactNode; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-hairline/40 bg-card p-5", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title && <p className="text-[13px] font-bold uppercase tracking-[0.06em]">{title}</p>}
            {note && <p className="mt-0.5 text-[11px] text-subtitle">{note}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={INPUT} aria-label={label} />
    </div>
  );
}

function NumField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input type="number" value={value || 0} step={step} onChange={e => onChange(Number(e.target.value) || 0)} aria-label={label} className={cn(INPUT, "tabular-nums")} />
    </div>
  );
}

function CheckRow({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 transition", checked ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.15)] bg-white hover:border-ink/40")}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 accent-ink" aria-label={label} />
      <span className="flex-1">
        <span className={cn("block text-[13px] font-semibold leading-tight", checked ? "text-white" : "text-ink")}>{label}</span>
        {hint && <span className={cn("text-[11px]", checked ? "text-white/60" : "text-subtitle")}>{hint}</span>}
      </span>
    </label>
  );
}

// ── Main Component ──

export function AcquisitionPipelineTracker({ data: raw, onChange, live }: AppProps) {
  const store = useStore();
  const d = useMemo(() => normalizeAcquisitionPipeline(raw), [raw]);

  // Currency: inherit from active project unless overridden
  const activeProjectCurrency = useMemo(() => {
    const projs = store.state.projects;
    if (!projs.length) return "USD";
    const latest = [...projs].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))[0];
    return latest?.feeCurrency || "USD";
  }, [store.state.projects]);

  const rawCur = (d.currency || "").trim();
  const isCustom = rawCur.toUpperCase() === "CUSTOM" || rawCur.toUpperCase() === "CUSTOM_CURRENCY";
  const currency = isCustom
    ? (d.customCurrency || "").trim().toUpperCase() || activeProjectCurrency
    : rawCur ? rawCur.toUpperCase() : activeProjectCurrency;

  const M = (v: number) => pipelineMoney(v, currency);
  const funnelBars = useMemo(() => computeFunnelBars(d.sourcingFunnel), [d.sourcingFunnel]);
  const upd = (u: Partial<AcquisitionPipelineData>) => onChange({ ...d, ...u });
  const updBuyBox = (k: keyof BuyBox, v: string | number) => upd({ buyBox: { ...d.buyBox, [k]: v } });
  const updFunnel = (k: keyof SourcingFunnel, v: number) => upd({ sourcingFunnel: { ...d.sourcingFunnel, [k]: v } });
  const updDiligence = (k: keyof DiligenceChecklist, v: boolean) => upd({ diligence: { ...d.diligence, [k]: v } });

  // Debt optimization bindings
  const debt = d.debtStressTest;
  const debtCalc = useMemo(() => computeDebtComparison(debt), [debt]);
  const updDebt = <K extends keyof DebtStressTest>(k: K, v: DebtStressTest[K]) =>
    upd({ debtStressTest: { ...debt, [k]: v } });
  const updVetting = (k: keyof VettingChecklist, v: boolean) =>
    upd({ debtStressTest: { ...debt, vettingChecklist: { ...debt.vettingChecklist, [k]: v } } });

  const setCurrencyPreset = (preset: string) => {
    if (preset === "inherit") upd({ currency: "", customCurrency: "" });
    else if (preset === "Custom") upd({ currency: "Custom", customCurrency: d.customCurrency || "" });
    else upd({ currency: preset, customCurrency: "" });
  };

  const addTarget = () => {
    const t: AcquisitionTarget = {
      id: generateId(),
      companyName: "",
      channel: "Off-Market",
      retirementMotivation: "",
      managementMaturity: "Owner-Dependent",
      concentrationRisk: "Moderate",
      cim: { financials3yr: false, managementAnalysis: false, fluffIdentifier: false },
      notes: "",
    };
    upd({ activeTargets: [...d.activeTargets, t] });
  };
  const rmTarget = (id: string) => upd({ activeTargets: d.activeTargets.filter(t => t.id !== id) });
  const updTarget = (id: string, patch: Partial<AcquisitionTarget>) =>
    upd({ activeTargets: d.activeTargets.map(t => t.id === id ? { ...t, ...patch } : t) });
  const updCim = (id: string, key: keyof CimChecks, val: boolean) => {
    const t = d.activeTargets.find(x => x.id === id);
    if (!t) return;
    updTarget(id, { cim: { ...t.cim, [key]: val } });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Acquisition Pipeline &amp; Deal Tracker — a 5-stage buyout playbook: calibrate your buy box, track sourcing flow, evaluate targets through the CIM, structure LOIs, and close via diligence
          in <span className="font-semibold text-ink">{currency}</span>.
        </p>
      )}

      {/* Currency Picker */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-hairline/40 bg-card px-4 py-3">
        <div>
          <label className={LABEL}>Project Currency</label>
          <select
            value={isCustom ? "Custom" : rawCur ? rawCur.toUpperCase() : "inherit"}
            onChange={e => setCurrencyPreset(e.target.value)}
            aria-label="Project currency"
            className={cn(INPUT, "w-44 font-semibold")}
          >
            <option value="inherit">Inherit ({activeProjectCurrency})</option>
            {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="Custom">Custom</option>
          </select>
        </div>
        {isCustom && (
          <div>
            <label className={LABEL}>Custom Token</label>
            <input
              value={d.customCurrency}
              onChange={e => upd({ customCurrency: e.target.value.toUpperCase().slice(0, 8) })}
              placeholder="OMR / SAR / ZAR"
              aria-label="Custom currency token"
              className={cn(INPUT, "w-36 font-semibold uppercase")}
            />
          </div>
        )}
        <span className="mb-2 ml-auto rounded-md bg-ink px-2.5 py-1 text-[12px] font-bold uppercase tracking-[0.04em] text-white">{currency}</span>
        <span className="mb-2 text-[11px] text-subtitle">Active token on every monetary figure</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-hairline/40 pb-4" role="tablist" aria-label="Pipeline stages">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={d.activeTab === t.id}
            onClick={() => upd({ activeTab: t.id })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-[12px] font-medium transition",
              d.activeTab === t.id ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] text-ink hover:border-ink/50"
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* TAB 1: Strategy & Buy Box */}
      {d.activeTab === "strategy" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <Card title="Buy Box Calibration" note="Your capital, target cash flow, and capacity">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumField label={`Sourced Down Payment (${currency})`} value={d.buyBox.downPayment} onChange={v => updBuyBox("downPayment", v)} step={10000} />
                <NumField label={`Target Annual Cash Flow (${currency})`} value={d.buyBox.targetCashFlow} onChange={v => updBuyBox("targetCashFlow", v)} step={10000} />
                <NumField label="Time Dedication (Hours / Week)" value={d.buyBox.hoursPerWeek} onChange={v => updBuyBox("hoursPerWeek", v)} step={1} />
                <TextField label="Time Dedication Detail" value={d.buyBox.timeDedication} onChange={v => updBuyBox("timeDedication", v)} placeholder="e.g. Nights & weekends + 1 day/week" />
                <TextField label="Target Geography Boundaries" value={d.buyBox.geography} onChange={v => updBuyBox("geography", v)} placeholder="e.g. Southeast US, within 2hr drive" />
                <TextField label="Target Industry Boundaries" value={d.buyBox.industry} onChange={v => updBuyBox("industry", v)} placeholder="e.g. B2B Services, recurring revenue" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[rgba(117,117,117,0.12)] bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Down Payment</p>
                  <p className="text-[18px] font-bold tabular-nums">{M(d.buyBox.downPayment)}</p>
                </div>
                <div className="rounded-xl border border-[rgba(117,117,117,0.12)] bg-white p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Target Cash Flow</p>
                  <p className="text-[18px] font-bold tabular-nums">{M(d.buyBox.targetCashFlow)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Preparation Milestones" note="4 steps to deal focus">
            <div className="flex flex-col gap-3">
              {PREP_MILESTONES.map((label, i) => {
                const done = d.prepMilestones[i];
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = [...d.prepMilestones];
                      next[i] = !next[i];
                      upd({ prepMilestones: next });
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                      done ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.15)] bg-white hover:border-ink/30"
                    )}
                  >
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                      done ? "bg-white text-ink" : "bg-card text-ink"
                    )}>{done ? "✓" : i + 1}</span>
                    <span className={cn("text-[13px] font-medium leading-tight", done ? "text-white" : "text-ink")}>{label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-subtitle">
                <span>Progress</span>
                <span className="font-bold tabular-nums text-ink">{d.prepMilestones.filter(Boolean).length} / {PREP_MILESTONES.length}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[rgba(117,117,117,0.15)]">
                <div
                  className="h-full rounded-full bg-ink transition-all"
                  style={{ width: `${(d.prepMilestones.filter(Boolean).length / PREP_MILESTONES.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Sourcing Funnel */}
      {d.activeTab === "sourcing" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Sourcing Metrics" note="Raw transaction counts">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumField label="Total Market Volume Assessed" value={d.sourcingFunnel.marketVolume} onChange={v => updFunnel("marketVolume", v)} step={10} />
              <NumField label="Fits Buy Box Filter" value={d.sourcingFunnel.fitsBuyBox} onChange={v => updFunnel("fitsBuyBox", v)} step={1} />
              <NumField label="Passes Initial Listing Questions" value={d.sourcingFunnel.passesQuestions} onChange={v => updFunnel("passesQuestions", v)} step={1} />
              <NumField label="Worth an Active Offer" value={d.sourcingFunnel.worthOffer} onChange={v => updFunnel("worthOffer", v)} step={1} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Buy-Box Hit Rate</p>
                <p className="text-[16px] font-bold tabular-nums">{d.sourcingFunnel.marketVolume ? ((d.sourcingFunnel.fitsBuyBox / d.sourcingFunnel.marketVolume) * 100).toFixed(1) : "—"}%</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Offer Rate</p>
                <p className="text-[16px] font-bold tabular-nums">{d.sourcingFunnel.marketVolume ? ((d.sourcingFunnel.worthOffer / d.sourcingFunnel.marketVolume) * 100).toFixed(1) : "—"}%</p>
              </div>
            </div>
          </Card>

          <Card title="Funnel Attrition" note="Volume → Offer">
            <div className="flex flex-col gap-3">
              {funnelBars.map(bar => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[12px] font-medium">{bar.label}</span>
                    <span className="text-[12px] font-bold tabular-nums">{bar.value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[rgba(117,117,117,0.12)]">
                    <div className={cn("h-full rounded-full transition-all", bar.color)} style={{ width: `${bar.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <span className="text-[12px] font-semibold">Funnel Yield</span>
              <span className="text-[14px] font-bold tabular-nums">
                {d.sourcingFunnel.marketVolume
                  ? `${((d.sourcingFunnel.worthOffer / d.sourcingFunnel.marketVolume) * 100).toFixed(2)}% make it to offer`
                  : "—"}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Target Analysis & CIM */}
      {d.activeTab === "targets" && (
        <Card
          title="Acquisition Targets"
          note="Evaluate each opportunity through the CIM"
          action={
            <button type="button" onClick={addTarget} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
              <IconPlus size={14} /> Add Acquisition Target
            </button>
          }
        >
          {d.activeTargets.length === 0 && (
            <p className="rounded-xl border border-dashed border-[rgba(117,117,117,0.3)] py-10 text-center text-[13px] text-subtitle">No targets yet. Add your first acquisition target to begin evaluation.</p>
          )}
          <div className="flex flex-col gap-4">
            {d.activeTargets.map((t, idx) => (
              <div key={t.id} className="rounded-2xl border border-[rgba(117,117,117,0.15)] bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{idx + 1}</span>
                    <span className="text-[13px] font-bold uppercase tracking-[0.06em]">Target {idx + 1}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]",
                      cimProgress(t.cim) === 3 ? "bg-ink text-white" : cimProgress(t.cim) > 0 ? "bg-yellow text-ink" : "bg-[rgba(117,117,117,0.15)] text-subtitle"
                    )}>{cimStageLabel(t.cim)}</span>
                  </div>
                  <button type="button" onClick={() => rmTarget(t.id)} aria-label="Remove target" className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Target Company Name" value={t.companyName} onChange={v => updTarget(t.id, { companyName: v })} placeholder="e.g. Acme Plumbing Co." />
                  <div>
                    <label className={LABEL}>Sourcing Channel</label>
                    <select value={t.channel} onChange={e => updTarget(t.id, { channel: e.target.value as SourcingChannel })} aria-label="Sourcing channel" className={INPUT}>
                      {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL}>Exit Motivation</label>
                    <textarea value={t.retirementMotivation} onChange={e => updTarget(t.id, { retirementMotivation: e.target.value })} rows={2} placeholder="e.g. Owner age 64, no succession plan, wants clean exit within 6 months" className={cn(INPUT, "resize-none leading-6")} aria-label="Exit motivation" />
                  </div>
                  <div>
                    <label className={LABEL}>Management Team Maturity</label>
                    <select value={t.managementMaturity} onChange={e => updTarget(t.id, { managementMaturity: e.target.value as MaturityLevel })} aria-label="Management team maturity" className={INPUT}>
                      {MATURITIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Customer Concentration Risk</label>
                    <select value={t.concentrationRisk} onChange={e => updTarget(t.id, { concentrationRisk: e.target.value as ConcentrationRisk })} aria-label="Customer concentration risk" className={INPUT}>
                      {CONCENTRATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Reading the CIM — 4-stage verification</p>
                  <div className="flex gap-2">
                    {([
                      { key: "financials3yr" as const, label: "3-Yr Financials" },
                      { key: "managementAnalysis" as const, label: "Management Analysis" },
                      { key: "fluffIdentifier" as const, label: "Fluff Identifier" },
                    ]).map(check => (
                      <button
                        key={check.key}
                        type="button"
                        onClick={() => updCim(t.id, check.key, !t.cim[check.key])}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.04em] transition",
                          t.cim[check.key] ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.15)] bg-card text-subtitle hover:border-ink/30"
                        )}
                      >{check.label}</button>
                    ))}
                    <div className={cn(
                      "flex flex-1 items-center justify-center rounded-xl border px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.04em]",
                      cimProgress(t.cim) === 3 ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.12)] bg-white text-subtitle"
                    )}>
                      {cimProgress(t.cim)}/3 · {cimStageLabel(t.cim)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className={LABEL}>Notes</label>
                  <textarea value={t.notes} onChange={e => updTarget(t.id, { notes: e.target.value })} rows={2} placeholder="Additional observations…" className={cn(INPUT, "resize-none leading-6")} aria-label="Target notes" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: Debt Optimization & Stress Test */}
      {d.activeTab === "debt" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            {/* Left — stressing parameters */}
            <Card title="Stressing Parameters" note="Model the same loan against two rate worlds">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumField label={`Loan Principal (${currency})`} value={debt.loanPrincipal} onChange={v => updDebt("loanPrincipal", Math.max(0, v))} step={50000} />
                <NumField label="Term Duration (Years)" value={debt.termYears} onChange={v => updDebt("termYears", Math.min(50, Math.max(1, v)))} step={1} />
                <NumField label="Rate A — Baseline (%)" value={debt.rateA} onChange={v => updDebt("rateA", Math.min(100, Math.max(0, v)))} step={0.25} />
                <NumField label="Rate B — Optimized (%)" value={debt.rateB} onChange={v => updDebt("rateB", Math.min(100, Math.max(0, v)))} step={0.25} />
              </div>

              <div className="mt-5 rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Finder / Concierge Fee</p>
                <p className="mt-0.5 text-[11px] text-subtitle">Declare the referral fee and exactly who settles it.</p>

                <div className="mt-3">
                  <label className={LABEL}>Fee Rate</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CONCIERGE_FEE_STEPS.map(step => (
                      <button
                        key={step}
                        type="button"
                        aria-pressed={debt.conciergeFeePct === step}
                        onClick={() => updDebt("conciergeFeePct", step)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-[11px] font-bold tabular-nums transition",
                          debt.conciergeFeePct === step ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.25)] bg-card text-subtitle hover:border-ink/40"
                        )}
                      >{step.toFixed(2)}%</button>
                    ))}
                    <input
                      type="number"
                      step={0.05}
                      value={debt.conciergeFeePct}
                      onChange={e => updDebt("conciergeFeePct", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                      aria-label="Custom concierge fee percent"
                      className={cn(INPUT, "w-24 tabular-nums")}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className={LABEL}>Who Pays the Referral Fee</label>
                  <div className="grid gap-1.5 sm:grid-cols-3">
                    {CONCIERGE_PAID_BY.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={debt.conciergePaidBy === opt.value}
                        title={opt.hint}
                        onClick={() => updDebt("conciergePaidBy", opt.value)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-left transition",
                          debt.conciergePaidBy === opt.value ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] bg-card hover:border-ink/40"
                        )}
                      >
                        <span className={cn("block text-[11px] font-bold uppercase tracking-[0.04em]", debt.conciergePaidBy === opt.value ? "text-white" : "text-ink")}>{opt.label}</span>
                        <span className={cn("block text-[10px] leading-tight", debt.conciergePaidBy === opt.value ? "text-white/60" : "text-subtitle")}>{opt.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-lg bg-card px-3 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-subtitle">Fee on principal</span>
                  <span className="font-[family-name:var(--font-roboto)] text-[14px] font-bold tabular-nums">
                    {M(debtCalc.conciergeFeeAmount)}
                    <span className="ml-1.5 text-[10px] font-medium uppercase text-subtitle">
                      {debt.conciergePaidBy === "buyer" ? "out of pocket" : debt.conciergePaidBy === "lender" ? "lender-absorbed" : "n/a"}
                    </span>
                  </span>
                </div>
              </div>
            </Card>

            {/* Right — arithmetic comparison matrix */}
            <div className="flex flex-col gap-6">
              <Card title="Arithmetic Comparison Matrix" note={`${debt.termYears}-year term · ${M(debt.loanPrincipal)} principal · all figures in ${currency}`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[rgba(117,117,117,0.2)]">
                        <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Measure</th>
                        <th className="py-2 px-3 text-right text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Term at Rate A · {debt.rateA}%</th>
                        <th className="py-2 px-3 text-right text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Term at Rate B · {debt.rateB}%</th>
                        <th className="py-2 pl-3 text-right text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="font-[family-name:var(--font-roboto)] tabular-nums">
                      {([
                        { label: "Monthly Payment", a: debtCalc.scenarioA.monthlyPayment, b: debtCalc.scenarioB.monthlyPayment, delta: debtCalc.monthlyDelta },
                        { label: "Total Cost Across Term", a: debtCalc.scenarioA.totalCost, b: debtCalc.scenarioB.totalCost, delta: debtCalc.totalSpread },
                        { label: "Cumulative Interest Paid", a: debtCalc.scenarioA.totalInterest, b: debtCalc.scenarioB.totalInterest, delta: debtCalc.interestSpread },
                      ]).map(row => (
                        <tr key={row.label} className="border-b border-[rgba(117,117,117,0.1)] last:border-0">
                          <td className="py-2.5 pr-3 font-[family-name:var(--font-sans)] text-[12px] font-medium">{row.label}</td>
                          <td className="py-2.5 px-3 text-right text-[13px]">{M(row.a)}</td>
                          <td className="py-2.5 px-3 text-right text-[13px] font-semibold">{M(row.b)}</td>
                          <td className={cn("py-2.5 pl-3 text-right text-[13px] font-bold", row.delta > 0 ? "text-green-700" : row.delta < 0 ? "text-red-600" : "text-subtitle")}>
                            {row.delta > 0 ? "−" : row.delta < 0 ? "+" : ""}{M(Math.abs(row.delta))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Dominant spread dashboard */}
              <div className="rounded-2xl bg-ink p-6 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">Total Spread Leakage Saved out of Pocket</p>
                <p className="mt-2 font-[family-name:var(--font-roboto)] text-[40px] font-bold leading-none tabular-nums tracking-[-0.03em]">
                  {M(Math.abs(debtCalc.totalSpread))}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-white/70">
                  {debtCalc.totalSpread > 0
                    ? <>Refusing the unoptimized baseline at <span className="font-semibold text-white">{debt.rateA}%</span> and closing at <span className="font-semibold text-white">{debt.rateB}%</span> keeps this much interest off the table across the full {debt.termYears}-year term.</>
                    : debtCalc.totalSpread < 0
                      ? <>Rate B is currently <span className="font-semibold text-white">more expensive</span> than Rate A. Re-shop before signing.</>
                      : <>Both scenarios price identically. Shop Rate B lower to open a spread.</>}
                </p>
                <div className="mt-4 grid gap-3 border-t border-white/15 pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/50">Monthly Relief</p>
                    <p className="font-[family-name:var(--font-roboto)] text-[16px] font-bold tabular-nums">{M(Math.abs(debtCalc.monthlyDelta))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/50">Concierge Fee ({debt.conciergeFeePct}%)</p>
                    <p className="font-[family-name:var(--font-roboto)] text-[16px] font-bold tabular-nums">
                      {debtCalc.conciergeOutOfPocket > 0 ? `−${M(debtCalc.conciergeOutOfPocket)}` : M(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-white/50">Net After Fee</p>
                    <p className="font-[family-name:var(--font-roboto)] text-[16px] font-bold tabular-nums text-[#e5b838]">{M(debtCalc.netSavings)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5-point contract vetting */}
          <Card
            title="Pre-Contract Vetting — 5 Gates"
            note="Clear every gate before going under contract"
            action={
              <span className={cn(
                "rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em]",
                debtCalc.gatesPassed === VETTING_GATES.length ? "bg-ink text-white" : "bg-[rgba(117,117,117,0.15)] text-subtitle"
              )}>{debtCalc.gatesPassed} / {VETTING_GATES.length} passed</span>
            }
          >
            <div className="flex flex-col gap-2">
              {VETTING_GATES.map((gate, i) => {
                const passed = debt.vettingChecklist[gate.key];
                return (
                  <button
                    key={gate.key}
                    type="button"
                    aria-pressed={passed}
                    onClick={() => updVetting(gate.key, !passed)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition",
                      passed ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.15)] bg-white hover:border-ink/40"
                    )}
                  >
                    <span className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                      passed ? "bg-white text-ink" : "bg-card text-subtitle"
                    )}>{passed ? "✓" : i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13px] font-semibold leading-tight", passed ? "text-white" : "text-ink")}>{gate.label}</span>
                      <span className={cn("mt-0.5 block text-[11px] leading-snug", passed ? "text-white/65" : "text-subtitle")}>{gate.hint}</span>
                    </span>
                    <span className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]",
                      passed ? "bg-white/15 text-white" : "bg-card text-subtitle"
                    )}>{passed ? "Pass" : "Open"}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-subtitle">
                <span>Vetting completion</span>
                <span className="font-bold tabular-nums text-ink">{debtCalc.gatesPassed} / {VETTING_GATES.length}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[rgba(117,117,117,0.15)]">
                <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(debtCalc.gatesPassed / VETTING_GATES.length) * 100}%` }} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: LOI Structuring & Diligence */}
      {d.activeTab === "closing" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="What the Seller Wants" note="Pain points & motivations">
              <label className={LABEL}>Seller Primary Pain Point</label>
              <textarea value={d.dealStructure.sellerPainPoint} onChange={e => upd({ dealStructure: { ...d.dealStructure, sellerPainPoint: e.target.value } })} rows={4} placeholder="e.g. Needs retirement within 6 months, worried about legacy & employees, wants max cash at close…" className={cn(INPUT, "resize-none leading-6")} aria-label="Seller primary pain point" />
            </Card>
            <Card title="What Your LOI Does" note="Asymmetric benefit framing">
              <label className={LABEL}>How Our LOI Structuring Solves It</label>
              <textarea value={d.dealStructure.loiSolution} onChange={e => upd({ dealStructure: { ...d.dealStructure, loiSolution: e.target.value }})} rows={4} placeholder="e.g. Seller note with earn-out protects employees, tax-efficient structure, advisory role for 6 months…" className={cn(INPUT, "resize-none leading-6")} aria-label="How LOI solves it" />

              <div className="mt-3">
                <label className={LABEL}>Handover Mode</label>
                <select value={d.dealStructure.handoverMode} onChange={e => upd({ dealStructure: { ...d.dealStructure, handoverMode: e.target.value as HandoverMode } })} aria-label="Handover mode" className={INPUT}>
                  {HANDOVER_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Free Diligence" note="Do this yourself">
              <div className="flex flex-col gap-2">
                <CheckRow label="Site Visit" checked={d.diligence.siteVisit} onChange={v => updDiligence("siteVisit", v)} hint="Walk the floor, meet the team" />
                <CheckRow label="Employee Interviews" checked={d.diligence.employeeInterviews} onChange={v => updDiligence("employeeInterviews", v)} hint="Culture, retention, key-person risk" />
                <CheckRow label="Customer Emulation" checked={d.diligence.customerEmulation} onChange={v => updDiligence("customerEmulation", v)} hint="Mystery-shop the experience" />
              </div>
            </Card>
            <Card title="Professional Diligence" note="CPA / Legal / Bank">
              <div className="flex flex-col gap-2">
                <CheckRow label="CPA Quality of Earnings (QofE)" checked={d.diligence.cpaQofE} onChange={v => updDiligence("cpaQofE", v)} hint="Validate cash flow vs P&L" />
                <CheckRow label="Legal Contract Assessment" checked={d.diligence.legalContracts} onChange={v => updDiligence("legalContracts", v)} hint="Customer, vendor, employment agreements" />
                <CheckRow label="Bank Document Checklist" checked={d.diligence.bankDocs} onChange={v => updDiligence("bankDocs", v)} hint="SBA / lender requirements" />
              </div>
            </Card>
          </div>

          <Card title="Moving Towards Closing" note="3-step bank ledger">
            <div className="flex flex-col gap-2">
              <CheckRow label="Step 1 — LOI Accepted & Exclusivity Secured" checked={d.diligence.closingStep1} onChange={v => updDiligence("closingStep1", v)} hint="Seller signed LOI, due diligence window opens" />
              <CheckRow label="Step 2 — Financing Committed & Purchase Agreement Drafted" checked={d.diligence.closingStep2} onChange={v => updDiligence("closingStep2", v)} hint="Lender commitment letter, SPA in legal review" />
              <CheckRow label="Step 3 — Funds Wired & Keys Handed Over" checked={d.diligence.closingStep3} onChange={v => updDiligence("closingStep3", v)} hint="Closing day — wire, docs, transition begins" />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-subtitle">
                <span>Closing momentum</span>
                <span className="font-bold tabular-nums text-ink">{[d.diligence.closingStep1, d.diligence.closingStep2, d.diligence.closingStep3].filter(Boolean).length} / 3</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[rgba(117,117,117,0.15)]">
                <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${([d.diligence.closingStep1, d.diligence.closingStep2, d.diligence.closingStep3].filter(Boolean).length / 3) * 100}%` }} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
