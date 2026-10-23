import { escapeHtml } from "../store";
import { SHEET_OPEN, SHEET_CLOSE } from "../export";
import { parseBmc, type BlockKey } from "./BusinessModelCanvas";
import { parseMicroMA, computeMicroMA, microMaToken, microMaSymbol, microMaMoney, MICRO_MA_BASELINE, MICRO_MA_RED_FLAGS, MICRO_MA_LEGAL_STRUCTURES } from "./MicroMASuite";
import { normalizeData, evaluateMethod, blendedValuation, vcSymbol, vcMoney, vcToken, VC_METHODS, VC_METHOD_LABEL, VC_BERKUS_LAYERS, VC_TERMINAL_MODES } from "./ValuationCalculator";
import { SCORECARD_SECTIONS, critKey, scorecardAverage, scorecardRecommendation, ALL_CRITERIA } from "./InnovationScorecard";
import { PERFORMANCE_DOMAINS, TREND_DOMAINS, rowKey, trackAverage, overallLabel } from "./DisruptionRisk";
import { LUXURIES, RELEVANCE_NUM, type Relevance } from "./RealLuxuriesAudit";
import { PS_STEPS } from "./ProblemSolvingWorkbook";
import { CRIT_MODES } from "./DesignCritiqueFacilitator";
import { PITCH_BEATS, STORY_CHECKS, FRAMEWORKS } from "./contentTools";
import { hvScore, hvRankLabel } from "./HighValueJobsRanker";
import { DISCOVERY_SECTIONS } from "./DiscoverySessionRecorder";
import { BRAND_WORLD_VECTORS, BRAND_WORLD_VECTOR_STATUSES } from "./BrandWorldCreator";
import { CAMPAIGN_CHANNELS, CAMPAIGN_PHASES, campaignAlignmentWarnings, campaignDeliverables, campaignTrueCells, normalizeCampaignBriefAlignment, phaseLabel } from "./CampaignBriefAlignmentEvaluator";
import { normalizeInfraReConsortium, computeInfraEconomics, infraMoney, effectiveInfraCurrency, assembleMouPitch, assigneeName, readinessLabel, INFRA_PILLARS, INFRA_RESPONSIBILITIES, INFRA_MILESTONES } from "./InfraReConsortiumSuite";
import { normalizeAcquisitionPipeline, computeFunnelBars, cimProgress, cimStageLabel, effectivePipelineCurrency, pipelineMoney, computeDebtComparison, VETTING_GATES, CONCIERGE_PAID_BY } from "./AcquisitionPipelineTracker";

type Renderer = (data: any) => string;

const E = (v: unknown) => escapeHtml(String(v ?? ""));
const F = (label: string, v?: string) =>
  v && String(v).trim() ? `<div class="field"><div class="field-label">${E(label)}</div><div class="field-value">${E(v)}</div></div>` : "";
const TBL = (heads: string[], rows: string[][]) =>
  rows.length ? `<table><thead><tr>${heads.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>` : "";
const CHIP = (text: string, cls = "") => `<span class="chip ${cls}">${E(text)}</span>`;
const H2 = (t: string) => `<h2>${E(t)}</h2>`;
const H3 = (t: string) => `<h3>${E(t)}</h3>`;
const RANK = (n: number) => `<span class="rank">${n}</span>`;
const LINES = (v?: string) => (v && v.trim() ? `<ul>` + String(v).split(/\n+/).filter(Boolean).map(l => `<li>${E(l)}</li>`).join("") + `</ul>` : "");

/* ── 01 Customer Pains ── */
const painsRenderer: Renderer = d => {
  const e = d?.entries || [];
  return H2("Customer Pains") + TBL(["#", "Description", "Intensity", "Frequency", "Segment", "Context"],
    e.map((x: any, i: number) => [RANK(i + 1), E(x.description), `${x.intensity}/5`, E(x.frequency), E(x.segment), E(x.context)]));
};

/* ── 02 Customer Gains ── */
const gainsRenderer: Renderer = d => {
  const e = d?.entries || [];
  return H2("Customer Gains") + TBL(["#", "Description", "Importance", "Type", "Segment", "Notes"],
    e.map((x: any, i: number) => [RANK(i + 1), E(x.description), `${x.importance}/5`, E(x.type), E(x.segment), E(x.notes)]));
};

/* ── 03 High-Value Jobs ── */
const jobsRenderer: Renderer = d => {
  const jobs = (d?.jobs || []).slice().map((j: any) => ({
    ...j,
    important: j.important ?? 3,
    tangible: j.tangible ?? 3,
    unsatisfied: j.unsatisfied ?? 3,
    lucrative: j.lucrative ?? 3,
  })).sort((a: any, b: any) => hvScore(b) - hvScore(a));

  return H2("High-Value Customer Jobs, Ranked") + TBL(["Rank", "Job Description", "Type", "Important", "Tangible", "Unsatisfied", "Lucrative", "Score", "Value Rank"],
    jobs.map((j: any, i: number) => {
      const score = hvScore(j);
      const rankInfo = hvRankLabel(score);
      return [
        RANK(i + 1),
        E(j.description),
        E(j.category),
        `${j.important}/4`,
        `${j.tangible}/4`,
        `${j.unsatisfied}/4`,
        `${j.lucrative}/4`,
        `<strong>${score}/16</strong>`,
        CHIP(rankInfo.label, rankInfo.tone === "green" ? "chip-green" : rankInfo.tone === "orange" ? "chip-orange" : "")
      ];
    })) +
    `<p style="color:#535862;font-size:12px">High-Value Score = Important + Tangible + Unsatisfied + Lucrative (Max 16)</p>`;
};

/* ── 04 Day in the Life ── */
const dayRenderer: Renderer = d => H2("Day in the Life") + F("Target Customer", d?.customer) + F("Observer", d?.observer) +
  F("Date", d?.date) + F("Setting", d?.setting) +
  TBL(["Time", "Activity (seen)", "Notes (thought)", "Tag"], (d?.rows || []).map((r: any) => [
    E(r.time), E(r.activity), E(r.notes),
    r.tag ? CHIP(r.tag, r.tag === "Gain" ? "chip-green" : r.tag === "Pain" ? "chip-orange" : "") : "",
  ]));

/* ── 05 Persona Journey ── */
const personaRenderer: Renderer = d => {
  const p = d?.persona || {};
  return H2("Persona") + F("Name", p.name) + F("Demographics", p.demographics) + F("Background", p.background) +
    F("Goals", p.goals) + F("Frustrations", p.frustrations) + H2("Journey Stages") +
    TBL(["Stage", "Actions", "Thoughts", "Emotion State", "Pain Points", "Jobs"],
      (d?.stages || []).map((s: any) => {
        const val = s.emotionVal || "Neutral";
        const desc = s.emotionDesc || s.emotions || "";
        const chip = val === "Positive" ? "chip-green" : val === "Negative" ? "chip-orange" : "";
        const emoStr = `${CHIP(val, chip)}${desc ? `<br><small style="color:#535862">${E(desc)}</small>` : ""}`;
        return [`<strong>${E(s.name)}</strong>`, E(s.actions), E(s.thoughts), emoStr, E(s.pains), E(s.jobs)];
      }));
};

/* ── 06 Business Model Canvas ── */
// A 2-tier blueprint that mirrors the live dashboard grid (the 10-column `bmc-grid`):
//   top    — five equal tracks: [Key Partners] [Key Activities / Key Resources] [Value Propositions]
//                               [Customer Relationships / Channels] [Customer Segments]
//   bottom — Cost Structure (left 50%) | Revenue Streams (right 50%)
// Flexbox with explicit proportional widths, so it never depends on grid support in the PDF rasteriser.
// The stylesheet travels with the markup so the block renders identically in every host document
// (single-session print, PDF iframe, HTML download, project context pack).
const BMC_GAP = "8px";
const BMC_PRINT_CSS = [
  // Own landscape page when the sheet sits among other (portrait) sections; a solo document is switched
  // to landscape wholesale by export.ts, which resets `page` to auto below the doc header.
  "@page bmc-sheet{size:A4 landscape;margin:8mm}",
  ".bmc-sheet{display:block;width:100%;margin:0 0 12px;background:#fff;page:bmc-sheet;break-inside:avoid;page-break-inside:avoid;-webkit-print-color-adjust:exact;print-color-adjust:exact}",
  ".bmc-sheet,.bmc-sheet *{box-sizing:border-box}",
  ".bmc-sheet h2{margin:0 0 8px}",
  `.bmc-canvas{display:flex;flex-direction:column;gap:${BMC_GAP};width:100%;break-inside:avoid;page-break-inside:avoid}`,
  `.bmc-top,.bmc-bottom{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:stretch;gap:${BMC_GAP};width:100%;break-inside:avoid;page-break-inside:avoid}`,
  ".bmc-top{min-height:92mm}",
  ".bmc-bottom{min-height:38mm}",
  // Five equal tracks = 20% each, less the four gutters shared between them.
  `.bmc-track{display:flex;flex-direction:column;gap:${BMC_GAP};flex:0 0 calc((100% - 4 * ${BMC_GAP}) / 5);width:calc((100% - 4 * ${BMC_GAP}) / 5);min-width:0;break-inside:avoid;page-break-inside:avoid}`,
  // Two halves = 50% each, less the one gutter between them.
  `.bmc-bottom>.bmc-block{flex:0 0 calc((100% - ${BMC_GAP}) / 2);width:calc((100% - ${BMC_GAP}) / 2)}`,
  // `flex:1 1 0` splits a stacked track evenly; the implicit min-height:auto keeps a block from shrinking below its text.
  ".bmc-block{flex:1 1 0;display:flex;flex-direction:column;min-width:0;padding:9px 10px;background:#fafafa;border:1px solid #e2e4e7;border-radius:6px;break-inside:avoid;page-break-inside:avoid}",
  ".bmc-label{margin:0 0 6px;font-size:8.5px;font-weight:700;line-height:1.3;text-transform:uppercase;letter-spacing:0.06em;color:#535862}",
  ".bmc-item{padding:5px 0;border-top:1px solid #ebecee;break-inside:avoid;page-break-inside:avoid}",
  ".bmc-item:first-of-type{padding-top:0;border-top:0}",
  ".bmc-text,.bmc-notes{margin:0;min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word}",
  ".bmc-text{font-size:10px;font-weight:700;line-height:1.35;color:#15190d}",
  ".bmc-notes{margin-top:1px;font-size:9px;font-style:italic;font-weight:400;line-height:1.4;color:#535862}",
  ".bmc-empty{font-size:10px;color:#b3b3b3}",
].join("");

const bmcRenderer: Renderer = d => {
  // parseBmc is the same defensive parser the live editor uses: legacy flat strings, partial or malformed
  // data all arrive here as { id, text, notes }[] per block.
  const data = parseBmc(d);
  const block = (key: BlockKey, label: string) => {
    const items = data[key].filter(i => i.text.trim() || i.notes.trim());
    const body = items.length
      ? items.map(i =>
          `<div class="bmc-item">` +
          (i.text.trim() ? `<div class="bmc-text">${E(i.text.trim())}</div>` : "") +
          (i.notes.trim() ? `<div class="bmc-notes">${E(i.notes.trim())}</div>` : "") +
          `</div>`).join("")
      : `<div class="bmc-empty">—</div>`;
    return `<div class="bmc-block" data-block="${key}"><div class="bmc-label">${E(label)}</div>${body}</div>`;
  };
  const track = (inner: string) => `<div class="bmc-track">${inner}</div>`;

  // The style element is addressable so export.ts can escalate its named page from A4 to A3 landscape on print.
  return `<style id="cs-bmc-sheet-css">${BMC_PRINT_CSS}</style>` +
    `<section class="bmc-sheet" ${SHEET_OPEN}>` +
    H2("Business Model Canvas") +
    `<div class="bmc-canvas">` +
      `<div class="bmc-top">` +
        track(block("keyPartners", "Key Partners")) +
        track(block("keyActivities", "Key Activities") + block("keyResources", "Key Resources")) +
        track(block("valuePropositions", "Value Propositions")) +
        track(block("customerRelationships", "Customer Relationships") + block("channels", "Channels")) +
        track(block("customerSegments", "Customer Segments")) +
      `</div>` +
      `<div class="bmc-bottom">` +
        block("costStructure", "Cost Structure") +
        block("revenueStreams", "Revenue Streams") +
      `</div>` +
    `</div>` +
    `</section>${SHEET_CLOSE}`;
};

/* ── 07 Six Ways to Innovate ── */
const SIX_LABELS = ["Address more jobs", "Switch to a more important job", "Go beyond functional jobs", "Help a lot more customers", "Get a job done incrementally better", "Help a customer get a job done radically better"];
const sixWaysRenderer: Renderer = d => {
  const ways = d?.ways || [];
  return H2("Six Ways to Innovate") + SIX_LABELS.map((label, i) => {
    const v = ways[i] || {};
    return H3(`${i + 1}. ${label}${v.score ? ` — actionability ${v.score}/5` : ""}`) + F("Current baseline", v.baseline) + F("Innovation idea", v.idea) + F("Next action", v.action);
  }).join("");
};

/* ── 08 Strategic Guidance ── */
const sgRenderer: Renderer = d => H2("Corporate Identity") + F("Culture", d?.culture) + F("Strategic Direction", d?.strategicDirection) +
  F("Brand Image", d?.brandImage) + H2("Portfolio Guidance") + F("Overall Portfolio", d?.overall) +
  F("Exploit", d?.exploit) + F("Explore", d?.explore) + F("Transfer", d?.transfer);

/* ── 09 Valuation Selector ── */
const valRenderer: Renderer = d => H2("Valuation Method Selector") + F("Company Stage", d?.stage) + F("Valuation Purpose", d?.purpose) +
  H3("Matrix Recommendation") + F("Primary Method", d?.primary) + F("Secondary Method", d?.secondary) + F("Rationale", d?.rationale) +
  H3("Execution") + F("Chosen Primary Method", d?.chosenMethod) + F("Key Assumptions", d?.keyAssumptions) +
  F("Multiples & Discount Inputs", d?.multiplesDiscountInputs) + F("Comparables Notes", d?.comparablesNotes) +
  F("Estimated Valuation Range", d?.valuationRange) + F("Valuation Conclusion", d?.conclusion || d?.notes);

/* ── 10 Asian BM Classifier ── */
const ASIAN_MODELS = [["emotion", "Emotion-first"], ["network", "Network-driven"], ["micro", "Microsegments"], ["knowledge", "Knowledge economy"], ["conglomerate", "Conglomerates 3.0"], ["ai", "AI-native"]];
const asianRenderer: Renderer = d => {
  const models = Array.isArray(d?.models) ? d.models : [];
  return H2("Asian Business Model Classifier") + TBL(["Model", "Relevance", "Client Application", "Notes"],
    ASIAN_MODELS.map(([k, label]) => { const v = models.find((x: any) => x.id === k) || {}; return [E(label), `${v.relevance || 0}/5`, E(v.example), E(v.notes)]; }));
};

/* ── 11 Discovery Recorder ── */
const discoveryRenderer: Renderer = d => {
  let html = H2("Discovery Session") + F("Date", d?.date) + F("Attendees", d?.attendees) + F("Focus", d?.focus) +
    H2("Key Takeaways & Buckets") +
    F("Key Insights", Array.isArray(d?.insights) ? d.insights.map((x: any) => x.text).join("\n") : d?.insights) +
    F("Notable Quotes", Array.isArray(d?.quotes) ? d.quotes.map((x: any) => x.text).join("\n") : d?.quotes) +
    F("Opportunities", Array.isArray(d?.opportunities) ? d.opportunities.map((x: any) => x.text).join("\n") : d?.opportunities) +
    F("Risks & Concerns", Array.isArray(d?.risks) ? d.risks.map((x: any) => x.text).join("\n") : d?.risks) +
    F("Next Actions", Array.isArray(d?.nextActions) ? d.nextActions.map((x: any) => x.text).join("\n") : d?.nextActions);

  const answers = d?.answers || {};
  let qHtml = "";
  DISCOVERY_SECTIONS.forEach(sec => {
    const secRows = sec.questions
      .filter(q => (answers[String(q.id)] || "").trim().length > 0)
      .map(q => [`<strong>Q${q.id}</strong>`, E(q.text), E(answers[String(q.id)])]);
    if (secRows.length) {
      qHtml += H3(sec.title) + TBL(["#", "Question", "Client Answer / Notes"], secRows);
    }
  });

  if (qHtml) {
    html += H2("Structured Discovery Questionnaire") + qHtml;
  }
  return html;
};

/* ── 12 Creative Brief ── */
const briefRenderer: Renderer = d => {
  const fields: [string, unknown][] = [
    ["Deliverable in Question", d?.deliverable],
    ["Project Name", d?.projectName],
    ["Client", d?.client],
    ["Date", d?.date],
    ["Background & Context", d?.background],
    ["Objective", d?.objective],
    ["Target Audience", d?.audience],
    ["Key Message", d?.keyMessage],
    ["Tone & Voice", d?.tone],
    ["Scope & Sub-Deliverables", d?.deliverables],
    ["Timeline", d?.timeline],
    ["Budget Range", d?.budget],
    ["Constraints & Requirements", d?.constraints],
    ["Success Metrics", d?.successMetrics],
  ];
  return H2("Creative Brief") + fields.filter(([, v]) => v && String(v).trim()).map(([l, v]) => F(l, String(v))).join("");
};

/* ── 13 Style Scape ── */
const styleScapeRenderer: Renderer = d => H2("Style Scape") + F("Date", d?.date) + F("Overall Direction", d?.direction) +
  H3("References") + TBL(["Reference", "Comment"], (d?.references || []).map((r: any) => [E(r.name), E(r.comment)])) +
  F("Do", d?.dos) + F("Don't", d?.donts) + F("Selected Direction Summary", d?.summary);

/* ── 14 Design Critique (multi-deliverable) ── */
const critiqueRenderer: Renderer = d => {
  const deliverables = d?.deliverables || [];
  if (!deliverables.length) return H2("Design Critique") + F("Notes", d?.notes);
  return H2("Design Critique") + deliverables.map((dl: any) => {
    const modes = dl.modes || {};
    const rows: string[][] = CRIT_MODES.flatMap(m => {
      const v = modes[m.name] || {};
      const has = (v.answers || "").trim() || (v.notes || "").trim();
      return has ? [[`<strong>${E(m.name)}</strong>`, E(v.answers), E(v.notes)]] : [];
    });
    return H3(dl.name || "Untitled deliverable") + (rows.length
      ? TBL(["Mode", "Client answers", "Consultant notes"], rows)
      : `<p style="color:#535862"><em>No critique captured.</em></p>`);
  }).join("");
};

/* ── 15 Logo Review ── */
const logoRenderer: Renderer = d => H2("Logo Brand Review Log") +
  TBL(["Round", "Date", "Versions Reviewed", "Strengths", "Concerns", "Decision"], (d?.reviews || []).map((v: any) => [
    `<strong>${E(v.round)}</strong>`, E(v.date), E(v.versions), E(v.strengths), E(v.concerns), E(v.decision),
  ])) + F("Final Direction", d?.final);

/* ── 16 Why They Buy ── */
const whyBuyRenderer: Renderer = d => {
  const reasons = d?.reasons || [];
  const avg = reasons.length ? reasons.reduce((s: number, r: any) => s + (r.score || 0), 0) / reasons.length : 0;
  const top = reasons.slice().sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).slice(0, 3).filter((r: any) => r.score > 0);
  return H2("Why They Buy") + F("Product / service / offer in question", d?.offer) +
    TBL(["Reason", "Score", "Notes"], reasons.map((r: any) => [E(r.label), `${r.score || 0}/5`, E(r.notes)])) +
    (top.length ? `<p><strong>Top drivers:</strong> ${top.map((t: any) => `${E(t.label)} (${t.score}/5)`).join(" · ")}</p>` : "") +
    (avg ? `<p><strong>Average strength:</strong> ${avg.toFixed(1)}/5</p>` : "") + F("Messaging Notes", d?.summary);
};

/* ── 17 Problem Solving (with 2.A / 2.B) ── */
const psRenderer: Renderer = d => {
  const steps = d?.steps || {};
  return H2("Problem Solving Workbook") + PS_STEPS.map((s, i) => {
    const v = steps[s.key] || {};
    const chip = v.status === "Done" ? "chip-green" : v.status === "In progress" ? "chip-orange" : "";
    return H3(`${i + 1}. ${s.label} ${v.status ? CHIP(v.status, chip) : ""}`) +
      (v.notes ? `<div class="field"><div class="field-value">${E(v.notes)}</div></div>` : "");
  }).join("") + F("Notes", d?.notes);
};

/* ── 18 Financial Research ── */
const finRenderer: Renderer = d => H2("Financial Research") + F("Company / Market", d?.subject) + F("Period", d?.period) +
  TBL(["Metric", "Value", "Benchmark", "Source", "Interpretation"], (d?.metrics || []).map((m: any) =>
    [E(m.metric), E(m.value), E(m.benchmark), E(m.source), E(m.note)])) + F("Research Summary", d?.summary);

/* ── 19 Real Luxuries Audit ── */
const luxuriesRenderer: Renderer = d => {
  const lux = d?.luxuries || {};
  const get = (k: string) => lux[k] || {};
  const rows = LUXURIES.map(l => {
    const v = get(l.key);
    return [`${RANK(LUXURIES.indexOf(l) + 1)} ${E(l.label)}`, E(l.desc), CHIP(v.relevance || "—"),
      `${v.product ?? 0}/5`, `${v.marketing ?? 0}/5`, E(v.notes)];
  });
  const strongest = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, s: (RELEVANCE_NUM[v.relevance as Relevance] || 0) * 2 + (v.product || 0) + (v.marketing || 0) }; })
    .sort((a, b) => b.s - a.s).slice(0, 3).filter(x => x.s > 0);
  const underComms = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, g: (v.product || 0) - (v.marketing || 0) }; })
    .filter(x => x.g > 0).sort((a, b) => b.g - a.g).slice(0, 3);
  const overPromised = LUXURIES.map(l => { const v = get(l.key); return { label: l.label, g: (v.marketing || 0) - (v.product || 0) }; })
    .filter(x => x.g > 0).sort((a, b) => b.g - a.g).slice(0, 3);
  return H2("Real Luxuries Audit") + F("Offer / brand / product in question", d?.offer) + F("Audit lens notes", d?.lens) +
    H3("The 12 Real Luxuries") + TBL(["Luxury", "Description", "Relevance", "Product delivers", "Marketing expresses", "Opportunity"], rows) +
    (strongest.length ? `<p><strong>Strongest:</strong> ${strongest.map(s => `${E(s.label)} (${s.s})`).join(" · ")}</p>` : "") +
    (underComms.length ? `<p><strong>Under-communicated:</strong> ${underComms.map(s => `${E(s.label)} (+${s.g})`).join(" · ")}</p>` : "") +
    (overPromised.length ? `<p><strong>Over-promised:</strong> ${overPromised.map(s => `${E(s.label)} (+${s.g})`).join(" · ")}</p>` : "") +
    F("Audit Summary", d?.summary);
};

/* ── 20 Collaboration Scope ── */
const scopeRenderer: Renderer = d => {
  const d0 = d || {};
  const upRows = (d0.upstream || []).map((p: any) => [E(p.name), E(p.role), E(p.what), E(p.dependency), E(p.status), E(p.owner)]);
  const downRows = (d0.downstream || []).map((p: any) => [E(p.name), E(p.role), E(p.what), E(p.dependency), E(p.status), E(p.consumption), E(p.handover), E(p.owner)]);
  const phaseRows = (d0.phases || []).map((p: any) => [E(p.name), E(p.timeline), E(p.description), `$${(+p.fee || 0).toLocaleString()}`]);
  const total = (d0.phases || []).reduce((s: number, p: any) => s + (+p.fee || 0), 0);
  return H2("Collaboration Scope") + F("Client", d0.client) + F("Project", d0.project) +
    F("Deliverable in Question", d0.deliverable) + F("My role / orchestration notes", d0.myRole) +
    H3("Upstream collaborators") + TBL(["Name", "Role", "Supplies", "Dependency", "Status", "Owner"], upRows) +
    H3("Downstream collaborators") + TBL(["Name", "Role", "Receives", "Dependency", "Status", "Consumption", "Handover", "Owner"], downRows) +
    (phaseRows.length ? H3("Phases & Milestones") + TBL(["Phase", "Timeline", "Description", "Fee"], phaseRows) +
      `<p style="text-align:right;font-size:15px"><strong>Total: $${total.toLocaleString()}</strong></p>` : "") +
    F("Terms", d0.terms) + F("Payment notes", d0.payment);
};

/* ── 21 Facilitation Log ── */
const facilitationRenderer: Renderer = d => H2("Facilitation Log") +
  TBL(["Date", "Session", "Outcomes", "Decisions", "Next Actions"], (d?.entries || []).map((e: any) => [E(e.date), E(e.session), E(e.outcomes), E(e.decisions), E(e.actions)]));

/* ── 22 Consortium Bid ── */
const consortiumRenderer: Renderer = d => {
  const partners = d?.partners || [];
  const totalAllocated = partners.reduce((s: number, p: any) => s + (+p.fee || 0), 0);
  const totalBudget = d?.totalBudget || totalAllocated || 1;

  const rows = partners.map((p: any, i: number) => {
    const feePct = totalBudget > 0 ? ((p.fee || 0) / totalBudget) * 100 : 0;
    return [
      `${i === 0 ? "<strong>" : ""}${E(p.name)}${i === 0 ? " (Lead)</strong>" : ""}`,
      E(p.role),
      E(p.contribution || p.scope),
      `$${(+p.fee || 0).toLocaleString()}`,
      `<strong>${feePct.toFixed(1)}%</strong>`,
    ];
  });

  return H2("Consortium Bid Builder") + F("Bid / Project Name", d?.bidName) + F("Client / Tenderer", d?.client) +
    F("Total Bid Budget", d?.totalBudget ? `$${(+d.totalBudget).toLocaleString()}` : "") +
    H3("Consortium Partners") + TBL(["Partner", "Role", "Scope & Contribution", "Fee ($)", "Fee Share (%)"], rows) +
    `<p style="text-align:right"><strong>Total Allocated: $${totalAllocated.toLocaleString()} (${((totalAllocated / totalBudget) * 100).toFixed(1)}%)</strong></p>` +
    F("Notes & Terms", d?.notes || d?.strategy);
};

/* ── 23 DPR Consulting ── */
const dprRenderer: Renderer = d => H2("DPR & Principal Project Consulting") + F("Project", d?.project) + F("Reporting Period", d?.period) +
  TBL(["Date", "Update", "Risks / Issues", "Decisions"], (d?.items || []).map((e: any) => [E(e.date), E(e.update), E(e.risks), E(e.decisions)]));

/* ── 24 Brand Mindset ── */
const mindsetRenderer: Renderer = d => {
  const sec = (label: string, items: any[]) => items?.length ? H3(label) + `<ul>${items.map(i => `<li>${E(i.text)}</li>`).join("")}</ul>` : "";
  return H2("Brand Mindset") + sec("Core Values", d?.values) + sec("Beliefs", d?.beliefs) +
    sec("Attitudes", d?.attitudes) + sec("Behaviors", d?.behaviors);
};

/* ── 25 Content Pillar ── */
const pillarRenderer: Renderer = d => H2("Content Pillars") + TBL(["Pillar", "Covers", "Formats", "Cadence", "Owner"],
  (d?.pillars || []).map((p: any) => [`<strong>${E(p.name)}</strong>`, E(p.covers), E(p.formats), E(p.cadence), E(p.owner)])) +
  F("Strategy Notes", d?.strategy);

/* ── 26 Style Locker ── */
const styleLockerRenderer: Renderer = d => H2("Signature Content Style Locker") + H3("Voice & Tone") +
  F("Voice", d?.voice) + F("Tone", d?.tone) + F("We say", d?.doSay) + F("We never say", d?.dontSay) +
  F("Formatting Rules", d?.formatting) + H3("Locked Signature Rules") + LINES((d?.rules || []).map((r: any) => r.rule).join("\n")) +
  F("Reference Examples", d?.examples);

/* ── 27 Story Framework ── */
const storyFrameworkRenderer: Renderer = d => {
  const selectedId = d?.selectedId || "golden_circle";
  const fw = FRAMEWORKS.find(f => f.id === selectedId) ?? FRAMEWORKS[0];
  const fields = d?.fields || {};

  let html = H2("Storytelling Framework Selector") + F("Deliverable in Question", d?.deliverable) +
    F("Target Audience", d?.audience) + F("Desired Action / Goal", d?.goal) +
    H3(`Selected Framework: ${fw.name}`) + `<p style="color:#535862;font-size:12px;margin-bottom:16px"><em>When to use: ${E(fw.useWhen)}</em></p>`;

  fw.fields.forEach(f => {
    const key = fw.id + "." + f.key;
    const val = fields[key] || (d as any)[f.key] || "";
    if (val && val.trim()) {
      html += F(f.label, val);
    }
  });

  return html + F("Facilitation & Delivery Notes", d?.notes);
};

/* ── 28 Pitch Narrative ── */
const pitchRenderer: Renderer = d => H2("Pitch Narrative") + PITCH_BEATS.map((b, i) =>
  d?.beats?.[b.key] ? H3(`${i + 1}. ${b.label}`) + F(b.hint, d.beats[b.key]) : "").join("");

/* ── 29 Story Checklist ── */
const storyChecklistRenderer: Renderer = d => {
  const checks = d?.checks || {}, notes = d?.notes || {};
  const passed = STORY_CHECKS.filter(c => checks[c]).length;
  return H2(`Storytelling Design Checklist — ${passed}/${STORY_CHECKS.length} passing`) +
    F("Deliverable in Question", d?.deliverable) +
    TBL(["", "Check", "Note"], STORY_CHECKS.map((c, i) => [
      checks[c] ? CHIP("Pass", "chip-green") : CHIP("Open", "chip-orange"),
      `${i + 1}. ${E(c)}`, E(notes[c] || ""),
    ]));
};

/* ── 30 Design Criteria (multi-deliverable) ── */
const criteriaRenderer: Renderer = d => {
  const canvases = d?.canvases || [];
  if (!canvases.length) {
    // Legacy single-shape session
    return H2("Design Criteria Canvas") + TBL(["Dimension", "Criterion", "Weight", "Type"],
      Object.entries(d || {}).map(([dim, items]: any) => (items || []).map((i: any) =>
        [E(dim), E(i.name), `${i.weight}/5`, i.mustHave ? "Must-have" : ""])).flat());
  }
  return H2("Design Criteria Canvas") + canvases.map((c: any) => {
    const m = c?.moscow || {};
    const mRows = (["must", "should", "could", "wont"] as const).flatMap(k =>
      (m[k] || []).map((i: any) => [CHIP(k.toUpperCase(), k === "must" ? "chip-green" : k === "could" ? "chip-orange" : ""), E(i.text), E(i.notes)]));
    const dims = c?.dimensions || {};
    const dRows = Object.entries(dims).flatMap(([dim, items]: any) =>
      (items || []).map((i: any) => [E(dim), E(i.name), `${i.weight}/5`, i.mustHave ? "Must-have" : ""]));
    return H3(c?.deliverable || "Untitled deliverable") +
      (mRows.length ? H4("MoSCoW Prioritisation") + TBL(["Bucket", "Criterion", "Notes"], mRows) : "") +
      (dRows.length ? H4("Weighted Criteria by Dimension") + TBL(["Dimension", "Criterion", "Weight", "Type"], dRows) : "");
  }).join("");
};
const H4 = (t: string) => `<h4 style="font-size:13px;font-weight:700;margin:16px 0 6px;text-transform:uppercase;letter-spacing:0.04em">${E(t)}</h4>`;

/* ── 31 Moodboard ── */
const moodboardRenderer: Renderer = d => H2("Moodboard") + TBL(["Tile", "Why it belongs", "Tags", "Image"],
  (d?.tiles || []).map((t: any) => [`<strong>${E(t.title)}</strong>`, E(t.why), E(t.tags),
    t.imageUrl ? `<img src="${E(t.imageUrl)}" style="max-width:140px;max-height:90px;object-fit:cover;border-radius:6px">` : ""])) +
  F("Direction Summary", d?.direction);

/* ── 32 Innovation Project Scorecard (Strategyzer) ── */
const scorecardRenderer: Renderer = d => {
  const scores = d?.scores || {}, notes = d?.notes || {};
  const avg = scorecardAverage(scores);
  const rec = d?.recommendation || scorecardRecommendation(scores);
  const scored = Object.values(scores).filter((v: any) => typeof v === "number" && v > 0).length;
  const rows: string[][] = [];
  SCORECARD_SECTIONS.forEach((sec, si) => {
    sec.criteria.forEach((c, ci) => {
      const k = critKey(si, ci);
      rows.push([`<strong>${E(c.label)}</strong>`, E(sec.title), `${scores[k] || 0}/5`, E(notes[k] || "")]);
    });
  });
  return H2("Innovation Project Scorecard") + F("Project", d?.project) + F("Short description", d?.description) +
    TBL(["Criterion", "Section", "Score", "Evidence / notes"], rows) +
    `<p style="font-size:16px;margin-top:12px"><strong>${scored}/${ALL_CRITERIA.length} scored · Average ${avg ? avg.toFixed(1) : "—"}/5 · ${E(rec)}</strong></p>`;
};

/* ── 33 Disruption Risk (Strategyzer bipolar) ── */
const disruptionRenderer: Renderer = d => {
  const scores = d?.scores || {};
  const renderTrack = (domains: typeof PERFORMANCE_DOMAINS, track: "performance" | "trend", title: string) => {
    const rows: string[][] = [];
    domains.forEach((dom, di) => dom.rows.forEach((row, ri) => {
      const v = scores[rowKey(track, di, ri)] ?? 0;
      rows.push([E(dom.title), E(row.left), E(row.right),
        `<span class="chip ${v < 0 ? "chip-orange" : v > 0 ? "chip-green" : ""}">${v > 0 ? "+" + v : v}</span>`]);
    }));
    return H3(title) + TBL(["Domain", "Threat pole (−3)", "Opportunity pole (+3)", "Score"], rows);
  };
  const perfAvg = trackAverage(PERFORMANCE_DOMAINS, "performance", scores);
  const trendAvg = trackAverage(TREND_DOMAINS, "trend", scores);
  const label = overallLabel(perfAvg, trendAvg);
  return H2("Disruption Risk Assessment") + F("Business / offer being assessed", d?.offer) +
    renderTrack(PERFORMANCE_DOMAINS, "performance", "Business Model Performance — current health") +
    renderTrack(TREND_DOMAINS, "trend", "Business Model Trend — future trajectory") +
    `<p style="font-size:15px;margin-top:12px"><strong>Performance avg: ${perfAvg ? perfAvg.toFixed(2) : "—"} · Trend avg: ${trendAvg ? trendAvg.toFixed(2) : "—"} · Overall: ${((perfAvg + trendAvg) / 2) ? ((perfAvg + trendAvg) / 2).toFixed(2) : "—"} · ${E(label)}</strong></p>` +
    F("Mitigation notes", d?.mitigation) + F("Synthesis", d?.synthesis);
};

/* ── 34 Brand World Creator ── */
const brandWorldRenderer: Renderer = d => {
  const statusLabel = (value: string) => BRAND_WORLD_VECTOR_STATUSES.find(s => s.value === value)?.label || "Missing";
  const always = Array.isArray(d?.alwaysRules) ? d.alwaysRules : [];
  const never = Array.isArray(d?.neverRules) ? d.neverRules : [];
  const answers = d?.evaluation?.answers || {};
  const checks = [...always.map((rule: string, i: number) => ({ key: `always-${i}`, label: `Keeps Always ${i + 1}`, rule })), ...never.map((rule: string, i: number) => ({ key: `never-${i}`, label: `Avoids Never ${i + 1}`, rule }))]
    .filter(row => String(row.rule || "").trim());
  const answered = checks.filter(row => answers[row.key]);
  const conflicts = answered.filter(row => answers[row.key] === "no").length;
  return H2("Brand World") + F("World", d?.worldName) + F("Promise", d?.worldTagline) +
    H3("Cast the World") +
    TBL(["Character", "Role", "Description"], (d?.characters || []).map((c: any) => [`<strong>${E(c.name)}</strong>`, E(c.role), E(c.description)])) +
    TBL(["Place"], (d?.places || []).map((x: any) => [E(x.text)])) +
    TBL(["Object"], (d?.objects || []).map((x: any) => [E(x.text)])) +
    F("Context Setting", d?.context) +
    H3("Culture") +
    TBL(["Lexicon"], (d?.lexicon || []).map((x: any) => [E(x.text)])) +
    TBL(["Rituals"], (d?.rituals || []).map((x: any) => [E(x.text)])) +
    TBL(["Humor & Interests"], (d?.humor || []).map((x: any) => [E(x.text)])) +
    H3("Universe Rules") +
    TBL(["Always"], always.map((rule: string, i: number) => [`${i + 1}. ${E(rule)}`])) +
    TBL(["Never"], never.map((rule: string, i: number) => [`${i + 1}. ${E(rule)}`])) +
    F("Idea Under Evaluation", d?.evaluation?.idea) + F("Idea Type", d?.evaluation?.ideaKind) +
    TBL(["Boundary", "Verdict"], checks.map(row => [`<strong>${E(row.label)}</strong><br>${E(row.rule)}`, answers[row.key] === "no" ? CHIP("Fail", "chip-orange") : answers[row.key] === "yes" ? CHIP("Pass", "chip-green") : CHIP("Check", "")])) +
    (answered.length ? `<p><strong>Boundary result:</strong> ${answered.length}/${checks.length} checked · ${conflicts} conflict${conflicts === 1 ? "" : "s"}</p>` : "") +
    F("Evaluator Notes", d?.evaluation?.notes) +
    H3("Participation Audit") +
    TBL(["Vector", "Status", "Evidence / Next Move"], BRAND_WORLD_VECTORS.map(v => {
      const value = d?.vectors?.[v.key] || {};
      return [`<strong>${E(v.label)}</strong><br><small>${E(v.prompt)}</small>`, CHIP(statusLabel(value.status), value.status === "strong" || value.status === "live" ? "chip-green" : value.status === "planned" ? "chip-orange" : ""), E(value.evidence)];
    })) +
    H3("Campaign Chapters") +
    TBL(["Chapter", "New Variable", "Anchors", "Storyline", "Success"], (d?.chapters || []).map((c: any) => [`<strong>${E(c.title)}</strong>`, `${E(c.variableKind)}: ${E(c.newVariable)}`, E(c.familiarAnchors), E(c.storyline), E(c.success)]));
};

/* ── 35 Campaign & Brief Alignment Evaluator ── */
const campaignBriefAlignmentRenderer: Renderer = raw => {
  const d = normalizeCampaignBriefAlignment(raw);
  const scope = campaignTrueCells(d);
  const warnings = campaignAlignmentWarnings(d);
  const deliverables = campaignDeliverables(d);
  const lean = (n: number) => d.hybridLean?.[String(n)] ?? "both";
  const trackLabel = d.track === "brand" ? "Brand" : d.track === "product" ? "Product" : "Hybrid";
  let html = H2("Campaign & Brief Alignment") +
    F("Mandate / campaign in question", d.mandate) +
    F("Attention track", trackLabel) +
    F("Bottleneck phase", `Phase ${d.bottleneckPhase} · ${phaseLabel(d.track, d.bottleneckPhase, lean(d.bottleneckPhase))}`) +
    F("Why stuck here", d.bottleneckNote) +
    F("Brief / mandate wording", d.briefPaste);
  if (d.track === "hybrid") {
    html += H3("Hybrid Lean Per Phase") + TBL(["Phase", "Brand Track", "Lean"], CAMPAIGN_PHASES.map(p =>
      [`Phase ${p.n}`, `${E(p.brandLabel)} / ${E(p.productLabel)}`, CHIP(lean(p.n) === "both" ? "Both" : lean(p.n) === "brand" ? "Brand" : "Product", "")]));
  }
  html += H3(`In-Scope Cells (${scope.length})`) + TBL(["Phase", "Channel", "KPI", "Data Source", "Creative", "Notes"],
    scope.map(c => [`<strong>P${c.phase} · ${E(c.phaseLabel)}</strong>`, E(c.channelLabel), E(c.kpi || "—"), E(c.source || "—"), E(c.creative || "—"), E(c.notes || "—")]));
  if (deliverables.length) {
    html += H3("Creative Deliverables Estimate") + TBL(["Channel", "Scope Implies", "Effort"],
      deliverables.map(x => [`<strong>${E(x.channelLabel)}</strong> (${x.count} cell${x.count === 1 ? "" : "s"})`, E(x.family), CHIP(x.effort, x.effort === "Heavy" ? "chip-orange" : x.effort === "Light" ? "chip-green" : "")]));
  }
  const phasesUsed = new Set(scope.map(c => c.phase));
  const outPhases = [1, 2, 3, 4, 5, 6].filter(p => !phasesUsed.has(p));
  const channelsUsed = new Set(scope.map(c => c.channelId));
  const outChannels = CAMPAIGN_CHANNELS.filter(c => !channelsUsed.has(c.id)).map(c => c.label);
  html += F("Explicitly out of scope", `Phases: ${outPhases.length ? outPhases.join(", ") : "none"} · Channels: ${outChannels.length ? outChannels.join(", ") : "none"}. Metrics for False scope are not claimable.`);
  if (warnings.length) {
    html += H3("Alignment Warnings") + `<ul>${warnings.map(w => `<li><strong>${w.level === "warn" ? "Warning" : "Gap"}:</strong> ${E(w.text)}</li>`).join("")}</ul>`;
  }
  return html;
};

/* ── 36 Micro-M&A & Structuring Suite ── */
const microMaRenderer: Renderer = d => {
  const data = parseMicroMA(d);
  const c = computeMicroMA(data);
  const sym = microMaSymbol(data.currency, data.customCurrencyCode);
  const M = (v: number) => microMaMoney(v, sym);
  const X1 = (v: number) => `${v.toFixed(1)}x`;
  const X2 = (v: number) => `${v.toFixed(2)}x`;
  const flags = MICRO_MA_RED_FLAGS.filter(f => data.flags.includes(f.id));
  let html = H2("Micro-M&A & Structuring Suite");
  html += F("Reporting currency", microMaToken(data.currency, data.customCurrencyCode));
  html += H3("Fixed Baseline Metrics") + TBL(["Metric", "Value"], [
    ["Target Company Current Revenue", M(MICRO_MA_BASELINE.revenue)],
    ["Target Company Current EBITDA", `${M(MICRO_MA_BASELINE.ebitda)} (${MICRO_MA_BASELINE.ebitdaMarginPct}% margin)`],
    ["Benchmark Competitor Trading Multiple", X1(MICRO_MA_BASELINE.benchmarkMultiple)],
  ]);
  html += H3("Capital Stack & Earn-Out") + TBL(["Output", "Value"], [
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
  html += H3("Restructuring & Deal Terms");
  html += F("Transaction Legal Structure", MICRO_MA_LEGAL_STRUCTURES[data.legalStructure]);
  html += F("Working Capital Target Peg (NWC)", M(data.nwcPeg));
  html += F("Inventory/Receivables Leakage Guardrails", data.leakageGuardrails);
  html += F("Founder Handover & Transition Window", data.handoverMode);
  html += F("Interim Management Deployment Sequence", data.transitionSequence);
  html += H3("Due Diligence & Valuation Guardrails");
  html += flags.length
    ? `<ul>` + flags.map(f => `<li><strong>−${f.penalty.toFixed(2)}x</strong> ${E(f.label)}</li>`).join("") + `</ul>`
    : `<p><em>No red flags active.</em></p>`;
  html += F("Total entry multiple deduction", `−${c.flagPenalty.toFixed(2)}x`);
  html += H3("Master Return Summary") + TBL(["Measure", "Value"], [
    ["Target MOIC", X2(c.moic)],
    ["Implied IRR %", c.irrPct === null ? "—" : `${c.irrPct.toFixed(1)}%`],
    ["Net Sponsor Proceeds on Exit", M(c.netProceeds)],
    ["Total Capital Sourced From Outside Co-Investors", `${M(c.outsideCoInvestors)} (Upfront Cash Check less a 10% Sponsor GP Carry Floor)`],
  ]);
  return html;
};

/* ── 37 Valuation Multi-Engine Calculator ── */
const valuationCalculatorRenderer: Renderer = d => {
  const data = normalizeData(d);
  const sym = vcSymbol(data.currency, data.customCurrencyCode);
  const M = (v: number) => vcMoney(v, sym);
  const p = evaluateMethod(data.primary, data);
  const s = evaluateMethod(data.secondary, data);
  const blend = blendedValuation(data);

  let html = H2("Valuation Multi-Engine Calculator");
  html += F("Reporting currency", vcToken(data.currency, data.customCurrencyCode));
  html += F("Primary method", VC_METHOD_LABEL[data.primary]);
  html += F("Secondary method", VC_METHOD_LABEL[data.secondary]);
  html += F("Blend weighting", `${data.blendWeightPct}% ${VC_METHOD_LABEL[data.primary]} / ${100 - data.blendWeightPct}% ${VC_METHOD_LABEL[data.secondary]}`);

  html += H3("Engine Outputs");
  html += `<div class="field"><div class="field-label">Primary · ${E(VC_METHOD_LABEL[data.primary])}</div><div class="field-value">${E(M(p.value))}<br><span style="font-size:11px;color:#535862">${E(p.detail)}</span></div></div>`;
  html += `<div class="field"><div class="field-label">Secondary · ${E(VC_METHOD_LABEL[data.secondary])}</div><div class="field-value">${E(M(s.value))}<br><span style="font-size:11px;color:#535862">${E(s.detail)}</span></div></div>`;
  html += `<div class="field"><div class="field-label">Blended Combined Valuation Assessment</div><div class="field-value">${E(M(blend))}</div></div>`;

  html += H3("Shared Fundamentals") + TBL(["Input", "Value"], [
    ["Revenue", M(data.revenue)], ["EBITDA", M(data.ebitda)], ["Net Debt", M(data.netDebt)],
    ["Total Assets", M(data.totalAssets)], ["Total Liabilities", M(data.totalLiabilities)], ["Active Users", data.users.toLocaleString("en-US")],
  ]);

  // All 11 method values, so the print carries the full engine set.
  html += H3("All 11 Method Values") + TBL(["#", "Method", "Value"], VC_METHODS.map(m => [
    String(m.n), m.label, M(evaluateMethod(m.id, data).value),
  ]));

  html += H3("Engine Parameters");
  html += F("Method 1 · Scorecard — base floor", M(data.scorecardFloor));
  html += VC_BERKUS_LAYERS.map(l => F(`  · ${l.label}`, M(data.berkusFactors[l.key] ?? 0))).join("");
  html += F("Method 5 · Berkus inverse benchmark", data.berkusBenchmark ? M(data.berkusBenchmark) : "mirrors Method 1");
  html += F("Method 2 · EV/Sales multiple", `${data.evSalesMultiple}x`);
  html += F("Method 2 · EV/User sub-view", data.users > 0 ? `${M(data.evPerUser)} × ${data.users.toLocaleString("en-US")} users = ${M(data.users * data.evPerUser)}` : "off");
  html += F("Method 3 · EV/EBITDA multiple", `${data.evEbitdaMultiple}x`);
  html += F("Method 6 · DCF — year-1 FCF / growth / WACC", `${M(data.dcfFcf)} · ${data.dcfGrowthPct}% · ${data.dcfWaccPct}%`);
  html += F("Method 6 · DCF terminal factor", `${data.dcfTerminalMode} @ ${data.dcfTerminalMultiple}x (one of ${VC_TERMINAL_MODES.join(", ")})`);
  html += F("Method 7 · Liquidation haircut", `${data.liquidationHaircutPct}%`);
  html += F("Method 9 · Replacement premium", `${data.replacementPremiumPct}%`);
  html += F("Method 8 · EV/TAM", `TAM ${M(data.tam)} · ${data.tamPenetrationPct}% penetration · ${data.tamShareOfEV}% share of EV`);
  return html;
};

/* ── 38 InfraRE Consortium Suite ── */
const infraReConsortiumRenderer: Renderer = d => {
  const data = normalizeInfraReConsortium(d);
  const cur = effectiveInfraCurrency(data, "USD");
  const M = (v: number) => infraMoney(v, cur);
  const e = computeInfraEconomics(data);
  const pct = (v: number | null) => (v == null ? "—" : `${(v * 100).toFixed(1)}%`);
  const xf = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}x`);
  const num = (v: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);
  const resp = (id: string) => INFRA_RESPONSIBILITIES.find(r => r.id === id)?.label ?? id;

  let html = H2("InfraRE Consortium Suite");
  html += F("Reporting currency", cur);
  html += F("Jurisdiction", "Jurisdiction-agnostic");

  html += H3("Consortium Alignment & Execution Team") + TBL(
    ["Vector Pillar", "Responsibility", "Maturity", "Scope Boundaries & Custom Responsibilities"],
    INFRA_PILLARS.map((p, i) => {
      const row = data.pillars[i];
      return [p.label, resp(row.responsibility), `${row.maturity}/5`, row.scope || "—"];
    }),
  );
  if (data.customMembers.length) {
    html += H3("Custom Consortium Members") + TBL(
      ["Firm / Member Name", "Responsibility", "Maturity", "Scope Boundaries & Custom Responsibilities"],
      data.customMembers.map(m => [m.name || "—", resp(m.responsibility), `${m.maturity}/5`, m.scope || "—"]),
    );
  }

  html += H3("SPV Structuring — Underwriting Inputs") + TBL(["Input", "Value"], [
    ["Plot / Land Scale Area", num(data.landArea)],
    ["Permissible FAR Ratio", `${data.farRatio}x`],
    ["Structural Efficiency", `${data.efficiencyPct}%`],
    ["Target Yield / Selling Price per Unit Area", M(data.targetYieldPrice)],
    ["Hard Construction Rate per Unit GFA", M(data.hardCostRate)],
    ["Soft Costs", `${data.softCostPct}% of hard`],
    ["Contingency Multiplier", `${data.contingencyMultiplier}x`],
    ["Development Horizon", `${data.horizonYears} years`],
  ]);

  html += H3("SPV Structural Injection Blueprint") + TBL(
    ["Stage", "Who provides what asset/capital input", "How it is legalised/transferred", "When it hits the SPV ledger", "Progressive funding stages"],
    data.injections.map((r, i) => [String(i + 1), r.whoProvides || "—", r.howLegalised || "—", r.whenLedger || "—", r.stageCount || "—"]),
  );

  html += H3("SPV Structuring — Financial & Equity") + TBL(["Component", `Value (${cur})`], [
    ["Land Value — In-Kind Contribution", M(data.landValue)],
    ["Upfront Cash Sourced", M(data.upfrontCash)],
    ["Senior Debt Facility Sized", M(data.seniorDebt)],
    ["Consortium Equity Injected", M(data.consortiumEquity)],
  ]);

  html += H3("Reactive Mathematical Engine") + TBL(["Metric", "Value"], [
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

  html += H3("Value-Chain Readiness Ledger") + TBL(
    ["Sourcing Scope / Material Category", "Mapped Rolodex Vendor", "Consortium Member Responsible", "Financing / Structuring Terms", "Readiness Status"],
    data.procurement.map(r => [r.category || "—", r.supplier || "—", assigneeName(data, r.ownerId) || "Unassigned", r.financing || "—", readinessLabel(r.readiness)]),
  );

  html += H3("Master Delivery Milestones & GTM Blueprint") + TBL(
    ["Phase", "Duration (wks)", "Inter-Phase Dependencies", "GTM Strategy Notes"],
    INFRA_MILESTONES.map((m, i) => {
      const row = data.milestones[i];
      return [m.label, String(row.durationWeeks), row.dependencies || "—", row.gtmNotes || "—"];
    }),
  );

  html += H3("MOU Executive Pitch Teaser Blueprint") + `<div class="field"><div class="field-value">${E(assembleMouPitch(data, cur, e))}</div></div>`;
  return html;
};

const acquisitionPipelineRenderer: Renderer = d => {
  const data = normalizeAcquisitionPipeline(d);
  const cur = effectivePipelineCurrency(data, "USD");
  const M = (v: number) => pipelineMoney(v, cur);
  const bars = computeFunnelBars(data.sourcingFunnel);
  const total = data.sourcingFunnel.marketVolume || 1;

  let html = H2("Acquisition Pipeline & Deal Tracker Engine");
  html += F("Reporting currency", cur);

  html += H3("Strategy & Buy Box Calibration") + TBL(["Input", "Value"], [
    ["Sourced Down Payment Available", M(data.buyBox.downPayment)],
    ["Target Annual Cash Flow Required", M(data.buyBox.targetCashFlow)],
    ["Target Time Dedication", `${data.buyBox.hoursPerWeek} Hours/Week`],
    ["Time Dedication Detail", data.buyBox.timeDedication || "—"],
    ["Target Geography Boundaries", data.buyBox.geography || "—"],
    ["Target Industry Boundaries", data.buyBox.industry || "—"],
  ]);

  html += H3("Preparation Milestones") + TBL(["Milestone", "Status"], [
    ["Define Buy Box & Capital Stack", data.prepMilestones[0] ? "✓ Done" : "○ Pending"],
    ["Build Sourcing Channels & Broker Network", data.prepMilestones[1] ? "✓ Done" : "○ Pending"],
    ["Prepare Diligence Framework & Team", data.prepMilestones[2] ? "✓ Done" : "○ Pending"],
    ["Secure Financing Pre-Approval & LOI Template", data.prepMilestones[3] ? "✓ Done" : "○ Pending"],
  ]);

  html += H3("Sourcing Funnel & Deal Flow") + TBL(["Stage", "Count", "Attrition"], bars.map(b => [
    b.label, String(b.value), b.pct.toFixed(1) + "% of market",
  ]));
  html += F("Buy-Box Hit Rate", `${((data.sourcingFunnel.fitsBuyBox / total) * 100).toFixed(1)}%`);
  html += F("Offer Rate", `${((data.sourcingFunnel.worthOffer / total) * 100).toFixed(1)}%`);
  html += F("Funnel Yield", `${((data.sourcingFunnel.worthOffer / total) * 100).toFixed(2)}% make it to offer`);

  if (data.activeTargets.length) {
    html += H3("Target Analysis & CIM Evaluation") + TBL(
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
    html += H3("Reading the CIM — Detail") + TBL(
      ["Target", "3-Yr Financials", "Management Analysis", "Fluff Identifier"],
      data.activeTargets.map(t => [
        t.companyName || `Target ${t.id.slice(0, 4)}`,
        t.cim.financials3yr ? "✓" : "○",
        t.cim.managementAnalysis ? "✓" : "○",
        t.cim.fluffIdentifier ? "✓" : "○",
      ]),
    );
  } else {
    html += H3("Target Analysis & CIM Evaluation") + `<p>No acquisition targets added yet.</p>`;
  }

  html += H3("LOI Structuring — Deal Terms") + TBL(["Field", "Value"], [
    ["Seller Primary Pain Point", data.dealStructure.sellerPainPoint || "—"],
    ["How Our LOI Structuring Solves It", data.dealStructure.loiSolution || "—"],
    ["Handover Mode", data.dealStructure.handoverMode],
  ]);

  html += H3("Due Diligence Checklists") + TBL(["Check", "Status"], [
    ["Free — Site Visit", data.diligence.siteVisit ? "✓" : "○"],
    ["Free — Employee Interviews", data.diligence.employeeInterviews ? "✓" : "○"],
    ["Free — Customer Emulation", data.diligence.customerEmulation ? "✓" : "○"],
    ["Professional — CPA Quality of Earnings (QofE)", data.diligence.cpaQofE ? "✓" : "○"],
    ["Professional — Legal Contract Assessment", data.diligence.legalContracts ? "✓" : "○"],
    ["Professional — Bank Document Checklist", data.diligence.bankDocs ? "✓" : "○"],
  ]);

  html += H3("Closing Track — Moving Towards Closing") + TBL(["Step", "Status"], [
    ["Step 1 — LOI Accepted & Exclusivity Secured", data.diligence.closingStep1 ? "✓" : "○"],
    ["Step 2 — Financing Committed & PA Drafted", data.diligence.closingStep2 ? "✓" : "○"],
    ["Step 3 — Funds Wired & Keys Handed Over", data.diligence.closingStep3 ? "✓" : "○"],
  ]);
  const closingDone = [data.diligence.closingStep1, data.diligence.closingStep2, data.diligence.closingStep3].filter(Boolean).length;
  html += F("Closing momentum", `${closingDone} / 3`);

  // ── Debt Optimization & Stress Test ──
  const debt = data.debtStressTest;
  const dc = computeDebtComparison(debt);
  const paidBy = CONCIERGE_PAID_BY.find(o => o.value === debt.conciergePaidBy);
  html += H3("Debt Optimization & Stress Test");
  html += F("Loan Principal", M(debt.loanPrincipal));
  html += F("Term Duration", `${debt.termYears} years`);
  html += F("Concierge / Finder Fee", `${debt.conciergeFeePct}% → ${M(dc.conciergeFeeAmount)} (${paidBy ? paidBy.label : debt.conciergePaidBy}${debt.conciergePaidBy === "buyer" ? ", out of pocket" : debt.conciergePaidBy === "lender" ? ", built into lender volume pricing" : ""})`);
  html += TBL(
    ["Measure", `Term at Rate A (${debt.rateA}%)`, `Term at Rate B (${debt.rateB}%)`, "Delta"],
    [
      ["Monthly Payment", M(dc.scenarioA.monthlyPayment), M(dc.scenarioB.monthlyPayment), M(Math.abs(dc.monthlyDelta))],
      ["Total Cost Across Term", M(dc.scenarioA.totalCost), M(dc.scenarioB.totalCost), M(Math.abs(dc.totalSpread))],
      ["Cumulative Interest Paid", M(dc.scenarioA.totalInterest), M(dc.scenarioB.totalInterest), M(Math.abs(dc.interestSpread))],
    ].map(r => r.map(E)),
  );
  html += F("Total Spread Leakage Saved out of Pocket", M(Math.abs(dc.totalSpread)));
  html += F("Net After Concierge Fee", M(dc.netSavings));
  html += H3(`Pre-Contract Vetting — ${dc.gatesPassed}/${VETTING_GATES.length} Gates Passed`) + TBL(
    ["#", "Gate", "Status", "Check"],
    VETTING_GATES.map((g, i) => [
      String(i + 1),
      g.label,
      debt.vettingChecklist[g.key] ? "Pass" : "Open",
      g.hint,
    ].map(E)),
  );

  return html;
};

export const RENDERERS: Record<string, Renderer> = {
  "pains-mapper": painsRenderer,
  "gains-mapper": gainsRenderer,
  "jobs-ranker": jobsRenderer,
  "day-in-life": dayRenderer,
  "persona-journey": personaRenderer,
  "bmc": bmcRenderer,
  "six-innovate": sixWaysRenderer,
  "strategic-guidance": sgRenderer,
  "valuation-selector": valRenderer,
  "asian-bm": asianRenderer,
  "discovery-recorder": discoveryRenderer,
  "creative-brief": briefRenderer,
  "style-scape": styleScapeRenderer,
  "design-critique": critiqueRenderer,
  "logo-review": logoRenderer,
  "why-buy": whyBuyRenderer,
  "problem-solving": psRenderer,
  "financial-research": finRenderer,
  "luxuries-audit": luxuriesRenderer,
  "scope-builder": scopeRenderer,
  "facilitation-log": facilitationRenderer,
  "consortium-bid": consortiumRenderer,
  "dpr-consulting": dprRenderer,
  "brand-mindset": mindsetRenderer,
  "content-pillar": pillarRenderer,
  "style-locker": styleLockerRenderer,
  "story-framework": storyFrameworkRenderer,
  "pitch-narrative": pitchRenderer,
  "story-checklist": storyChecklistRenderer,
  "design-criteria": criteriaRenderer,
  "moodboard": moodboardRenderer,
  "innovation-scorecard": scorecardRenderer,
  "disruption-risk": disruptionRenderer,
  "brand-world-creator": brandWorldRenderer,
  "campaign-brief-alignment": campaignBriefAlignmentRenderer,
  "universal-micro-ma-suite": microMaRenderer,
  "valuation-calculator": valuationCalculatorRenderer,
  "infra-re-consortium": infraReConsortiumRenderer,
  "acquisition-pipeline": acquisitionPipelineRenderer,
};

export function renderAppBody(appId: string, data: any): string {
  const r = RENDERERS[appId];
  if (r) return r(data);
  return `<h2>Session Notes</h2><div class="field"><div class="field-value">${E(data?.notes || "No structured print available yet.")}</div></div>`;
}

export const PRINT_RENDERER_IDS = Object.keys(RENDERERS);
