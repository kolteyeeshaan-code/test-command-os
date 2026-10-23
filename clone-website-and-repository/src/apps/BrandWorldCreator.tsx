/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Experience Design [Experience]
 * Domain Key        : brand_experience
 * Official Title    : Brand World Creator
 * Operational Purpose: Cast, culture, rules, and participation vectors for a living brand world.
 */
import { useState } from "react";
import { generateId } from "../data";
import { IconPlus, IconTrash } from "../icons";
import type { AppProps } from "../pages/AppSession";
import { cn } from "../utils/cn";

export type BrandWorldCharacterRole = "Primary persona" | "Side character" | "Brand mascot";
export type BrandWorldVectorKey = "wear" | "visit" | "collect" | "attend" | "content";
export type BrandWorldVectorStatus = "missing" | "planned" | "live" | "strong";
export type BrandWorldCheck = "yes" | "no" | "unsure";
export type BrandWorldChapterVariable = "person" | "product" | "routine" | "storyline";

export interface BrandWorldCharacter { id: string; name: string; role: BrandWorldCharacterRole; description: string }
export interface BrandWorldItem { id: string; text: string }
export interface BrandWorldVector { status: BrandWorldVectorStatus; evidence: string }
export interface BrandWorldChapter {
  id: string;
  title: string;
  newVariable: string;
  variableKind: BrandWorldChapterVariable;
  familiarAnchors: string;
  storyline: string;
  success: string;
}

export interface BrandWorldData {
  worldName: string;
  worldTagline: string;
  characters: BrandWorldCharacter[];
  places: BrandWorldItem[];
  objects: BrandWorldItem[];
  context: string;
  lexicon: BrandWorldItem[];
  rituals: BrandWorldItem[];
  humor: BrandWorldItem[];
  alwaysRules: string[];
  neverRules: string[];
  evaluation: {
    idea: string;
    ideaKind: string;
    answers: Record<string, BrandWorldCheck>;
    notes: string;
  };
  vectors: Record<BrandWorldVectorKey, BrandWorldVector>;
  chapters: BrandWorldChapter[];
  presetId: string | null;
}

export const BRAND_WORLD_CHARACTER_ROLES: BrandWorldCharacterRole[] = ["Primary persona", "Side character", "Brand mascot"];

export const BRAND_WORLD_VECTORS: { key: BrandWorldVectorKey; label: string; prompt: string }[] = [
  { key: "wear", label: "Wear it", prompt: "Apparel, physical merchandise, or wearable artifacts." },
  { key: "visit", label: "Visit it", prompt: "Retail spaces, pop-ups, hospitality, or digital environments." },
  { key: "collect", label: "Collect something", prompt: "Limited drops, physical souvenirs, or badges." },
  { key: "attend", label: "Attend something", prompt: "Events, meetups, activations, or shared routines." },
  { key: "content", label: "Make recognizable content", prompt: "Replicable templates, meme formats, or user routines." },
];

export const BRAND_WORLD_VECTOR_STATUSES: { value: BrandWorldVectorStatus; label: string }[] = [
  { value: "missing", label: "Missing" },
  { value: "planned", label: "Planned" },
  { value: "live", label: "Live" },
  { value: "strong", label: "Signature" },
];

const RULE_COUNT = 5;

const STEPS = [
  { id: 0, short: "1 · Cast", title: "Cast the World" },
  { id: 1, short: "2 · Culture", title: "Give the World Its Culture" },
  { id: 2, short: "3 · Rules", title: "Write the Rules of the Universe" },
  { id: 3, short: "4 · Participate", title: "Participation Audit & Campaign Chapters" },
] as const;

function items(prefix: string, texts: string[]): BrandWorldItem[] {
  return texts.map((text, i) => ({ id: `${prefix}-${i + 1}`, text }));
}

function characters(list: { id: string; name: string; role: BrandWorldCharacterRole; description: string }[]): BrandWorldCharacter[] {
  return list.map(c => ({ ...c }));
}

function fixedRules(values: string[]): string[] {
  return Array.from({ length: RULE_COUNT }, (_, i) => values[i] ?? "");
}

function remapIds(data: BrandWorldData): BrandWorldData {
  const remapItems = (list: BrandWorldItem[]) => list.map(item => ({ ...item, id: generateId() }));
  return {
    ...data,
    characters: data.characters.map(c => ({ ...c, id: generateId() })),
    places: remapItems(data.places),
    objects: remapItems(data.objects),
    lexicon: remapItems(data.lexicon),
    rituals: remapItems(data.rituals),
    humor: remapItems(data.humor),
    chapters: data.chapters.map(c => ({ ...c, id: generateId() })),
  };
}

function sunbleachPreset(): BrandWorldData {
  return {
    worldName: "Sunbleach Club",
    worldTagline: "SPF for the pleasantly unbothered.",
    characters: characters([
      { id: "sun-character-1", name: "Marisol Vega", role: "Primary persona", description: "34-year-old graphic designer who plans Saturdays around parking, shade, and salt water." },
      { id: "sun-character-2", name: "Dockside Dave", role: "Side character", description: "Snack-stand philosopher who knows every regular by sunscreen scent." },
      { id: "sun-character-3", name: "Sunny Sal", role: "Brand mascot", description: "A peeling-nose cartoon sun who only appears when someone reapplies." },
    ]),
    places: items("sun-place", ["Dawn lifeguard tower", "Shared beach cooler circle", "Boardwalk arcade", "Chaotic bathroom counter"]),
    objects: items("sun-object", ["Striped canvas umbrella", "Zinc stick trio", "Film camera", "Mesh beach tote"]),
    context: "Sunbleach concepts start at the shoreline: overheard lifeguard wisdom, sunscreen-stained tote bags, and leisure that refuses to be optimized.",
    lexicon: items("sun-lexicon", ["Reapply o'clock", "Shade math", "SPF gossip", "Golden-hour audit"]),
    rituals: items("sun-ritual", ["Sunday slow-beach arrival", "Post-swim zinc check", "Cooler inventory roll call"]),
    humor: items("sun-humor", ["Burn-line confessionals", "Tourist-versus-local sunscreen wars", "Overbuilt beach-setup memes"]),
    alwaysRules: fixedRules([
      "Always looks sun-warmed, washed-out, and leisurely.",
      "Always treats sunscreen as a social ritual, not a chore.",
      "Always uses plainspoken beach English with retro warmth.",
      "Always includes at least one real, unposed person.",
      "Always leaves room for sand, sweat, salt, and imperfection.",
    ]),
    neverRules: fixedRules([
      "Never looks clinical, sterile, or dermatologist-office cold.",
      "Never uses fear-based skin-shaming language.",
      "Never shows perfect, untouched, or airbrushed skin.",
      "Never adopts luxury-minimal coldness or tech-startup jargon.",
      "Never promises a tan instead of protection.",
    ]),
    evaluation: {
      idea: "Hotel-lobby zinc bar with personalized minis",
      ideaKind: "Venue",
      answers: {
        "always-0": "yes", "always-1": "yes", "always-2": "yes", "always-3": "unsure", "always-4": "yes",
        "never-0": "yes", "never-1": "yes", "never-2": "unsure", "never-3": "no", "never-4": "yes",
      },
      notes: "A lobby can work only if it feels like a beach shack, not a luxury counter. Keep staff script goofy and hands-on.",
    },
    vectors: {
      wear: { status: "live", evidence: "Terry-cloth bucket hats and zinc-stained tees at the boardwalk stand." },
      visit: { status: "planned", evidence: "Pop-up zinc bar planned for two beach hotels." },
      collect: { status: "live", evidence: "Seasonal tube colors plus lifeguard-tower sticker drops." },
      attend: { status: "live", evidence: "Sunday SPF socials and dawn swim meetups." },
      content: { status: "strong", evidence: "Burn-line confessionals and reapply-alarm memes." },
    },
    chapters: [
      {
        id: "sun-chapter-1",
        title: "Chapter 4: The Arcade After Dark",
        newVariable: "A retro boardwalk arcade as the nighttime venue",
        variableKind: "storyline",
        familiarAnchors: "Marisol, zinc trio, burn-line humor",
        storyline: "The club takes over the boardwalk arcade for one humid evening, trading sunscreen for tokens and SPF trivia for prizes.",
        success: "Same warmth and ritual, one unfamiliar place.",
      },
    ],
    presetId: "sunbleach",
  };
}

function stridehousePreset(): BrandWorldData {
  return {
    worldName: "Stridehouse Run Club",
    worldTagline: "An activewear club disguised as a running habit.",
    characters: characters([
      { id: "stride-character-1", name: "Priya Anand", role: "Primary persona", description: "29-year-old product manager who runs before email and brings one reluctant friend every month." },
      { id: "stride-character-2", name: "Coach Okafor", role: "Side character", description: "Retired sprinter who leads warmups and enforces coffee stops." },
      { id: "stride-character-3", name: "Mile Dog", role: "Brand mascot", description: "A loping greyhound patch awarded for perfect attendance months." },
    ]),
    places: items("stride-place", ["5:45 a.m. track loop", "Post-run coffee window", "Clubhouse gear wall", "Sunday long-run bridge"]),
    objects: items("stride-object", ["Reflective singlet", "Shared foam-roller rack", "Clubhouse guest book", "Route cards"]),
    context: "Stridehouse concepts start on the running loop: breath, banter, attendance rituals, and gear earned rather than bought.",
    lexicon: items("stride-lexicon", ["Show up miles", "No-drop promise", "Coffee pace", "Guest-book PR"]),
    rituals: items("stride-ritual", ["Wednesday no-drop loop", "Monthly guest-mile invitation", "Post-run route-card stamp"]),
    humor: items("stride-humor", ["GPS-watch fails", "Matching-sock debates", "Marathon-training snack math"]),
    alwaysRules: fixedRules([
      "Always feels sweaty, communal, and encouraging.",
      "Always shows mixed paces and real running bodies.",
      "Always uses coachly, inclusive running language.",
      "Always earns status through attendance, not spending.",
      "Always keeps the clubhouse door visibly open.",
    ]),
    neverRules: fixedRules([
      "Never looks elite, exclusionary, or performance-obsessed.",
      "Never uses military boot-camp discipline language.",
      "Never shows solitary suffering as the ideal.",
      "Never centers luxury fashion over movement.",
      "Never shames walkers, beginners, or slow miles.",
    ]),
    evaluation: {
      idea: "Members-only recovery lounge with guest passes",
      ideaKind: "Venue",
      answers: {
        "always-0": "yes", "always-1": "yes", "always-2": "yes", "always-3": "unsure", "always-4": "yes",
        "never-0": "yes", "never-1": "yes", "never-2": "yes", "never-3": "no", "never-4": "yes",
      },
      notes: "Recovery fits, but only if guests are welcomed and prices stay club-level rather than luxury-spa level.",
    },
    vectors: {
      wear: { status: "strong", evidence: "Reflective singlet and attendance patches." },
      visit: { status: "live", evidence: "Clubhouse gear wall and coffee window." },
      collect: { status: "planned", evidence: "Route badges planned for twelve city loops." },
      attend: { status: "live", evidence: "Weekly no-drop runs and monthly guest mile." },
      content: { status: "planned", evidence: "Member route-card template in testing." },
    },
    chapters: [
      {
        id: "stride-chapter-1",
        title: "Chapter 3: The Guest Mile",
        newVariable: "One invited non-member per runner",
        variableKind: "person",
        familiarAnchors: "Wednesday loop, coffee pace, guest book",
        storyline: "Every regular brings exactly one newcomer; the chapter ends with first-timers signing the guest book.",
        success: "Same ritual, expanded community.",
      },
    ],
    presetId: "stridehouse",
  };
}

/** Realistic fallback so a brand-new session opens populated instead of crashing or empty. */
export const initialBrandWorldData: BrandWorldData = sunbleachPreset();

export const BRAND_WORLD_PRESETS: { id: string; label: string; blurb: string }[] = [
  { id: "sunbleach", label: "Sunbleach Club", blurb: "Retro leisure sunscreen world" },
  { id: "stridehouse", label: "Stridehouse Run Club", blurb: "Lifestyle activewear club world" },
];

export function getBrandWorldPreset(presetId: string): BrandWorldData {
  const preset = presetId === "stridehouse" ? stridehousePreset() : sunbleachPreset();
  // Clone with fresh ids so loading examples never collides with existing rows.
  return {
    ...preset,
    characters: preset.characters.map(c => ({ ...c, id: generateId() })),
    places: preset.places.map(item => ({ ...item, id: generateId() })),
    objects: preset.objects.map(item => ({ ...item, id: generateId() })),
    lexicon: preset.lexicon.map(item => ({ ...item, id: generateId() })),
    rituals: preset.rituals.map(item => ({ ...item, id: generateId() })),
    humor: preset.humor.map(item => ({ ...item, id: generateId() })),
    chapters: preset.chapters.map(c => ({ ...c, id: generateId() })),
  };
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringList(value: unknown, length: number): string[] {
  const list = Array.isArray(value) ? value.map(item => asString(item)) : [];
  return Array.from({ length }, (_, i) => list[i] ?? "");
}

function asItems(value: unknown, prefix: string): BrandWorldItem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item: any, index: number) => ({
    id: typeof item?.id === "string" && item.id ? item.id : `${prefix}-${index + 1}`,
    text: asString(item?.text ?? item),
  }));
}

function asCharacters(value: unknown): BrandWorldCharacter[] {
  if (!Array.isArray(value)) return [];
  return value.map((item: any, index: number) => ({
    id: typeof item?.id === "string" && item.id ? item.id : `character-${index + 1}`,
    name: asString(item?.name),
    role: (["Primary persona", "Side character", "Brand mascot"] as BrandWorldCharacterRole[]).includes(item?.role) ? item.role : "Primary persona",
    description: asString(item?.description),
  }));
}

function asChapters(value: unknown): BrandWorldChapter[] {
  if (!Array.isArray(value)) return [];
  const kinds: BrandWorldChapterVariable[] = ["person", "product", "routine", "storyline"];
  return value.map((item: any, index: number) => ({
    id: typeof item?.id === "string" && item.id ? item.id : `chapter-${index + 1}`,
    title: asString(item?.title),
    newVariable: asString(item?.newVariable),
    variableKind: kinds.includes(item?.variableKind) ? item.variableKind : "storyline",
    familiarAnchors: asString(item?.familiarAnchors),
    storyline: asString(item?.storyline),
    success: asString(item?.success),
  }));
}

function asVectors(value: unknown): Record<BrandWorldVectorKey, BrandWorldVector> {
  const input = (value && typeof value === "object" ? value : {}) as Record<string, Partial<BrandWorldVector>>;
  const statuses: BrandWorldVectorStatus[] = ["missing", "planned", "live", "strong"];
  return {
    wear: { status: statuses.includes(input.wear?.status as BrandWorldVectorStatus) ? input.wear!.status! : "missing", evidence: asString(input.wear?.evidence) },
    visit: { status: statuses.includes(input.visit?.status as BrandWorldVectorStatus) ? input.visit!.status! : "missing", evidence: asString(input.visit?.evidence) },
    collect: { status: statuses.includes(input.collect?.status as BrandWorldVectorStatus) ? input.collect!.status! : "missing", evidence: asString(input.collect?.evidence) },
    attend: { status: statuses.includes(input.attend?.status as BrandWorldVectorStatus) ? input.attend!.status! : "missing", evidence: asString(input.attend?.evidence) },
    content: { status: statuses.includes(input.content?.status as BrandWorldVectorStatus) ? input.content!.status! : "missing", evidence: asString(input.content?.evidence) },
  };
}

function hasContent(raw: Record<string, any>): boolean {
  return [
    raw.worldName, raw.worldTagline, raw.context,
    raw.evaluation?.idea, raw.evaluation?.notes,
    ...(Array.isArray(raw.characters) ? raw.characters.map((c: any) => [c?.name, c?.description].join(" ")) : []),
    ...(Array.isArray(raw.places) ? raw.places.map((x: any) => x?.text ?? x) : []),
    ...(Array.isArray(raw.objects) ? raw.objects.map((x: any) => x?.text ?? x) : []),
    ...(Array.isArray(raw.lexicon) ? raw.lexicon.map((x: any) => x?.text ?? x) : []),
    ...(Array.isArray(raw.rituals) ? raw.rituals.map((x: any) => x?.text ?? x) : []),
    ...(Array.isArray(raw.humor) ? raw.humor.map((x: any) => x?.text ?? x) : []),
    ...((Array.isArray(raw.alwaysRules) ? raw.alwaysRules : []).map(String)),
    ...((Array.isArray(raw.neverRules) ? raw.neverRules : []).map(String)),
    ...(Array.isArray(raw.chapters) ? raw.chapters.map((c: any) => [c?.title, c?.newVariable, c?.storyline].join(" ")) : []),
  ].some(v => String(v ?? "").trim().length > 0);
}

export function normalizeBrandWorldData(raw: unknown): BrandWorldData {
  if (!raw || typeof raw !== "object") return remapIds(initialBrandWorldData);
  const input = raw as Partial<BrandWorldData> & Record<string, any>;
  if (!hasContent(input)) return remapIds(initialBrandWorldData);
  const checks = ["yes", "no", "unsure"] as const;
  const answers: Record<string, BrandWorldCheck> = {};
  for (const [key, value] of Object.entries(input.evaluation?.answers ?? {})) {
    if (checks.includes(value as BrandWorldCheck)) answers[key] = value as BrandWorldCheck;
  }
  return {
    worldName: asString(input.worldName),
    worldTagline: asString(input.worldTagline),
    characters: asCharacters(input.characters),
    places: asItems(input.places, "place"),
    objects: asItems(input.objects, "object"),
    context: asString(input.context),
    lexicon: asItems(input.lexicon, "lexicon"),
    rituals: asItems(input.rituals, "ritual"),
    humor: asItems(input.humor, "humor"),
    alwaysRules: asStringList(input.alwaysRules, RULE_COUNT),
    neverRules: asStringList(input.neverRules, RULE_COUNT),
    evaluation: {
      idea: asString(input.evaluation?.idea),
      ideaKind: asString(input.evaluation?.ideaKind, "Campaign"),
      answers,
      notes: asString(input.evaluation?.notes),
    },
    vectors: asVectors(input.vectors),
    chapters: asChapters(input.chapters),
    presetId: typeof input.presetId === "string" ? input.presetId : null,
  };
}

type ListKey = "places" | "objects" | "lexicon" | "rituals" | "humor";

export function BrandWorldCreator({ data: raw, onChange, live }: AppProps) {
  const d = normalizeBrandWorldData(raw);
  const [step, setStep] = useState(0);
  const upd = (patch: Partial<BrandWorldData>) => onChange({ ...d, ...patch });

  const updateList = (key: ListKey, id: string, text: string) =>
    upd({ [key]: d[key].map(item => (item.id === id ? { ...item, text } : item)) } as Partial<BrandWorldData>);
  const addListItem = (key: ListKey) => upd({ [key]: [...d[key], { id: generateId(), text: "" }] } as Partial<BrandWorldData>);
  const removeListItem = (key: ListKey, id: string) => upd({ [key]: d[key].filter(item => item.id !== id) } as Partial<BrandWorldData>);

  const addCharacter = () => upd({ characters: [...d.characters, { id: generateId(), name: "", role: "Primary persona", description: "" }] });
  const updateCharacter = (id: string, patch: Partial<BrandWorldCharacter>) =>
    upd({ characters: d.characters.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  const removeCharacter = (id: string) => upd({ characters: d.characters.filter(c => c.id !== id) });

  const updateRule = (kind: "alwaysRules" | "neverRules", index: number, value: string) =>
    upd({ [kind]: d[kind].map((rule, i) => (i === index ? value : rule)) } as Partial<BrandWorldData>);
  const setCheck = (key: string, value: BrandWorldCheck) =>
    upd({ evaluation: { ...d.evaluation, answers: { ...d.evaluation.answers, [key]: value } } });
  const updateVector = (key: BrandWorldVectorKey, patch: Partial<BrandWorldVector>) =>
    upd({ vectors: { ...d.vectors, [key]: { ...d.vectors[key], ...patch } } });

  const addChapter = () => upd({
    chapters: [...d.chapters, { id: generateId(), title: "", newVariable: "", variableKind: "storyline", familiarAnchors: "", storyline: "", success: "" }],
  });
  const updateChapter = (id: string, patch: Partial<BrandWorldChapter>) =>
    upd({ chapters: d.chapters.map(c => (c.id === id ? { ...c, ...patch } : c)) });
  const removeChapter = (id: string) => upd({ chapters: d.chapters.filter(c => c.id !== id) });

  const filledAlways = d.alwaysRules.filter(r => r.trim()).length;
  const filledNever = d.neverRules.filter(r => r.trim()).length;
  const liveVectors = BRAND_WORLD_VECTORS.filter(v => d.vectors[v.key].status === "live" || d.vectors[v.key].status === "strong").length;
  const evaluatedRules = [...d.alwaysRules.map((rule, i) => ({ rule, key: `always-${i}` })), ...d.neverRules.map((rule, i) => ({ rule, key: `never-${i}` }))]
    .filter(row => row.rule.trim() && d.evaluation.answers[row.key]);
  const conflicts = evaluatedRules.filter(row => d.evaluation.answers[row.key] === "no").length;

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
      {!live && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtitle">A brand people can step inside.</p>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-subtitle">
            Cast the characters, places, and objects. Define the culture. Lock the always/never boundaries. Then audit where customers can actually participate.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-card p-5">
        <div>
          <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Brand world</label>
          <input value={d.worldName} onChange={e => upd({ worldName: e.target.value })} placeholder="e.g. Sunbleach Club" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-[16px] font-semibold outline-none focus:border-ink" />
        </div>
        <input value={d.worldTagline} onChange={e => upd({ worldTagline: e.target.value })} placeholder="One-line promise for this universe…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] uppercase tracking-[0.04em] text-subtitle">
          <span>{d.characters.length} characters</span>
          <span>{filledAlways + filledNever}/10 rules</span>
          <span>{liveVectors}/5 participation vectors live</span>
          <span>{d.chapters.length} chapters</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Brand world steps">
        {STEPS.map(s => (
          <button key={s.id} type="button" role="tab" aria-selected={step === s.id} onClick={() => setStep(s.id)}
            className={cn("rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.04em] transition",
              step === s.id ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] text-ink hover:border-ink/40")}>
            {s.short}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card p-5">
            <SectionHead title="Recurring characters" actionLabel="Add character" onAdd={addCharacter} />
            {d.characters.length === 0 && <EmptyRow text="Add the first persona, side character, or mascot." />}
            <div className="flex flex-col gap-3">
              {d.characters.map((c, i) => (
                <div key={c.id} className="rounded-xl bg-white p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Character {i + 1}</span>
                    <button type="button" onClick={() => removeCharacter(c.id)} aria-label="Remove character" className="text-ink/30 hover:text-red-500"><IconTrash size={14} /></button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_180px]">
                    <input value={c.name} onChange={e => updateCharacter(c.id, { name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
                    <select value={c.role} onChange={e => updateCharacter(c.id, { role: e.target.value as BrandWorldCharacterRole })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
                      {BRAND_WORLD_CHARACTER_ROLES.map(role => <option key={role}>{role}</option>)}
                    </select>
                  </div>
                  <textarea value={c.description} onChange={e => updateCharacter(c.id, { description: e.target.value })} rows={2} placeholder="Role in the world, habits, look, voice…" className="mt-2 w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListCard title="Places" hint="Where this world naturally occurs." items={d.places} placeholder="Add a place…" onAdd={() => addListItem("places")} onRemove={id => removeListItem("places", id)} onChange={(id, text) => updateList("places", id, text)} />
            <ListCard title="Objects" hint="Artifacts around the characters, beyond the hero product." items={d.objects} placeholder="Add an object…" onAdd={() => addListItem("objects")} onRemove={id => removeListItem("objects", id)} onChange={(id, text) => updateList("objects", id, text)} />
          </div>

          <div className="rounded-2xl bg-card p-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Context setting</p>
            <p className="mb-3 mt-1 text-[12px] leading-5 text-subtitle">Where do creative concepts originate in this universe?</p>
            <textarea value={d.context} onChange={e => upd({ context: e.target.value })} rows={4} placeholder="Origin story, creative source, time and place…" className="w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <ListCard title="Lexicon & vocabulary" hint="On-brand jargon and distinct words." items={d.lexicon} placeholder="Add a term…" onAdd={() => addListItem("lexicon")} onRemove={id => removeListItem("lexicon", id)} onChange={(id, text) => updateList("lexicon", id, text)} />
          <ListCard title="Recurring rituals" hint="Routines and repeated community behavior." items={d.rituals} placeholder="Add a ritual…" onAdd={() => addListItem("rituals")} onRemove={id => removeListItem("rituals", id)} onChange={(id, text) => updateList("rituals", id, text)} />
          <ListCard title="Humor & interests" hint="Memes, jokes, references, obsessions." items={d.humor} placeholder="Add an interest…" onAdd={() => addListItem("humor")} onRemove={id => removeListItem("humor", id)} onChange={(id, text) => updateList("humor", id, text)} />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <RuleCard title="Always" hint="Exactly five non-negotiable brand truths." tone="green" rules={d.alwaysRules} onChange={(i, v) => updateRule("alwaysRules", i, v)} />
            <RuleCard title="Never" hint="Exactly five complete exclusions." tone="orange" rules={d.neverRules} onChange={(i, v) => updateRule("neverRules", i, v)} />
          </div>

          <div className="rounded-2xl bg-card p-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Boundary evaluator</p>
            <p className="mb-4 mt-1 text-[12px] leading-5 text-subtitle">Test one idea against the ten rules. A single conflict means revise or reject.</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <input value={d.evaluation.idea} onChange={e => upd({ evaluation: { ...d.evaluation, idea: e.target.value } })} placeholder="Idea to test: product, venue, campaign…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              <select value={d.evaluation.ideaKind} onChange={e => upd({ evaluation: { ...d.evaluation, ideaKind: e.target.value } })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
                {["Campaign", "Product", "Venue", "Partnership", "Content", "Other"].map(kind => <option key={kind}>{kind}</option>)}
              </select>
            </div>

            <div className="mt-4 grid gap-2 lg:grid-cols-2">
              {d.alwaysRules.map((rule, i) => (
                <CheckRow key={`always-${i}`} label={`Keeps Always ${i + 1}`} rule={rule} value={d.evaluation.answers[`always-${i}`]} onChange={value => setCheck(`always-${i}`, value)} />
              ))}
              {d.neverRules.map((rule, i) => (
                <CheckRow key={`never-${i}`} label={`Avoids Never ${i + 1}`} rule={rule} value={d.evaluation.answers[`never-${i}`]} onChange={value => setCheck(`never-${i}`, value)} />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px]">
              <span className={cn("rounded px-2 py-1 font-semibold", conflicts ? "bg-[rgba(255,69,58,0.18)] text-[#b3001b]" : "bg-[rgba(52,199,89,0.25)] text-black")}>
                {evaluatedRules.length}/10 checked{evaluatedRules.length ? ` · ${conflicts} conflict${conflicts === 1 ? "" : "s"}` : ""}
              </span>
              <span className="text-subtitle">{conflicts ? "Revise or reject this idea." : evaluatedRules.length === 10 ? "Within universe boundaries." : "Check every boundary before approving."}</span>
            </div>
            <textarea value={d.evaluation.notes} onChange={e => upd({ evaluation: { ...d.evaluation, notes: e.target.value } })} rows={2} placeholder="Evaluator notes…" className="mt-3 w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-card p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="text-[13px] font-bold uppercase tracking-[0.04em]">Five-vector entry audit</p>
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle">{liveVectors}/5 live</span>
            </div>
            <p className="mb-4 text-[12px] leading-5 text-subtitle">Where can someone actually enter this world today?</p>
            <div className="flex flex-col gap-3">
              {BRAND_WORLD_VECTORS.map(v => {
                const value = d.vectors[v.key];
                return (
                  <div key={v.key} className="rounded-xl bg-white p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold">{v.label}</p>
                        <p className="text-[12px] text-subtitle">{v.prompt}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {BRAND_WORLD_VECTOR_STATUSES.map(status => (
                          <button key={status.value} type="button" onClick={() => updateVector(v.key, { status: status.value })}
                            className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.05em] transition",
                              value.status === status.value ? "border-ink bg-ink text-white" : "border-[rgba(117,117,117,0.2)] text-subtitle hover:border-ink/40 hover:text-ink")}>
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input value={value.evidence} onChange={e => updateVector(v.key, { evidence: e.target.value })} placeholder="Evidence, example, or next move…" className="mt-2 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-card p-5">
            <SectionHead title="Campaign chapters" actionLabel="Add chapter" onAdd={addChapter} />
            {d.chapters.length === 0 && <EmptyRow text="Add the first campaign chapter." />}
            <div className="flex flex-col gap-3">
              {d.chapters.map((chapter, index) => (
                <div key={chapter.id} className="rounded-xl bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Chapter {index + 1}</span>
                    <button type="button" onClick={() => removeChapter(chapter.id)} aria-label="Remove chapter" className="text-ink/30 hover:text-red-500"><IconTrash size={14} /></button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input value={chapter.title} onChange={e => updateChapter(chapter.id, { title: e.target.value })} placeholder="Chapter title" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-ink" />
                    <select value={chapter.variableKind} onChange={e => updateChapter(chapter.id, { variableKind: e.target.value as BrandWorldChapterVariable })} className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink">
                      <option value="person">New variable: Person</option>
                      <option value="product">New variable: Product</option>
                      <option value="routine">New variable: Routine</option>
                      <option value="storyline">New variable: Storyline</option>
                    </select>
                  </div>
                  <input value={chapter.newVariable} onChange={e => updateChapter(chapter.id, { newVariable: e.target.value })} placeholder="The one new variable…" className="mt-2 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                  <input value={chapter.familiarAnchors} onChange={e => updateChapter(chapter.id, { familiarAnchors: e.target.value })} placeholder="Familiar anchors it reuses…" className="mt-2 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                  <textarea value={chapter.storyline} onChange={e => updateChapter(chapter.id, { storyline: e.target.value })} rows={2} placeholder="Chapter storyline…" className="mt-2 w-full resize-none rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-ink" />
                  <input value={chapter.success} onChange={e => updateChapter(chapter.id, { success: e.target.value })} placeholder="What success looks like…" className="mt-2 w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <StepButton label="Back" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} />
        <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Step {step + 1} of {STEPS.length}</span>
        {step < STEPS.length - 1
          ? <StepButton label="Next" primary onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} />
          : <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">Exports include all four steps</span>}
      </div>
    </div>
  );
}

function SectionHead({ title, actionLabel, onAdd }: { title: string; actionLabel: string; onAdd: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="text-[13px] font-bold uppercase tracking-[0.04em]">{title}</p>
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-full border border-[rgba(117,117,117,0.25)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.06em] transition hover:border-ink">
        <IconPlus size={12} /> {actionLabel}
      </button>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="mb-3 rounded-lg border border-dashed border-black/15 py-5 text-center text-[12px] text-subtitle">{text}</p>;
}

function ListCard({ title, hint, items, placeholder, onAdd, onRemove, onChange }: {
  title: string; hint: string; items: BrandWorldItem[]; placeholder: string;
  onAdd: () => void; onRemove: (id: string) => void; onChange: (id: string, text: string) => void;
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-5">
      <SectionHead title={title} actionLabel="Add" onAdd={onAdd} />
      <p className="mb-3 text-[12px] leading-5 text-subtitle">{hint}</p>
      {items.length === 0 && <EmptyRow text="No entries yet." />}
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={item.id} className="group flex items-start gap-2">
            <span className="mt-2.5 w-4 text-[11px] font-bold tabular-nums text-ink/40">{idx + 1}</span>
            <input value={item.text} onChange={e => onChange(item.id, e.target.value)} placeholder={placeholder}
              className="flex-1 rounded-lg border border-white/60 bg-white/80 px-3 py-2 text-[14px] outline-none focus:border-ink" />
            <button type="button" onClick={() => onRemove(item.id)} aria-label="Remove entry" className="mt-2 text-ink/20 opacity-0 transition hover:text-red-500 group-hover:opacity-100"><IconTrash size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleCard({ title, hint, tone, rules, onChange }: {
  title: string; hint: string; tone: "green" | "orange"; rules: string[]; onChange: (index: number, value: string) => void;
}) {
  return (
    <div className={cn("rounded-2xl p-5", tone === "green" ? "bg-[rgba(52,199,89,0.15)]" : "bg-[rgba(255,149,0,0.14)]")}>
      <p className="text-[13px] font-bold uppercase tracking-[0.04em]">{title}</p>
      <p className="mb-3 mt-1 text-[12px] leading-5 text-subtitle">{hint}</p>
      <div className="flex flex-col gap-2">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2.5 w-4 text-[11px] font-bold tabular-nums text-ink/40">{i + 1}</span>
            <input value={rule} onChange={e => onChange(i, e.target.value)} placeholder={`${title} rule ${i + 1}`} className="flex-1 rounded-lg border border-white/60 bg-white/80 px-3 py-2 text-[14px] outline-none focus:border-ink" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ label, rule, value, onChange }: { label: string; rule: string; value: BrandWorldCheck | undefined; onChange: (value: BrandWorldCheck) => void }) {
  const options: { value: BrandWorldCheck; label: string }[] = [
    { value: "yes", label: "Pass" },
    { value: "unsure", label: "Check" },
    { value: "no", label: "Fail" },
  ];
  return (
    <div className={cn("rounded-xl bg-white p-3", !rule.trim() && "opacity-60")}>
      <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-subtitle">{label}</p>
      <p className="mt-0.5 min-h-[20px] text-[13px] leading-5">{rule.trim() || "Rule not written yet."}</p>
      <div className="mt-2 flex gap-1.5">
        {options.map(option => (
          <button key={option.value} type="button" disabled={!rule.trim()} onClick={() => onChange(option.value)}
            className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.05em] transition disabled:cursor-not-allowed disabled:opacity-40",
              value === option.value
                ? option.value === "no" ? "border-[#b3001b] bg-[#b3001b] text-white" : option.value === "yes" ? "border-ink bg-ink text-white" : "border-ink/50 bg-ink/10 text-ink"
                : "border-[rgba(117,117,117,0.25)] text-subtitle hover:border-ink/50 hover:text-ink")}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepButton({ label, primary, disabled, onClick }: { label: string; primary?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick}
      className={cn("rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition",
        primary ? "border-ink bg-ink text-white hover:bg-white hover:text-ink" : "border-[rgba(117,117,117,0.25)] hover:border-ink",
        disabled && "pointer-events-none opacity-40")}>
      {label}
    </button>
  );
}
