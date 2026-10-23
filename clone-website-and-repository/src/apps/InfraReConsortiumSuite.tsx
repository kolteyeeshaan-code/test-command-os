/**
 * ─────────────────────────────────────────────────────────────────────
 * Taxonomy Registry Stamp (see src/data.ts · APP_CATALOG).
 * ─────────────────────────────────────────────────────────────────────
 * App ID                : infra-re-consortium
 * App Catalog Number    : 38
 * Process-Based Category: commercial
 * Vertical-Based Class. : events_activations (Activations)
 * ─────────────────────────────────────────────────────────────────────
 * Official Title    : InfraRE Consortium Suite
 * Operational Purpose: Jurisdiction- and currency-agnostic consortium workspace for
 *   infrastructure / real-estate SPVs — trust-vector alignment, capital-stack
 *   structuring with live CapEx + IRR math, procurement rolodex allocation, and
 *   the master delivery / GTM milestone blueprint.
 */
import { useMemo } from "react";
import { formatCurrency, generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import { parseHash, projectIdOf } from "../nav";
import type { AppProps } from "../pages/AppSession";
import { useStore } from "../store";
import { cn } from "../utils/cn";

/* ══════════════════════════ Taxonomy constants ══════════════════════════ */
export const INFRA_APP_ID = "infra-re-consortium";

export type InfraResponsibility = "consortium_lead" | "partner_sub" | "client_provided" | "missing_gap";
export const INFRA_RESPONSIBILITIES: { id: InfraResponsibility; label: string }[] = [
  { id: "consortium_lead", label: "Consortium Lead" },
  { id: "partner_sub", label: "Partner / Subcontractor" },
  { id: "client_provided", label: "Client Provided" },
  { id: "missing_gap", label: "Missing Gap" },
];

export const INFRA_PILLARS: { key: string; label: string }[] = [
  { key: "architecture_pmc", label: "Architecture & PMC (Institutional Track Record)" },
  { key: "corporate_consultancy", label: "Corporate Consultancy (Underwriting & Structuring)" },
  { key: "capital_sourcing", label: "Capital & Sourcing (Land, Equity, Funding Pools)" },
  { key: "sports_construction", label: "Sports Infrastructure / Construction PMC (FIFA/BCCI Accreditations)" },
  { key: "branding_gtm", label: "Branding, Positioning & GTM Systems" },
  { key: "b2b_rolodex", label: "B2B Supplier Rolodex & Early-Stage Customer Pipeline" },
];

export const INFRA_PROCUREMENT_SEED = [
  "Pro Audio / Acoustics",
  "Broadcast Tech / Display Hardware",
  "Heavy Structural Material",
  "Specialized Turf / Surfacing",
  "Merchandise / Collateral Manufacturing",
];

export type InfraReadiness = "in_concrete" | "in_principle" | "in_pipeline";
export const INFRA_READINESS: { id: InfraReadiness; label: string; hint: string }[] = [
  { id: "in_concrete", label: "In Concrete", hint: "Legally Binding / Locked Agreement" },
  { id: "in_principle", label: "In Principle", hint: "MOU Drafted / Agreed in Spirit" },
  { id: "in_pipeline", label: "In Pipeline", hint: "Awaiting Master Agreement Sign-Off" },
];

export const INFRA_MILESTONES: { key: string; label: string }[] = [
  { key: "p1", label: "Phase 1: Underwriting, Structuring & Liaising" },
  { key: "p2", label: "Phase 2: Detailed Architectural Design & Specifications" },
  { key: "p3", label: "Phase 3: Construction Engineering & Technical PMC" },
  { key: "p4", label: "Phase 4: Branding, Positioning & GTM Launch Activation" },
  { key: "p5", label: "Phase 5: Anchor Occupier Handover & SPV Closeout" },
];

export const INFRA_CURRENCY_PRESETS = ["USD", "EUR", "GBP", "INR", "SGD", "AED"] as const;
export type InfraCurrencyPreset = (typeof INFRA_CURRENCY_PRESETS)[number] | "Custom" | "inherit";

export type InfraTab = "alignment" | "structuring" | "procurement" | "milestones";
export const INFRA_TABS: { id: InfraTab; label: string }[] = [
  { id: "alignment", label: "Consortium Alignment & Execution Team" },
  { id: "structuring", label: "SPV Structuring & Capital" },
  { id: "procurement", label: "Procurement & Rolodex" },
  { id: "milestones", label: "Milestones & GTM" },
];

/* ══════════════════════════ Data model ══════════════════════════ */
export interface Pillar { key: string; responsibility: InfraResponsibility; maturity: number; scope: string }
export interface CustomMember { id: string; name: string; maturity: number; responsibility: InfraResponsibility; scope: string }
export interface InjectionStage { id: string; whoProvides: string; howLegalised: string; whenLedger: string; stageCount: string }
export interface ProcurementRow {
  id: string;
  category: string;
  supplier: string;
  ownerId: string;
  financing: string;
  readiness: InfraReadiness;
  // Legacy fields retained so old sessions don't lose data on round-trip.
  tier?: string;
  leadTimeWeeks?: number;
  riskNotes?: string;
}
export interface Milestone { key: string; durationWeeks: number; dependencies: string; gtmNotes: string }

export interface InfraData {
  currency: string;
  customCurrency: string;
  currencyPreset: InfraCurrencyPreset;
  activeTab: InfraTab;
  pillars: Pillar[];
  customMembers: CustomMember[];
  landArea: number;
  farRatio: number;
  efficiencyPct: number;
  targetYieldPrice: number;
  hardCostRate: number;
  softCostPct: number;
  contingencyMultiplier: number;
  landValue: number;
  upfrontCash: number;
  seniorDebt: number;
  consortiumEquity: number;
  horizonYears: number;
  injections: InjectionStage[];
  procurement: ProcurementRow[];
  milestones: Milestone[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function emptyProc(category = ""): ProcurementRow {
  return { id: generateId(), category, supplier: "", ownerId: "", financing: "", readiness: "in_pipeline" };
}
function emptyInjection(): InjectionStage {
  return { id: generateId(), whoProvides: "", howLegalised: "", whenLedger: "", stageCount: "" };
}
function emptyMember(): CustomMember {
  return { id: generateId(), name: "", maturity: 1, responsibility: "partner_sub", scope: "" };
}

export const INFRA_DEFAULTS: InfraData = {
  currency: "",
  customCurrency: "",
  currencyPreset: "inherit",
  activeTab: "alignment",
  pillars: INFRA_PILLARS.map(p => ({ key: p.key, responsibility: "missing_gap", maturity: 1, scope: "" })),
  customMembers: [],
  landArea: 0,
  farRatio: 2.0,
  efficiencyPct: 80,
  targetYieldPrice: 0,
  hardCostRate: 0,
  softCostPct: 12,
  contingencyMultiplier: 1.1,
  landValue: 0,
  upfrontCash: 0,
  seniorDebt: 0,
  consortiumEquity: 0,
  horizonYears: 3,
  injections: [emptyInjection()],
  procurement: INFRA_PROCUREMENT_SEED.map(c => emptyProc(c)),
  milestones: INFRA_MILESTONES.map(m => ({ key: m.key, durationWeeks: 0, dependencies: "", gtmNotes: "" })),
};

const PRESET_SET = new Set<string>(INFRA_CURRENCY_PRESETS);

function inferPreset(currency: string): InfraCurrencyPreset {
  const c = (currency || "").trim().toUpperCase();
  if (!c) return "inherit";
  if (PRESET_SET.has(c)) return c as InfraCurrencyPreset;
  return "Custom";
}

/** Strict defensive parse: any stored shape in, a complete validated model out. */
export function normalizeInfraReConsortium(raw: unknown): InfraData {
  const s: Record<string, unknown> = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const num = (v: unknown, def: number, lo: number, hi: number): number => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def;
  };
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const tab = s.activeTab;
  const activeTab: InfraTab = (["alignment", "structuring", "procurement", "milestones"] as const).includes(tab as InfraTab) ? (tab as InfraTab) : "alignment";

  const byKey = (arr: unknown, key: string): Record<string, Record<string, unknown>> => {
    const out: Record<string, Record<string, unknown>> = {};
    if (Array.isArray(arr)) for (const it of arr) {
      if (it && typeof it === "object" && typeof (it as Record<string, unknown>)[key] === "string") {
        out[(it as Record<string, unknown>)[key] as string] = it as Record<string, unknown>;
      }
    }
    return out;
  };

  const pBy = byKey(s.pillars, "key");
  const pillars: Pillar[] = INFRA_PILLARS.map(def => {
    const p = pBy[def.key] ?? {};
    const resp = p.responsibility;
    return {
      key: def.key,
      responsibility: (INFRA_RESPONSIBILITIES.some(r => r.id === resp) ? resp : "missing_gap") as InfraResponsibility,
      maturity: num(p.maturity, 1, 1, 5),
      scope: str(p.scope),
    };
  });

  const rawMembers = Array.isArray(s.customMembers)
    ? s.customMembers
    : Array.isArray(s.members)
    ? s.members
    : [];
  const customMembers: CustomMember[] = rawMembers.flatMap((it, i): CustomMember[] => {
    if (!it || typeof it !== "object") return [];
    const o = it as Record<string, unknown>;
    const resp = o.responsibility;
    return [{
      id: typeof o.id === "string" && o.id ? o.id : `cm-${i}`,
      name: str(o.name),
      maturity: num(o.maturity, 1, 1, 5),
      responsibility: (INFRA_RESPONSIBILITIES.some(r => r.id === resp) ? resp : "partner_sub") as InfraResponsibility,
      scope: str(o.scope) || str(o.description),
    }];
  });

  const injections: InjectionStage[] = Array.isArray(s.injections) && s.injections.length
    ? s.injections.flatMap((it, i): InjectionStage[] => {
        if (!it || typeof it !== "object") return [];
        const o = it as Record<string, unknown>;
        return [{
          id: typeof o.id === "string" && o.id ? o.id : `inj-${i}`,
          whoProvides: str(o.whoProvides) || str(o.provider),
          howLegalised: str(o.howLegalised) || str(o.legal),
          whenLedger: str(o.whenLedger) || str(o.trigger),
          stageCount: str(o.stageCount) || (o.stage != null ? String(o.stage) : ""),
        }];
      })
    : [{ ...emptyInjection(), id: "inj-0" }];

  const readinessOf = (v: unknown): InfraReadiness =>
    (INFRA_READINESS.some(r => r.id === v) ? v : "in_pipeline") as InfraReadiness;

  let procurement: ProcurementRow[] = [];
  if (Array.isArray(s.procurement) && s.procurement.length) {
    procurement = s.procurement.flatMap((it, i): ProcurementRow[] => {
      if (!it || typeof it !== "object") return [];
      const o = it as Record<string, unknown>;
      return [{
        id: typeof o.id === "string" && o.id ? o.id : `proc-${i}`,
        category: str(o.category),
        supplier: str(o.supplier),
        ownerId: str(o.ownerId),
        financing: str(o.financing) || str(o.riskNotes),
        readiness: readinessOf(o.readiness),
        tier: str(o.tier) || undefined,
        leadTimeWeeks: typeof o.leadTimeWeeks === "number" ? o.leadTimeWeeks : undefined,
        riskNotes: str(o.riskNotes) || undefined,
      }];
    });
  }
  if (!procurement.length) procurement = INFRA_PROCUREMENT_SEED.map((c, i) => ({ ...emptyProc(c), id: `cat-${slug(c) || i}` }));

  const mBy = byKey(s.milestones, "key");
  const milestones: Milestone[] = INFRA_MILESTONES.map(def => {
    const m = mBy[def.key] ?? {};
    return {
      key: def.key,
      durationWeeks: num(m.durationWeeks, 0, 0, 1040),
      dependencies: str(m.dependencies),
      gtmNotes: str(m.gtmNotes),
    };
  });

  const currency = str(s.currency).slice(0, 8);
  const customCurrency = str(s.customCurrency).slice(0, 8);
  const rawPreset = s.currencyPreset;
  const currencyPreset: InfraCurrencyPreset =
    rawPreset === "inherit" || rawPreset === "Custom" || PRESET_SET.has(String(rawPreset))
      ? (rawPreset as InfraCurrencyPreset)
      : inferPreset(currency);

  return {
    currency,
    customCurrency: customCurrency || (currencyPreset === "Custom" ? currency : ""),
    currencyPreset,
    activeTab,
    pillars,
    customMembers,
    landArea: num(s.landArea, 0, 0, 1e12),
    farRatio: num(s.farRatio, INFRA_DEFAULTS.farRatio, 0, 20),
    efficiencyPct: num(s.efficiencyPct, INFRA_DEFAULTS.efficiencyPct, 0, 100),
    targetYieldPrice: num(s.targetYieldPrice, 0, 0, 1e12),
    hardCostRate: num(s.hardCostRate, 0, 0, 1e12),
    softCostPct: num(s.softCostPct, INFRA_DEFAULTS.softCostPct, 0, 200),
    contingencyMultiplier: num(s.contingencyMultiplier, INFRA_DEFAULTS.contingencyMultiplier, 1, 5),
    landValue: num(s.landValue, 0, 0, 1e15),
    upfrontCash: num(s.upfrontCash, 0, 0, 1e15),
    seniorDebt: num(s.seniorDebt, 0, 0, 1e15),
    consortiumEquity: num(s.consortiumEquity, 0, 0, 1e15),
    horizonYears: num(s.horizonYears, INFRA_DEFAULTS.horizonYears, 1, 30),
    injections,
    procurement,
    milestones,
  };
}

/* ══════════════════════════ Reactive financial engine ══════════════════════════ */
export interface InfraEconomics {
  gfa: number;
  netSaleable: number;
  hardCost: number;
  softCost: number;
  contingency: number;
  totalCapex: number;
  totalEquity: number;
  leverage: number | null;
  grossRevenue: number;
  grossProfit: number;
  profitOnCost: number | null;
  netToCapital: number;
  moic: number | null;
  irrBase: number | null;
  irrLow: number | null;
  irrHigh: number | null;
}

export function computeInfraEconomics(d: InfraData): InfraEconomics {
  const gfa = d.landArea * d.farRatio;
  const netSaleable = gfa * (d.efficiencyPct / 100);
  const hardCost = gfa * d.hardCostRate;
  const softCost = hardCost * (d.softCostPct / 100);
  const contingency = (hardCost + softCost) * (d.contingencyMultiplier - 1);
  const totalCapex = d.landValue + hardCost + softCost + contingency;
  const totalEquity = d.consortiumEquity + d.landValue + d.upfrontCash;
  const leverage = totalEquity > 0 ? d.seniorDebt / totalEquity : null;
  const grossRevenue = netSaleable * d.targetYieldPrice;
  const grossProfit = grossRevenue - totalCapex;
  const profitOnCost = totalCapex > 0 ? grossProfit / totalCapex : null;
  const netToCapital = grossRevenue - d.seniorDebt;
  const moic = totalEquity > 0 ? netToCapital / totalEquity : null;
  const irr = (m: number, yrs: number) => (m > 0 ? Math.pow(m, 1 / yrs) - 1 : null);
  const H = d.horizonYears;
  return {
    gfa, netSaleable, hardCost, softCost, contingency, totalCapex, totalEquity, leverage,
    grossRevenue, grossProfit, profitOnCost, netToCapital, moic,
    irrBase: moic != null ? irr(moic, H) : null,
    irrLow: moic != null ? irr(moic, H + 1) : null,
    irrHigh: moic != null ? irr(moic, Math.max(1, H - 1)) : null,
  };
}

/* ══════════════════════════ Formatting helpers ══════════════════════════ */
export function infraMoney(v: number, code: string): string {
  if (v == null || Number.isNaN(v)) return "—";
  const c = (code || "USD").trim().toUpperCase() || "USD";
  if (v === 0) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(0);
    } catch {
      return `${c} 0`;
    }
  }
  try {
    return formatCurrency(v, c);
  } catch {
    return `${c} ` + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
  }
}

export function resolveInfraCurrency(override: string, inherited: string): string {
  const o = (override || "").trim().toUpperCase();
  if (o) return o;
  const i = (inherited || "").trim().toUpperCase();
  return i || "USD";
}

/** Effective token used everywhere money is rendered. */
export function effectiveInfraCurrency(d: InfraData, inherited = "USD"): string {
  const safeInherited = (inherited || "USD").trim().toUpperCase() || "USD";
  const preset = d.currencyPreset || "inherit";
  if (preset === "Custom") {
    const c = (d.customCurrency || d.currency || "").trim().toUpperCase();
    return c || safeInherited;
  }
  if (preset === "inherit") {
    const explicit = (d.currency || "").trim().toUpperCase();
    if (explicit && explicit !== "INHERIT" && explicit !== "CUSTOM") {
      return explicit;
    }
    return safeInherited;
  }
  return (preset || safeInherited).toUpperCase();
}

export function consortiumAssignees(d: InfraData): { id: string; name: string }[] {
  const seeded = INFRA_PILLARS.map(p => ({ id: p.key, name: p.label }));
  const custom = (d.customMembers || []).map((m, i) => ({
    id: m.id,
    name: m.name?.trim() ? m.name.trim() : `Custom Member ${i + 1}`,
  }));
  return [...seeded, ...custom];
}

export function assigneeName(d: InfraData, ownerId: string): string {
  if (!ownerId) return "";
  const list = consortiumAssignees(d);
  const found = list.find(a => a.id === ownerId || a.name === ownerId);
  if (found) return found.name;
  const customMatch = (d.customMembers || []).find(m => m.id === ownerId);
  if (customMatch) return customMatch.name?.trim() || "Custom Member";
  return ownerId;
}

export function readinessLabel(id: InfraReadiness): string {
  return INFRA_READINESS.find(r => r.id === id)?.label ?? id;
}

const fmtNum = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
const fmtPct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
const fmtX = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}x`);

/** Institutional-grade MOU teaser assembled from every tab. Shared with exporters. */
export function assembleMouPitch(d: InfraData, currency: string, econ: InfraEconomics): string {
  const M = (v: number) => infraMoney(v, currency);
  const leads = d.pillars
    .filter(p => p.responsibility === "consortium_lead")
    .map(p => INFRA_PILLARS.find(x => x.key === p.key)?.label)
    .filter(Boolean) as string[];
  const customs = d.customMembers.filter(m => m.name.trim());
  const teamBits = [
    leads.length ? `Consortium lead coverage sits with ${leads.join("; ")}` : "Lead coverage across the six trust vectors is still being assigned",
    customs.length ? `with additional members ${customs.map(m => `${m.name.trim()} (${INFRA_RESPONSIBILITIES.find(r => r.id === m.responsibility)?.label ?? m.responsibility})`).join("; ")}` : "",
  ].filter(Boolean).join(", ");

  const injFilled = d.injections.filter(i => i.whoProvides.trim() || i.howLegalised.trim() || i.whenLedger.trim() || i.stageCount.trim());
  const injBits = injFilled.length
    ? injFilled.map((i, n) => {
        const parts = [
          i.whoProvides.trim() && `who provides ${i.whoProvides.trim()}`,
          i.howLegalised.trim() && `legalised via ${i.howLegalised.trim()}`,
          i.whenLedger.trim() && `hitting the SPV ledger ${i.whenLedger.trim()}`,
          i.stageCount.trim() && `across ${i.stageCount.trim()} progressive funding stage(s)`,
        ].filter(Boolean);
        return `Stage ${n + 1}: ${parts.join("; ") || "parameters pending"}`;
      }).join(". ")
    : "SPV injection stages are open and will be locked at MOU.";

  const concrete = d.procurement.filter(r => r.readiness === "in_concrete");
  const principle = d.procurement.filter(r => r.readiness === "in_principle");
  const pipeline = d.procurement.filter(r => r.readiness === "in_pipeline" && (r.category.trim() || r.supplier.trim()));
  const chainBits = [
    concrete.length ? `${concrete.length} line item(s) In Concrete (${concrete.map(r => r.category || r.supplier || "unnamed").join(", ")})` : "",
    principle.length ? `${principle.length} In Principle` : "",
    pipeline.length ? `${pipeline.length} In Pipeline` : "",
  ].filter(Boolean).join("; ") || "value-chain readiness is being mapped";

  const owners = d.procurement
    .filter(r => r.ownerId)
    .map(r => `${r.category || "line"} → ${assigneeName(d, r.ownerId) || "unassigned"}`);
  const finance = d.procurement.filter(r => r.financing.trim()).map(r => `${r.category || r.supplier || "line"}: ${r.financing.trim()}`);

  const capexLine = econ.totalCapex
    ? `Underwriting currently frames a ${M(econ.totalCapex)} total CapEx stack against ${M(econ.totalEquity)} equity and ${M(d.seniorDebt)} senior debt`
    : "Underwriting inputs are being populated";
  const irrLine = econ.irrBase != null
    ? `, implying a ${fmtX(econ.moic)} equity MOIC and an estimated IRR band of ${fmtPct(econ.irrLow)}–${fmtPct(econ.irrHigh)} over ${d.horizonYears} years`
    : "";

  const duration = d.milestones.reduce((s, m) => s + (m.durationWeeks || 0), 0);

  return [
    `MOU Executive Pitch Teaser — ${currency} denomination.`,
    `${teamBits}.`,
    `${capexLine}${irrLine}.`,
    `Capital is proposed to enter the SPV as follows. ${injBits}.`,
    `Procurement architecture: ${chainBits}.`,
    owners.length ? `Accountability: ${owners.join("; ")}.` : "",
    finance.length ? `Financing / structuring terms: ${finance.join("; ")}.` : "",
    duration ? `Master delivery trajectory currently totals ${duration} weeks across five macro phases, positioning the parties to move from this teaser into a binding MOU without reopening the commercial frame.` : `Five-phase delivery and GTM blueprint is sequenced and ready to be duration-locked at MOU.`,
  ].filter(Boolean).join(" ");
}

/* ══════════════════════════ UI atoms ══════════════════════════ */
const INPUT = "w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const LABEL = "mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle";

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={INPUT} aria-label={label} />
    </div>
  );
}

function NumField({ label, value, onChange, step = 1, hint, ariaLabel }: { label: string; value: number; onChange: (v: number) => void; step?: number; hint?: string; ariaLabel?: string }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input type="number" value={value || ""} step={step} onChange={e => onChange(Number(e.target.value) || 0)} aria-label={ariaLabel ?? label} className={cn(INPUT, "tabular-nums")} />
      {hint && <p className="mt-1 text-[11px] text-subtitle">{hint}</p>}
    </div>
  );
}

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

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ink" | "green" | "orange" }) {
  return (
    <div className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-subtitle">{label}</p>
      <p className={cn("mt-1 text-[18px] font-bold tabular-nums tracking-[-0.02em]",
        tone === "green" && "text-green-700", tone === "orange" && "text-orange-600", (!tone || tone === "ink") && "text-ink")}>{value}</p>
    </div>
  );
}

function MaturitySlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">1–5 Capability Maturity</label>
        <span className="rounded-md bg-white px-2 py-0.5 text-[13px] font-bold tabular-nums">{value} / 5</span>
      </div>
      <input type="range" min={1} max={5} step={1} value={value} onChange={e => onChange(Number(e.target.value))} aria-label={label} className="w-full accent-[#15190d]" />
    </div>
  );
}

function ReadinessToggle({ value, onChange, name }: { value: InfraReadiness; onChange: (v: InfraReadiness) => void; name: string }) {
  return (
    <div>
      <p className={LABEL}>Readiness Status</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${name} readiness`}>
        {INFRA_READINESS.map(r => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={value === r.id}
            title={r.hint}
            onClick={() => onChange(r.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] transition",
              value === r.id
                ? r.id === "in_concrete" ? "border-ink bg-ink text-white"
                  : r.id === "in_principle" ? "border-[#e5b838] bg-[#e5b838] text-ink"
                  : "border-[rgba(117,117,117,0.5)] bg-[rgba(117,117,117,0.18)] text-ink"
                : "border-[rgba(117,117,117,0.25)] text-subtitle hover:border-ink/50"
            )}
          >{r.label}</button>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-subtitle">{INFRA_READINESS.find(r => r.id === value)?.hint}</p>
    </div>
  );
}

/* ══════════════════════════ Component ══════════════════════════ */
export function InfraReConsortiumSuite({ data: raw, onChange, live }: AppProps) {
  const store = useStore();
  const d = useMemo(() => normalizeInfraReConsortium(raw), [raw]);

  const activeProjectCurrency = useMemo(() => {
    try {
      const page = parseHash();
      const projId = projectIdOf(page);
      if (projId && store?.getProject) {
        const p = store.getProject(projId);
        if (p?.feeCurrency && p.feeCurrency.trim()) {
          return p.feeCurrency.trim().toUpperCase();
        }
      }
      const projs = store?.state?.projects;
      if (Array.isArray(projs) && projs.length > 0) {
        const sorted = [...projs].sort((a, b) => (b.lastActivityAt || "").localeCompare(a.lastActivityAt || ""));
        const top = sorted.find(p => p && p.feeCurrency && p.feeCurrency.trim());
        if (top?.feeCurrency) return top.feeCurrency.trim().toUpperCase();
      }
    } catch {
      // Graceful fallback
    }
    return "USD";
  }, [store]);
  const currency = effectiveInfraCurrency(d, activeProjectCurrency);
  const M = (v: number) => infraMoney(v, currency);

  const econ = useMemo(() => computeInfraEconomics(d), [d]);
  const pitch = useMemo(() => assembleMouPitch(d, currency, econ), [d, currency, econ]);
  const assignees = useMemo(() => consortiumAssignees(d), [d]);
  const upd = (u: Partial<InfraData>) => onChange({ ...d, ...u });

  const updPillar = (key: string, u: Partial<Pillar>) => upd({ pillars: d.pillars.map(p => p.key === key ? { ...p, ...u } : p) });
  const updMember = (id: string, u: Partial<CustomMember>) => upd({ customMembers: d.customMembers.map(m => m.id === id ? { ...m, ...u } : m) });
  const updInj = (id: string, u: Partial<InjectionStage>) => upd({ injections: d.injections.map(r => r.id === id ? { ...r, ...u } : r) });
  const updProc = (id: string, u: Partial<ProcurementRow>) => upd({ procurement: d.procurement.map(r => r.id === id ? { ...r, ...u } : r) });
  const updMs = (key: string, u: Partial<Milestone>) => upd({ milestones: d.milestones.map(m => m.key === key ? { ...m, ...u } : m) });

  const setPreset = (preset: InfraCurrencyPreset) => {
    if (preset === "inherit") upd({ currencyPreset: "inherit", currency: "" });
    else if (preset === "Custom") upd({ currencyPreset: "Custom", currency: (d.customCurrency || "").toUpperCase() });
    else upd({ currencyPreset: preset, currency: preset });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          InfraRE Consortium Suite — a jurisdiction- and currency-agnostic workspace for infrastructure SPVs:
          align the execution team, structure the capital stack with live CapEx + IRR math, allocate a custom
          procurement ledger, and compile an MOU-ready executive teaser.
        </p>
      )}

      {/* Project Currency Picker */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-hairline/40 bg-card px-4 py-3">
        <div>
          <label className={LABEL}>Project Currency Picker</label>
          <select
            value={d.currencyPreset}
            onChange={e => setPreset(e.target.value as InfraCurrencyPreset)}
            aria-label="Project currency picker"
            className={cn(INPUT, "w-44 font-semibold")}
          >
            <option value="inherit">Inherit ({activeProjectCurrency})</option>
            {INFRA_CURRENCY_PRESETS.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="Custom">Custom</option>
          </select>
        </div>
        {d.currencyPreset === "Custom" && (
          <div>
            <label className={LABEL}>Custom Token</label>
            <input
              value={d.customCurrency}
              onChange={e => {
                const v = e.target.value.toUpperCase().slice(0, 8);
                upd({ customCurrency: v, currency: v, currencyPreset: "Custom" });
              }}
              placeholder="OMR / SAR / ZAR"
              aria-label="Custom currency token"
              className={cn(INPUT, "w-36 font-semibold uppercase")}
            />
          </div>
        )}
        <span className="mb-2 ml-auto rounded-md bg-ink px-2.5 py-1 font-[family-name:var(--font-roboto)] text-[12px] font-bold uppercase tracking-[0.04em] text-white">{currency}</span>
        <span className="mb-2 text-[11px] text-subtitle">Active token on every monetary figure</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-hairline/40 pb-4" role="tablist" aria-label="Consortium modules">
        {INFRA_TABS.map(t => (
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

      {/* ── TAB 1: Consortium Alignment & Execution Team ── */}
      {d.activeTab === "alignment" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            {INFRA_PILLARS.map((def, i) => {
              const p = d.pillars[i];
              const resp = INFRA_RESPONSIBILITIES.find(r => r.id === p.responsibility)!;
              return (
                <Card key={def.key}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                      <p className="text-[13px] font-bold leading-tight tracking-[-0.01em]">{def.label}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]",
                      p.responsibility === "missing_gap" ? "bg-[rgba(255,69,58,0.15)] text-red-700"
                        : p.responsibility === "consortium_lead" ? "bg-ink text-white"
                        : "bg-[rgba(117,117,117,0.15)] text-subtitle")}>{resp.label}</span>
                  </div>
                  <div className="mb-3">
                    <label className={LABEL}>Responsibility Status</label>
                    <select value={p.responsibility} onChange={e => updPillar(def.key, { responsibility: e.target.value as InfraResponsibility })} aria-label={`${def.label} responsibility`} className={INPUT}>
                      {INFRA_RESPONSIBILITIES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <MaturitySlider label={`${def.label} maturity`} value={p.maturity} onChange={v => updPillar(def.key, { maturity: v })} />
                  </div>
                  <div>
                    <label className={LABEL}>Scope Boundaries &amp; Custom Responsibilities</label>
                    <textarea value={p.scope} onChange={e => updPillar(def.key, { scope: e.target.value })} rows={2} placeholder="e.g. FIFA Grade-2 certified; stadium envelope only; excludes MEP fit-out." className={cn(INPUT, "resize-none leading-6")} aria-label={`${def.label} scope`} />
                  </div>
                </Card>
              );
            })}
          </div>

          <Card
            title="Custom Consortium Members"
            note="Append infinite execution-team rows beyond the six seeded vectors"
            action={
              <button type="button" onClick={() => upd({ customMembers: [...d.customMembers, emptyMember()] })} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
                <IconPlus size={14} /> Add Custom Consortium Member
              </button>
            }
          >
            {d.customMembers.length === 0 && (
              <p className="rounded-xl border border-dashed border-[rgba(117,117,117,0.3)] py-8 text-center text-[13px] text-subtitle">No custom members yet. Seeded vectors remain; add a firm when the six pillars do not cover the bench.</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {d.customMembers.map((m, i) => (
                <div key={m.id} className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Custom member {i + 1}</span>
                    <button type="button" onClick={() => upd({ customMembers: d.customMembers.filter(x => x.id !== m.id) })} aria-label="Remove custom member" className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
                  </div>
                  <div className="mb-3">
                    <TextField label="Firm / Member Name" value={m.name} onChange={v => updMember(m.id, { name: v })} placeholder="e.g. Northbridge PMC LLP" />
                  </div>
                  <div className="mb-3">
                    <label className={LABEL}>Responsibility Status</label>
                    <select value={m.responsibility} onChange={e => updMember(m.id, { responsibility: e.target.value as InfraResponsibility })} aria-label={`${m.name || "Custom member"} responsibility`} className={INPUT}>
                      {INFRA_RESPONSIBILITIES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <MaturitySlider label={`${m.name || "Custom member"} maturity`} value={m.maturity} onChange={v => updMember(m.id, { maturity: v })} />
                  </div>
                  <div>
                    <label className={LABEL}>Scope Boundaries &amp; Custom Responsibilities</label>
                    <textarea value={m.scope} onChange={e => updMember(m.id, { scope: e.target.value })} rows={2} placeholder="Custom responsibility description" className={cn(INPUT, "resize-none leading-6")} aria-label={`${m.name || "Custom member"} scope`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: dual-focus alignment matrix ── */}
      {d.activeTab === "structuring" && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card title="Financial Underwriting Inputs" note="Column A — Plot, FAR, yield, rates, horizon">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumField label="Plot / Land Scale Area" value={d.landArea} step={100} onChange={v => upd({ landArea: v })} hint="Base plot/land footprint" />
                <NumField label="Permissible FAR Ratio" value={d.farRatio} step={0.1} onChange={v => upd({ farRatio: v })} hint="GFA = Area × FAR" />
                <NumField label="Structural Efficiency %" value={d.efficiencyPct} step={1} onChange={v => upd({ efficiencyPct: v })} hint="Net saleable ÷ GFA" />
                <NumField label={`Target Yield / Selling Price per Unit Area (${currency})`} ariaLabel="Target Yield / Selling Price per Unit Area" value={d.targetYieldPrice} step={10} onChange={v => upd({ targetYieldPrice: v })} />
                <NumField label={`Hard Construction Rate per Unit GFA (${currency})`} ariaLabel="Hard Construction Rate per Unit GFA" value={d.hardCostRate} step={10} onChange={v => upd({ hardCostRate: v })} />
                <NumField label="Soft Costs (% of Hard)" value={d.softCostPct} step={1} onChange={v => upd({ softCostPct: v })} />
                <NumField label="Contingency Multiplier" value={d.contingencyMultiplier} step={0.05} onChange={v => upd({ contingencyMultiplier: v })} hint="Applied to Hard + Soft" />
                <NumField label="Development Horizon (Years)" value={d.horizonYears} step={1} onChange={v => upd({ horizonYears: v })} hint="Used for IRR compounding" />
              </div>
            </Card>

            <Card
              title="SPV Structural Injection Blueprint"
              note="Column B — Who / How / When / How many stages"
              action={
                <button type="button" onClick={() => upd({ injections: [...d.injections, emptyInjection()] })} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
                  <IconPlus size={12} /> Add Stage
                </button>
              }
            >
              <div className="flex flex-col gap-4">
                {d.injections.map((row, i) => (
                  <div key={row.id} className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[12px] font-bold uppercase tracking-[0.06em]">Injection stage {i + 1}</span>
                      {d.injections.length > 1 && (
                        <button type="button" onClick={() => upd({ injections: d.injections.filter(x => x.id !== row.id) })} aria-label="Remove injection stage" className="text-ink/30 hover:text-red-500"><IconTrash size={15} /></button>
                      )}
                    </div>
                    <div className="grid gap-3">
                      <TextField label="Who provides what asset / capital input" value={row.whoProvides} onChange={v => updInj(row.id, { whoProvides: v })} placeholder="e.g. Landowner contributes titled parcel in-kind" />
                      <TextField label="How it is legalised / transferred" value={row.howLegalised} onChange={v => updInj(row.id, { howLegalised: v })} placeholder="e.g. Share-swap SPA + contribution agreement" />
                      <TextField label="When it hits the SPV ledger" value={row.whenLedger} onChange={v => updInj(row.id, { whenLedger: v })} placeholder="e.g. Closing Date + 5 business days" />
                      <TextField label="In how many precise progressive funding stages" value={row.stageCount} onChange={v => updInj(row.id, { stageCount: v })} placeholder="e.g. 3 draws: 40 / 35 / 25" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Financial & Equity Structure" note="In-kind, cash, debt & equity">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumField label={`Land Value — In-Kind Contribution (${currency})`} ariaLabel="Land Value — In-Kind Contribution" value={d.landValue} step={10000} onChange={v => upd({ landValue: v })} />
              <NumField label={`Upfront Cash Sourced (${currency})`} ariaLabel="Upfront Cash Sourced" value={d.upfrontCash} step={10000} onChange={v => upd({ upfrontCash: v })} />
              <NumField label={`Senior Debt Facility Sized (${currency})`} ariaLabel="Senior Debt Facility Sized" value={d.seniorDebt} step={10000} onChange={v => upd({ seniorDebt: v })} />
              <NumField label={`Consortium Equity Injected (${currency})`} ariaLabel="Consortium Equity Injected" value={d.consortiumEquity} step={10000} onChange={v => upd({ consortiumEquity: v })} />
            </div>
          </Card>

          <Card title="Reactive Mathematical Engine" note={`All values in ${currency}`}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Gross Floor Area (GFA)" value={fmtNum(econ.gfa)} />
              <Stat label="Net Saleable / Leasable Area" value={fmtNum(econ.netSaleable)} />
              <Stat label="Total Estimated Project CapEx" value={M(econ.totalCapex)} />
              <Stat label="Total Equity Stack" value={M(econ.totalEquity)} />
              <Stat label="Gross Sale Revenue" value={M(econ.grossRevenue)} />
              <Stat label="Gross Development Profit" value={M(econ.grossProfit)} tone={econ.grossProfit >= 0 ? "green" : "orange"} />
              <Stat label="Profit on Cost" value={fmtPct(econ.profitOnCost)} tone={econ.profitOnCost != null && econ.profitOnCost >= 0 ? "green" : "orange"} />
              <Stat label="Sourced Debt-to-Equity Leverage" value={fmtX(econ.leverage)} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Stat label="Equity MOIC" value={fmtX(econ.moic)} />
              <Stat label="Estimated IRR — Low" value={fmtPct(econ.irrLow)} tone={econ.irrLow != null && econ.irrLow >= 0.25 ? "green" : "orange"} />
              <Stat label="Estimated IRR — High" value={fmtPct(econ.irrHigh)} tone={econ.irrHigh != null && econ.irrHigh >= 0.25 ? "green" : "orange"} />
            </div>
            <p className="mt-3 text-[11px] leading-5 text-subtitle">
              CapEx = Land + (GFA × Hard Rate) + Soft + Contingency. IRR band brackets a base case of{" "}
              <span className="font-semibold text-ink">{fmtPct(econ.irrBase)}</span> over {d.horizonYears}yr via the
              compounding-carry model (MOIC^(1/yr) − 1, exit year ±1).
            </p>
          </Card>
        </div>
      )}

      {/* ── TAB 3: Customisable value-chain readiness ledger ── */}
      {d.activeTab === "procurement" && (
        <Card
          title="Value-Chain Readiness Ledger"
          note="Every line is custom-fillable. Assignees pull from Tab 1 members."
          action={
            <button type="button" onClick={() => upd({ procurement: [...d.procurement, emptyProc()] })} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
              <IconPlus size={14} /> Add Procurement Line Item
            </button>
          }
        >
          {d.procurement.length === 0 && (
            <p className="rounded-xl border border-dashed border-[rgba(117,117,117,0.3)] py-8 text-center text-[13px] text-subtitle">No line items. Add a procurement row to start mapping the value chain.</p>
          )}
          <div className="flex flex-col gap-4">
            {d.procurement.map((r, i) => (
              <div key={r.id} className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Line {i + 1}</span>
                  <button type="button" onClick={() => upd({ procurement: d.procurement.filter(x => x.id !== r.id) })} aria-label="Remove procurement line" className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="Sourcing Scope / Material Category" value={r.category} onChange={v => updProc(r.id, { category: v })} placeholder='e.g. "Pro Audio Systems", "Structural Steel", "Land Parcel Base"' />
                  <TextField label="Mapped Rolodex Vendor / Firm" value={r.supplier} onChange={v => updProc(r.id, { supplier: v })} placeholder="e.g. Acme Acoustics" />
                  <div>
                    <label className={LABEL}>Consortium Member Responsible</label>
                    <select value={r.ownerId} onChange={e => updProc(r.id, { ownerId: e.target.value })} aria-label={`${r.category || "Line"} consortium member responsible`} className={INPUT}>
                      <option value="">Unassigned</option>
                      {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <TextField label="Financing / Structuring Terms Required" value={r.financing} onChange={v => updProc(r.id, { financing: v })} placeholder="e.g. Supplier credit / 180-day letter of credit" />
                </div>
                <div className="mt-3">
                  <ReadinessToggle value={r.readiness} onChange={v => updProc(r.id, { readiness: v })} name={r.category || `Line ${i + 1}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── TAB 4: Milestones + MOU Executive Pitch Teaser ── */}
      {d.activeTab === "milestones" && (
        <div className="flex flex-col gap-6">
          <Card title="Master Delivery Milestones & GTM Blueprint" note="Chronological execution trajectory">
            <div className="flex flex-col gap-4">
              {INFRA_MILESTONES.map((def, i) => {
                const m = d.milestones[i];
                return (
                  <div key={def.key} className="rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                      <p className="text-[13px] font-bold tracking-[-0.01em]">{def.label}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <NumField label="Estimated Duration (Weeks)" value={m.durationWeeks} step={1} onChange={v => updMs(def.key, { durationWeeks: v })} />
                      <TextField label="Inter-Phase Dependencies" value={m.dependencies} onChange={v => updMs(def.key, { dependencies: v })} placeholder="e.g. Requires Phase 1 sign-off" />
                      <TextField label="GTM Strategy Notes" value={m.gtmNotes} onChange={v => updMs(def.key, { gtmNotes: v })} placeholder="e.g. Anchor tenant teaser" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="rounded-2xl bg-ink p-6 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/60">MOU Executive Pitch Teaser Blueprint</p>
            <p className="mt-1 text-[12px] text-white/50">Institutional-grade assembler — live from Tabs 1–4, denominated in {currency}.</p>
            <p className="mt-4 text-[14px] leading-7 tracking-[-0.01em] text-white/95">{pitch}</p>
          </div>
        </div>
      )}
    </div>
  );
}
