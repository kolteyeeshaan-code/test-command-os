/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 *
 * Consulting Domain : B2B Matchmaking/Trading + Micro M&A/Funding Consultancy [M&A & Trading]
 * Domain Key        : micro_ma_matchmaking
 * Official Title    : Financial Research Workbook
 * Operational Purpose: Log metrics against benchmarks and sources, then interpret what they mean.
 *
 * Consulting Domain : Digital Communication & Marketing Outreach [Digital]
 * Domain Key        : digital_outreach
 * Official Title    : Content Pillar Architect
 * Operational Purpose: Three to five pillars with coverage, formats, cadence, and owner.
 *
 * Consulting Domain : Digital Communication & Marketing Outreach [Digital]
 * Domain Key        : digital_outreach
 * Official Title    : Signature Content Style Locker
 * Operational Purpose: Lock voice, tone, vocabulary, and non-negotiable style rules.
 *
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Storytelling Framework Selector
 * Operational Purpose: Choose the narrative frame, then outline the story inside it.
 *
 * Consulting Domain : Events, Brand Activations & Business Development [Activations]
 * Domain Key        : events_activations
 * Official Title    : Pitch Narrative Builder
 * Operational Purpose: Seven spoken beats from hook to closing.
 *
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Storytelling Design Checklist
 * Operational Purpose: Ten checks for story quality, with notes where checks fail.
 *
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Moodboarding App
 * Operational Purpose: Build a board from image URLs where every tile earns its place.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════
   18 · FINANCIAL RESEARCH WORKBOOK
   ═══════════════════════════════════════════════════════════ */
interface Metric { id: string; metric: string; value: string; benchmark: string; source: string; note: string }
interface FinData { subject: string; period: string; metrics: Metric[]; summary: string }

export function FinancialResearchWorkbook({ data: raw, onChange, live }: AppProps) {
  const d: FinData = { subject: "", period: "", metrics: [], summary: "", ...(raw as Partial<FinData>) };
  const upd = (u: Partial<FinData>) => onChange({ ...d, ...u });
  const um = (id: string, u: Partial<Metric>) => upd({ metrics: d.metrics.map(m => m.id === id ? { ...m, ...u } : m) });
  const add = () => upd({ metrics: [...d.metrics, { id: generateId(), metric: "", value: "", benchmark: "", source: "", note: "" }] });
  const rm = (id: string) => upd({ metrics: d.metrics.filter(m => m.id !== id) });

  return (
    <div className="mx-auto max-w-[1000px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Financial Research Workbook</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Numbers only mean something next to a benchmark. Log the source of every figure.</p>
        </div>
      )}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Company / market</label>
            <input value={d.subject} onChange={e => upd({ subject: e.target.value })} placeholder="e.g. Meridian Capital" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[15px] font-semibold outline-none focus:border-ink" /></div>
          <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Period</label>
            <input value={d.period} onChange={e => upd({ period: e.target.value })} placeholder="e.g. FY2025 · Q3" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
        </div>
      </div>

      {d.metrics.length === 0 && (
        <div className="rounded-2xl bg-card py-12 text-center">
          <p className="mb-4 text-sm text-subtitle">No metrics yet. Add the first figure you want to benchmark.</p>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add metric</button>
        </div>
      )}

      {d.metrics.map((m, i) => (
        <div key={m.id} className="mb-3 rounded-2xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
            <button onClick={() => rm(m.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Metric</label>
              <input value={m.metric} onChange={e => um(m.id, { metric: e.target.value })} placeholder="Revenue growth" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Value</label>
              <input value={m.value} onChange={e => um(m.id, { value: e.target.value })} placeholder="12.4%" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Benchmark</label>
              <input value={m.benchmark} onChange={e => um(m.id, { benchmark: e.target.value })} placeholder="8.0% industry" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Source</label>
              <input value={m.source} onChange={e => um(m.id, { source: e.target.value })} placeholder="Annual report p.24" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Interpretation</label>
              <input value={m.note} onChange={e => um(m.id, { note: e.target.value })} placeholder="What it means" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
          </div>
        </div>
      ))}

      {d.metrics.length > 0 && (
        <button onClick={add} className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,117,117,0.3)] py-4 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink"><IconPlus size={14} /> Add metric</button>
      )}

      <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Research summary</label>
        <textarea value={d.summary} onChange={e => upd({ summary: e.target.value })} rows={4} placeholder="What do the numbers actually say?" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" /></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   25 · CONTENT PILLAR ARCHITECT
   ═══════════════════════════════════════════════════════════ */
interface Pillar { id: string; name: string; covers: string; formats: string; cadence: string; owner: string }
interface PillarData { pillars: Pillar[]; strategy: string }

export function ContentPillarArchitect({ data: raw, onChange, live }: AppProps) {
  const d: PillarData = { pillars: [], strategy: "", ...(raw as Partial<PillarData>) };
  const upd = (u: Partial<PillarData>) => onChange({ ...d, ...u });
  const up = (id: string, u: Partial<Pillar>) => upd({ pillars: d.pillars.map(p => p.id === id ? { ...p, ...u } : p) });
  const add = () => upd({ pillars: [...d.pillars, { id: generateId(), name: "", covers: "", formats: "", cadence: "", owner: "" }] });
  const rm = (id: string) => upd({ pillars: d.pillars.filter(p => p.id !== id) });

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Content Pillar Architect</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Three to five pillars carry an entire content strategy. More than five and none of them gets enough volume to compound.</p>
        </div>
      )}
      {d.pillars.length === 0 && (
        <div className="rounded-2xl bg-card py-12 text-center">
          <p className="mb-4 text-sm text-subtitle">No pillars defined yet.</p>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add first pillar</button>
        </div>
      )}
      {d.pillars.map((p, i) => (
        <div key={p.id} className="mb-4 rounded-2xl bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
              <input value={p.name} onChange={e => up(p.id, { name: e.target.value })} placeholder="Pillar name…" className="flex-1 bg-transparent text-[17px] font-semibold tracking-[-0.02em] outline-none placeholder:text-black/25" />
            </div>
            <button onClick={() => rm(p.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
          </div>
          <div className="grid gap-3">
            <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">What this pillar covers</label>
              <textarea value={p.covers} onChange={e => up(p.id, { covers: e.target.value })} rows={2} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Formats</label>
                <input value={p.formats} onChange={e => up(p.id, { formats: e.target.value })} placeholder="Posts, video…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
              <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Cadence</label>
                <input value={p.cadence} onChange={e => up(p.id, { cadence: e.target.value })} placeholder="2× weekly" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
              <div><label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">Owner</label>
                <input value={p.owner} onChange={e => up(p.id, { owner: e.target.value })} placeholder="Who makes it" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" /></div>
            </div>
          </div>
        </div>
      ))}
      {d.pillars.length > 0 && (
        <button onClick={add} className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,117,117,0.3)] py-4 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink"><IconPlus size={14} /> Add pillar</button>
      )}
      <div><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Strategy notes</label>
        <textarea value={d.strategy} onChange={e => upd({ strategy: e.target.value })} rows={3} placeholder="How the pillars reinforce each other…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" /></div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   26 · SIGNATURE CONTENT STYLE LOCKER
   ═══════════════════════════════════════════════════════════ */
interface Rule { id: string; rule: string }
interface StyleData { voice: string; tone: string; doSay: string; dontSay: string; formatting: string; rules: Rule[]; examples: string }

export function SignatureContentStyleLocker({ data: raw, onChange, live }: AppProps) {
  const d: StyleData = { voice: "", tone: "", doSay: "", dontSay: "", formatting: "", rules: [], examples: "", ...(raw as Partial<StyleData>) };
  const upd = (u: Partial<StyleData>) => onChange({ ...d, ...u });
  const CARD = "rounded-2xl bg-card p-5";
  const lbl = "mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle";
  const inp = "w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink";

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Signature Content Style Locker</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Lock the voice so anyone can write in it — and nobody can quietly drift it.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={CARD}><label className={lbl}>Voice — who we sound like</label><textarea value={d.voice} onChange={e => upd({ voice: e.target.value })} rows={4} placeholder="Personality in 2–3 sentences…" className={inp} /></div>
        <div className={CARD}><label className={lbl}>Tone — how it flexes</label><textarea value={d.tone} onChange={e => upd({ tone: e.target.value })} rows={4} placeholder="Serious ↔ playful across contexts…" className={inp} /></div>
        <div className={CARD}><label className={lbl}>We say</label><textarea value={d.doSay} onChange={e => upd({ doSay: e.target.value })} rows={4} placeholder="Words and phrases we use…" className={inp} /></div>
        <div className={CARD}><label className={lbl}>We never say</label><textarea value={d.dontSay} onChange={e => upd({ dontSay: e.target.value })} rows={4} placeholder="Banned words, clichés, jargon…" className={inp} /></div>
      </div>
      <div className="mt-4 rounded-2xl bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <label className={lbl}>Locked signature rules</label>
          <button onClick={() => upd({ rules: [...d.rules, { id: generateId(), rule: "" }] })} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(117,117,117,0.25)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.06em] hover:border-ink"><IconPlus size={12} /> Lock a rule</button>
        </div>
        {d.rules.length === 0 && <p className="py-3 text-center text-[12px] text-subtitle">No rules locked yet.</p>}
        {d.rules.map((r, i) => (
          <div key={r.id} className="group mb-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2">
            <span className="text-[11px] font-bold text-ink/40">{String(i + 1).padStart(2, "0")}</span>
            <input value={r.rule} onChange={e => upd({ rules: d.rules.map(x => x.id === r.id ? { ...x, rule: e.target.value } : x) })} placeholder="A non-negotiable style rule…" className="flex-1 bg-transparent text-[14px] outline-none" />
            <button onClick={() => upd({ rules: d.rules.filter(x => x.id !== r.id) })} className="text-ink/20 opacity-0 transition hover:text-red-500 group-hover:opacity-100"><IconTrash size={14} /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className={CARD}><label className={lbl}>Formatting rules</label><textarea value={d.formatting} onChange={e => upd({ formatting: e.target.value })} rows={3} placeholder="Capitalisation, emoji policy, length rules…" className={inp} /></div>
        <div className={CARD}><label className={lbl}>Reference examples</label><textarea value={d.examples} onChange={e => upd({ examples: e.target.value })} rows={3} placeholder="Links or snippets of on-voice content…" className={inp} /></div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   27 · STORYTELLING FRAMEWORK SELECTOR (6 Frameworks Model)
   ═══════════════════════════════════════════════════════════ */
export interface FrameworkDef {
  id: string;
  name: string;
  useWhen: string;
  fields: { key: string; label: string; hint: string }[];
}

export const FRAMEWORKS: FrameworkDef[] = [
  {
    id: "golden_circle",
    name: "1. Golden Circle (Simon Sinek)",
    useWhen: "When establishing purpose, vision, or brand alignment. Connects emotionally before explaining utility.",
    fields: [
      { key: "why", label: "WHY (Core Belief & Purpose)", hint: "Why do you exist? What is your core belief or reason for being?" },
      { key: "how", label: "HOW (Differentiating Process / Values)", hint: "How do you do it differently? What are your values or unique methods?" },
      { key: "what", label: "WHAT (Tangible Offer / Deliverable)", hint: "What do you actually produce or sell to fulfill that Why?" },
    ],
  },
  {
    id: "minto_pyramid",
    name: "2. Minto Pyramid Principle",
    useWhen: "When presenting to executives or decision-makers. Leads with the conclusion, then supporting arguments.",
    fields: [
      { key: "mainIdea", label: "Main Idea / Top Recommendation", hint: "State the core message or decision upfront in one sentence." },
      { key: "keyArguments", label: "Key Supporting Arguments (3–4 Pillars)", hint: "Group logical supporting arguments (MECE: Mutually Exclusive, Collectively Exhaustive)." },
      { key: "evidence", label: "Supporting Data & Evidence", hint: "Facts, research, financial models, and proofs backing each argument." },
    ],
  },
  {
    id: "storybrand",
    name: "3. StoryBrand Framework",
    useWhen: "When building customer-centric marketing, website copy, or brand positioning where customer is the Hero.",
    fields: [
      { key: "hero", label: "1. Customer (Hero) & Goal", hint: "Who is the customer and what do they want?" },
      { key: "problem", label: "2. External, Internal & Philosophical Problem", hint: "What problem is blocking them? How does it make them feel?" },
      { key: "guide", label: "3. Guide (Your Brand with Empathy & Authority)", hint: "How do you show empathy and demonstrate proven authority?" },
      { key: "plan", label: "4. The 3-Step Plan", hint: "What clear, simple path do you lay out for them?" },
      { key: "callToAction", label: "5. Direct Call to Action", hint: "What clear action do you ask them to take?" },
      { key: "success", label: "6. Success & Avoided Failure", hint: "What does life look like when they win vs if they do nothing?" },
    ],
  },
  {
    id: "abt",
    name: "4. ABT (And, But, Therefore)",
    useWhen: "When delivering rapid, punchy verbal pitches, keynote openings, or high-level narrative Hooks.",
    fields: [
      { key: "and", label: "AND (Context & Shared Agreement)", hint: "Set the background state and shared vision..." },
      { key: "but", label: "BUT (The Conflict & Turning Point)", hint: "Introduce the problem, barrier, or contradiction..." },
      { key: "therefore", label: "THEREFORE (The Resolution & Action)", hint: "Present the solution and the necessary next step..." },
    ],
  },
  {
    id: "challenger",
    name: "5. Challenger Framework",
    useWhen: "When reframing B2B sales or executive consulting pitches. Teaches a new perspective rather than asking what they want.",
    fields: [
      { key: "teach", label: "1. Teach (Commercial Insight)", hint: "Offer a non-obvious insight that reframes their perspective on their business." },
      { key: "tailor", label: "2. Tailor (Economic Resonance)", hint: "Connect that insight directly to their specific financial/operational metrics." },
      { key: "takeControl", label: "3. Take Control (Prescriptive Path)", hint: "Lead the customer toward your unique solution with confidence." },
    ],
  },
  {
    id: "what_sowhat_nowwhat",
    name: "6. What, So What, Now What",
    useWhen: "When facilitating workshops, debriefing research, or writing executive status reports.",
    fields: [
      { key: "what", label: "1. WHAT (Facts & Observations)", hint: "What happened? What are the key facts or data points?" },
      { key: "soWhat", label: "2. SO WHAT (Implications & Impact)", hint: "Why does this matter? What is the strategic or operational impact?" },
      { key: "nowWhat", label: "3. NOW WHAT (Action & Next Steps)", hint: "What specific actions do we take right now?" },
    ],
  },
];

interface FrameworkData {
  selectedId: string;
  deliverable: string;
  audience: string;
  goal: string;
  fields: Record<string, string>; // fields[frameworkId + "." + fieldKey]
  notes: string;
}

export function StorytellingFrameworkSelector({ data: raw, onChange, live }: AppProps) {
  const d: FrameworkData = {
    selectedId: "golden_circle",
    deliverable: "",
    audience: "",
    goal: "",
    fields: {},
    notes: "",
    ...(raw as Partial<FrameworkData>),
  };

  const activeFw = FRAMEWORKS.find(f => f.id === d.selectedId) ?? FRAMEWORKS[0];

  const upd = (u: Partial<FrameworkData>) => onChange({ ...d, ...u });
  const setField = (fieldKey: string, val: string) => {
    const key = activeFw.id + "." + fieldKey;
    upd({ fields: { ...d.fields, [key]: val } });
  };

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Storytelling Framework Selector</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Pick the narrative framework that fits your communication context. Fill in the structured beats below.
          </p>
        </div>
      )}

      {/* Scope / Deliverable Header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Story Scope</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Deliverable in question</label>
            <input value={d.deliverable} onChange={e => upd({ deliverable: e.target.value })} placeholder="e.g. Investor Keynote / Brand Story Video" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Target Audience</label>
            <input value={d.audience} onChange={e => upd({ audience: e.target.value })} placeholder="e.g. Board of Directors / HNW Prospects" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Desired Action / Goal</label>
            <input value={d.goal} onChange={e => upd({ goal: e.target.value })} placeholder="e.g. Sign retainer contract" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
          </div>
        </div>
      </div>

      {/* Framework Selector Cards */}
      <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-subtitle">Select Framework</p>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORKS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => upd({ selectedId: f.id })}
            className={cn(
              "flex flex-col justify-between rounded-2xl p-4 text-left transition",
              d.selectedId === f.id ? "bg-ink text-white shadow-md" : "bg-card hover:bg-[#ededed]"
            )}
          >
            <div>
              <p className="text-[14px] font-semibold">{f.name}</p>
              <p className={cn("mt-1.5 text-[11px] leading-relaxed", d.selectedId === f.id ? "opacity-80" : "text-subtitle")}>
                {f.useWhen}
              </p>
            </div>
            {d.selectedId === f.id && <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-[0.08em] text-white/60">Active Framework</span>}
          </button>
        ))}
      </div>

      {/* Active Framework Beats */}
      <div className="rounded-2xl bg-card p-6">
        <div className="mb-4 border-b border-dashed border-[rgba(120,120,128,0.2)] pb-3">
          <p className="text-[16px] font-bold tracking-[-0.01em]">{activeFw.name}</p>
          <p className="mt-1 text-[12px] italic text-subtitle"><strong>When to use:</strong> {activeFw.useWhen}</p>
        </div>

        <div className="flex flex-col gap-4">
          {activeFw.fields.map(f => {
            const key = activeFw.id + "." + f.key;
            const val = d.fields?.[key] ?? "";
            return (
              <div key={f.key} className="rounded-xl bg-white p-4">
                <label className="mb-1 block text-[13px] font-semibold text-ink">{f.label}</label>
                <p className="mb-2 text-[12px] italic text-subtitle">{f.hint}</p>
                <textarea
                  value={val}
                  onChange={e => setField(f.key, e.target.value)}
                  rows={3}
                  placeholder={`Draft ${f.label.toLowerCase()} beat…`}
                  className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-dashed border-[rgba(120,120,128,0.2)] pt-4">
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Facilitation &amp; Delivery Notes</label>
          <textarea
            value={d.notes}
            onChange={e => upd({ notes: e.target.value })}
            rows={3}
            placeholder="Slide design notes, verbal delivery cues, emphasis points…"
            className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink"
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   28 · PITCH NARRATIVE BUILDER
   ═══════════════════════════════════════════════════════════ */
export const PITCH_BEATS: { key: string; label: string; hint: string }[] = [
  { key: "hook", label: "Hook", hint: "The opening line that earns the next 30 seconds." },
  { key: "problem", label: "Problem", hint: "The specific pain, named in the audience's words." },
  { key: "stakes", label: "Stakes", hint: "What happens if nothing changes?" },
  { key: "solution", label: "Solution", hint: "Your answer — simply, confidently, without jargon." },
  { key: "proof", label: "Proof", hint: "Evidence: results, names, numbers, demos." },
  { key: "ask", label: "The Ask", hint: "Exactly what you want from this audience." },
  { key: "closing", label: "Closing", hint: "The line they'll repeat to someone else." },
];
interface PitchData { beats: Record<string, string> }

export function PitchNarrativeBuilder({ data: raw, onChange, live }: AppProps) {
  const d: PitchData = { beats: {}, ...(raw as Partial<PitchData>) };
  const set = (k: string, v: string) => onChange({ beats: { ...d.beats, [k]: v } });
  return (
    <div className="mx-auto max-w-[820px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Pitch Narrative Builder</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Write each beat as it will be spoken — not as bullet points.</p>
        </div>
      )}
      {PITCH_BEATS.map((b, i) => (
        <div key={b.key} className="mb-4 rounded-2xl bg-card p-5">
          <div className="mb-1 flex items-center gap-3">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
            <p className="text-[16px] font-semibold">{b.label}</p>
          </div>
          <p className="mb-3 pl-9 text-[12px] leading-5 text-subtitle">{b.hint}</p>
          <textarea value={d.beats?.[b.key] ?? ""} onChange={e => set(b.key, e.target.value)} rows={3} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   29 · STORYTELLING DESIGN CHECKLIST
   ═══════════════════════════════════════════════════════════ */
export const STORY_CHECKS = [
  "The customer is the protagonist — not the brand",
  "There is a clearly named conflict or tension",
  "Concrete stakes: something is won or lost",
  "One message, stated simply",
  "An emotional arc, not just information",
  "A visual metaphor or memorable image",
  "Credible proof supports the claims",
  "A clear resolution or transformation",
  "The ending is repeatable in one sentence",
  "There is one obvious call to action",
];
interface CheckData { deliverable: string; checks: Record<string, boolean>; notes: Record<string, string> }

export function StorytellingDesignChecklist({ data: raw, onChange, live }: AppProps) {
  const d: CheckData = { deliverable: "", checks: {}, notes: {}, ...(raw as Partial<CheckData>) };
  const upd = (u: Partial<CheckData>) => onChange({ deliverable: d.deliverable, checks: d.checks, notes: d.notes, ...u });
  const done = STORY_CHECKS.filter(c => d.checks?.[c]).length;

  return (
    <div className="mx-auto max-w-[800px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Storytelling Design Checklist</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Run every deliverable through the list. Scope the checklist to the deliverable in question.</p>
        </div>
      )}

      {/* Scope / Deliverable header */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Deliverable in Question</label>
        <input
          value={d.deliverable}
          onChange={e => upd({ deliverable: e.target.value })}
          placeholder="e.g. Brand Launch Video Script / Keynote Deck"
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-[15px] font-semibold outline-none focus:border-ink",
            !d.deliverable.trim() ? "border-[rgba(255,149,0,0.5)]" : "border-[rgba(117,117,117,0.15)]"
          )}
        />
        {!d.deliverable.trim() && <p className="mt-1.5 text-[11px] text-[#c77700]">Recommended — name the deliverable being audited.</p>}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[15px] font-bold uppercase tracking-[0.04em]">10-Point Story Audit</p>
        <span className="font-[family-name:var(--font-roboto)] text-[14px] font-bold tabular-nums text-subtitle">{done} / {STORY_CHECKS.length} passing</span>
      </div>

      <div className="flex flex-col gap-2">
        {STORY_CHECKS.map((c, i) => (
          <div key={c} className={cn("rounded-2xl bg-card p-4 transition", d.checks?.[c] && "opacity-70")}>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={!!d.checks?.[c]} onChange={e => upd({ checks: { ...d.checks, [c]: e.target.checked } })} className="mt-1 h-4 w-4 accent-ink" />
              <span className="flex-1">
                <span className={cn("text-[15px] font-medium", d.checks?.[c] && "line-through decoration-ink/40")}>{i + 1}. {c}</span>
                <input value={d.notes?.[c] || ""} onChange={e => upd({ notes: { ...d.notes, [c]: e.target.value } })} placeholder="Note if failing…" className="mt-1 block w-full bg-transparent text-[13px] text-subtitle outline-none placeholder:text-black/20" />
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   31 · MOODBOARDING APP
   ═══════════════════════════════════════════════════════════ */
interface Tile { id: string; title: string; why: string; imageUrl: string; tags: string }
interface MoodData { tiles: Tile[]; direction: string }

export function MoodboardingApp({ data: raw, onChange, live }: AppProps) {
  const d: MoodData = { tiles: [], direction: "", ...(raw as Partial<MoodData>) };
  const upd = (u: Partial<MoodData>) => onChange({ ...d, ...u });
  const ut = (id: string, u: Partial<Tile>) => upd({ tiles: d.tiles.map(t => t.id === id ? { ...t, ...u } : t) });
  const add = () => upd({ tiles: [...d.tiles, { id: generateId(), title: "", why: "", imageUrl: "", tags: "" }] });
  const rm = (id: string) => upd({ tiles: d.tiles.filter(t => t.id !== id) });

  return (
    <div>
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Moodboarding</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Paste any image URL to build the board. Every tile needs a “why” or it is just decoration.</p>
        </div>
      )}
      {d.tiles.length === 0 && (
        <div className="rounded-2xl bg-card py-12 text-center">
          <p className="mb-4 text-sm text-subtitle">The board is empty.</p>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink"><IconPlus size={14} /> Add first tile</button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {d.tiles.map(t => (
          <div key={t.id} className="flex flex-col overflow-hidden rounded-2xl bg-card">
            {t.imageUrl
              ? <img src={t.imageUrl} alt={t.title} className="h-44 w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              : <div className="flex h-44 w-full items-center justify-center bg-[rgba(21,25,13,0.04)] text-3xl">◻</div>}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <input value={t.title} onChange={e => ut(t.id, { title: e.target.value })} placeholder="Tile title…" className="flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:text-black/25" />
                <button onClick={() => rm(t.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={15} /></button>
              </div>
              <input value={t.imageUrl} onChange={e => ut(t.id, { imageUrl: e.target.value })} placeholder="Image URL…" className="w-full bg-transparent text-[12px] text-subtitle outline-none placeholder:text-black/25" />
              <input value={t.why} onChange={e => ut(t.id, { why: e.target.value })} placeholder="Why this belongs on the board…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-black/25" />
              <input value={t.tags} onChange={e => ut(t.id, { tags: e.target.value })} placeholder="tags, comma, separated" className="w-full bg-transparent text-[12px] uppercase tracking-[0.04em] text-subtitle outline-none placeholder:text-black/20" />
            </div>
          </div>
        ))}
      </div>
      {d.tiles.length > 0 && (
        <button onClick={add} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(117,117,117,0.3)] py-4 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink"><IconPlus size={14} /> Add tile</button>
      )}
      <div className="mt-6"><label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.08em] text-subtitle">Direction summary</label>
        <textarea value={d.direction} onChange={e => upd({ direction: e.target.value })} rows={3} placeholder="What this board says in two sentences." className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" /></div>
    </div>
  );
}
