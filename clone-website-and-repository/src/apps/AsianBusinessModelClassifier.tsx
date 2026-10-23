/**
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain Tag — operational 9-domain taxonomy stamp (see src/data.ts).
 * ─────────────────────────────────────────────────────────────────────
 * Consulting Domain : Brand Strategy (+ Positioning, Messaging) [Strategy]
 * Domain Key        : brand_strategy
 * Official Title    : Asian Business Model Classifier
 * Operational Purpose: Score six Asian model archetypes against the current client.
 */
import type { AppProps } from "../pages/AppSession";

interface Model { id: string; name: string; relevance: number; notes: string; example: string }
interface Data { models: Model[] }

const MODEL_SPECS = [
  { id: "emotion", name: "Emotion-first", whenFits: "When brand resonance, experience, or community status drive pricing power over feature parity." },
  { id: "network", name: "Network-driven", whenFits: "When value scales exponentially with every user, vendor, or ecosystem partner added." },
  { id: "micro", name: "Microsegments", whenFits: "When hyper-specialized niches can be served at scale with automated operations or digital delivery." },
  { id: "knowledge", name: "Knowledge economy", whenFits: "When proprietary expertise, IP, credentials, or content form the main monetization engine." },
  { id: "conglomerate", name: "Conglomerates 3.0", whenFits: "When a portfolio of synergistic brands/units leverage shared backend infrastructure and data." },
  { id: "ai", name: "AI-native", whenFits: "When machine intelligence, predictive models, or real-time personalizations ARE the core offering." },
];

export function AsianBusinessModelClassifier({ data: raw, onChange, live }: AppProps) {
  const rawModels = (raw as Partial<Data>)?.models ?? [];
  const models: Model[] = MODEL_SPECS.map(spec => {
    const found = rawModels.find(m => m.id === spec.id);
    return {
      id: spec.id,
      name: spec.name,
      relevance: found?.relevance ?? 3,
      notes: found?.notes ?? "",
      example: found?.example ?? "",
    };
  });

  const updM = (id: string, u: Partial<Model>) => {
    const updated = models.map(m => m.id === id ? { ...m, ...u } : m);
    onChange({ models: updated });
  };

  return (
    <div className="mx-auto max-w-[900px]">
      {!live && (
        <p className="mb-6 text-[13px] leading-relaxed text-subtitle">
          Asian Business Model Classifier — Score the relevance of six modern Asian business model archetypes to your client and document specific applications.
        </p>
      )}

      {MODEL_SPECS.map((spec, i) => {
        const m = models.find(x => x.id === spec.id) ?? { id: spec.id, name: spec.name, relevance: 3, notes: "", example: "" };
        return (
          <div key={spec.id} className="mb-4 rounded-2xl bg-card p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{i + 1}</span>
                <p className="text-[15px] font-bold uppercase tracking-[0.04em]">{spec.name}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" onClick={() => updM(spec.id, { relevance: n })} className={"h-7 w-7 rounded text-[12px] font-bold transition " + (n <= m.relevance ? "bg-ink text-white" : "bg-white border border-[rgba(117,117,117,0.15)] text-ink/50")}>{n}</button>
                ))}
              </div>
            </div>

            <p className="mb-4 pl-8 text-[12px] italic text-subtitle">
              <strong>When this fits:</strong> {spec.whenFits}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Client Application</label>
                <textarea value={m.example} onChange={e => updM(spec.id, { example: e.target.value })} rows={2} placeholder="How can the client apply this archetype?" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Notes &amp; Observations</label>
                <textarea value={m.notes} onChange={e => updM(spec.id, { notes: e.target.value })} rows={2} placeholder="Context, constraints, or peer examples…" className="w-full rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
