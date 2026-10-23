/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Strategic Guidance Framework
 * Operational Purpose: Corporate identity + portfolio guidance (exploit / explore / transfer).
 */
import type { AppProps } from "../pages/AppSession";

interface Data {
  culture: string;
  strategicDirection: string;
  brandImage: string;
  overall: string;
  exploit: string;
  explore: string;
  transfer: string;
}

const DEFAULT: Data = {
  culture: "",
  strategicDirection: "",
  brandImage: "",
  overall: "",
  exploit: "",
  explore: "",
  transfer: "",
};

export const SG_QUESTIONS = {
  culture: "What behaviors and values define this organization at its best — and which mindset shifts must happen?",
  strategicDirection: "Where does the company choose to play, and how does it intend to win in the long term?",
  brandImage: "How must the market perceive the brand for the strategic vision to take hold and command premium trust?",
  overall: "How balanced is the portfolio between current profit generators and future growth bets?",
  exploit: "Which existing core products or units should be optimized, defended, or monetized more effectively?",
  explore: "Which new growth opportunities, business models, or markets deserve dedicated resources and testing?",
  transfer: "What core capabilities, technologies, or brand equity can be transferred from core to new ventures?",
};

export function StrategicGuidanceFramework({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (u: Partial<Data>) => onChange({ ...d, ...u });

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Strategic Guidance Framework — Paper Toolkit alignment. Establish Corporate Identity foundations before directing Portfolio choices.
        </p>
      )}

      {/* Corporate Identity */}
      <div className="mb-6 rounded-2xl bg-card p-6">
        <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.06em]">Corporate Identity</p>
        <p className="mb-4 text-[11px] text-subtitle">Foundational values, vision, and market perception</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Culture</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.culture}</p>
            <textarea value={d.culture} onChange={e => upd({ culture: e.target.value })} rows={3} placeholder="Define corporate culture & behaviors…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Strategic Direction</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.strategicDirection}</p>
            <textarea value={d.strategicDirection} onChange={e => upd({ strategicDirection: e.target.value })} rows={3} placeholder="Define long-term strategic direction…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Brand Image</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.brandImage}</p>
            <textarea value={d.brandImage} onChange={e => upd({ brandImage: e.target.value })} rows={3} placeholder="Define target brand image & perception…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>
        </div>
      </div>

      {/* Portfolio Guidance */}
      <div className="rounded-2xl bg-card p-6">
        <p className="mb-1 text-[13px] font-bold uppercase tracking-[0.06em]">Portfolio Guidance</p>
        <p className="mb-4 text-[11px] text-subtitle">Allocating focus between exploiting the core and exploring new growth</p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Overall Portfolio Strategy</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.overall}</p>
            <textarea value={d.overall} onChange={e => upd({ overall: e.target.value })} rows={3} placeholder="Portfolio vision & balance…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Exploit — Core Business Optimization</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.exploit}</p>
            <textarea value={d.exploit} onChange={e => upd({ exploit: e.target.value })} rows={3} placeholder="Actions for current core business…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Explore — Innovation & New Growth</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.explore}</p>
            <textarea value={d.explore} onChange={e => upd({ explore: e.target.value })} rows={3} placeholder="Actions for new growth bets…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-bold text-ink">Transfer — Capability & Asset Transfer</label>
            <p className="mb-2 text-[12px] italic text-subtitle">{SG_QUESTIONS.transfer}</p>
            <textarea value={d.transfer} onChange={e => upd({ transfer: e.target.value })} rows={3} placeholder="Cross-unit asset & capability sharing…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}
