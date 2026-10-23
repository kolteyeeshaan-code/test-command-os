/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Brand Mindset Mapper
 * Operational Purpose: Values → beliefs → attitudes → behaviors framework.
 */
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";

interface Item { id: string; text: string }
interface Data { values: Item[]; beliefs: Item[]; attitudes: Item[]; behaviors: Item[] }
type Q = keyof Data;
const QUADS: { key: Q; label: string; hint: string; color: string }[] = [
  { key: "values", label: "Core Values", hint: "What does the brand fundamentally stand for?", color: "bg-[rgba(52,199,89,0.15)]" },
  { key: "beliefs", label: "Beliefs", hint: "What does the brand believe about the world?", color: "bg-[rgba(0,122,255,0.1)]" },
  { key: "attitudes", label: "Attitudes", hint: "The brand's posture and point of view.", color: "bg-[rgba(255,149,0,0.12)]" },
  { key: "behaviors", label: "Behaviors", hint: "What the brand consistently does. Observable actions.", color: "bg-[rgba(175,82,222,0.12)]" },
];

export function BrandMindsetMapper({ data: raw, onChange, live }: AppProps) {
  const d: Data = {
    values: (raw as Data)?.values || [],
    beliefs: (raw as Data)?.beliefs || [],
    attitudes: (raw as Data)?.attitudes || [],
    behaviors: (raw as Data)?.behaviors || [],
  };
  const add = (q: Q) => onChange({ ...d, [q]: [...d[q], { id: generateId(), text: "" }] });
  const rm = (q: Q, id: string) => onChange({ ...d, [q]: d[q].filter(i => i.id !== id) });
  const upd = (q: Q, id: string, text: string) => onChange({ ...d, [q]: d[q].map(i => i.id === id ? { ...i, text } : i) });

  return (
    <div className="flex flex-col gap-6">
      {!live && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">The mindset behind the brand.</p>
          <p className="mt-2 text-[13px] leading-6 text-subtitle max-w-lg">Values drive beliefs, beliefs shape attitudes, attitudes produce behaviors. Build the chain from top-left down.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {QUADS.map(q => (
          <div key={q.key} className={"flex flex-col rounded-2xl p-5 " + q.color}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase tracking-[0.04em]">{q.label}</p>
              <button onClick={() => add(q.key)} className="text-ink/40 transition hover:text-ink"><IconPlus size={16} /></button>
            </div>
            <p className="mb-4 text-[12px] leading-5 text-subtitle">{q.hint}</p>
            <div className="flex flex-col gap-2">
              {d[q.key].map((item, idx) => (
                <div key={item.id} className="group flex items-start gap-2">
                  <span className="mt-2.5 text-[11px] font-bold text-ink/40 w-4 tabular-nums">{idx + 1}</span>
                  <input
                    value={item.text}
                    onChange={e => upd(q.key, item.id, e.target.value)}
                    placeholder={"Add " + q.label.toLowerCase().slice(0, -1) + "…"}
                    className="flex-1 rounded-lg border border-white/60 bg-white/80 px-3 py-2 text-[14px] outline-none focus:border-ink"
                    autoFocus={!item.text}
                  />
                  <button onClick={() => rm(q.key, item.id)} className="mt-2 text-ink/20 opacity-0 transition hover:text-red-500 group-hover:opacity-100"><IconTrash size={14} /></button>
                </div>
              ))}
              {d[q.key].length === 0 && (
                <button onClick={() => add(q.key)} className="rounded-lg border border-dashed border-black/15 py-6 text-[12px] text-subtitle transition hover:border-black/30 hover:text-ink">+ Add first entry</button>
              )}
              {d[q.key].length > 0 && (
                <button onClick={() => add(q.key)} className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-black/10 py-2 text-[11px] uppercase tracking-[0.06em] text-subtitle transition hover:border-black/30 hover:text-ink"><IconPlus size={12} /> Add</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
