/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Business Model Canvas
 * Operational Purpose: The classic 9-block canvas for mapping and designing business models.
 */
import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type TextareaHTMLAttributes } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

// ── Data shapes ──
// Each of the 9 canvas blocks holds an ordered list of items. An item has a
// primary point (the main strategic statement) and a secondary note
// (mechanism, benchmark, or context). Mirrors the MoSCoW item mechanics in
// DesignCriteriaCanvas.
export interface BmcItem { id: string; text: string; notes: string }
export type BlockKey =
  | "keyPartners" | "keyActivities" | "keyResources"
  | "valuePropositions" | "customerRelationships" | "channels"
  | "customerSegments" | "costStructure" | "revenueStreams";
export type BmcData = Record<BlockKey, BmcItem[]>;

const BLOCKS: { key: BlockKey; label: string; area: string; hint: string }[] = [
  { key: "keyPartners", label: "Key Partners", area: "kp", hint: "Who are your key partners and suppliers?" },
  { key: "keyActivities", label: "Key Activities", area: "ka", hint: "What key activities does your value proposition require?" },
  { key: "keyResources", label: "Key Resources", area: "kr", hint: "What key resources are needed?" },
  { key: "valuePropositions", label: "Value Propositions", area: "vp", hint: "What value do you deliver to customers?" },
  { key: "customerRelationships", label: "Customer Relationships", area: "cr", hint: "What type of relationship does each segment expect?" },
  { key: "channels", label: "Channels", area: "ch", hint: "How do you reach and serve customers?" },
  { key: "customerSegments", label: "Customer Segments", area: "cs", hint: "For whom are you creating value?" },
  { key: "costStructure", label: "Cost Structure", area: "co", hint: "What are the most important costs?" },
  { key: "revenueStreams", label: "Revenue Streams", area: "rv", hint: "For what value are customers willing to pay?" },
];

const BLOCK_KEYS = BLOCKS.map(b => b.key);
const NOTES_HINT = "Mechanism, benchmark or context";

// ── Defensive parsing ──
// Sessions saved before this refactor store each block as one flat string.
// Anything stored may be a legacy string, an array of items, an array of bare
// strings, a missing key, or garbage. Every shape is coerced into BmcItem[] so
// the state and UI never see anything else.

/** Coerce one stored block value into a well-formed item list. */
function normaliseBlock(key: BlockKey, value: unknown): BmcItem[] {
  // Legacy flat string: one item per non-empty line. Ids are deterministic so
  // re-parsing on every render keeps React keys (and input focus) stable.
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .map((text, i) => ({ id: `legacy-${key}-${i}`, text, notes: "" }));
  }
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry: unknown, i): BmcItem[] => {
    // Bare strings inside an array: treat as primary text.
    if (typeof entry === "string") {
      const text = entry.trim();
      return text ? [{ id: `${key}-str-${i}`, text, notes: "" }] : [];
    }
    if (entry && typeof entry === "object") {
      const o = entry as Record<string, unknown>;
      // Empty items are kept on purpose: a freshly added item is blank until typed in.
      return [{
        id: typeof o.id === "string" && o.id ? o.id : `${key}-obj-${i}`,
        text: typeof o.text === "string" ? o.text : "",
        notes: typeof o.notes === "string" ? o.notes : "",
      }];
    }
    return [];
  });
}

/** Top-level parse: any stored value in, a complete BmcData out. */
export function parseBmc(raw: unknown): BmcData {
  const src: Record<string, unknown> = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
  const out = {} as BmcData;
  for (const key of BLOCK_KEYS) out[key] = normaliseBlock(key, src[key]);
  return out;
}

/** Auto-growing textarea styled as a bare input, so long strategic points wrap instead of truncating. */
function AutoField({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      {...props}
      className={cn("block w-full resize-none overflow-hidden bg-transparent outline-none", className)}
    />
  );
}

export function BusinessModelCanvas({ data: raw, onChange, live }: AppProps) {
  // Defensive parse at the top: legacy or malformed data becomes the array format here.
  const d = useMemo(() => parseBmc(raw), [raw]);
  // Id of the item most recently added, so only that one takes focus.
  const [freshId, setFreshId] = useState<string | null>(null);

  const addItem = (key: BlockKey) => {
    const id = generateId();
    setFreshId(id);
    onChange({ ...d, [key]: [...d[key], { id, text: "", notes: "" }] });
  };
  const updItem = (key: BlockKey, id: string, u: Partial<Omit<BmcItem, "id">>) =>
    onChange({ ...d, [key]: d[key].map(i => (i.id === id ? { ...i, ...u } : i)) });
  const rmItem = (key: BlockKey, id: string) =>
    onChange({ ...d, [key]: d[key].filter(i => i.id !== id) });

  // Enter in the primary field jumps to its notes field instead of inserting a line break.
  const onPrimaryKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      {!live && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">The 9-block canvas.</p>
          <p className="mt-2 text-[13px] leading-6 text-subtitle max-w-lg">Map the business model at a glance. Right side is customer-facing, left side is operations, bottom is the money.</p>
        </div>
      )}

      <div className={cn("bmc-grid", live ? "min-h-[70vh]" : "min-h-[560px]")}>
        {BLOCKS.map(b => {
          const items = d[b.key];
          return (
            <div key={b.key} className="flex flex-col rounded-xl bg-card p-4 transition hover:bg-[#ededed]" style={{ gridArea: b.area }}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">{b.label}</p>
                <button
                  type="button"
                  onClick={() => addItem(b.key)}
                  aria-label={`Add item to ${b.label}`}
                  title="Add item"
                  className="touch-hit shrink-0 rounded text-ink/40 transition hover:text-ink"
                >
                  <IconPlus size={14} />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-2">
                {items.map(it => (
                  <div key={it.id} className="group relative rounded-lg bg-white p-2.5 shadow-[0_0_0_1px_rgba(21,25,13,0.04)]">
                    <AutoField
                      value={it.text}
                      onChange={e => updItem(b.key, it.id, { text: e.target.value })}
                      onKeyDown={onPrimaryKey}
                      placeholder={b.hint}
                      aria-label={`${b.label} point`}
                      autoFocus={it.id === freshId}
                      className="pr-6 text-[13px] font-medium leading-5 placeholder:font-normal placeholder:text-black/25"
                    />
                    <AutoField
                      value={it.notes}
                      onChange={e => updItem(b.key, it.id, { notes: e.target.value })}
                      placeholder={NOTES_HINT}
                      aria-label={`${b.label} notes`}
                      className="mt-1 text-[12px] leading-5 text-subtitle placeholder:text-black/25"
                    />
                    <button
                      type="button"
                      onClick={() => rmItem(b.key, it.id)}
                      aria-label="Delete item"
                      title="Delete item"
                      className="absolute right-1.5 top-1.5 rounded p-1 text-ink/25 opacity-0 transition hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))}

                {items.length === 0 && (
                  <button
                    type="button"
                    onClick={() => addItem(b.key)}
                    className="flex w-full flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/20 py-4 text-[12px] font-medium text-subtitle transition hover:border-ink/40 hover:text-ink"
                  >
                    <IconPlus size={12} /> Add item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
