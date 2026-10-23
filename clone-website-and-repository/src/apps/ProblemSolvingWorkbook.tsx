/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Design Consultancy for Innovation & Experience [Innovation]
 * Domain Key        : innovation_design
 * Official Title    : Problem Solving Workbook
 * Operational Purpose: Eight steps from define to communicate, with literal and lateral structuring.
 */
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

interface Step { key: string; label: string; hint: string }

/** 8-step flow with step 2 split into literal (2.A) and lateral/alchemical (2.B). */
export const PS_STEPS: Step[] = [
  { key: "define", label: "1. Define the Problem", hint: "State the problem precisely — what is actually broken, for whom, and why it matters now." },
  { key: "structureLiteral", label: "2.A Structure the Problem — Literally", hint: "Break the problem down logically: issue tree, hypotheses, measurable components." },
  { key: "structureLateral", label: "2.B Structure the Problem — Laterally / Alchemically", hint: "Reframe it. What is this problem when inverted, combined, exaggerated, or seen from another discipline?" },
  { key: "issues", label: "3. Identify Key Issues", hint: "Which sub-questions must be answered to resolve the problem?" },
  { key: "plan", label: "4. Plan the Analyses", hint: "What analysis would prove or disprove each hypothesis? Prioritise by impact." },
  { key: "analyses", label: "5. Perform the Analyses", hint: "Do the work. Record what the evidence actually shows." },
  { key: "summarize", label: "6. Synthesize Findings", hint: "So what? Pull the evidence into a single coherent answer." },
  { key: "recommendations", label: "7. Develop Recommendations", hint: "What should be done, by whom, and with what trade-offs?" },
  { key: "communicate", label: "8. Communicate the Story", hint: "How will this be told so the audience acts on it?" },
];

const STATUSES = ["Not started", "In progress", "Done"] as const;
type Status = typeof STATUSES[number];

interface Data { steps: Record<string, { status: Status; notes: string }> }

export function ProblemSolvingWorkbook({ data: raw, onChange, live }: AppProps) {
  const d: Data = { steps: {}, ...(raw as Partial<Data>) };
  const get = (k: string) => d.steps?.[k] ?? { status: "Not started" as Status, notes: "" };
  const set = (k: string, u: Partial<{ status: Status; notes: string }>) =>
    onChange({ steps: { ...d.steps, [k]: { ...get(k), ...u } } });

  const doneCount = PS_STEPS.filter(s => get(s.key).status === "Done").length;

  return (
    <div className="mx-auto max-w-[880px]">
      {!live && (
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Problem Solving Workbook</p>
          <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
            Work the steps in order. Step 2 is deliberately split: structure it literally first, then reframe it laterally.
          </p>
        </div>
      )}

      <div className="mb-6 flex items-end justify-between gap-4">
        <p className="text-[20px] font-normal tracking-[-0.03em]">Steps</p>
        <div className="text-right">
          <span className="block text-[28px] font-normal tracking-[-0.04em] tabular-nums">{doneCount}/{PS_STEPS.length}</span>
          <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">done</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {PS_STEPS.map(step => {
          const v = get(step.key);
          return (
            <div key={step.key} className={cn("rounded-2xl bg-card p-5", v.status === "Done" && "opacity-75")}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14px] font-bold tracking-[-0.01em]">{step.label}</p>
                <select value={v.status} onChange={e => set(step.key, { status: e.target.value as Status })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.04em] outline-none",
                    v.status === "Done" ? "border-transparent bg-[rgba(52,199,89,0.3)]"
                    : v.status === "In progress" ? "border-transparent bg-[rgba(255,149,0,0.3)]"
                    : "border-[rgba(117,117,117,0.2)]"
                  )}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <p className="mb-3 text-[12px] leading-5 text-subtitle">{step.hint}</p>
              <textarea value={v.notes} onChange={e => set(step.key, { notes: e.target.value })} rows={3}
                placeholder="Working notes for this step…"
                className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
