/**
 * Markdown export per app.
 *
 * Most apps render cleanly via a generic "structured data → markdown" pass; a handful
 * with nested/encoded shapes get a dedicated renderer so the output reads like a real
 * document rather than a data dump. Mirrors printRenderers, tuned for plain text.
 */
import { SCORECARD_SECTIONS, critKey } from "./InnovationScorecard";
import { PERFORMANCE_DOMAINS, TREND_DOMAINS, rowKey } from "./DisruptionRisk";
import { LUXURIES } from "./RealLuxuriesAudit";
import { DISCOVERY_SECTIONS } from "./DiscoverySessionRecorder";
import { FRAMEWORKS, PITCH_BEATS, STORY_CHECKS } from "./contentTools";
import { CRIT_MODES } from "./DesignCritiqueFacilitator";
import { hvRankLabel, hvScore } from "./HighValueJobsRanker";
import { PS_STEPS } from "./ProblemSolvingWorkbook";
import { BRAND_WORLD_VECTORS, BRAND_WORLD_VECTOR_STATUSES } from "./BrandWorldCreator";
import { CAMPAIGN_CHANNELS, CAMPAIGN_PHASES, campaignAlignmentWarnings, campaignDeliverables, campaignTrueCells, normalizeCampaignBriefAlignment, phaseLabel } from "./CampaignBriefAlignmentEvaluator";
import { parseMicroMA, computeMicroMA, microMaToken, microMaSymbol, microMaMoney, MICRO_MA_BASELINE, MICRO_MA_RED_FLAGS, MICRO_MA_LEGAL_STRUCTURES } from "./MicroMASuite";
import { normalizeData, evaluateMethod, blendedValuation, vcSymbol, vcMoney, vcToken, VC_METHODS, VC_METHOD_LABEL, VC_BERKUS_LAYERS } from "./ValuationCalculator";
import { normalizeInfraReConsortium, computeInfraEconomics, infraMoney, effectiveInfraCurrency, assembleMouPitch, assigneeName, readinessLabel, INFRA_PILLARS, INFRA_RESPONSIBILITIES, INFRA_MILESTONES } from "./InfraReConsortiumSuite";
import { normalizeAcquisitionPipeline, computeFunnelBars, cimProgress, cimStageLabel, effectivePipelineCurrency, pipelineMoney, computeDebtComparison, VETTING_GATES, CONCIERGE_PAID_BY } from "./AcquisitionPipelineTracker";

type Renderer = (data: any) => string;

/* ───────────── Helpers ───────────── */

const esc = (v: unknown): string => String(v ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
const nonEmpty = (v: unknown): boolean => v !== "" && v != null;

function titleCase(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_.-]+/g, " ")
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

function mdTable(headers: string[], rows: (string | number)[][]): string {
  if (!headers.length || !rows.length) return "";
  const clean = rows.map(r => r.map(c => esc(c)));
  return (
    "| " + headers.join(" | ") + " |\n" +
    "| " + headers.map(() => "---").join(" | ") + " |\n" +
    clean.map(r => "| " + r.join(" | ") + " |").join("\n") + "\n\n"
  );
}

function mdLabel(label: string, value: unknown): string {
  return nonEmpty(value) ? "**" + label + ":** " + esc(value) + "\n\n" : "";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

const SKIP = ["id", "createdAt", "updatedAt", "deletedAt", "revision", "dataVersion"];

/** Generic structured-data → markdown: labels for scalars, tables for object arrays, bullets for scalar arrays, recurse for objects. */
function mdGeneric(data: unknown, heading?: string): string {
  if (!isRecord(data)) return nonEmpty(data) ? esc(data) + "\n\n" : "";
  const keys = Object.keys(data).filter(k => !SKIP.includes(k));
  let out = heading ? "## " + heading + "\n\n" : "";
  for (const key of keys) {
    const v = data[key];
    const label = titleCase(key);
    if (Array.isArray(v)) {
      if (v.length === 0) continue;
      if (v.every(isRecord)) {
        const headers = Array.from(new Set(v.flatMap((r: Record<string, unknown>) => Object.keys(r).filter(k => !SKIP.includes(k)))));
        out += "### " + label + "\n\n" + mdTable(headers, v.map((r: Record<string, unknown>) => headers.map(h => r[h] as string | number)));
      } else {
        out += "### " + label + "\n\n" + v.map(x => "- " + esc(x)).join("\n") + "\n\n";
      }
    } else if (isRecord(v)) {
      out += "### " + label + "\n\n" + mdGeneric(v);
    } else {
      out += mdLabel(label, v);
    }
  }
  return out;
}

/* ───────────── Dedicated renderers ───────────── */

const pains: Renderer = d => "## Customer Pains\n\n" + mdTable(
  ["#", "Pain", "Intensity", "Frequency", "Segment", "Evidence"],
  (d?.entries || []).map((x: any, i: number) => [i + 1, x.description, `${x.intensity || 0}/5`, x.frequency, x.segment, x.context])
);

const gains: Renderer = d => "## Customer Gains\n\n" + mdTable(
  ["#", "Gain", "Importance", "Type", "Segment", "Notes"],
  (d?.entries || []).map((x: any, i: number) => [i + 1, x.description, `${x.importance || 0}/5`, x.type, x.segment, x.notes])
);

const jobs: Renderer = d => {
  const rows = (d?.jobs || []).slice().map((j: any) => ({ ...j, important: j.important ?? 3, tangible: j.tangible ?? 3, unsatisfied: j.unsatisfied ?? 3, lucrative: j.lucrative ?? 3 }))
    .sort((a: any, b: any) => hvScore(b) - hvScore(a));
  return "## High-Value Customer Jobs\n\n" + mdTable(
    ["Rank", "Job", "Type", "Important", "Tangible", "Unsatisfied", "Lucrative", "Score", "Value Rank"],
    rows.map((j: any, i: number) => [i + 1, j.description, j.category, `${j.important}/4`, `${j.tangible}/4`, `${j.unsatisfied}/4`, `${j.lucrative}/4`, `${hvScore(j)}/16`, hvRankLabel(hvScore(j)).label])
  );
};

const dayInLife: Renderer = d => "## Day in the Life\n\n" + mdLabel("Target customer", d?.customer) + mdLabel("Observer", d?.observer) + mdLabel("Date", d?.date) + mdLabel("Setting", d?.setting) +
  mdTable(["Time", "Activity", "Notes", "Tag"], (d?.rows || []).map((r: any) => [r.time, r.activity, r.notes, r.tag]));

const sixWays: Renderer = d => {
  const labels = ["Address more jobs", "Switch to a more important job", "Go beyond functional jobs", "Help a lot more customers", "Get a job done incrementally better", "Help a customer get a job done radically better"];
  return "## Six Ways to Innovate\n\n" + labels.map((label, i) => {
    const w = d?.ways?.[i] || {};
    return `### ${i + 1}. ${label}${w.score ? ` · ${w.score}/5 actionability` : ""}\n\n` + mdLabel("Current baseline", w.baseline) + mdLabel("Innovation idea", w.idea) + mdLabel("Next action", w.action);
  }).join("");
};

const strategicGuidance: Renderer = d => "## Corporate Identity\n\n" + mdLabel("Culture", d?.culture) + mdLabel("Strategic Direction", d?.strategicDirection) + mdLabel("Brand Image", d?.brandImage) +
  "## Portfolio Guidance\n\n" + mdLabel("Overall Portfolio", d?.overall) + mdLabel("Exploit", d?.exploit) + mdLabel("Explore", d?.explore) + mdLabel("Transfer", d?.transfer);

const valuation: Renderer = d => "## Valuation Method Selector\n\n" + mdLabel("Company stage", d?.stage) + mdLabel("Valuation purpose", d?.purpose) +
  "### Matrix Recommendation\n\n" + mdLabel("Primary method", d?.primary) + mdLabel("Secondary method", d?.secondary) + mdLabel("Rationale", d?.rationale) +
  "### Valuation Execution\n\n" + mdLabel("Chosen primary method", d?.chosenMethod) + mdLabel("Key assumptions", d?.keyAssumptions) + mdLabel("Multiples / discount inputs", d?.multiplesDiscountInputs) +
  mdLabel("Comparables & market benchmarks", d?.comparablesNotes) + mdLabel("Estimated valuation range", d?.valuationRange) + mdLabel("Conclusion", d?.conclusion);

const asianModels: Renderer = d => "## Asian Business Model Classifier\n\n" + mdTable(
  ["Model", "Relevance", "Client Application", "Notes"],
  (d?.models || []).map((m: any) => [m.name, `${m.relevance || 0}/5`, m.example, m.notes])
);

const creativeBrief: Renderer = d => "## Creative Brief\n\n" + mdLabel("Deliverable in question", d?.deliverable) + mdLabel("Project", d?.projectName) + mdLabel("Client", d?.client) + mdLabel("Date", d?.date) +
  mdLabel("Background & context", d?.background) + mdLabel("Objective", d?.objective) + mdLabel("Target audience", d?.audience) + mdLabel("Key message", d?.keyMessage) +
  mdLabel("Tone & voice", d?.tone) + mdLabel("Scope & sub-deliverables", d?.deliverables) + mdLabel("Timeline", d?.timeline) + mdLabel("Budget", d?.budget) +
  mdLabel("Constraints", d?.constraints) + mdLabel("Success metrics", d?.successMetrics);

const consortium: Renderer = d => {
  const partners = d?.partners || [];
  const allocated = partners.reduce((n: number, p: any) => n + (+p.fee || 0), 0);
  const budget = +d?.totalBudget || allocated || 1;
  return "## Consortium Bid\n\n" + mdLabel("Bid / Project", d?.bidName) + mdLabel("Client / Tenderer", d?.client) + mdLabel("Total bid budget", d?.totalBudget ? `$${(+d.totalBudget).toLocaleString()}` : "") +
    mdTable(["Partner", "Role", "Contribution", "Fee", "Share"], partners.map((p: any) => [p.name, p.role, p.contribution, `$${(+p.fee || 0).toLocaleString()}`, `${((+p.fee || 0) / budget * 100).toFixed(1)}%`])) +
    `**Allocated:** $${allocated.toLocaleString()} · ${((allocated / budget) * 100).toFixed(1)}% · **Remaining:** $${((+d?.totalBudget || 0) - allocated).toLocaleString()}\n\n` + mdLabel("Notes & terms", d?.notes);
};

const whyBuy: Renderer = d => {
  const reasons = (d?.reasons || []).slice().sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
  const avg = reasons.length ? reasons.reduce((n: number, r: any) => n + (r.score || 0), 0) / reasons.length : 0;
  return "## Why They Buy\n\n" + mdLabel("Offer in question", d?.offer) +
    mdTable(["Motivation", "Strength", "Evidence / Notes"], reasons.map((r: any) => [r.label, `${r.score || 0}/5`, r.notes])) +
    (reasons.length ? `**Top drivers:** ${reasons.slice(0, 3).map((r: any) => `${r.label} (${r.score}/5)`).join(" · ")}\n\n**Average strength:** ${avg.toFixed(1)}/5\n\n` : "") +
    mdLabel("Messaging notes", d?.summary);
};

const problemSolving: Renderer = d => {
  const steps = d?.steps || {};
  return "## Problem Solving Workbook\n\n" + PS_STEPS.map(step => {
    const value = steps[step.key] || {};
    return `### ${step.label}${value.status ? ` · ${value.status}` : ""}\n\n${value.notes || "_No notes captured._"}\n\n`;
  }).join("");
};

const styleScape: Renderer = d => "## Style Scape Direction\n\n" + mdLabel("Date", d?.date) + mdLabel("Overall direction", d?.direction) +
  mdTable(["Reference", "Comment"], (d?.references || []).map((r: any) => [r.name, r.comment])) + mdLabel("Do", d?.dos) + mdLabel("Don't", d?.donts) + mdLabel("Selected direction summary", d?.summary);

const logoReview: Renderer = d => "## Logo Brand Review Log\n\n" + mdTable(
  ["Round", "Date", "Versions Reviewed", "Strengths", "Concerns", "Decision"],
  (d?.reviews || []).map((r: any) => [r.round, r.date, r.versions, r.strengths, r.concerns, r.decision])
) + mdLabel("Final direction", d?.final);

const facilitation: Renderer = d => "## Facilitation Log\n\n" + mdTable(
  ["Date", "Session", "Outcomes", "Decisions", "Next Actions"],
  (d?.entries || []).map((e: any) => [e.date, e.session, e.outcomes, e.decisions, e.actions])
);

const dpr: Renderer = d => "## DPR & Principal Project Consulting\n\n" + mdLabel("Project", d?.project) + mdLabel("Reporting period", d?.period) +
  mdTable(["Date", "Update", "Risks / Issues", "Decisions"], (d?.items || []).map((e: any) => [e.date, e.update, e.risks, e.decisions]));

const bmc: Renderer = d => {
  const blocks: [string, string][] = [
    ["Key Partners", "keyPartners"], ["Key Activities", "keyActivities"], ["Key Resources", "keyResources"],
    ["Value Propositions", "valuePropositions"], ["Customer Relationships", "customerRelationships"], ["Channels", "channels"],
    ["Customer Segments", "customerSegments"], ["Cost Structure", "costStructure"], ["Revenue Streams", "revenueStreams"],
  ];
  // Blocks are item arrays ({ text, notes }); older sessions still hold flat strings. Join items on one line each.
  const bmcText = (v: unknown): string => Array.isArray(v)
    ? v.map((i: any) => [i?.text, i?.notes].filter(Boolean).join(" — ")).filter(Boolean).join("; ")
    : String(v ?? "");
  return "## Business Model Canvas\n\n" + blocks.map(([l, k]) => mdLabel(l, bmcText(d?.[k]))).join("");
};

const designCriteria: Renderer = d => {
  const canvases = (d?.canvases || []) as any[];
  if (!canvases.length) return mdGeneric(d);
  return canvases.map((c, i) => {
    let out = "## " + (c.deliverable || "Deliverable " + (i + 1)) + "\n\n";
    const moscow = c.moscow || {};
    const buckets: [string, string][] = [["Must", "must"], ["Should", "should"], ["Could", "could"], ["Won't", "wont"]];
    out += "### MoSCoW Prioritisation\n\n";
    for (const [label, key] of buckets) {
      const items = moscow[key] || [];
      if (!items.length) continue;
      out += "**" + label.toUpperCase() + "** (" + items.length + ")\n\n";
      items.forEach((it: any) => { out += "- " + (it.text || "(untitled)") + (it.notes ? " — *" + it.notes + "*" : "") + "\n"; });
      out += "\n";
    }
    const dims = c.dimensions || {};
    const dimRows = Object.entries(dims).flatMap(([dim, items]: any) => (items || []).map((it: any) => [titleCase(dim), it.name, it.weight + "/5", it.mustHave ? "Must-have" : "Nice-to-have"] as (string | number)[]));
    if (dimRows.length) out += "### Weighted Criteria\n\n" + mdTable(["Dimension", "Criterion", "Weight", "Type"], dimRows);
    return out;
  }).join("\n");
};

const persona: Renderer = d => {
  const p = d?.persona || {};
  let out = "## Persona\n\n" + mdLabel("Name", p.name) + mdLabel("Demographics", p.demographics) + mdLabel("Background", p.background) + mdLabel("Goals", p.goals) + mdLabel("Frustrations", p.frustrations);
  const stages = d?.stages || [];
  if (stages.length) {
    out += "## Journey Stages\n\n";
    stages.forEach((s: any, i: number) => {
      const pol = s.emotionVal || (s.emotions?.includes("😊") ? "Positive" : s.emotions?.includes("😟") ? "Negative" : "Neutral");
      out += "### " + (i + 1) + ". " + (s.name || "Stage") + "\n\n";
      out += mdLabel("Actions", s.actions) + mdLabel("Thoughts", s.thoughts) + mdLabel("Emotion", pol + (s.emotionDesc ? " — " + s.emotionDesc : "")) + mdLabel("Pain points", s.pains) + mdLabel("Jobs-to-be-done", s.jobs);
    });
  }
  return out;
};

const discovery: Renderer = d => {
  let out = "## Session Details\n\n" + mdLabel("Date", d?.date) + mdLabel("Attendees", d?.attendees) + mdLabel("Focus", d?.focus);
  const buckets: [string, string][] = [["insights", "Key Insights"], ["quotes", "Notable Quotes"], ["opportunities", "Opportunities"], ["risks", "Risks & Concerns"], ["nextActions", "Next Actions"]];
  const anyBuckets = buckets.some(([k]) => (Array.isArray(d?.[k]) ? d[k].length : 0));
  if (anyBuckets) {
    out += "## Live Findings\n\n";
    for (const [key, label] of buckets) {
      const items = d?.[key] || [];
      if (!items.length) continue;
      out += "### " + label + "\n\n" + items.map((n: any) => "- " + (n.text || "")).join("\n") + "\n\n";
    }
  }
  const answers = d?.answers || {};
  const answered = DISCOVERY_SECTIONS.map(sec => ({ sec, qs: sec.questions.filter(q => (answers[String(q.id)] || "").trim()) })).filter(x => x.qs.length);
  if (answered.length) {
    out += "## Questionnaire Responses\n\n";
    answered.forEach(({ sec, qs }) => {
      out += "### " + sec.title + "\n\n";
      qs.forEach(q => { out += "**Q" + q.id + ".** " + q.text + "\n\n" + (answers[String(q.id)] || "*—*") + "\n\n"; });
    });
  }
  return out;
};

const scope: Renderer = d => {
  let out = "## Overview\n\n" + mdLabel("Client", d?.client) + mdLabel("Project", d?.project) + mdLabel("Deliverable in question", d?.deliverable) + mdLabel("My role", d?.myRole);
  const up = d?.upstream || [];
  const down = d?.downstream || [];
  const phases = d?.phases || [];
  if (up.length) out += "## Upstream Collaborators\n\n" + mdTable(["Name", "Role", "Supplies", "Dependency", "Status", "Owner"], up.map((c: any) => [c.name, c.role, c.what, c.dependency, c.status, c.owner]));
  if (down.length) out += "## Downstream Collaborators\n\n" + mdTable(["Name", "Role", "Receives", "Dependency", "Status", "Consumption", "Handover"], down.map((c: any) => [c.name, c.role, c.what, c.dependency, c.status, c.consumption, c.handover]));
  if (phases.length) {
    const total = phases.reduce((s: number, p: any) => s + (+p.fee || 0), 0);
    out += "## Phases & Milestones\n\n" + mdTable(["Phase", "Timeline", "Description", "Fee"], phases.map((p: any) => [p.name, p.timeline, p.description, "$" + (+p.fee || 0).toLocaleString()])) + "**Total:** $" + total.toLocaleString() + "\n\n";
  }
  out += mdLabel("Terms", d?.terms) + mdLabel("Payment notes", d?.payment);
  return out;
};

const innovation: Renderer = d => {
  const scores = d?.scores || {}, notes = d?.notes || {};
  const rows: (string | number)[][] = [];
  SCORECARD_SECTIONS.forEach((sec, si) => sec.criteria.forEach((c, ci) => { const k = critKey(si, ci); rows.push([c.label, sec.title, scores[k] || 0, notes[k] || ""]); }));
  const vals = Object.values(scores).filter((v: any) => typeof v === "number" && v > 0) as number[];
  const avg = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  const rec = d?.recommendation || (avg >= 4 ? "Pursue" : avg >= 2.75 ? "Explore further" : "Kill · Pivot");
  return "## Innovation Project Scorecard\n\n" + mdLabel("Project", d?.project) + mdLabel("Description", d?.description) +
    mdTable(["Criterion", "Section", "Score", "Evidence"], rows) +
    "**Result:** " + vals.length + " scored · Average " + (avg ? avg.toFixed(1) : "—") + "/5 · " + rec + "\n\n";
};

const disruption: Renderer = d => {
  const scores = d?.scores || {};
  const track = (domains: typeof PERFORMANCE_DOMAINS, t: "performance" | "trend", title: string) => {
    const rows: (string | number)[][] = [];
    domains.forEach((dom, di) => dom.rows.forEach((row, ri) => rows.push([dom.title, row.left, row.right, scores[rowKey(t, di, ri)] ?? 0])));
    return "### " + title + "\n\n" + mdTable(["Domain", "Threat (−3)", "Opportunity (+3)", "Score"], rows);
  };
  const avg = (domains: typeof PERFORMANCE_DOMAINS, t: "performance" | "trend") => {
    const vals: number[] = [];
    domains.forEach((_, di) => domains[di].rows.forEach((_, ri) => { const v = scores[rowKey(t, di, ri)]; if (typeof v === "number" && v !== 0) vals.push(v); }));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  };
  const p = avg(PERFORMANCE_DOMAINS, "performance"), tr = avg(TREND_DOMAINS, "trend");
  const overall = (p + tr) / 2;
  const label = overall <= -1.5 ? "Critical risk" : overall <= -0.75 ? "Elevated risk" : overall < 0.75 ? "Monitor" : "Strong position";
  return "## Disruption Risk Assessment\n\n" + mdLabel("Offer", d?.offer) +
    track(PERFORMANCE_DOMAINS, "performance", "Business Model Performance") +
    track(TREND_DOMAINS, "trend", "Business Model Trend") +
    "**Result:** Performance " + (p ? p.toFixed(2) : "—") + " · Trend " + (tr ? tr.toFixed(2) : "—") + " · Overall " + (overall ? overall.toFixed(2) : "—") + " · " + label + "\n\n" +
    mdLabel("Mitigation", d?.mitigation) + mdLabel("Synthesis", d?.synthesis);
};

const luxuries: Renderer = d => {
  const lux = d?.luxuries || {};
  const get = (k: string) => lux[k] || {};
  const rel = (v: any) => ({ "None": 0, "Low": 1, "Medium": 2, "High": 3 } as Record<string, number>)[v.relevance] ?? 0;
  const rows = LUXURIES.map(l => { const v = get(l.key); return [l.label, v.relevance || "—", v.product ?? 0, v.marketing ?? 0, v.notes || ""]; });
  const under = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, g: (v.product || 0) - (v.marketing || 0) }; }).filter(x => x.g > 0).sort((a, b) => b.g - a.g).slice(0, 3);
  const over = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, g: (v.marketing || 0) - (v.product || 0) }; }).filter(x => x.g > 0).sort((a, b) => b.g - a.g).slice(0, 3);
  const strongest = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, s: rel(v) * 2 + (v.product || 0) + (v.marketing || 0) }; }).sort((a, b) => b.s - a.s).slice(0, 3).filter(x => x.s > 0);
  return "## Real Luxuries Audit\n\n" + mdLabel("Offer", d?.offer) + mdLabel("Lens", d?.lens) +
    mdTable(["Luxury", "Relevance", "Product", "Marketing", "Opportunity"], rows) +
    (strongest.length ? "**Strongest:** " + strongest.map(s => s.label + " (" + s.s + ")").join(" · ") + "\n\n" : "") +
    (under.length ? "**Under-communicated:** " + under.map(s => s.label + " (+" + s.g + ")").join(" · ") + "\n\n" : "") +
    (over.length ? "**Over-promised:** " + over.map(s => s.label + " (+" + s.g + ")").join(" · ") + "\n\n" : "") +
    mdLabel("Summary", d?.summary);
};

const mindset: Renderer = d => {
  const sec = (label: string, items: any[]) => items?.length ? "### " + label + "\n\n" + items.map(i => "- " + (i.text || "")).join("\n") + "\n\n" : "";
  return "## Brand Mindset\n\n" + sec("Core Values", d?.values) + sec("Beliefs", d?.beliefs) + sec("Attitudes", d?.attitudes) + sec("Behaviors", d?.behaviors);
};

const storyFramework: Renderer = d => {
  const selectedId = d?.selectedId || "golden_circle";
  const fw = FRAMEWORKS.find(f => f.id === selectedId) ?? FRAMEWORKS[0];
  const fields = d?.fields || {};
  let out = "## " + fw.name + "\n\n" + mdLabel("Use when", fw.useWhen) + mdLabel("Deliverable in question", d?.deliverable) + mdLabel("Audience", d?.audience) + mdLabel("Goal", d?.goal);
  fw.fields.forEach(f => { out += mdLabel(f.label, fields[fw.id + "." + f.key] ?? d?.[f.key]); });
  out += mdLabel("Notes", d?.notes);
  return out;
};

const pitch: Renderer = d => "## Pitch Narrative\n\n" + PITCH_BEATS.map((b, i) => d?.beats?.[b.key] ? "### " + (i + 1) + ". " + b.label + "\n\n" + (d.beats[b.key] || "") + "\n\n" : "").join("");

const checklist: Renderer = d => {
  const checks = d?.checks || {}, notes = d?.notes || {};
  const passed = STORY_CHECKS.filter(c => checks[c]).length;
  return "## Storytelling Design Checklist\n\n" + mdLabel("Deliverable", d?.deliverable) +
    "**Result:** " + passed + "/" + STORY_CHECKS.length + " passing\n\n" +
    STORY_CHECKS.map((c, i) => "- " + (checks[c] ? "[x]" : "[ ]") + " " + (i + 1) + ". " + c + (notes[c] ? " — *" + notes[c] + "*" : "")).join("\n") + "\n\n";
};

const critique: Renderer = d => {
  const deliverables = d?.deliverables || [];
  if (!deliverables.length) return mdGeneric(d);
  return deliverables.map((dl: any) => {
    const modes = dl.modes || {};
    let out = "## " + (dl.name || "Untitled deliverable") + "\n\n";
    CRIT_MODES.forEach((m, i) => {
      const v = modes[m.name] || {};
      if (!(v.answers || "").trim() && !(v.notes || "").trim()) return;
      out += "### " + (i + 1) + ". " + m.name + "\n\n" + mdLabel("Client feedback", v.answers) + mdLabel("Consultant notes", v.notes);
    });
    return out;
  }).join("");
};

const financialResearch: Renderer = d => {
  const metrics = d?.metrics || [];
  return "## Financial Research Workbook\n\n" +
    mdLabel("Subject / Company", d?.subject) +
    mdLabel("Period", d?.period) +
    mdTable(
      ["Metric", "Value", "Benchmark", "Source", "Interpretation"],
      metrics.map((m: any) => [m.metric, m.value, m.benchmark, m.source, m.note])
    ) +
    mdLabel("Research Summary", d?.summary);
};

const contentPillar: Renderer = d => {
  const pillars = d?.pillars || [];
  return "## Content Pillar Architect\n\n" +
    mdTable(
      ["Pillar", "Covers", "Formats", "Cadence", "Owner"],
      pillars.map((p: any) => [p.name, p.covers, p.formats, p.cadence, p.owner])
    ) +
    mdLabel("Strategy Notes", d?.strategy);
};

const styleLocker: Renderer = d => {
  const rules = d?.rules || [];
  return "## Signature Content Style Locker\n\n" +
    mdLabel("Voice", d?.voice) +
    mdLabel("Tone", d?.tone) +
    mdLabel("We Say", d?.doSay) +
    mdLabel("We Never Say", d?.dontSay) +
    mdLabel("Formatting Rules", d?.formatting) +
    (rules.length ? "### Locked Signature Rules\n\n" + rules.map((r: any, i: number) => `${i + 1}. ${r.rule}`).join("\n") + "\n\n" : "") +
    mdLabel("Reference Examples", d?.examples);
};

const moodboard: Renderer = d => {
  const tiles = d?.tiles || [];
  return "## Moodboarding App\n\n" +
    mdTable(
      ["Tile", "Why It Belongs", "Tags", "Image URL"],
      tiles.map((t: any) => [t.title, t.why, t.tags, t.imageUrl])
    ) +
    mdLabel("Direction Summary", d?.direction);
};

const brandWorld: Renderer = d => {
  const statusLabel = (value: string) => BRAND_WORLD_VECTOR_STATUSES.find(s => s.value === value)?.label || "Missing";
  const always = Array.isArray(d?.alwaysRules) ? d.alwaysRules : [];
  const never = Array.isArray(d?.neverRules) ? d.neverRules : [];
  const checks = [...always.map((rule: string, i: number) => ({ key: `always-${i}`, label: `Keeps Always ${i + 1}`, rule })), ...never.map((rule: string, i: number) => ({ key: `never-${i}`, label: `Avoids Never ${i + 1}`, rule }))]
    .filter(row => String(row.rule || "").trim());
  const answers = d?.evaluation?.answers || {};
  const answered = checks.filter(row => answers[row.key]);
  const conflicts = answered.filter(row => answers[row.key] === "no").length;
  return "## Brand World\n\n" + mdLabel("World", d?.worldName) + mdLabel("Promise", d?.worldTagline) +
    "### Cast the World\n\n" +
    mdTable(["Character", "Role", "Description"], (d?.characters || []).map((c: any) => [c.name, c.role, c.description])) +
    mdTable(["Place"], (d?.places || []).map((x: any) => [x.text])) +
    mdTable(["Object"], (d?.objects || []).map((x: any) => [x.text])) +
    mdLabel("Context Setting", d?.context) +
    "### Culture\n\n" +
    mdTable(["Lexicon"], (d?.lexicon || []).map((x: any) => [x.text])) +
    mdTable(["Rituals"], (d?.rituals || []).map((x: any) => [x.text])) +
    mdTable(["Humor & Interests"], (d?.humor || []).map((x: any) => [x.text])) +
    "### Universe Rules\n\n" +
    mdTable(["Always"], always.map((rule: string, i: number) => [`${i + 1}. ${rule}`])) +
    mdTable(["Never"], never.map((rule: string, i: number) => [`${i + 1}. ${rule}`])) +
    mdLabel("Idea Under Evaluation", d?.evaluation?.idea) + mdLabel("Idea Type", d?.evaluation?.ideaKind) +
    mdTable(["Boundary", "Rule", "Verdict"], checks.map(row => [row.label, row.rule, answers[row.key] === "no" ? "Fail" : answers[row.key] === "yes" ? "Pass" : "Check"])) +
    (answered.length ? `**Boundary result:** ${answered.length}/${checks.length} checked · ${conflicts} conflict${conflicts === 1 ? "" : "s"}\n\n` : "") +
    mdLabel("Evaluator Notes", d?.evaluation?.notes) +
    "### Participation Audit\n\n" +
    mdTable(["Vector", "Question", "Status", "Evidence / Next Move"], BRAND_WORLD_VECTORS.map(v => {
      const value = d?.vectors?.[v.key] || {};
      return [v.label, v.prompt, statusLabel(value.status), value.evidence];
    })) +
    "### Campaign Chapters\n\n" +
    mdTable(["Chapter", "New Variable", "Anchors", "Storyline", "Success"], (d?.chapters || []).map((c: any) => [c.title, `${c.variableKind}: ${c.newVariable}`, c.familiarAnchors, c.storyline, c.success]));
};

const campaignBriefAlignment: Renderer = raw => {
  const d = normalizeCampaignBriefAlignment(raw);
  const scope = campaignTrueCells(d);
  const warnings = campaignAlignmentWarnings(d);
  const deliverables = campaignDeliverables(d);
  const lean = (n: number) => d.hybridLean?.[String(n)] ?? "both";
  const trackLabel = d.track === "brand" ? "Brand" : d.track === "product" ? "Product" : "Hybrid";
  let out = "## Campaign & Brief Alignment\n\n" +
    mdLabel("Mandate / campaign in question", d.mandate) +
    mdLabel("Attention track", trackLabel) +
    mdLabel("Bottleneck phase", `Phase ${d.bottleneckPhase} · ${phaseLabel(d.track, d.bottleneckPhase, lean(d.bottleneckPhase))}`) +
    mdLabel("Why stuck here", d.bottleneckNote) +
    mdLabel("Brief / mandate wording", d.briefPaste);
  if (d.track === "hybrid") {
    out += "### Hybrid Lean Per Phase\n\n" + mdTable(["Phase", "Tracks", "Lean"],
      CAMPAIGN_PHASES.map(p => [`Phase ${p.n}`, `${p.brandLabel} / ${p.productLabel}`, lean(p.n)]));
  }
  out += `### In-Scope Cells (${scope.length})\n\n` + mdTable(["Phase", "Channel", "KPI", "Data Source", "Creative", "Notes"],
    scope.map(c => [`P${c.phase} · ${c.phaseLabel}`, c.channelLabel, c.kpi || "—", c.source || "—", c.creative || "—", c.notes || "—"]));
  if (deliverables.length) {
    out += "### Creative Deliverables Estimate\n\n" + mdTable(["Channel", "Scope Implies", "Effort"],
      deliverables.map(x => [`${x.channelLabel} (${x.count} cell${x.count === 1 ? "" : "s"})`, x.family, x.effort]));
  }
  const phasesUsed = new Set(scope.map(c => c.phase));
  const outPhases = [1, 2, 3, 4, 5, 6].filter(p => !phasesUsed.has(p));
  const channelsUsed = new Set(scope.map(c => c.channelId));
  const outChannels = CAMPAIGN_CHANNELS.filter(c => !channelsUsed.has(c.id)).map(c => c.label);
  out += mdLabel("Explicitly out of scope", `Phases: ${outPhases.length ? outPhases.join(", ") : "none"} · Channels: ${outChannels.length ? outChannels.join(", ") : "none"}. Metrics for False scope are not claimable.`);
  if (warnings.length) {
    out += "### Alignment Warnings\n\n" + warnings.map(w => `- **${w.level === "warn" ? "Warning" : "Gap"}:** ${w.text}`).join("\n") + "\n\n";
  }
  return out;
};

const microMa: Renderer = d => {
  const data = parseMicroMA(d);
  const c = computeMicroMA(data);
  const sym = microMaSymbol(data.currency, data.customCurrencyCode);
  const M = (v: number) => microMaMoney(v, sym);
  const X1 = (v: number) => `${v.toFixed(1)}x`;
  const X2 = (v: number) => `${v.toFixed(2)}x`;
  const flags = MICRO_MA_RED_FLAGS.filter(f => data.flags.includes(f.id));
  let out = "## Micro-M&A & Structuring Suite\n\n";
  out += mdLabel("Reporting currency", microMaToken(data.currency, data.customCurrencyCode));
  out += "### Fixed Baseline Metrics\n\n" + mdTable(["Metric", "Value"], [
    ["Target Company Current Revenue", M(MICRO_MA_BASELINE.revenue)],
    ["Target Company Current EBITDA", `${M(MICRO_MA_BASELINE.ebitda)} (${MICRO_MA_BASELINE.ebitdaMarginPct}% margin)`],
    ["Benchmark Competitor Trading Multiple", X1(MICRO_MA_BASELINE.benchmarkMultiple)],
  ]);
  out += "### Capital Stack & Earn-Out\n\n" + mdTable(["Output", "Value"], [
    ["Target Base EV/EBITDA Entry Multiple", X1(data.entryMultiple)],
    ["Upfront Cash Down Payment %", `${data.upfrontCashPct}%`],
    ["Projected Annual Revenue Growth Rate %", `${data.revenueGrowthPct}%`],
    ["Target Stabilized Operating Margin %", `${data.stabilizedMarginPct}%`],
    ["Target Exit Valuation Multiple", X1(data.exitMultiple)],
    ["Adjusted Entry Multiple (after red flags)", X1(c.adjustedMultiple)],
    ["Initial Enterprise Value (EV)", M(c.initialEV)],
    ["Upfront Cash Check Sizing", M(c.upfrontCash)],
    ["Deferred Seller Note Sizing", M(c.deferredNote)],
    ["Projected Year 5 Revenue", M(c.y5Revenue)],
    ["Projected Year 5 EBITDA", M(c.y5Ebitda)],
    ["Gross Exit Valuation (EV)", M(c.grossExitEV)],
  ]);
  out += "### Restructuring & Deal Terms\n\n";
  out += mdLabel("Transaction Legal Structure", MICRO_MA_LEGAL_STRUCTURES[data.legalStructure]);
  out += mdLabel("Working Capital Target Peg (NWC)", M(data.nwcPeg));
  out += mdLabel("Inventory/Receivables Leakage Guardrails", data.leakageGuardrails);
  out += mdLabel("Founder Handover & Transition Window", data.handoverMode);
  out += mdLabel("Interim Management Deployment Sequence", data.transitionSequence);
  out += "### Due Diligence & Valuation Guardrails\n\n";
  out += flags.length
    ? flags.map(f => `- **−${f.penalty.toFixed(2)}x** ${esc(f.label)}`).join("\n") + "\n\n"
    : "_No red flags active._\n\n";
  out += mdLabel("Total entry multiple deduction", `−${c.flagPenalty.toFixed(2)}x`);
  out += "### Master Return Summary\n\n" + mdTable(["Measure", "Value"], [
    ["Target MOIC", X2(c.moic)],
    ["Implied IRR %", c.irrPct === null ? "—" : `${c.irrPct.toFixed(1)}%`],
    ["Net Sponsor Proceeds on Exit", M(c.netProceeds)],
    ["Total Capital Sourced From Outside Co-Investors", `${M(c.outsideCoInvestors)} (Upfront Cash Check less a 10% Sponsor GP Carry Floor)`],
  ]);
  return out;
};

const valuationCalculator: Renderer = d => {
  const data = normalizeData(d);
  const sym = vcSymbol(data.currency, data.customCurrencyCode);
  const M = (v: number) => vcMoney(v, sym);
  const p = evaluateMethod(data.primary, data);
  const s = evaluateMethod(data.secondary, data);
  const blend = blendedValuation(data);
  let out = "## Valuation Multi-Engine Calculator\n\n";
  out += mdLabel("Reporting currency", vcToken(data.currency, data.customCurrencyCode));
  out += mdLabel("Primary method", VC_METHOD_LABEL[data.primary]);
  out += mdLabel("Secondary method", VC_METHOD_LABEL[data.secondary]);
  out += mdLabel("Blend weighting", `${data.blendWeightPct}% ${VC_METHOD_LABEL[data.primary]} / ${100 - data.blendWeightPct}% ${VC_METHOD_LABEL[data.secondary]}`);
  out += "### Engine Outputs\n\n" + mdTable(["Engine", "Standalone value"], [
    [`Primary · ${VC_METHOD_LABEL[data.primary]}`, M(p.value)],
    [`Secondary · ${VC_METHOD_LABEL[data.secondary]}`, M(s.value)],
  ]);
  out += `**Blended Combined Valuation Assessment: ${M(blend)}**\n\n`;
  out += mdLabel("Primary basis", p.detail);
  out += mdLabel("Secondary basis", s.detail);
  out += "### Shared Fundamentals\n\n" + mdTable(["Input", "Value"], [
    ["Revenue", M(data.revenue)], ["EBITDA", M(data.ebitda)], ["Net Debt", M(data.netDebt)],
    ["Total Assets", M(data.totalAssets)], ["Total Liabilities", M(data.totalLiabilities)], ["Active Users", data.users.toLocaleString("en-US")],
  ]);
  out += "### All 11 Method Values\n\n" + mdTable(["#", "Method", "Value"], VC_METHODS.map(m => [
    m.n, m.label, M(evaluateMethod(m.id, data).value),
  ]));
  out += "### Engine Parameters\n\n";
  out += mdLabel("Method 1 · Scorecard base floor", M(data.scorecardFloor));
  VC_BERKUS_LAYERS.forEach(l => { out += mdLabel(`  · ${l.label}`, M(data.berkusFactors[l.key] ?? 0)); });
  out += mdLabel("Method 5 · Berkus inverse benchmark", data.berkusBenchmark ? M(data.berkusBenchmark) : "mirrors Method 1");
  out += mdLabel("Method 2 · EV/Sales multiple", `${data.evSalesMultiple}x`);
  out += mdLabel("Method 2 · EV/User sub-view", data.users > 0 ? `${M(data.evPerUser)} × ${data.users.toLocaleString("en-US")} users = ${M(data.users * data.evPerUser)}` : "off");
  out += mdLabel("Method 3 · EV/EBITDA multiple", `${data.evEbitdaMultiple}x`);
  out += mdLabel("Method 6 · DCF (FCF / growth / WACC)", `${M(data.dcfFcf)} · ${data.dcfGrowthPct}% · ${data.dcfWaccPct}%`);
  out += mdLabel("Method 6 · DCF terminal factor", `${data.dcfTerminalMode} @ ${data.dcfTerminalMultiple}x`);
  out += mdLabel("Method 7 · Liquidation haircut", `${data.liquidationHaircutPct}%`);
  out += mdLabel("Method 9 · Replacement premium", `${data.replacementPremiumPct}%`);
  out += mdLabel("Method 8 · EV/TAM", `TAM ${M(data.tam)} · ${data.tamPenetrationPct}% penetration · ${data.tamShareOfEV}% share of EV`);
  return out;
};

const acquisitionPipeline: Renderer = d => {
  const data = normalizeAcquisitionPipeline(d);
  const cur = effectivePipelineCurrency(data, "USD");
  const M = (v: number) => pipelineMoney(v, cur);
  const bars = computeFunnelBars(data.sourcingFunnel);
  const total = data.sourcingFunnel.marketVolume || 1;

  let out = "## Acquisition Pipeline & Deal Tracker Engine\n\n";
  out += mdLabel("Reporting currency", cur);
  out += mdLabel("Jurisdiction", "Currency-agnostic");

  out += "### Strategy & Buy Box Calibration\n\n" + mdTable(["Input", "Value"], [
    ["Sourced Down Payment Available", M(data.buyBox.downPayment)],
    ["Target Annual Cash Flow Required", M(data.buyBox.targetCashFlow)],
    ["Target Time Dedication", `${data.buyBox.hoursPerWeek} Hours/Week`],
    ["Time Dedication Detail", data.buyBox.timeDedication || "—"],
    ["Target Geography Boundaries", data.buyBox.geography || "—"],
    ["Target Industry Boundaries", data.buyBox.industry || "—"],
  ]);

  out += "### Preparation Milestones\n\n" + mdTable(["Milestone", "Status"], [
    ["Define Buy Box & Capital Stack", data.prepMilestones[0] ? "✓ Done" : "○ Pending"],
    ["Build Sourcing Channels & Broker Network", data.prepMilestones[1] ? "✓ Done" : "○ Pending"],
    ["Prepare Diligence Framework & Team", data.prepMilestones[2] ? "✓ Done" : "○ Pending"],
    ["Secure Financing Pre-Approval & LOI Template", data.prepMilestones[3] ? "✓ Done" : "○ Pending"],
  ]);

  out += "### Sourcing Funnel & Deal Flow\n\n" + mdTable(["Stage", "Count", "Attrition"], bars.map(b => [
    b.label, String(b.value), b.pct.toFixed(1) + "% of market",
  ]));
  out += mdLabel("Buy-Box Hit Rate", `${((data.sourcingFunnel.fitsBuyBox / total) * 100).toFixed(1)}%`);
  out += mdLabel("Offer Rate", `${((data.sourcingFunnel.worthOffer / total) * 100).toFixed(1)}%`);
  out += mdLabel("Funnel Yield", `${((data.sourcingFunnel.worthOffer / total) * 100).toFixed(2)}% make it to offer`);

  if (data.activeTargets.length) {
    out += "### Target Analysis & CIM Evaluation\n\n" + mdTable(
      ["#", "Company", "Channel", "Exit Motivation", "Team Maturity", "Concentration Risk", "CIM (3 checks)", "Stage", "Notes"],
      data.activeTargets.map((t, i) => [
        String(i + 1),
        t.companyName || "—",
        t.channel,
        t.retirementMotivation || "—",
        t.managementMaturity,
        t.concentrationRisk,
        `${cimProgress(t.cim)}/3`,
        cimStageLabel(t.cim),
        t.notes || "—",
      ]),
    );
    out += "#### Reading the CIM — Detail\n\n" + mdTable(
      ["Target", "3-Yr Financials", "Management Analysis", "Fluff Identifier"],
      data.activeTargets.map(t => [
        t.companyName || `Target ${t.id.slice(0, 4)}`,
        t.cim.financials3yr ? "✓" : "○",
        t.cim.managementAnalysis ? "✓" : "○",
        t.cim.fluffIdentifier ? "✓" : "○",
      ]),
    );
  } else {
    out += "### Target Analysis & CIM Evaluation\n\nNo acquisition targets added yet.\n\n";
  }

  out += "### LOI Structuring — Deal Terms\n\n" + mdTable(["Field", "Value"], [
    ["Seller Primary Pain Point", data.dealStructure.sellerPainPoint || "—"],
    ["How Our LOI Structuring Solves It", data.dealStructure.loiSolution || "—"],
    ["Handover Mode", data.dealStructure.handoverMode],
  ]);

  out += "### Due Diligence Checklists\n\n" + mdTable(["Check", "Status"], [
    ["Free — Site Visit", data.diligence.siteVisit ? "✓" : "○"],
    ["Free — Employee Interviews", data.diligence.employeeInterviews ? "✓" : "○"],
    ["Free — Customer Emulation", data.diligence.customerEmulation ? "✓" : "○"],
    ["Professional — CPA Quality of Earnings (QofE)", data.diligence.cpaQofE ? "✓" : "○"],
    ["Professional — Legal Contract Assessment", data.diligence.legalContracts ? "✓" : "○"],
    ["Professional — Bank Document Checklist", data.diligence.bankDocs ? "✓" : "○"],
  ]);

  out += "### Closing Track — Moving Towards Closing\n\n" + mdTable(["Step", "Status"], [
    ["Step 1 — LOI Accepted & Exclusivity Secured", data.diligence.closingStep1 ? "✓" : "○"],
    ["Step 2 — Financing Committed & PA Drafted", data.diligence.closingStep2 ? "✓" : "○"],
    ["Step 3 — Funds Wired & Keys Handed Over", data.diligence.closingStep3 ? "✓" : "○"],
  ]);
  const closingDone = [data.diligence.closingStep1, data.diligence.closingStep2, data.diligence.closingStep3].filter(Boolean).length;
  out += mdLabel("Closing momentum", `${closingDone} / 3`);


  // ── Debt Optimization & Stress Test ──
  const debt = data.debtStressTest;
  const dc = computeDebtComparison(debt);
  const paidBy = CONCIERGE_PAID_BY.find(o => o.value === debt.conciergePaidBy);
  out += "### Debt Optimization & Stress Test\n\n";
  out += mdLabel("Loan Principal", M(debt.loanPrincipal));
  out += mdLabel("Term Duration", `${debt.termYears} years`);
  out += mdLabel("Concierge / Finder Fee", `${debt.conciergeFeePct}% → ${M(dc.conciergeFeeAmount)} (${paidBy ? paidBy.label : debt.conciergePaidBy}${debt.conciergePaidBy === "buyer" ? ", out of pocket" : debt.conciergePaidBy === "lender" ? ", built into lender volume pricing" : ""})`);
  out += mdTable(
    ["Measure", `Term at Rate A (${debt.rateA}%)`, `Term at Rate B (${debt.rateB}%)`, "Delta"],
    [
      ["Monthly Payment", M(dc.scenarioA.monthlyPayment), M(dc.scenarioB.monthlyPayment), M(Math.abs(dc.monthlyDelta))],
      ["Total Cost Across Term", M(dc.scenarioA.totalCost), M(dc.scenarioB.totalCost), M(Math.abs(dc.totalSpread))],
      ["Cumulative Interest Paid", M(dc.scenarioA.totalInterest), M(dc.scenarioB.totalInterest), M(Math.abs(dc.interestSpread))],
    ],
  );
  out += mdLabel("Total Spread Leakage Saved out of Pocket", M(Math.abs(dc.totalSpread)));
  out += mdLabel("Net After Concierge Fee", M(dc.netSavings));
  out += `#### Pre-Contract Vetting — ${dc.gatesPassed}/${VETTING_GATES.length} Gates Passed\n\n` + mdTable(
    ["#", "Gate", "Status", "Check"],
    VETTING_GATES.map((g, i) => [
      String(i + 1),
      g.label,
      debt.vettingChecklist[g.key] ? "✓ Pass" : "○ Open",
      g.hint,
    ]),
  );

  return out;
};

const infraReConsortium: Renderer = d => {
  const data = normalizeInfraReConsortium(d);
  const cur = effectiveInfraCurrency(data, "USD");
  const M = (v: number) => infraMoney(v, cur);
  const e = computeInfraEconomics(data);
  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
  const xf = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}x`);
  const num = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
  const resp = (id: string) => INFRA_RESPONSIBILITIES.find(r => r.id === id)?.label ?? id;

  let out = "## InfraRE Consortium Suite\n\n";
  out += mdLabel("Reporting currency", cur);
  out += mdLabel("Jurisdiction", "Jurisdiction-agnostic");

  out += "### Consortium Alignment & Execution Team\n\n" + mdTable(
    ["Vector Pillar", "Responsibility", "Maturity", "Scope Boundaries & Custom Responsibilities"],
    INFRA_PILLARS.map((p, i) => {
      const row = data.pillars[i];
      return [p.label, resp(row.responsibility), `${row.maturity}/5`, row.scope || "—"];
    }),
  );
  if (data.customMembers.length) {
    out += "### Custom Consortium Members\n\n" + mdTable(
      ["Firm / Member Name", "Responsibility", "Maturity", "Scope Boundaries & Custom Responsibilities"],
      data.customMembers.map(m => [m.name || "—", resp(m.responsibility), `${m.maturity}/5`, m.scope || "—"]),
    );
  }

  out += "### SPV Structuring — Underwriting Inputs\n\n" + mdTable(["Input", "Value"], [
    ["Plot / Land Scale Area", num(data.landArea)],
    ["Permissible FAR Ratio", `${data.farRatio}x`],
    ["Structural Efficiency", `${data.efficiencyPct}%`],
    ["Target Yield / Selling Price per Unit Area", M(data.targetYieldPrice)],
    ["Hard Construction Rate per Unit GFA", M(data.hardCostRate)],
    ["Soft Costs", `${data.softCostPct}% of hard`],
    ["Contingency Multiplier", `${data.contingencyMultiplier}x`],
    ["Development Horizon", `${data.horizonYears} years`],
  ]);

  out += "### SPV Structural Injection Blueprint\n\n" + mdTable(
    ["Stage", "Who provides what asset/capital input", "How it is legalised/transferred", "When it hits the SPV ledger", "Progressive funding stages"],
    data.injections.map((r, i) => [String(i + 1), r.whoProvides || "—", r.howLegalised || "—", r.whenLedger || "—", r.stageCount || "—"]),
  );

  out += "### SPV Structuring — Financial & Equity\n\n" + mdTable(["Component", `Value (${cur})`], [
    ["Land Value — In-Kind Contribution", M(data.landValue)],
    ["Upfront Cash Sourced", M(data.upfrontCash)],
    ["Senior Debt Facility Sized", M(data.seniorDebt)],
    ["Consortium Equity Injected", M(data.consortiumEquity)],
  ]);

  out += "### Reactive Mathematical Engine\n\n" + mdTable(["Metric", "Value"], [
    ["Gross Floor Area (GFA)", num(e.gfa)],
    ["Net Saleable / Leasable Area", num(e.netSaleable)],
    ["Total Estimated Project CapEx", M(e.totalCapex)],
    ["Total Equity Stack", M(e.totalEquity)],
    ["Gross Sale Revenue", M(e.grossRevenue)],
    ["Gross Development Profit", M(e.grossProfit)],
    ["Profit on Cost", pct(e.profitOnCost)],
    ["Sourced Debt-to-Equity Leverage", xf(e.leverage)],
    ["Equity MOIC", xf(e.moic)],
    ["Estimated IRR — Base", pct(e.irrBase)],
    ["Estimated IRR — Low", pct(e.irrLow)],
    ["Estimated IRR — High", pct(e.irrHigh)],
  ]);

  out += "### Value-Chain Readiness Ledger\n\n" + mdTable(
    ["Sourcing Scope / Material Category", "Mapped Rolodex Vendor", "Consortium Member Responsible", "Financing / Structuring Terms", "Readiness Status"],
    data.procurement.map(r => [r.category || "—", r.supplier || "—", assigneeName(data, r.ownerId) || "Unassigned", r.financing || "—", readinessLabel(r.readiness)]),
  );

  out += "### Master Delivery Milestones & GTM Blueprint\n\n" + mdTable(
    ["Phase", "Duration (wks)", "Inter-Phase Dependencies", "GTM Strategy Notes"],
    INFRA_MILESTONES.map((m, i) => {
      const row = data.milestones[i];
      return [m.label, String(row.durationWeeks), row.dependencies || "—", row.gtmNotes || "—"];
    }),
  );

  out += "### MOU Executive Pitch Teaser Blueprint\n\n" + assembleMouPitch(data, cur, e) + "\n\n";
  return out;
};

export const MARKDOWN_RENDERERS: Record<string, Renderer> = {
  "pains-mapper": pains,
  "gains-mapper": gains,
  "jobs-ranker": jobs,
  "day-in-life": dayInLife,
  "bmc": bmc,
  "six-innovate": sixWays,
  "strategic-guidance": strategicGuidance,
  "valuation-selector": valuation,
  "asian-bm": asianModels,
  "creative-brief": creativeBrief,
  "style-scape": styleScape,
  "logo-review": logoReview,
  "design-criteria": designCriteria,
  "persona-journey": persona,
  "discovery-recorder": discovery,
  "scope-builder": scope,
  "consortium-bid": consortium,
  "why-buy": whyBuy,
  "problem-solving": problemSolving,
  "facilitation-log": facilitation,
  "dpr-consulting": dpr,
  "innovation-scorecard": innovation,
  "disruption-risk": disruption,
  "luxuries-audit": luxuries,
  "brand-mindset": mindset,
  "story-framework": storyFramework,
  "pitch-narrative": pitch,
  "story-checklist": checklist,
  "design-critique": critique,
  "financial-research": financialResearch,
  "content-pillar": contentPillar,
  "style-locker": styleLocker,
  "moodboard": moodboard,
  "brand-world-creator": brandWorld,
  "campaign-brief-alignment": campaignBriefAlignment,
  "universal-micro-ma-suite": microMa,
  "valuation-calculator": valuationCalculator,
  "infra-re-consortium": infraReConsortium,
  "acquisition-pipeline": acquisitionPipeline,
};

export function renderAppMarkdown(appId: string, data: any): string {
  const r = MARKDOWN_RENDERERS[appId];
  if (r) {
    try { return r(data).trim() + "\n"; } catch { /* fall through to generic */ }
  }
  return mdGeneric(data).trim() + "\n";
}

/** Used by build-time audits to distinguish dedicated templates from the generic fallback. */
export const MARKDOWN_RENDERER_IDS = Object.keys(MARKDOWN_RENDERERS);
