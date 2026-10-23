/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Creative Brief Builder
 * Operational Purpose: Build comprehensive briefs: audience, message, tone, deliverables, metrics.
 */
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

export interface Data {
  deliverable: string;
  projectName: string;
  client: string;
  date: string;
  background: string;
  objective: string;
  audience: string;
  keyMessage: string;
  tone: string;
  deliverables: string;
  timeline: string;
  budget: string;
  constraints: string;
  successMetrics: string;
}

const DEFAULT: Data = {
  deliverable: "",
  projectName: "",
  client: "",
  date: "",
  background: "",
  objective: "",
  audience: "",
  keyMessage: "",
  tone: "",
  deliverables: "",
  timeline: "",
  budget: "",
  constraints: "",
  successMetrics: "",
};

const SECTIONS: { title: string; fields: { key: keyof Data; label: string; type: "text" | "area"; hint?: string }[] }[] = [
  {
    title: "The Basics",
    fields: [
      { key: "deliverable", label: "Deliverable in Question", type: "text", hint: "e.g. Master Packaging System / Brand Strategy Deck" },
      { key: "projectName", label: "Project Name", type: "text" },
      { key: "client", label: "Client", type: "text" },
      { key: "date", label: "Date", type: "text", hint: "YYYY-MM-DD" },
    ],
  },
  {
    title: "The Situation",
    fields: [
      { key: "background", label: "Background & Context", type: "area", hint: "What's the situation? Why is this project happening now?" },
      { key: "objective", label: "Objective", type: "area", hint: "What must this project achieve?" },
    ],
  },
  {
    title: "The Audience",
    fields: [
      { key: "audience", label: "Target Audience", type: "area", hint: "Who are we speaking to? Demographics, psychographics, behaviors." },
      { key: "keyMessage", label: "Key Message", type: "area", hint: "If the audience remembers one thing, what should it be?" },
      { key: "tone", label: "Tone & Voice", type: "area", hint: "How should this feel? What words describe the desired tone?" },
    ],
  },
  {
    title: "The Work",
    fields: [
      { key: "deliverables", label: "Scope & Sub-Deliverables", type: "area", hint: "List all expected outputs (one per line)." },
      { key: "timeline", label: "Timeline", type: "text", hint: "Key milestones and final deadline" },
      { key: "budget", label: "Budget Range", type: "text" },
      { key: "constraints", label: "Constraints & Requirements", type: "area", hint: "Technical, legal, brand, or other constraints." },
      { key: "successMetrics", label: "Success Metrics", type: "area", hint: "How will we know this project succeeded?" },
    ],
  },
];

export function CreativeBriefBuilder({ data: raw, onChange, live }: AppProps) {
  const d: Data = { ...DEFAULT, ...(raw as Partial<Data>) };
  const upd = (key: keyof Data, val: string) => onChange({ ...d, [key]: val });

  return (
    <div className="mx-auto max-w-[820px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">A clear brief prevents ten bad rounds.</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">Fill in what you know. Scope the brief to the deliverable in question.</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {SECTIONS.map(section => (
          <div key={section.title} className="rounded-2xl bg-card p-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{section.title}</p>
            <div className="flex flex-col gap-4">
              {section.fields.map(f => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">{f.label}</label>
                  {f.type === "text" ? (
                    <input
                      value={d[f.key]}
                      onChange={e => upd(f.key, e.target.value)}
                      placeholder={f.hint}
                      className={cn(
                        "w-full rounded-lg border bg-white px-3 py-2 text-[14px] outline-none focus:border-ink",
                        f.key === "deliverable" && !d.deliverable.trim() ? "border-[rgba(255,149,0,0.5)]" : "border-[rgba(117,117,117,0.15)]"
                      )}
                    />
                  ) : (
                    <textarea
                      value={d[f.key]}
                      onChange={e => upd(f.key, e.target.value)}
                      placeholder={f.hint}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[14px] leading-6 outline-none focus:border-ink"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
