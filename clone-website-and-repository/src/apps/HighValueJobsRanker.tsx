/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : High-Value Jobs Ranker
 * Operational Purpose: Rank jobs-to-be-done by importance and satisfaction to find opportunities.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { EmptyState } from "../ui";
import { cn } from "../utils/cn";

export interface Job {
  id: string;
  description: string;
  category: string;
  important: number;   // 1–4
  tangible: number;    // 1–4
  unsatisfied: number; // 1–4
  lucrative: number;   // 1–4
}

interface Data { jobs: Job[] }
const CATS = ["Functional", "Emotional", "Social"];

export function hvScore(j: Job) {
  const imp = j.important ?? 3;
  const tan = j.tangible ?? 3;
  const uns = j.unsatisfied ?? 3;
  const luc = j.lucrative ?? 3;
  return imp + tan + uns + luc;
}

export function hvRankLabel(score: number): { label: string; tone: "green" | "orange" | "gray" } {
  if (score >= 13) return { label: "High Value", tone: "green" };
  if (score >= 10) return { label: "Moderate", tone: "orange" };
  return { label: "Low Value", tone: "gray" };
}

export function HighValueJobsRanker({ data: raw, onChange, live }: AppProps) {
  const d = (raw as Data)?.jobs ? (raw as Data) : { jobs: [] };

  // Defensive normalisation (the store also migrates legacy importance/satisfaction rows via db/appData).
  const clamp4 = (n: number) => Math.min(4, Math.max(1, Math.round(n)));
  const normalizedJobs: Job[] = d.jobs.map(j => {
    const legacy = j as Job & { importance?: number; satisfaction?: number };
    return {
      id: j.id || generateId(),
      description: j.description || "",
      category: j.category || "Functional",
      important: typeof j.important === "number" ? j.important : typeof legacy.importance === "number" ? clamp4(legacy.importance / 2.5) : 3,
      tangible: typeof j.tangible === "number" ? j.tangible : 3,
      unsatisfied: typeof j.unsatisfied === "number" ? j.unsatisfied : typeof legacy.satisfaction === "number" ? clamp4((11 - legacy.satisfaction) / 2.5) : 3,
      lucrative: typeof j.lucrative === "number" ? j.lucrative : 3,
    };
  });

  const sorted = [...normalizedJobs].sort((a, b) => hvScore(b) - hvScore(a));

  const add = () => {
    const newJob: Job = { id: generateId(), description: "", category: "Functional", important: 3, tangible: 3, unsatisfied: 3, lucrative: 3 };
    onChange({ jobs: [...normalizedJobs, newJob] });
  };

  const rm = (id: string) => onChange({ jobs: normalizedJobs.filter(j => j.id !== id) });
  const upd = (id: string, u: Partial<Job>) => onChange({ jobs: normalizedJobs.map(j => j.id === id ? { ...j, ...u } : j) });

  return (
    <div className="flex flex-col gap-6">
      {!live && (
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">Identify High-Value Customer Jobs.</p>
            <p className="mt-2 max-w-lg text-[13px] leading-6 text-subtitle">
              Rank jobs across 4 paper-matrix criteria: <strong>Important</strong> (critical goal), <strong>Tangible</strong> (clearly felt outcome), <strong>Unsatisfied</strong> (poor current options), and <strong>Lucrative</strong> (high willingness to pay).
            </p>
          </div>
          <button onClick={add} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
            <IconPlus size={14} /> Add Job
          </button>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="rounded-2xl bg-card">
          <EmptyState
            icon="⚡"
            title="No jobs ranked yet"
            hint="Add each job-to-be-done and score the 4 dimensions (1=Low, 2=Medium, 3=High, 4=Very High)."
            action={
              <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
                <IconPlus size={14} /> Add first job
              </button>
            }
          />
        </div>
      )}

      {sorted.length > 0 && (
        <div className="overflow-x-auto rounded-2xl bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(120,120,128,0.16)]">
                <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Rank</th>
                <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Job Description</th>
                <th className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Type</th>
                <th className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Important</th>
                <th className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Tangible</th>
                <th className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Unsatisfied</th>
                <th className="px-3 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Lucrative</th>
                <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">High-Value Score</th>
                <th className="px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((j, i) => {
                const score = hvScore(j);
                const rankInfo = hvRankLabel(score);
                return (
                  <tr key={j.id} className="border-b border-[rgba(120,120,128,0.08)] last:border-0 hover:bg-white/60">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                    </td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <input value={j.description} onChange={v => upd(j.id, { description: v.target.value })} placeholder="Describe the job…" className="w-full bg-transparent text-[14px] outline-none" />
                    </td>
                    <td className="px-3 py-3">
                      <select value={j.category} onChange={v => upd(j.id, { category: v.target.value })} className="rounded bg-transparent px-1 py-0.5 text-xs outline-none hover:bg-white">
                        {CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select value={j.important} onChange={e => upd(j.id, { important: +e.target.value })} className="rounded border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1 text-xs font-semibold outline-none">
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Med</option>
                        <option value={3}>3 - High</option>
                        <option value={4}>4 - V.High</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select value={j.tangible} onChange={e => upd(j.id, { tangible: +e.target.value })} className="rounded border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1 text-xs font-semibold outline-none">
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Med</option>
                        <option value={3}>3 - High</option>
                        <option value={4}>4 - V.High</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select value={j.unsatisfied} onChange={e => upd(j.id, { unsatisfied: +e.target.value })} className="rounded border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1 text-xs font-semibold outline-none">
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Med</option>
                        <option value={3}>3 - High</option>
                        <option value={4}>4 - V.High</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select value={j.lucrative} onChange={e => upd(j.id, { lucrative: +e.target.value })} className="rounded border border-[rgba(117,117,117,0.15)] bg-white px-2 py-1 text-xs font-semibold outline-none">
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Med</option>
                        <option value={3}>3 - High</option>
                        <option value={4}>4 - V.High</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums text-[13px]">{score}/16</span>
                        <span className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]",
                          rankInfo.tone === "green" ? "bg-[rgba(52,199,89,0.3)] text-black" : rankInfo.tone === "orange" ? "bg-[rgba(255,149,0,0.3)] text-black" : "bg-card text-subtitle"
                        )}>{rankInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><button onClick={() => rm(j.id)} className="text-ink/20 hover:text-red-500"><IconTrash size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-[rgba(120,120,128,0.1)] p-3">
            <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(117,117,117,0.3)] py-3 text-[12px] font-medium uppercase tracking-[0.06em] text-subtitle transition hover:border-ink hover:text-ink">
              <IconPlus size={14} /> Add job
            </button>
          </div>
        </div>
      )}

      {sorted.length > 0 && <p className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Matrix: High-Value Job Score = Important + Tangible + Unsatisfied + Lucrative (Max 16)</p>}
    </div>
  );
}
