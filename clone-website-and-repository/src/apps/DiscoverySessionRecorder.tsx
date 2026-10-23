/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Discovery Session Recorder
 * Operational Purpose: Capture structured insights, quotes, opportunities, risks, and actions.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

export interface QuestionDef { id: number; text: string }
export interface QuestionSectionDef { id: string; title: string; questions: QuestionDef[] }

export const DISCOVERY_SECTIONS: QuestionSectionDef[] = [
  {
    id: "company",
    title: "Company",
    questions: [
      { id: 1, text: "Why does your company exist? Apart from money? Your reason behind starting this business?" },
      { id: 2, text: "What is your business's brand name? And how did you come up with the name? How long has your company been established?" },
      { id: 3, text: "What is your company worth to you?" },
      { id: 4, text: "What do we value most?" },
      { id: 5, text: "What do we do and how do we do it? Who are we here for? (rule of 3 for each offering)" },
      { id: 6, text: "What are the basics of your industry?" },
      { id: 7, text: "What are your products? Are sales increasing or decreasing? Sales + / - : %" },
      { id: 8, text: "What are your services? Are sales increasing or decreasing? Sales + / - : %" },
      { id: 9, text: "What are some big trends in your industry?" },
      { id: 10, text: "Where do you sell / sales channels? (e.g. In-person, Resell, eComm, etc.)" },
      { id: 11, text: "What FUNCTIONAL benefits do you offer your customers?" },
      { id: 12, text: "What EMOTIONAL benefits do you offer?" },
      { id: 13, text: "How do people learn about your product or service?" },
      { id: 14, text: "What are your organisation’s goals for the year?" },
    ],
  },
  {
    id: "challenges",
    title: "Challenges",
    questions: [
      { id: 15, text: "What are the biggest challenges for you (personal & professional) in your industry?" },
      { id: 16, text: "What’s the biggest challenge for your customers in your industry?" },
      { id: 17, text: "What are the challenges within your business?" },
      { id: 18, text: "What are the biggest problems you’re experiencing right now?" },
      { id: 19, text: "Why hasn’t it been addressed before? Or did you address this but got stuck somewhere along the way?" },
      { id: 20, text: "What have you done so far? What has worked? What hasn’t?" },
      { id: 21, text: "What’s the problem/challenge you’re looking to solve, right now? (Priority 1)" },
      { id: 22, text: "Why is it a priority today?" },
      { id: 23, text: "Are you having problems in [area as relates to the product]? What’s the source of that problem?" },
    ],
  },
  {
    id: "goals",
    title: "Goals",
    questions: [
      { id: 24, text: "What are your aspirations, goals & ambitions for the coming years? Where do you want to be? Where are you now?" },
      { id: 25, text: "Tell me about some of your specific/narrowed-down goals (financial, customer-related, operational)" },
      { id: 26, text: "When do you need to achieve these goals? (Timeline)" },
      { id: 27, text: "How do you plan to reach these goals? What’s standing in the way?" },
      { id: 28, text: "What do you want to change about your company?" },
      { id: 29, text: "What impact do you wish to leave on your industry?" },
    ],
  },
  {
    id: "stakeholders",
    title: "Stakeholders / Customers / Competitors / Team",
    questions: [
      { id: 30, text: "Who are you interacting with? School, family, life...?" },
      { id: 31, text: "Are there any other stakeholders? What are their roles?" },
      { id: 32, text: "What are the needs of the marketplace?" },
      { id: 33, text: "What makes us relevant?" },
      { id: 34, text: "Who exactly is your dream customer? (i.e. their age, gender, interests, style)" },
      { id: 35, text: "What is the target audience's age group?" },
      { id: 36, text: "Once again, for further clarity, Who is your target market/demographic?" },
      { id: 37, text: "What motivates them?" },
      { id: 38, text: "What are their common pain points?" },
      { id: 39, text: "What pain points do you solve for your customers? What are you helping them with?" },
      { id: 40, text: 'So would you say that you are in the business of doing/selling "X" or in the business of facilitating "Y" (Effect/Result/Benefit/Experience)' },
      { id: 41, text: "Why do your customers come to you instead of your competitors?" },
      { id: 42, text: "How exactly do your customers like to be spoken to?" },
      { id: 43, text: "How exactly do you intend to interact with customers?" },
      { id: 44, text: "How do you want to make your clients feel?" },
      { id: 45, text: "What emotion do you want them to have with your end result?" },
      { id: 46, text: "How could this emotion impact their lives? What’s the biggest impact?" },
      { id: 47, text: "What are their other choices? Why should they choose you?" },
      { id: 48, text: "If your customers had to describe your company in one word, what would it be and why?" },
      { id: 49, text: "Is there a higher purpose for your offerings?" },
      { id: 50, text: "Do you have a greater mission or vision?" },
      { id: 51, text: "Is there a global cause that your brand will uniquely be able to fulfill?" },
      { id: 52, text: "What do you consider your brand’s core values? e.g. what do you care about, what makes you different, how do you give back?" },
      { id: 53, text: "Who are you? What is your role? How long have you been there?" },
      { id: 54, text: "How long has the company been around? What’s its story?" },
      { id: 55, text: "How big is your team? What does it look like?" },
      { id: 56, text: "Any other stakeholders or decision-makers? What will their input look like?" },
      { id: 57, text: "How have you worked with vendors/studios in the past?" },
      { id: 58, text: "What’s your competition doing that’s keeping you up at night?" },
      { id: 59, text: "Who are your competitors and how do they position themselves?" },
      { id: 60, text: "What are your competitors’ advantages over you?" },
      { id: 61, text: "What makes us unique?" },
      { id: 62, text: "How do you differ from your competitors?" },
      { id: 63, text: "What can you apply from brands you admire from other industries?" },
      { id: 64, text: "What can we do better than our competitors?" },
      { id: 65, text: "What can we do that's very different to our competition?" },
      { id: 66, text: "What are your advantages over your competitors?" },
      { id: 67, text: "What do you consider your USP?" },
      { id: 68, text: "Who are your indirect competitors? e.g. in the same audience, with a different product?" },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    questions: [
      { id: 69, text: "Do you have an established visual & sensory brand identity system? & supplementary systems — e.g. Art direction? Photography?" },
      { id: 70, text: "Are you happy with this or do you wish to update it all or in parts & if in part, which parts?" },
      { id: 71, text: "What's wrong with your existing brand systems?" },
      { id: 72, text: "What are you trying to communicate?" },
      { id: 73, text: "What is the overall message you wish to portray with your brand?" },
      { id: 74, text: "What's the story behind your brand that you wish to share?" },
      { id: 75, text: "What are the primary places where your brand will be seen?" },
      { id: 76, text: "What are 5 words that describe our brand essence?" },
      { id: 77, text: "What makes us different? (Repurpose & expand, but not in detail, answers from uniqueness/competition)" },
      { id: 78, text: "What kind of personality does your brand have? (Fun, simple, professional, modern, gender-neutral)" },
      { id: 79, text: "As a brand, are you more of a MOTHER (caring, generous), FRIEND (straightforward and sociable) or LEADER (assertive, in control)?" },
      { id: 80, text: "Which of these words is a better fit for your brand? Traditional or modern?" },
      { id: 81, text: "Which of these words is a better fit for your brand? Friendly or corporate?" },
      { id: 82, text: "Which of these words is a better fit for your brand? High end or cost-effective?" },
      { id: 83, text: "Which of these words is a better fit for your brand? Consumer or Trade?" },
      { id: 84, text: "Why does your current branding use those colors, fonts, etc.?" },
      { id: 85, text: "How can you simplify your brand so it can be easily understood?" },
      { id: 86, text: "What should people feel when they see or think of your brand?" },
      { id: 87, text: "If you were writing an obituary for your brand, what would you want to hear about its accomplishments, legacy and outstanding character traits?" },
      { id: 88, text: "How will you test your brand's perception in the real world? How can I help make this easy? (Follow-up: How will an X (any of my services) solve that or make your life better?)" },
    ],
  },
  {
    id: "project_followup",
    title: "Project Follow-up",
    questions: [
      { id: 89, text: "If you implement this solution, how do you hope things are different in one year?" },
      { id: 90, text: "How did your last design experience go?" },
      { id: 91, text: "How would you measure success for this project?" },
      { id: 92, text: "If time and money were not an object, what would the perfect solution be?" },
    ],
  },
];

export const TOTAL_QUESTIONS = 92;

interface Note { id: string; text: string }
interface Data {
  date: string;
  attendees: string;
  focus: string;
  insights: Note[];
  quotes: Note[];
  opportunities: Note[];
  risks: Note[];
  nextActions: Note[];
  /** answers[questionId] = answer text */
  answers?: Record<string, string>;
}

const KEYS: (keyof Data)[] = ["insights", "quotes", "opportunities", "risks", "nextActions"];
const LABELS: Record<string, string> = { insights: "Key Insights", quotes: "Notable Quotes", opportunities: "Opportunities", risks: "Risks", nextActions: "Next Actions" };

export function DiscoverySessionRecorder({ data: raw, onChange, live }: AppProps) {
  const d: Data = {
    date: "",
    attendees: "",
    focus: "",
    insights: [],
    quotes: [],
    opportunities: [],
    risks: [],
    nextActions: [],
    answers: {},
    ...(raw as Partial<Data>),
  };

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    company: true,
  });

  const toggleSection = (id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });
  const add = (k: keyof Data) => upd({ [k]: [...(d[k] as Note[]), { id: generateId(), text: "" }] });
  const rm = (k: keyof Data, id: string) => upd({ [k]: (d[k] as Note[]).filter(n => n.id !== id) });
  const updNote = (k: keyof Data, id: string, text: string) => upd({ [k]: (d[k] as Note[]).map(n => n.id === id ? { ...n, text } : n) });

  const setAnswer = (qid: number, text: string) => {
    upd({ answers: { ...d.answers, [String(qid)]: text } });
  };

  const answeredCount = Object.values(d.answers || {}).filter(a => a && a.trim().length > 0).length;

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Discovery Session &amp; Questionnaire</p>
            <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
              Capture free-form session observations above, or walk through the 92 discovery questions grouped by section below.
            </p>
          </div>
          <div className="text-right">
            <span className="block text-[28px] font-normal tracking-[-0.04em] tabular-nums">{answeredCount}/{TOTAL_QUESTIONS}</span>
            <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">questions answered</span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Date</label>
          <input type="date" value={d.date} onChange={e => upd({ date: e.target.value })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Attendees</label>
          <input value={d.attendees} onChange={e => upd({ attendees: e.target.value })} placeholder="e.g. CEO, CMO, Lead Designer" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Focus</label>
          <input value={d.focus} onChange={e => upd({ focus: e.target.value })} placeholder="e.g. Brand Refresh Discovery" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
        </div>
      </div>

      {/* Free-form buckets */}
      <div className="mb-8 flex flex-col gap-4">
        <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-subtitle">Session Takeaways &amp; Buckets</p>
        {KEYS.map(k => (
          <div key={k} className="rounded-2xl bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase tracking-[0.06em]">{LABELS[k]}</p>
              <button onClick={() => add(k)} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
                <IconPlus size={12} /> Add
              </button>
            </div>
            {(d[k] as Note[]).length === 0 && <p className="text-sm text-subtitle">Nothing added yet.</p>}
            {(d[k] as Note[]).map(n => (
              <div key={n.id} className="mb-2 flex gap-2">
                <input value={n.text} onChange={e => updNote(k, n.id, e.target.value)} placeholder="Enter note…" className="flex-1 rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                <button onClick={() => rm(k, n.id)} className="text-ink/30 hover:text-red-500"><IconTrash size={16} /></button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 92-Question Structured Questionnaire */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold uppercase tracking-[0.04em]">Discovery Questionnaire (92 Prompts)</p>
          <button
            type="button"
            onClick={() => {
              const allOpen = DISCOVERY_SECTIONS.every(s => openSections[s.id]);
              const next: Record<string, boolean> = {};
              DISCOVERY_SECTIONS.forEach(s => { next[s.id] = !allOpen; });
              setOpenSections(next);
            }}
            className="text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle hover:text-ink underline"
          >
            {DISCOVERY_SECTIONS.every(s => openSections[s.id]) ? "Collapse All" : "Expand All"}
          </button>
        </div>

        {DISCOVERY_SECTIONS.map(sec => {
          const isOpen = !!openSections[sec.id];
          const secAnswered = sec.questions.filter(q => (d.answers?.[String(q.id)] || "").trim().length > 0).length;

          return (
            <div key={sec.id} className="rounded-2xl border border-[rgba(117,117,117,0.18)] bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className="flex w-full items-center justify-between p-5 text-left transition hover:bg-black/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[16px] font-bold tracking-[-0.01em]">{sec.title}</span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 font-[family-name:var(--font-roboto)] text-[11px] font-semibold text-subtitle border border-[rgba(117,117,117,0.2)]">
                    {secAnswered} / {sec.questions.length} answered
                  </span>
                </div>
                <span className="text-sm font-bold text-subtitle">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="flex flex-col gap-4 border-t border-dashed border-[rgba(120,120,128,0.16)] p-5 bg-card">
                  {sec.questions.map(q => {
                    const ans = d.answers?.[String(q.id)] || "";
                    return (
                      <div key={q.id} className="rounded-xl bg-white p-4">
                        <label className="mb-2 block text-[13px] font-semibold leading-snug text-ink">
                          <span className="mr-2 inline-flex h-5 min-w-[24px] items-center justify-center rounded bg-ink px-1.5 text-[11px] font-bold text-white tabular-nums">{q.id}</span>
                          {q.text}
                        </label>
                        <textarea
                          value={ans}
                          onChange={e => setAnswer(q.id, e.target.value)}
                          placeholder="Client answer / notes…"
                          rows={2}
                          className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
