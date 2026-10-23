import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../toast";
import { Breadcrumb, Card, PageShell, SectionTitle, Topbar } from "../ui";
import { IconSearch, IconTrash } from "../icons";

export function NotesPage() {
  const store = useStore();
  const toast = useToast();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  const allNotes = useMemo(() => {
    const projectName = new Map(store.state.projects.map(p => [p.id, p.clientName] as const));
    const rows = [
      ...store.state.globalNotes.map(n => ({ ...n, source: "Global" })),
      ...store.state.projects.flatMap(p => p.notes.map(n => ({ ...n, source: p.clientName }))),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const needle = q.trim().toLowerCase();
    return needle
      ? rows.filter(n => n.body.toLowerCase().includes(needle) || (n.projectId ? (projectName.get(n.projectId) ?? "") : "global").toLowerCase().includes(needle))
      : rows;
  }, [store.state.globalNotes, store.state.projects, q]);

  const submit = () => {
    if (!text.trim()) return;
    store.addNote(null, { author: "You", body: text.trim() });
    setText("");
    toast.show("Note added", { tone: "success" });
  };

  return (
    <PageShell>
      <Topbar current="notes" />
      <Breadcrumb items={[{ label: "Notes" }]} />
      <h1 className="relative z-10 mb-8 text-[36px] font-normal tracking-[-0.04em] sm:text-[48px] sm:leading-[44px]">Notes</h1>

      <div className="relative z-10 mx-auto max-w-[720px]">
        <Card className="mb-4 bg-white">
          <form onSubmit={e => { e.preventDefault(); submit(); }}>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); } }}
              placeholder="Write a global note… (⌘↵ to save)"
              rows={3}
              className="mb-3 w-full resize-none rounded-xl border border-[rgba(117,117,117,0.18)] p-3 text-sm outline-none focus:border-ink"
            />
            <button type="submit" disabled={!text.trim()} className="rounded-full border border-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-40">Add Note</button>
          </form>
        </Card>

        <Card>
          <SectionTitle action={
            <span className="flex items-center gap-2 rounded-lg border border-[rgba(117,117,117,0.18)] bg-white px-2.5 py-1">
              <IconSearch size={14} className="text-subtitle" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notes…" className="w-36 bg-transparent text-[12px] outline-none" aria-label="Search notes" />
            </span>
          }>All Notes</SectionTitle>
          <div className="mt-4 flex flex-col gap-5">
            {allNotes.length === 0 && <p className="text-sm text-subtitle">{q ? "No notes match your search." : "No notes yet."}</p>}
            {allNotes.map(n => (
              <div key={n.id} className="group border-b border-dashed border-[rgba(120,120,128,0.16)] pb-5 last:border-0">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="text-[13px] font-bold">{n.author}</span>
                  <span className="text-[11px] uppercase tracking-[0.04em] text-black/40" title={n.createdAt}>{n.time}</span>
                  <span className="ml-auto flex items-center gap-2 text-[11px] font-medium uppercase text-subtitle">
                    {n.projectId
                      ? <a href={"#/project/" + n.projectId} className="underline decoration-dotted hover:text-ink">{n.source}</a>
                      : n.source}
                    <button type="button" aria-label="Delete note" onClick={() => store.deleteNote(n.projectId, n.id)} className="opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"><IconTrash size={12} className="text-ink/30 hover:text-red-500" /></button>
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-[14px] leading-6">{n.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
