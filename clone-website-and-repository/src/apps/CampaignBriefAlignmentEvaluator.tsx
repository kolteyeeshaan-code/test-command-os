/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Digital Communication & Marketing Outreach [Digital]
 * Domain Key        : digital_outreach
 * Official Title    : Campaign & Brief Alignment Evaluator
 * Operational Purpose: Align a campaign or communications mandate to Brand/Product/Hybrid track and journey phase; toggle in-scope channels; lock KPIs; estimate creative deliverables; check brief alignment.
 */
import { useState } from "react";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

export type CampaignTrack = "brand" | "product" | "hybrid";
export type CampaignChannelId = "ooh" | "radio" | "digital" | "tv" | "print" | "events" | "integrations";
export type CampaignHybridLean = "brand" | "product" | "both";

export interface CampaignCellState {
  enabled: boolean;
  notes: string;
  kpiOverride?: string;
  dataSourceOverride?: string;
  creativeOverride?: string;
}

export interface CampaignBriefAlignmentData {
  mandate: string;
  track: CampaignTrack;
  bottleneckPhase: number;
  bottleneckNote: string;
  briefPaste: string;
  hybridLean?: Record<string, CampaignHybridLean>;
  cells: Record<string, CampaignCellState>;
}

export interface CampaignPhaseMeta {
  n: number;
  brandLabel: string;
  productLabel: string;
  goal: string;
  brandWhy: string;
  brandHook: string;
  productWhy: string;
  productHook: string;
}

export interface CampaignChannel { id: CampaignChannelId; label: string }
export interface CampaignCellDefault { creative: string; kpi: string; source: string }

export const CAMPAIGN_CHANNELS: CampaignChannel[] = [
  { id: "ooh", label: "Billboard (OOH)" },
  { id: "radio", label: "Radio / Audio" },
  { id: "digital", label: "Digital" },
  { id: "tv", label: "TV / CTV" },
  { id: "print", label: "Print" },
  { id: "events", label: "Events & Activations" },
  { id: "integrations", label: "Integrations / Placements / Collabs" },
];

export const CAMPAIGN_PHASES: CampaignPhaseMeta[] = [
  { n: 1, brandLabel: "Origin / Vision", productLabel: "Reveal (Hype)", goal: "Disruption & curiosity",
    brandWhy: "Attention starts with a worldview people can join.", brandHook: "Founder myth + manifesto line",
    productWhy: "Hype concentrates demand at launch.", productHook: "Tease → reveal → waitlist" },
  { n: 2, brandLabel: "Ecosystem Value", productLabel: "Specs & Upgrades", goal: "Dwell time & logic",
    brandWhy: "Value must be legible before it is purchasable.", brandHook: "Map the ecosystem, not the SKU",
    productWhy: "Logic justifies desire.", productHook: "Demos beat claims" },
  { n: 3, brandLabel: "Institutional Trust", productLabel: "Narrative (Use-case)", goal: "Reassurance & trust",
    brandWhy: "Institutions buy from institutions.", brandHook: "Proof, tenure, standards",
    productWhy: "Stories sell outcomes.", productHook: "One hero use-case" },
  { n: 4, brandLabel: "Ecosystem On-Ramp", productLabel: "Transaction (Push)", goal: "Focus & urgency",
    brandWhy: "Lower the first step, widen the funnel.", brandHook: "One clear next action",
    productWhy: "Attention must convert.", productHook: "Offer + urgency" },
  { n: 5, brandLabel: "Membership Halo", productLabel: "Optimization (Nurture)", goal: "Re-engagement & LTV",
    brandWhy: "Belonging compounds lifetime value.", brandHook: "Members as heroes",
    productWhy: "Retention is cheaper than acquisition.", productHook: "Win-backs & upsells" },
  { n: 6, brandLabel: "Cultural Community", productLabel: "Distancing (Sunset)", goal: "Belonging / clean slate",
    brandWhy: "Culture outlives campaigns.", brandHook: "Rituals, not ads",
    productWhy: "End cleanly to protect the next launch.", productHook: "Farewell with a forward tease" },
];

export const CAMPAIGN_EFFORT: Record<CampaignChannelId, "Light" | "Medium" | "Heavy"> = {
  digital: "Light", radio: "Light", print: "Medium", ooh: "Medium", tv: "Heavy", events: "Heavy", integrations: "Medium",
};

type TrackKey = "brand" | "product";
/* Library: track → phase → channel → { creative, kpi, source }. 72 cells. */
export const CAMPAIGN_LIBRARY: Record<TrackKey, Record<number, Record<CampaignChannelId, CampaignCellDefault>>> = {
  brand: {
    1: {
      ooh: { creative: "Manifesto billboards: one bold origin line", kpi: "Unaided recall lift", source: "Brand lift survey" },
      radio: { creative: "Founder-story audio spots + sonic mark", kpi: "Ad recall / brand linkage", source: "Audio brand-lift panel" },
      digital: { creative: "High-impact video hooks / manifesto cutdowns", kpi: "View completion rate (VCR)", source: "Ad server / platform video metrics" },
      tv: { creative: "60s origin film", kpi: "Reach + ad recall", source: "TV measurement / brand lift" },
      print: { creative: "Manifesto full-page in culture titles", kpi: "QR / URL visits", source: "UTM landing analytics" },
      events: { creative: "Founding-story launch night", kpi: "Attendance + press pickups", source: "Event CRM / PR tracker" },
      integrations: { creative: "Co-branded launch placement with a values-aligned partner", kpi: "Partner-driven reach & co-brand recall", source: "Partner lift study / UTM analytics" },
    },
    2: {
      ooh: { creative: "Value-map posters near partner venues", kpi: "QR scans", source: "UTM analytics" },
      radio: { creative: "Explainer vignettes with partners", kpi: "Listen-through rate", source: "Streaming audio metrics" },
      digital: { creative: "Ecosystem explainer hub + carousels", kpi: "Time on page", source: "Web analytics (GA4)" },
      tv: { creative: "30s ecosystem value spots", kpi: "Site lift during flight", source: "TV attribution / web analytics" },
      print: { creative: "Partner ecosystem inserts", kpi: "Response / QR scans", source: "UTM analytics" },
      events: { creative: "Partner pop-up showcase", kpi: "Dwell time per visitor", source: "Footfall sensors / CRM" },
      integrations: { creative: "Joint ecosystem story with partner brands", kpi: "Engagement with co-branded hub", source: "Shared web analytics + partner data" },
    },
    3: {
      ooh: { creative: "Proof-point billboards (years, clients, standards)", kpi: "Trust attribute lift", source: "Brand tracker" },
      radio: { creative: "Testimonial audio spots", kpi: "Trust attribute lift", source: "Brand tracker" },
      digital: { creative: "Native trust content, proof hubs", kpi: "Time on page / scroll depth", source: "Web analytics (GA4)" },
      tv: { creative: "Documentary-style trust films", kpi: "Brand favourability", source: "Brand lift survey" },
      print: { creative: "Credentials spreads in trade press", kpi: "RFQs mentioning press", source: "CRM source tracking" },
      events: { creative: "Open-house / factory tours", kpi: "NPS of attendees", source: "Post-event survey" },
      integrations: { creative: "Credentialing partnerships & awards placements", kpi: "Trust attribute lift in exposed audience", source: "Brand tracker + partner CRM" },
    },
    4: {
      ooh: { creative: "Wayfinding + join-now OOH near venues", kpi: "QR signups", source: "UTM analytics" },
      radio: { creative: "Drive-time CTA spots", kpi: "Promo-code redemptions", source: "CRM / POS" },
      digital: { creative: "Onboarding flows + welcome emails", kpi: "Activation rate", source: "Product analytics" },
      tv: { creative: "Shoppable CTV + QR end-cards", kpi: "QR conversions", source: "CTV attribution" },
      print: { creative: "Onboarding welcome inserts", kpi: "Activation from codes", source: "CRM codes" },
      events: { creative: "Onboarding workshops / welcome nights", kpi: "Activation within 7 days", source: "Event CRM" },
      integrations: { creative: "Partner-led onboarding offers & trial placements", kpi: "Partner-sourced signups", source: "UTM analytics + partner CRM" },
    },
    5: {
      ooh: { creative: "Member-story OOH in home markets", kpi: "Member referrals", source: "Referral codes" },
      radio: { creative: "Member voices audio series", kpi: "Repeat engagement rate", source: "Streaming metrics" },
      digital: { creative: "Member hub + loyalty content", kpi: "Repeat purchase / retention", source: "CRM / commerce data" },
      tv: { creative: "Member-story TV cutdowns", kpi: "Retention lift in exposed geo", source: "Geo holdout test" },
      print: { creative: "Member magazine / lookbook", kpi: "Redemption of member offers", source: "POS / codes" },
      events: { creative: "Members-only gatherings", kpi: "Repeat attendance rate", source: "Event CRM" },
      integrations: { creative: "Member-value partner offers & co-perks", kpi: "Partner offer redemption rate", source: "Redemption codes / POS" },
    },
    6: {
      ooh: { creative: "Community-art billboards", kpi: "Social mentions near sites", source: "Social listening" },
      radio: { creative: "Community radio takeovers", kpi: "Branded search lift", source: "Search console" },
      digital: { creative: "UGC rituals + meme templates", kpi: "UGC volume + sentiment", source: "Social listening" },
      tv: { creative: "Culture-doc closing films", kpi: "Brand love / sentiment", source: "Brand tracker" },
      print: { creative: "Community zine editions", kpi: "Distribution + pickups", source: "Print distribution logs" },
      events: { creative: "Community meetups / brand moments", kpi: "Referrals + sentiment", source: "Event CRM / social listening" },
      integrations: { creative: "Culture collaborations with creators & communities", kpi: "UGC volume & sentiment", source: "Social listening + UGC tracker" },
    },
  },
  product: {
    1: {
      ooh: { creative: "Teaser countdown billboards", kpi: "Tease recall / QR scans", source: "OOH panel + UTM" },
      radio: { creative: "Teaser audio drops", kpi: "Search spike", source: "Search console" },
      digital: { creative: "Homepage / launch video takeover, waitlist drive", kpi: "Waitlist signups / CTR", source: "CMS / landing analytics" },
      tv: { creative: "Launch reveal film", kpi: "Reach + launch-day traffic", source: "TV measurement / web analytics" },
      print: { creative: "Sealed teaser inserts", kpi: "QR curiosity scans", source: "UTM analytics" },
      events: { creative: "Reveal event / first-look night", kpi: "RSVPs + press coverage", source: "Event CRM / PR tracker" },
      integrations: { creative: "Teaser placements in launch partner channels", kpi: "Waitlist signups from partners", source: "UTM / landing analytics" },
    },
    2: {
      ooh: { creative: "Spec-comparison billboards", kpi: "QR to spec pages", source: "UTM analytics" },
      radio: { creative: "Expert-review audio spots", kpi: "Consideration lift", source: "Brand / consideration tracker" },
      digital: { creative: "Spec hubs, comparisons, reviews hub", kpi: "Time on spec pages", source: "Web analytics (GA4)" },
      tv: { creative: "Demo-led TV spots", kpi: "Search + site lift", source: "TV attribution" },
      print: { creative: "Spec sheets in enthusiast press", kpi: "Dealer / demo requests", source: "CRM / forms" },
      events: { creative: "Hands-on demo roadshow", kpi: "Demo completions", source: "Event CRM" },
      integrations: { creative: "Expert & media review placements", kpi: "Consideration lift + referral traffic", source: "Web analytics + referral sources" },
    },
    3: {
      ooh: { creative: "Use-case story billboards", kpi: "Brand recall in category", source: "Brand tracker" },
      radio: { creative: "Customer-story audio", kpi: "Consideration lift", source: "Consideration tracker" },
      digital: { creative: "Use-case films + tutorial content", kpi: "Video completion / saves", source: "Platform metrics" },
      tv: { creative: "Testimonial TV", kpi: "Purchase intent", source: "Brand lift survey" },
      print: { creative: "Case-study spreads", kpi: "Demo / quote requests", source: "CRM forms" },
      events: { creative: "Customer clinics / open days", kpi: "Qualified leads", source: "Event CRM" },
      integrations: { creative: "Use-case placements with real customers", kpi: "Demo / trial requests", source: "CRM forms + product analytics" },
    },
    4: {
      ooh: { creative: "Offer-led OOH near retail", kpi: "Store visits", source: "Footfall / geo data" },
      radio: { creative: "Limited-offer audio spots", kpi: "Promo redemptions", source: "POS / codes" },
      digital: { creative: "Retargeting / offer / cart units", kpi: "ROAS / CPA / conversion rate", source: "Ads + commerce pixels" },
      tv: { creative: "Shoppable TV + QR offers", kpi: "Direct response rate", source: "CTV attribution" },
      print: { creative: "Coupon / offer inserts", kpi: "Redemption rate", source: "POS codes" },
      events: { creative: "Retail activations / trunk shows", kpi: "Units sold per event", source: "POS" },
      integrations: { creative: "Retail & affiliate offer placements", kpi: "Partner-sourced conversions / ROAS", source: "Commerce pixels + affiliate data" },
    },
    5: {
      ooh: { creative: "Loyalty / trade-in OOH", kpi: "Trade-in starts", source: "CRM / POS" },
      radio: { creative: "Win-back audio", kpi: "Reactivation rate", source: "CRM cohorts" },
      digital: { creative: "Lifecycle CRM + win-back flows", kpi: "Repeat purchase / LTV", source: "CRM / commerce data" },
      tv: { creative: "Loyalty TV reminders", kpi: "Repeat purchase lift", source: "Geo holdout / POS" },
      print: { creative: "Loyalty mailers", kpi: "Offer redemption", source: "POS codes" },
      events: { creative: "Owner clubs / service days", kpi: "Service attach / upsell", source: "CRM / POS" },
      integrations: { creative: "Retention partnerships & bundle placements", kpi: "Repeat purchase / LTV", source: "CRM / commerce data" },
    },
    6: {
      ooh: { creative: "Clearance / final-edition OOH", kpi: "Sell-through rate", source: "Inventory / POS" },
      radio: { creative: "Final-call audio", kpi: "Clearance redemptions", source: "POS codes" },
      digital: { creative: "Sunset comms + migration offers", kpi: "Migration conversion", source: "Product analytics" },
      tv: { creative: "Farewell spots + next-gen tease", kpi: "Next-gen waitlist", source: "Landing analytics" },
      print: { creative: "Final-edition print drops", kpi: "Units cleared", source: "POS" },
      events: { creative: "Teardown & rebrand of space / farewell events", kpi: "Space turnover / sentiment", source: "Event CRM / social listening" },
      integrations: { creative: "Successor product placements & migration partners", kpi: "Migration conversion rate", source: "Product analytics + POS" },
    },
  },
};

export const cellKey = (phase: number, channel: CampaignChannelId) => `${phase}-${channel}`;
export const blankCell = (): { enabled: boolean; notes: string } => ({ enabled: false, notes: "" });

export function phaseLabel(track: "brand" | "product" | "hybrid", phase: number, lean?: "brand" | "product" | "both"): string {
  const meta = CAMPAIGN_PHASES[phase - 1];
  if (!meta) return `Phase ${phase}`;
  if (track === "brand") return meta.brandLabel;
  if (track === "product") return meta.productLabel;
  if (lean === "brand") return meta.brandLabel;
  if (lean === "product") return meta.productLabel;
  return `${meta.brandLabel} / ${meta.productLabel}`;
}

export interface CampaignCellResolved { creative: string; kpi: string; source: string; from: string }

export function libraryCell(track: CampaignTrack, phase: number, channel: CampaignChannelId, lean: CampaignHybridLean = "both"): CampaignCellResolved {
  const b = CAMPAIGN_LIBRARY.brand[phase]?.[channel];
  const p = CAMPAIGN_LIBRARY.product[phase]?.[channel];
  const empty = { creative: "", kpi: "", source: "" };
  if (track === "brand") return { ...(b ?? empty), from: "brand" };
  if (track === "product") return { ...(p ?? empty), from: "product" };
  if (lean === "brand") return { ...(b ?? empty), from: "brand" };
  if (lean === "product") return { ...(p ?? empty), from: "product" };
  return {
    creative: [b?.creative, p?.creative].filter(Boolean).join(" + "),
    kpi: [b?.kpi, p?.kpi].filter(Boolean).join(" / "),
    source: [b?.source, p?.source].filter(Boolean).join(" + "),
    from: "both",
  };
}

export interface CampaignTrueCell {
  phase: number;
  phaseLabel: string;
  channelId: CampaignChannelId;
  channelLabel: string;
  creative: string;
  kpi: string;
  source: string;
  notes: string;
  from: string;
}

export function normalizeCampaignBriefAlignment(raw: unknown): CampaignBriefAlignmentData {
  const d = (raw && typeof raw === "object" ? raw : {}) as Partial<CampaignBriefAlignmentData> & Record<string, unknown>;
  const track: CampaignTrack = d.track === "product" || d.track === "hybrid" ? d.track : "brand";
  const bottleneckPhase = Math.min(6, Math.max(1, Math.round(Number(d.bottleneckPhase) || 1)));
  const hybridLean: Record<string, CampaignHybridLean> = {};
  for (let n = 1; n <= 6; n++) {
    const v = (d.hybridLean as Record<string, unknown> | undefined)?.[String(n)];
    hybridLean[String(n)] = v === "brand" || v === "product" || v === "both" ? v : "both";
  }
  const cells: Record<string, { enabled: boolean; notes: string; kpiOverride?: string; dataSourceOverride?: string; creativeOverride?: string }> = {};
  const rawCells = (d.cells && typeof d.cells === "object" ? d.cells : {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(rawCells)) {
    if (!value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    cells[key] = {
      enabled: v.enabled === true,
      notes: typeof v.notes === "string" ? v.notes : "",
      kpiOverride: typeof v.kpiOverride === "string" && v.kpiOverride ? v.kpiOverride : undefined,
      dataSourceOverride: typeof v.dataSourceOverride === "string" && v.dataSourceOverride ? v.dataSourceOverride : undefined,
      creativeOverride: typeof v.creativeOverride === "string" && v.creativeOverride ? v.creativeOverride : undefined,
    };
  }
  return {
    mandate: typeof d.mandate === "string" ? d.mandate : "",
    track,
    bottleneckPhase,
    bottleneckNote: typeof d.bottleneckNote === "string" ? d.bottleneckNote : "",
    briefPaste: typeof d.briefPaste === "string" ? d.briefPaste : "",
    hybridLean,
    cells,
  };
}

export function campaignTrueCells(d: CampaignBriefAlignmentData): CampaignTrueCell[] {
  const out: CampaignTrueCell[] = [];
  for (let phase = 1; phase <= 6; phase++) {
    const lean = d.hybridLean?.[String(phase)] ?? "both";
    for (const ch of CAMPAIGN_CHANNELS) {
      const cell = d.cells[cellKey(phase, ch.id)];
      if (!cell?.enabled) continue;
      const lib = libraryCell(d.track, phase, ch.id, lean);
      out.push({
        phase,
        phaseLabel: phaseLabel(d.track, phase, lean),
        channelId: ch.id,
        channelLabel: ch.label,
        creative: cell.creativeOverride || lib.creative,
        kpi: cell.kpiOverride || lib.kpi,
        source: cell.dataSourceOverride || lib.source,
        notes: cell.notes || "",
        from: lib.from,
      });
    }
  }
  return out;
}

const THEME_WORDS: { label: string; words: string[] }[] = [
  { label: "journey phases", words: ["awareness", "consider", "evaluation", "purchase", "transaction", "retention", "advocacy", "awareness", "funnel", "journey", "phase", "origin", "vision", "reveal", "hype", "trust", "narrative", "ramp", "transaction", "member", "nurture", "community", "sunset"] },
  { label: "channels", words: ["billboard", "ooh", "outdoor", "radio", "audio", "podcast", "digital", "social", "tv", "ctv", "video", "print", "press", "event", "activation", "pop-up", "popup", "retail"] },
  { label: "KPIs / success metrics", words: ["kpi", "metric", "measure", "conversion", "roas", "cpa", "ctr", "retention", "sentiment", "reach", "completion", "signup", "signup", "activation", "ltv", "nps", "sov", "share of voice", "response time"] },
];

export function campaignAlignmentWarnings(d: CampaignBriefAlignmentData): { level: "warn" | "gap"; text: string }[] {
  const out: { level: "warn" | "gap"; text: string }[] = [];
  const scope = campaignTrueCells(d);
  if (!d.mandate.trim()) out.push({ level: "warn", text: "Add the mandate — scope without a named mandate drifts." });
  if (!scope.length) {
    out.push({ level: "warn", text: "Nothing is in scope yet — toggle at least the bottleneck phase." });
    return out;
  }
  const inBottleneck = scope.filter(c => c.phase === d.bottleneckPhase);
  if (!inBottleneck.length) {
    out.push({ level: "warn", text: `Bottleneck is Phase ${d.bottleneckPhase} (${phaseLabel(d.track, d.bottleneckPhase, d.hybridLean?.[String(d.bottleneckPhase)])}), but it has no True channels.` });
  }
  const phasesUsed = Array.from(new Set(scope.map(c => c.phase)));
  if (d.bottleneckPhase <= 2 && phasesUsed.length && phasesUsed.every(p => p >= 4)) {
    out.push({ level: "warn", text: `Sequence jump: bottleneck is early (Phase ${d.bottleneckPhase}) but scope sits only in late phases (${phasesUsed.sort().join(", ")}).` });
  }
  const missingKpi = scope.filter(c => !c.kpi.trim());
  if (missingKpi.length) {
    out.push({ level: "warn", text: `Locked scope with no KPI: ${missingKpi.map(c => `Phase ${c.phase} × ${c.channelLabel}`).join("; ")}.` });
  }
  const brief = d.briefPaste.trim().toLowerCase();
  if (brief) {
    const missing = THEME_WORDS.filter(t => !t.words.some(w => brief.includes(w))).map(t => t.label);
    if (missing.length) out.push({ level: "gap", text: `Brief barely mentions: ${missing.join(", ")} — confirm the paste covers the full mandate.` });
  }
  return out;
}

export interface CampaignDeliverable { channelId: CampaignChannelId; channelLabel: string; family: string; effort: "Light" | "Medium" | "Heavy"; count: number }

export function campaignDeliverables(d: CampaignBriefAlignmentData): CampaignDeliverable[] {
  const scope = campaignTrueCells(d);
  const byChannel = new Map<CampaignChannelId, CampaignTrueCell[]>();
  for (const cell of scope) {
    const list = byChannel.get(cell.channelId) ?? [];
    list.push(cell);
    byChannel.set(cell.channelId, list);
  }
  return CAMPAIGN_CHANNELS.filter(c => byChannel.has(c.id)).map(c => {
    const cells = (byChannel.get(c.id) ?? []).sort((a, b2) => a.phase - b2.phase);
    const headline = cells
      .map(cell => `Phase ${cell.phase} → ${cell.creative.split(/[.;]/)[0].trim()}`)
      .filter(s => s && !s.endsWith("→"))
      .slice(0, 4)
      .join("; ");
    return {
      channelId: c.id,
      channelLabel: c.label,
      family: headline || `${cells.length} scoped cell${cells.length === 1 ? "" : "s"}`,
      effort: CAMPAIGN_EFFORT[c.id],
      count: cells.length,
    };
  });
}

function DetailField({ label, value, onChange, placeholder, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
    </div>
  );
}

export function CampaignBriefAlignmentEvaluator({ data: raw, onChange, live }: AppProps) {
  const d = normalizeCampaignBriefAlignment(raw);
  const [selected, setSelected] = useState<{ phase: number; channel: CampaignChannelId } | null>(null);
  const upd = (patch: Partial<CampaignBriefAlignmentData>) => onChange({ ...d, ...patch });
  const updCell = (phase: number, channel: CampaignChannelId, patch: Partial<{ enabled: boolean; notes: string; kpiOverride?: string; dataSourceOverride?: string; creativeOverride?: string }>) => {
    const key = cellKey(phase, channel);
    const prev = d.cells[key] ?? blankCell();
    upd({ cells: { ...d.cells, [key]: { ...prev, ...patch } } });
  };
  const toggleCell = (phase: number, channel: CampaignChannelId) => {
    const key = cellKey(phase, channel);
    const prev = d.cells[key] ?? blankCell();
    updCell(phase, channel, { enabled: !prev.enabled });
    setSelected({ phase, channel });
  };
  const setLean = (phase: number, lean: CampaignHybridLean) =>
    upd({ hybridLean: { ...d.hybridLean, [String(phase)]: lean } });

  const scope = campaignTrueCells(d);
  const warnings = campaignAlignmentWarnings(d);
  const deliverables = campaignDeliverables(d);
  const phasesUsed = Array.from(new Set(scope.map(c => c.phase))).sort((a, b) => a - b);
  const channelsUsed = Array.from(new Set(scope.map(c => c.channelId)));
  const outScopePhases = [1, 2, 3, 4, 5, 6].filter(p => !phasesUsed.includes(p));
  const outScopeChannels = CAMPAIGN_CHANNELS.filter(c => !channelsUsed.includes(c.id)).map(c => c.label);
  const lean = (phase: number) => d.hybridLean?.[String(phase)] ?? "both";

  const sel = selected ? {
    meta: CAMPAIGN_PHASES[selected.phase - 1],
    channel: CAMPAIGN_CHANNELS.find(c => c.id === selected.channel)!,
    cell: d.cells[cellKey(selected.phase, selected.channel)] ?? blankCell(),
    lib: libraryCell(d.track, selected.phase, selected.channel, lean(selected.phase)),
    lean: lean(selected.phase),
  } : null;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
      {!live && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Mandate alignment, not media buying.</p>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-subtitle">
            This tool aligns a campaign or communications mandate to the right attention track and journey phase, scopes channels, locks KPIs, and lists implied creative deliverables so accountability matches the real scope. Agreed KPIs in True cells define success; metrics for False scope are not claimable later.
          </p>
        </div>
      )}

      {/* 1 · Header / mandate / track */}
      <div className="rounded-2xl bg-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Mandate / campaign in question</label>
            <input value={d.mandate} onChange={e => upd({ mandate: e.target.value })} placeholder="e.g. Social + ORM retainer, Q4 product launch, brand trust rebuild…" className={cn("w-full rounded-lg border bg-white px-3 py-2 text-[15px] font-semibold outline-none focus:border-ink", !d.mandate.trim() ? "border-[rgba(255,149,0,0.55)]" : "border-[rgba(117,117,117,0.15)]")} />
            {!d.mandate.trim() && <p className="mt-1.5 text-[11px] text-[#c77700]">Required — name the mandate so scope stays honest.</p>}
          </div>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Attention track</p>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-1" role="tablist" aria-label="Attention track">
              {(["brand", "product", "hybrid"] as const).map(t => (
                <button key={t} type="button" role="tab" aria-selected={d.track === t} onClick={() => upd({ track: t })}
                  className={cn("rounded-lg px-2 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] transition", d.track === t ? "bg-ink text-white" : "text-ink/55 hover:bg-black/5")}>
                  {t === "brand" ? "Brand" : t === "product" ? "Product" : "Hybrid"}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-subtitle">
              {d.track === "brand" ? "Corporate Brand Attention Lifecycle — trust, ecosystem, culture." : d.track === "product" ? "Product-Specific Attention Lifecycle — reveal to sunset." : "Asymmetric: lean each phase toward brand, product, or both."}
            </p>
          </div>
        </div>
        {d.track === "hybrid" && (
          <div className="mt-4 border-t border-dashed border-[rgba(120,120,128,0.2)] pt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Per-phase hybrid lean</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPAIGN_PHASES.map(p => {
                const value = lean(p.n);
                return (
                  <div key={p.n} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
                    <span className="min-w-0 truncate text-[12px] font-semibold">P{p.n} · {p.brandLabel} <span className="font-normal text-subtitle">/ {p.productLabel}</span></span>
                    <span className="flex shrink-0 gap-1">
                      {(["brand", "product", "both"] as const).map(option => (
                        <button key={option} type="button" onClick={() => setLean(p.n, option)} aria-pressed={value === option}
                          className={cn("rounded px-1.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] transition", value === option ? "bg-ink text-white" : "bg-card text-ink/55 hover:bg-black/10")}>
                          {option === "brand" ? "Brand" : option === "product" ? "Product" : "Both"}
                        </button>
                      ))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2 · Diagnosis + 3 · brief paste */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-card p-5">
          <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Diagnosis</p>
          <p className="mb-4 mt-1 text-[12px] leading-5 text-subtitle">Where is the buyer — or the mandate — actually stuck?</p>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Bottleneck phase</label>
          <select value={d.bottleneckPhase} onChange={e => upd({ bottleneckPhase: Number(e.target.value) })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink">
            {CAMPAIGN_PHASES.map(p => <option key={p.n} value={p.n}>Phase {p.n} · {phaseLabel(d.track, p.n, lean(p.n))}</option>)}
          </select>
          <div className="mt-3">
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Why stuck here</label>
            <textarea value={d.bottleneckNote} onChange={e => upd({ bottleneckNote: e.target.value })} rows={3} placeholder="Evidence or reasoning for this bottleneck…" className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>
        </div>
        <div className="rounded-2xl bg-card p-5">
          <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Existing brief / mandate <span className="font-medium normal-case text-subtitle">(optional)</span></p>
          <p className="mb-3 mt-1 text-[12px] leading-5 text-subtitle">Paste current wording to check whether phases, channels, and KPIs are actually mentioned.</p>
          <textarea value={d.briefPaste} onChange={e => upd({ briefPaste: e.target.value })} rows={8} placeholder="Paste the brief or mandate text here…" className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
        </div>
      </div>

      {/* 4 · Matrix */}
      <div className="rounded-2xl bg-card p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Phase × Channel scope</p>
            <p className="mt-1 text-[12px] text-subtitle">True = in scope and therefore accountable. False cells never enter success definition or deliverables.</p>
          </div>
          <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle">{scope.length} in scope</span>
        </div>
        <div className="touch-scroll overflow-x-auto rounded-xl">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr>
                <th className="min-w-[190px] px-2 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Phase</th>
                {CAMPAIGN_CHANNELS.map(c => (
                  <th key={c.id} className="min-w-[110px] px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGN_PHASES.map(p => (
                <tr key={p.n} className="border-t border-[rgba(120,120,128,0.16)]">
                  <th className="px-2 py-2 align-top text-left">
                    <p className="text-[12px] font-bold leading-tight">P{p.n} · {phaseLabel(d.track, p.n, lean(p.n))}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.04em] text-subtitle">{p.goal}</p>
                    {d.bottleneckPhase === p.n && <span className="mt-1 inline-block rounded bg-[rgba(255,149,0,0.25)] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.04em]">Bottleneck</span>}
                  </th>
                  {CAMPAIGN_CHANNELS.map(c => {
                    const key = cellKey(p.n, c.id);
                    const cell = d.cells[key] ?? blankCell();
                    const lib = libraryCell(d.track, p.n, c.id, lean(p.n));
                    const isSel = selected?.phase === p.n && selected.channel === c.id;
                    return (
                      <td key={c.id} className="px-1.5 py-1.5 align-top">
                        <button type="button" aria-pressed={cell.enabled} onClick={() => toggleCell(p.n, c.id)}
                          className={cn(
                            "flex min-h-[76px] w-full flex-col justify-between gap-1 rounded-lg border p-2 text-left transition",
                            cell.enabled ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.18)] bg-white hover:border-ink/40",
                            isSel && !cell.enabled && "border-ink"
                          )}>
                          <span className="flex items-center justify-between gap-1">
                            <span className={cn("text-[10px] font-bold uppercase tracking-[0.05em]", cell.enabled ? "text-white" : "text-ink")}>{cell.enabled ? "True" : "False"}</span>
                            <span className={cn("inline-block h-2 w-2 rounded-full", cell.enabled ? "bg-white" : "bg-[rgba(117,117,117,0.25)]")} aria-hidden />
                          </span>
                          <span className={cn("line-clamp-3 text-[10.5px] leading-tight", cell.enabled ? "text-white/85" : "text-subtitle")}>
                            {cell.kpiOverride || lib.kpi}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 · Detail drawer */}
      <div className="rounded-2xl bg-card p-5">
        {!sel && (
          <div className="py-6 text-center">
            <p className="text-[14px] font-semibold">Select a cell to lock its accountability</p>
            <p className="mt-1 text-[12px] text-subtitle">Click any matrix cell to review defaults and set overrides, KPI, source, and notes.</p>
          </div>
        )}
        {sel && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Selected cell</p>
                <p className="text-[17px] font-bold tracking-[-0.02em]">Phase {sel.meta.n} · {phaseLabel(d.track, sel.meta.n, sel.lean)} × {sel.channel.label}</p>
              </div>
              <button type="button" onClick={() => toggleCell(sel.meta.n, sel.channel.id)}
                className={cn("rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition",
                  sel.cell.enabled ? "border-ink bg-ink text-white hover:bg-white hover:text-ink" : "border-[rgba(117,117,117,0.25)] hover:border-ink")}>
                {sel.cell.enabled ? "In scope · True" : "Out of scope · False"}
              </button>
            </div>
            <div className="mb-4 grid gap-3 rounded-xl bg-white p-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Strategic why</p>
                <p className="mt-1 text-[12.5px] leading-5">{d.track === "product" || (d.track === "hybrid" && sel.lean === "product") ? sel.meta.productWhy : d.track === "hybrid" && sel.lean === "both" ? `${sel.meta.brandWhy} / ${sel.meta.productWhy}` : sel.meta.brandWhy}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Attention goal</p>
                <p className="mt-1 text-[12.5px] leading-5">{sel.meta.goal}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">Psychological hook</p>
                <p className="mt-1 text-[12.5px] leading-5">{d.track === "product" || (d.track === "hybrid" && sel.lean === "product") ? sel.meta.productHook : d.track === "hybrid" && sel.lean === "both" ? `${sel.meta.brandHook} / ${sel.meta.productHook}` : sel.meta.brandHook}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <DetailField label={`Creative direction${sel.cell.creativeOverride ? " (override)" : " (library default)"}`} value={sel.cell.creativeOverride ?? ""} placeholder={sel.lib.creative} onChange={v => updCell(sel.meta.n, sel.channel.id, { creativeOverride: v || undefined })} />
              <DetailField label={`Agreed KPI(s)${sel.cell.kpiOverride ? " (override)" : " (library default)"}`} value={sel.cell.kpiOverride ?? ""} placeholder={sel.lib.kpi} onChange={v => updCell(sel.meta.n, sel.channel.id, { kpiOverride: v || undefined })} />
              <DetailField label={`Data source${sel.cell.dataSourceOverride ? " (override)" : " (library default)"}`} value={sel.cell.dataSourceOverride ?? ""} placeholder={sel.lib.source} onChange={v => updCell(sel.meta.n, sel.channel.id, { dataSourceOverride: v || undefined })} />
              <DetailField label="Session notes" value={sel.cell.notes} placeholder="Exclusions, budget reality, e.g. “ORM only — no lead-gen KPIs”…" onChange={v => updCell(sel.meta.n, sel.channel.id, { notes: v })} rows={3} />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-subtitle">False cells never enter success definition or the deliverables list. Overrides replace the library default for exports.</p>
          </div>
        )}
      </div>

      {/* 6 · Alignment evaluator */}
      <div className="rounded-2xl bg-card p-5">
        <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Alignment evaluator</p>
        <p className="mb-3 mt-1 text-[12px] leading-5 text-subtitle">Simple mandate checks — no score engine, just readable warnings.</p>
        {warnings.length === 0 ? (
          <p className="rounded-xl bg-[rgba(52,199,89,0.18)] px-3 py-2.5 text-[13px] font-medium">Scope and bottleneck are consistent. True cells define success.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {warnings.map((w, i) => (
              <li key={i} className={cn("rounded-xl px-3 py-2.5 text-[13px] leading-5", w.level === "warn" ? "bg-[rgba(255,149,0,0.18)]" : "bg-white")}>
                <span className="mr-2 font-bold uppercase tracking-[0.04em] text-[10px]">{w.level === "warn" ? "Warning" : "Gap"}</span>
                {w.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 7 · Summary */}
      <div className="rounded-2xl bg-card p-5">
        <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Scope, accountability & deliverables estimate</p>
        <p className="mb-4 mt-1 text-[12px] leading-5 text-subtitle">
          Track: <strong className="capitalize">{d.track}</strong> · Bottleneck: <strong>Phase {d.bottleneckPhase} · {phaseLabel(d.track, d.bottleneckPhase, lean(d.bottleneckPhase))}</strong>
          {d.mandate.trim() ? <> · Mandate: <strong>{d.mandate.trim()}</strong></> : null}
        </p>
        {!scope.length && <p className="rounded-xl bg-white px-3 py-4 text-center text-[13px] text-subtitle">No True cells yet — the mandate has no locked scope.</p>}
        {!!scope.length && (
          <div className="touch-scroll overflow-x-auto rounded-xl">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[rgba(120,120,128,0.2)] text-[10px] font-bold uppercase tracking-[0.06em] text-subtitle">
                  <th className="px-2 py-2">Phase</th>
                  <th className="px-2 py-2">Channel</th>
                  <th className="px-2 py-2">KPI</th>
                  <th className="px-2 py-2">Data source</th>
                </tr>
              </thead>
              <tbody>
                {scope.map(c => (
                  <tr key={`${c.phase}-${c.channelId}`} className="border-b border-[rgba(120,120,128,0.12)] align-top last:border-0">
                    <td className="px-2 py-2 font-semibold">P{c.phase} · {c.phaseLabel}</td>
                    <td className="px-2 py-2">{c.channelLabel}</td>
                    <td className="px-2 py-2">{c.kpi || <em className="text-[#b3001b]">Missing KPI</em>}</td>
                    <td className="px-2 py-2 text-subtitle">{c.source || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!!deliverables.length && (
          <div className="mt-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Creative deliverables estimate</p>
            <div className="flex flex-col gap-2">
              {deliverables.map(item => (
                <div key={item.channelId} className="rounded-xl bg-white px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-bold">{item.channelLabel} <span className="font-medium text-subtitle">· {item.count} cell{item.count === 1 ? "" : "s"}</span></p>
                    <span className={cn("rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.04em]", item.effort === "Heavy" ? "bg-[rgba(255,149,0,0.3)]" : item.effort === "Medium" ? "bg-card" : "bg-[rgba(52,199,89,0.25)]")}>{item.effort} effort</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-subtitle">{item.family}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 rounded-xl bg-white px-3 py-2.5 text-[12px] leading-5 text-subtitle">
          <strong className="text-ink">Explicitly out of scope:</strong>{" "}
          {outScopePhases.length === 6 && !channelsUsed.length
            ? "everything — nothing is True yet."
            : `${outScopePhases.length ? `phases ${outScopePhases.join(", ")}` : "no empty phases"}${outScopePhases.length && outScopeChannels.length ? " · " : ""}${outScopeChannels.length ? `channels: ${outScopeChannels.join(", ")}` : "no empty channels"}. Metrics from False scope are not claimable later.`}
        </div>
        {!!warnings.length && (
          <p className="mt-2 text-[11px] leading-5 text-subtitle"><strong className="text-ink">Alignment flags:</strong> {warnings.map(w => w.text).join(" " )}</p>
        )}
      </div>
    </div>
  );
}

