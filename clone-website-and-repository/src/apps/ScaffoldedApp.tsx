import type { AppProps } from "../pages/AppSession";

export function ScaffoldedApp({ data, onChange }: AppProps) {
  const notes = ((data as { notes?: string })?.notes) ?? "";

  return (
    <div className="mx-auto flex max-w-[820px] flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card py-12 text-center">
        <span className="text-4xl">🚧</span>
        <p className="text-[20px] font-normal tracking-[-0.03em]">Scaffolded — Ready for Content</p>
        <p className="max-w-md text-[13px] text-subtitle">This tool's dedicated canvas is on the roadmap. For now you can capture live session notes below — they'll save, export, and print like any other session.</p>
      </div>

      <div className="rounded-2xl bg-card p-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Session notes</p>
        <textarea
          value={notes}
          onChange={e => onChange({ notes: e.target.value })}
          placeholder="Capture the conversation, decisions, and outputs…"
          rows={14}
          className="w-full resize-none rounded-xl border border-[rgba(117,117,117,0.15)] bg-white p-4 text-[15px] leading-7 outline-none focus:border-ink"
        />
      </div>
    </div>
  );
}
