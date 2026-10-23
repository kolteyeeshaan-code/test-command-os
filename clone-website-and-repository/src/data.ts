/**
 * App catalog, formatting helpers, and seed content.
 * Entity types live in src/db/schema.ts and are re-exported here so existing imports keep working.
 */
export type {
  Project, Session, NoteEntry, FileEntry, ActivityItem, ProjectView,
  ProjectStatus, FeeType, AppCategory, BadgeTone, ConsultingDomain,
} from "./db/schema";
export { generateId } from "./db/ids";

import type { AppCategory, AppVertical, BadgeTone, ConsultingDomain, FileEntry, NoteEntry, Project, ProjectStatus, Session, ActivityItem } from "./db/schema";
import { generateId as newId } from "./db/ids";

export type AppIconKey =
  | "pains" | "gains" | "jobs" | "day" | "journey" | "mic" | "why" | "chart"
  | "diamond" | "canvas" | "sparkle" | "compass" | "scale" | "globe"
  | "wrench" | "medal" | "warning" | "doc" | "palette" | "eye"
  | "pillar" | "lock" | "book" | "microphone" | "clipboard" | "image"
  | "ruler" | "pen" | "link" | "files" | "puzzle" | "handshake" | "check" | "star" | "world" | "target";

export interface AppDef {
  id: string;
  num: number;
  name: string;
  category: AppCategory;
  description: string;
  icon: AppIconKey;
  implemented: boolean;
  /** Operational consulting tags from the strict 9-domain taxonomy (see CONSULTING_DOMAIN_META). */
  domains: ConsultingDomain[];
  /** Vertical-Based classification layer, alongside the Process-Based `category` (see VERTICAL_META). */
  verticals: AppVertical[];
}

/** Human-readable labels + short chips for the 9-domain consulting taxonomy. */
export const CONSULTING_DOMAIN_META: Record<ConsultingDomain, { label: string; short: string }> = {
  brand_strategy: { label: "Brand Strategy (+ Positioning, Messaging)", short: "Strategy" },
  brand_experience: { label: "Brand Experience Design", short: "Experience" },
  innovation_design: { label: "Design Consultancy for Innovation & Experience", short: "Innovation" },
  digital_outreach: { label: "Digital Communication & Marketing Outreach", short: "Digital" },
  events_activations: { label: "Events, Brand Activations & Business Development", short: "Activations" },
  tactile_packaging: { label: "Environmental, Tactile, Packaging & Sensory Collateral", short: "Tactile" },
  printing_manufacturing: { label: "Printing & Collateral Manufacturing", short: "Manufacturing" },
  systems_integration: { label: "Sensory Environment & Systems Integration", short: "Systems" },
  micro_ma_matchmaking: { label: "B2B Matchmaking/Trading + Micro M&A/Funding Consultancy", short: "M&A & Trading" },
};

export const APP_CATALOG: AppDef[] = [
  { id: "pains-mapper", num: 1, name: "Customer Pains Mapper", category: "discovery", description: "Map and prioritize customer pain points by intensity and frequency.", icon: "pains", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "gains-mapper", num: 2, name: "Customer Gains Mapper", category: "discovery", description: "Identify and rank customer gains, desires, and expected outcomes.", icon: "gains", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "jobs-ranker", num: 3, name: "High-Value Jobs Ranker", category: "discovery", description: "Rank jobs-to-be-done by importance and satisfaction to find opportunities.", icon: "jobs", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "day-in-life", num: 4, name: "Day in the Life Worksheet", category: "discovery", description: "Chronological capture of a customer's day with activity/tag columns.", icon: "day", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "persona-journey", num: 5, name: "Customer Persona Journey Map", category: "discovery", description: "Persona profile plus stage-by-stage actions, thoughts, emotions, and jobs.", icon: "journey", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "bmc", num: 6, name: "Business Model Canvas", category: "strategy", description: "The classic 9-block canvas for mapping and designing business models.", icon: "canvas", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "six-innovate", num: 7, name: "Six Ways to Innovate", category: "strategy", description: "Six innovation lenses — baseline, idea, actionability per lens.", icon: "sparkle", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "strategic-guidance", num: 8, name: "Strategic Guidance Framework", category: "strategy", description: "Corporate identity + portfolio guidance (exploit / explore / transfer).", icon: "compass", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "valuation-selector", num: 9, name: "Valuation Method Selector", category: "strategy", description: "Select primary and secondary valuation methods by stage and purpose.", icon: "scale", implemented: true, domains: ["micro_ma_matchmaking"], verticals: ["micro_ma_matchmaking"] },
  { id: "asian-bm", num: 10, name: "Asian Business Model Classifier", category: "strategy", description: "Score six Asian model archetypes against the current client.", icon: "globe", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "discovery-recorder", num: 11, name: "Discovery Session Recorder", category: "discovery", description: "Capture structured insights, quotes, opportunities, risks, and actions.", icon: "mic", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "creative-brief", num: 12, name: "Creative Brief Builder", category: "creative", description: "Build comprehensive briefs: audience, message, tone, deliverables, metrics.", icon: "doc", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "style-scape", num: 13, name: "Style Scape Session Recorder", category: "creative", description: "Record visual direction, references, do/don't, and selected direction.", icon: "palette", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "design-critique", num: 14, name: "Design Critique Facilitator", category: "creative", description: "Per deliverable: five critique modes from inspire to polish.", icon: "eye", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "logo-review", num: 15, name: "Logo Brand Review Logger", category: "creative", description: "Log review rounds with versions, strengths, concerns, and decision.", icon: "star", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "why-buy", num: 16, name: "Why They Buy Analyser", category: "discovery", description: "Scope one offer, then score ten buying motivations for it.", icon: "why", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "problem-solving", num: 17, name: "Problem Solving Workbook", category: "strategy", description: "Eight steps from define to communicate, with literal and lateral structuring.", icon: "wrench", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "financial-research", num: 18, name: "Financial Research Workbook", category: "discovery", description: "Log metrics against benchmarks and sources, then interpret what they mean.", icon: "chart", implemented: true, domains: ["micro_ma_matchmaking"], verticals: ["micro_ma_matchmaking"] },
  { id: "luxuries-audit", num: 19, name: "Real Luxuries Audit", category: "discovery", description: "Audit product delivery and marketing expression against the 12 real luxuries.", icon: "diamond", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "scope-builder", num: 20, name: "Collaboration Scope Builder", category: "commercial", description: "Map upstream and downstream collaborators for a deliverable you orchestrate.", icon: "handshake", implemented: true, domains: ["printing_manufacturing"], verticals: ["printing_manufacturing"] },
  { id: "facilitation-log", num: 21, name: "Facilitation Log Entry", category: "commercial", description: "Log sessions with outcomes, decisions, and next actions.", icon: "pen", implemented: true, domains: ["events_activations"], verticals: ["events_activations"] },
  { id: "consortium-bid", num: 22, name: "Consortium Bid Builder", category: "commercial", description: "Build multi-party bids with partner roles, contributions, and fee shares.", icon: "link", implemented: true, domains: ["events_activations"], verticals: ["events_activations"] },
  { id: "dpr-consulting", num: 23, name: "DPR & Principal Project Consulting", category: "commercial", description: "Progress reporting across periods with risks and decisions.", icon: "files", implemented: true, domains: ["events_activations"], verticals: ["events_activations"] },
  { id: "brand-mindset", num: 24, name: "Brand Mindset Mapper", category: "strategy", description: "Values → beliefs → attitudes → behaviors framework.", icon: "puzzle", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "content-pillar", num: 25, name: "Content Pillar Architect", category: "creative", description: "Three to five pillars with coverage, formats, cadence, and owner.", icon: "pillar", implemented: true, domains: ["digital_outreach"], verticals: ["digital_outreach"] },
  { id: "style-locker", num: 26, name: "Signature Content Style Locker", category: "creative", description: "Lock voice, tone, vocabulary, and non-negotiable style rules.", icon: "lock", implemented: true, domains: ["digital_outreach"], verticals: ["digital_outreach"] },
  { id: "story-framework", num: 27, name: "Storytelling Framework Selector", category: "creative", description: "Choose the narrative frame, then outline the story inside it.", icon: "book", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "pitch-narrative", num: 28, name: "Pitch Narrative Builder", category: "creative", description: "Seven spoken beats from hook to closing.", icon: "microphone", implemented: true, domains: ["events_activations"], verticals: ["events_activations"] },
  { id: "story-checklist", num: 29, name: "Storytelling Design Checklist", category: "creative", description: "Ten checks for story quality, with notes where checks fail.", icon: "clipboard", implemented: true, domains: ["brand_strategy"], verticals: ["brand_strategy"] },
  { id: "design-criteria", num: 30, name: "Design Criteria Canvas", category: "creative", description: "Per deliverable: MoSCoW prioritisation plus weighted criteria by dimension.", icon: "ruler", implemented: true, domains: ["innovation_design"], verticals: ["tactile_packaging"] },
  { id: "moodboard", num: 31, name: "Moodboarding App", category: "creative", description: "Build a board from image URLs where every tile earns its place.", icon: "image", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "innovation-scorecard", num: 32, name: "Innovation Project Scorecard", category: "strategy", description: "Score 17 Strategyzer criteria with evidence; get Pursue / Explore / Kill.", icon: "medal", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "disruption-risk", num: 33, name: "Disruption Risk Assessment", category: "strategy", description: "Bipolar performance and trend assessment across 20 Strategyzer statements.", icon: "warning", implemented: true, domains: ["innovation_design"], verticals: ["innovation_design"] },
  { id: "brand-world-creator", num: 34, name: "Brand World Creator", category: "creative", description: "Cast, culture, rules, and participation vectors for a living brand world.", icon: "world", implemented: true, domains: ["brand_experience"], verticals: ["brand_experience"] },
  { id: "campaign-brief-alignment", num: 35, name: "Campaign & Brief Alignment Evaluator", category: "strategy", description: "Align a campaign or communications mandate to Brand/Product/Hybrid track and journey phase; toggle in-scope channels; lock KPIs; estimate creative deliverables; check brief alignment.", icon: "target", implemented: true, domains: ["digital_outreach"], verticals: ["digital_outreach"] },
  { id: "universal-micro-ma-suite", num: 36, name: "Micro-M&A & Structuring Suite", category: "strategy", description: "Size the capital stack and earn-out, structure deal terms, and stress the entry multiple against due-diligence red flags — with live MOIC/IRR returns in any currency.", icon: "scale", implemented: true, domains: ["micro_ma_matchmaking"], verticals: ["micro_ma_matchmaking"] },
  { id: "valuation-calculator", num: 37, name: "Valuation Multi-Engine Calculator", category: "strategy", description: "Reactive valuation engine modeling 11 variations with a dual-engine dropdown blender and sensitivity matrix.", icon: "scale", implemented: true, domains: ["micro_ma_matchmaking"], verticals: ["micro_ma_matchmaking"] },
  { id: "infra-re-consortium", num: 38, name: "InfraRE Consortium Suite", category: "commercial", description: "Jurisdiction- and currency-agnostic infrastructure SPV workspace: trust-vector alignment, capital-stack structuring with live CapEx/IRR, procurement rolodex, and GTM milestone blueprint.", icon: "files", implemented: true, domains: ["events_activations"], verticals: ["events_activations"] },
  { id: "acquisition-pipeline", num: 39, name: "Acquisition Pipeline & Deal Tracker Engine", category: "strategy", description: "5-stage buyout playbook: buy-box calibration, sourcing funnel, CIM target analysis, LOI structuring, and diligence-to-close tracking.", icon: "target", implemented: true, domains: ["micro_ma_matchmaking"], verticals: ["micro_ma_matchmaking"] },
];

export const CATEGORY_META: Record<AppCategory, { label: string }> = {
  discovery: { label: "Discovery & Insight" },
  strategy: { label: "Strategy & Business Design" },
  creative: { label: "Creative & Brand" },
  commercial: { label: "Commercial & Delivery" },
};

export const STATUS_META: Record<ProjectStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "green" },
  paused: { label: "Paused", tone: "orange" },
  completed: { label: "Completed", tone: "gray" },
};

export function getApp(id: string) { return APP_CATALOG.find(a => a.id === id); }
export function getImplementedApps() { return APP_CATALOG.filter(a => a.implemented); }

/* ───────────── Formatting ───────────── */

export function formatCurrency(n: number, c = "USD") {
  if (!n) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function relativeTime(iso: string) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const now = Date.now();
  const s = Math.floor((now - d) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  const days = Math.floor(s / 86400);
  if (days < 30) return days + " day" + (days > 1 ? "s" : "") + " ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatBytes(n: number) {
  if (!Number.isFinite(n)) return "∞";
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

/* ───────────── Factories ───────────── */

export function newProject(clientName = "", projectName = ""): Project {
  const now = new Date().toISOString();
  return {
    id: newId(), clientName, projectName, status: "active",
    startDate: now.slice(0, 10), targetEndDate: "",
    fee: 0, feeType: "fixed", feeCurrency: "USD",
    vertical: "brand_strategy",
    scopeSummary: "",
    phases: ["Discovery", "Strategy", "Creative", "Delivery", "Review"],
    donePhases: 0, sollPct: 0,
    goals: [],
    createdAt: now, updatedAt: now, deletedAt: null,
  };
}

/* ───────────── Seed content ───────────── */

const daysAgo = (d: number, hour = 10) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(hour, 0, 0, 0);
  return t.toISOString();
};

export type SeedNote = Omit<NoteEntry, "projectId">;
export type SeedFile = Omit<FileEntry, "projectId">;
export interface SeedProject extends Project { notes: SeedNote[]; files: SeedFile[] }

const note = (id: string, d: number, body: string): SeedNote => ({ id, author: "You", body, time: new Date(daysAgo(d)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), createdAt: daysAgo(d), updatedAt: daysAgo(d), deletedAt: null });
const file = (id: string, d: number, name: string, meta: string): SeedFile => ({ id, name, meta, createdAt: daysAgo(d), updatedAt: daysAgo(d), deletedAt: null });

export function seedProjects(): SeedProject[] {
  return [
    {
      id: "meridian", clientName: "Meridian Capital Partners", projectName: "Brand Identity Redesign",
      status: "active", startDate: "2025-09-01", targetEndDate: "2026-02-28",
      fee: 85000, feeType: "fixed", feeCurrency: "USD",
      scopeSummary: "Complete brand identity redesign — strategy, visual identity, and guidelines for a mid-market financial advisory firm.",
      phases: ["Discovery", "Strategy", "Creative Dev", "Design Systems", "Implementation", "Delivery", "Review"],
      donePhases: 3, sollPct: 55,
      goals: ["Reposition brand from traditional advisory to modern wealth management", "Create distinctive visual identity that builds trust with HNW clients", "Deliver comprehensive brand guidelines and asset library", "Launch new brand across digital and print touchpoints"],
      createdAt: daysAgo(80), updatedAt: daysAgo(2), deletedAt: null,
      files: [file("f1", 45, "Discovery Report.pdf", "Delivered · Oct 12"), file("f2", 24, "Brand Strategy Deck.pdf", "Delivered · Nov 3")],
      notes: [note("n1", 12, "Client approved strategy direction B — premium minimalism with warm metallics. Moving to creative development.")],
    },
    {
      id: "harvest", clientName: "Harvest & Bloom", projectName: "Brand Launch Identity",
      status: "active", startDate: "2025-10-15", targetEndDate: "2026-03-15",
      fee: 12000, feeType: "retainer", feeCurrency: "USD",
      scopeSummary: "New brand identity and launch campaign for an organic food & lifestyle brand entering DTC.",
      phases: ["Discovery", "Strategy", "Creative Dev", "Design Systems", "Implementation", "Delivery", "Review"],
      donePhases: 4, sollPct: 65,
      goals: ["Define brand positioning in the crowded organic food space", "Create visual identity that communicates authenticity and craft", "Design packaging system for initial product range", "Build digital brand presence"],
      createdAt: daysAgo(40), updatedAt: daysAgo(1), deletedAt: null,
      files: [file("f3", 35, "Competitive Landscape.pdf", "Internal · Oct 22"), file("f4", 18, "Moodboard Approved.pdf", "Approved · Nov 8")],
      notes: [note("n2", 7, "Packaging printer needs final files by Dec 5. Tight but doable if logo approval comes this week.")],
    },
    {
      id: "atlas", clientName: "Atlas Ventures", projectName: "VC Firm Positioning & Identity",
      status: "paused", startDate: "2025-11-01", targetEndDate: "",
      fee: 0, feeType: "value-based", feeCurrency: "USD",
      scopeSummary: "Brand strategy and identity for a new VC firm focused on deep-tech investments in Southeast Asia.",
      phases: ["Discovery", "Strategy", "Creative Dev", "Design Systems", "Implementation", "Delivery", "Review"],
      donePhases: 0, sollPct: 0,
      goals: ["Differentiate positioning from established VC brands", "Create visual identity that signals deep-tech expertise", "Develop investor-facing and founder-facing brand expressions"],
      createdAt: daysAgo(20), updatedAt: daysAgo(17), deletedAt: null,
      files: [],
      notes: [note("n3", 17, "Initial call went well. They want a proposal by end of month. Value-based pricing likely — $120K+ potential.")],
    },
  ];
}

export function seedSessions(): Session[] {
  return [
    {
      id: "s1", appId: "pains-mapper", projectId: "meridian",
      title: "Client Pains Analysis — Meridian Capital",
      createdAt: daysAgo(30), updatedAt: daysAgo(28), deletedAt: null, revision: 3, dataVersion: 1,
      data: { entries: [
        { id: "p1", description: "Current brand feels outdated compared to fintech competitors", intensity: 5, frequency: "Constant", segment: "HNW Clients", context: "Mentioned in every client interview" },
        { id: "p2", description: "Website doesn't reflect the quality of advisory services", intensity: 4, frequency: "Frequent", segment: "Prospects", context: "Bounce rate 65% on landing page" },
        { id: "p3", description: "Inconsistent brand presentation across advisors' materials", intensity: 3, frequency: "Frequent", segment: "Internal", context: "Each advisor uses their own slide template" },
      ] },
    },
    {
      id: "s2", appId: "bmc", projectId: "meridian",
      title: "Business Model Mapping — Meridian",
      createdAt: daysAgo(24), updatedAt: daysAgo(24), deletedAt: null, revision: 1, dataVersion: 1,
      data: {
        keyPartners: [
          { id: "bmc-kp-1", text: "Custodian banks", notes: "Custody and clearing; fee-tiered by AUM" },
          { id: "bmc-kp-2", text: "Compliance consultants", notes: "Quarterly regulatory review" },
          { id: "bmc-kp-3", text: "Portfolio management software", notes: "Rebalancing and reporting stack" },
        ],
        keyActivities: [
          { id: "bmc-ka-1", text: "Wealth advisory", notes: "Core service, billed on AUM" },
          { id: "bmc-ka-2", text: "Portfolio management", notes: "Discretionary model portfolios" },
          { id: "bmc-ka-3", text: "Financial planning", notes: "Annual plan refresh per client" },
        ],
        keyResources: [
          { id: "bmc-kr-1", text: "Licensed advisors (12)", notes: "Average 14 years' experience" },
          { id: "bmc-kr-2", text: "Proprietary research", notes: "In-house macro and sector notes" },
          { id: "bmc-kr-3", text: "Brand reputation", notes: "Built on referrals" },
        ],
        valuePropositions: [
          { id: "bmc-vp-1", text: "Personalized wealth management", notes: "Tailored to each family's goals" },
          { id: "bmc-vp-2", text: "Institutional-grade research", notes: "Same research desk used by larger funds" },
        ],
        customerRelationships: [
          { id: "bmc-cr-1", text: "Dedicated advisor", notes: "One named point of contact per client" },
          { id: "bmc-cr-2", text: "Quarterly reviews", notes: "Benchmarked against agreed targets" },
          { id: "bmc-cr-3", text: "Family office services", notes: "Top tier only" },
        ],
        channels: [
          { id: "bmc-ch-1", text: "Referrals (60%)", notes: "Client and advisor introductions" },
          { id: "bmc-ch-2", text: "Website", notes: "Inbound enquiries" },
          { id: "bmc-ch-3", text: "Private banking partnerships", notes: "Advisor networks and industry events" },
        ],
        customerSegments: [
          { id: "bmc-cs-1", text: "HNW individuals ($2M+)", notes: "Primary segment" },
          { id: "bmc-cs-2", text: "Family offices", notes: "Multi-generational mandates" },
          { id: "bmc-cs-3", text: "Business owners pre/post exit", notes: "Liquidity event planning" },
        ],
        costStructure: [
          { id: "bmc-co-1", text: "Advisor compensation (55%)", notes: "Largest cost line" },
          { id: "bmc-co-2", text: "Technology, compliance, office, marketing", notes: "Fixed overhead" },
        ],
        revenueStreams: [
          { id: "bmc-rv-1", text: "AUM fees (0.8-1.2%)", notes: "Recurring, scales with assets" },
          { id: "bmc-rv-2", text: "Financial planning fees", notes: "Project-based" },
          { id: "bmc-rv-3", text: "Family office retainers", notes: "Annual retainer" },
        ],
      },
    },
    {
      id: "s3", appId: "creative-brief", projectId: "harvest",
      title: "Packaging System Brief",
      createdAt: daysAgo(12), updatedAt: daysAgo(6), deletedAt: null, revision: 4, dataVersion: 1,
      data: {
        deliverable: "Master packaging system (6 SKUs)",
        projectName: "Harvest & Bloom Packaging System",
        client: "Harvest & Bloom", date: "2025-11-08",
        background: "Founding team needs a packaging system for the initial 6-SKU launch. Must feel handcrafted but production-ready.",
        objective: "Design a scalable packaging system that reads as premium, organic, and unmistakably ours on a crowded shelf.",
        audience: "Health-conscious urban millennials, 28–42, who buy at premium grocers and read every label.",
        keyMessage: "Real food, made with care — nothing hidden.",
        tone: "Warm, honest, quietly confident. Not shouty. Not cutesy.",
        deliverables: "Master packaging template, 6 SKU applications, print-ready files, spec sheet",
        timeline: "Concept: 2 weeks · Refinement: 2 weeks · Production files: 1 week",
        budget: "$18,000",
        constraints: "FDA-compliant labeling, recyclable materials only, must fit existing bottle & pouch specs",
        successMetrics: "Shelf-test wins in 3+ blind panels; launch on schedule; retail buyer approval",
      },
    },
  ];
}

/* ───────────── Delivery tracking seeds ───────────── */

import type { Sprint, Task, TaskPriority, TaskStatus } from "./db/schema";

const dateOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export function seedSprints(): Sprint[] {
  const base = (id: string, projectId: string, name: string, goal: string, status: Sprint["status"], startDays: number, lenDays: number): Sprint => ({
    id, projectId, name, goal, status,
    startDate: dateOffset(startDays), endDate: dateOffset(startDays + lenDays),
    createdAt: dateOffset(startDays - 3) + "T09:00:00.000Z", updatedAt: dateOffset(startDays - 3) + "T09:00:00.000Z", deletedAt: null,
  });
  return [
    base("sprint-meridian-1", "meridian", "Sprint 1 · Identity foundations", "Lock positioning territory and complete stakeholder interviews.", "active", -8, 14),
    base("sprint-harvest-1", "harvest", "Sprint 1 · Packaging system", "Master packaging template approved for all 6 SKUs.", "active", -5, 14),
  ];
}

export function seedTasks(): Task[] {
  const t = (
    id: string, projectId: string, title: string, status: TaskStatus, priority: TaskPriority,
    assignee: string, phaseIndex: number, sprintId: string | null, dueDays: number, estimate: number,
    description = "", order = 0, doneDaysAgo?: number
  ): Task => ({
    id, projectId, title, description, status, priority, assignee,
    phaseIndex, sprintId, dueDate: dateOffset(dueDays), estimate, order,
    createdAt: dateOffset(-20) + "T09:00:00.000Z", updatedAt: dateOffset(doneDaysAgo !== undefined ? -doneDaysAgo : -1) + "T09:00:00.000Z",
    completedAt: status === "done" && doneDaysAgo !== undefined ? dateOffset(-doneDaysAgo) + "T17:00:00.000Z" : null,
    deletedAt: null,
  });

  return [
    // Meridian — brand identity redesign
    t("task-m1", "meridian", "Stakeholder interviews (6 advisors)", "done", "high", "You", 0, "sprint-meridian-1", -6, 5, "Two HNW clients, four internal advisors.", 0, 6),
    t("task-m2", "meridian", "Competitive landscape audit", "done", "medium", "You", 0, "sprint-meridian-1", -3, 3, "Nine comparable wealth brands.", 1, 3),
    t("task-m3", "meridian", "Positioning territory workshop", "doing", "urgent", "You", 1, "sprint-meridian-1", 3, 8, "Three territories to test with leadership.", 0),
    t("task-m4", "meridian", "Brand architecture recommendation", "todo", "high", "You", 1, "sprint-meridian-1", 8, 5, "Monolithic vs endorsed sub-brands.", 1),
    t("task-m5", "meridian", "Legal review of name availability", "todo", "high", "Client legal", 1, "sprint-meridian-1", 5, 2, "", 2),
    t("task-m6", "meridian", "Visual identity explorations", "backlog", "high", "You", 2, null, 16, 13, "", 0),
    t("task-m7", "meridian", "Design system component library", "backlog", "medium", "You", 3, null, 30, 8, "", 1),
    t("task-m8", "meridian", "Guidelines document (print + digital)", "backlog", "medium", "You", 4, null, 45, 8, "", 2),
    t("task-m9", "meridian", "Website hero refresh", "review", "low", "Vendor", 3, null, -1, 5, "Awaiting client sign-off on copy.", 0),
    t("task-m10", "meridian", "Advisor slide template migration", "todo", "medium", "Client marketing", 3, null, 12, 5, "Twelve advisors to migrate.", 3),

    // Harvest & Bloom — packaging
    t("task-h1", "harvest", "SKU photography direction", "done", "high", "You", 0, "sprint-harvest-1", -4, 3, "", 0, 4),
    t("task-h2", "harvest", "Master packaging template", "doing", "urgent", "You", 2, "sprint-harvest-1", 2, 8, "Must fit existing bottle & pouch specs.", 0),
    t("task-h3", "harvest", "Print vendor colour proofing", "todo", "high", "Print vendor", 3, "sprint-harvest-1", 6, 3, "Recyclable stock only.", 1),
    t("task-h4", "harvest", "Nutritional panel compliance check", "todo", "urgent", "Client ops", 2, "sprint-harvest-1", 4, 2, "FDA labelling rules.", 2),
    t("task-h5", "harvest", "Shelf-test blind panel #1", "backlog", "medium", "You", 4, null, 20, 5, "", 0),
    t("task-h6", "harvest", "Retail buyer presentation", "backlog", "high", "You", 4, null, 28, 5, "", 1),
    t("task-h7", "harvest", "Logo refinement round 3", "review", "high", "You", 2, null, 1, 5, "Client asked for a lighter wordmark.", 0),
  ];
}

export function seedActivity(): ActivityItem[] {
  const a = (id: string, d: number, icon: ActivityItem["icon"], title: string, href: string, projectId: string): ActivityItem =>
    ({ id, icon, title, meta: "", href, projectId, createdAt: daysAgo(d), updatedAt: daysAgo(d), deletedAt: null });
  return [
    a("a1", 6, "session", "Creative Brief updated — Harvest & Bloom", "#/project/harvest", "harvest"),
    a("a2", 7, "note", "Note added — Harvest & Bloom", "#/project/harvest", "harvest"),
    a("a3", 24, "session", "Business Model Canvas — Meridian Capital", "#/project/meridian", "meridian"),
    a("a4", 24, "file", "Brand Strategy Deck uploaded — Meridian", "#/project/meridian", "meridian"),
  ];
}
