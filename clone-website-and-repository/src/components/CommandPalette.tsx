import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { APP_CATALOG, getApp, relativeTime } from "../data";
import { CATALOG_ICONS, IconClipboard, IconFolder, IconHome, IconSearch, IconStar } from "../icons";
import { projectIdOf, type Page } from "../nav";
import { useStore } from "../store";
import { Kbd } from "../ui";
import { useEscape } from "../hooks";
import { cn } from "../utils/cn";

type Group = "Navigate" | "Projects" | "Tasks" | "Sessions" | "Tools";

interface Item {
  id: string;
  group: Group;
  title: string;
  subtitle?: string;
  hint?: string;
  keywords: string;
  href: string;
  icon: ReactNode;
}

const GROUP_ORDER: Group[] = ["Tasks", "Sessions", "Projects", "Tools", "Navigate"];

function score(item: Item, tokens: string[]): number {
  if (!tokens.length) return 1;
  const hay = (item.title + " " + (item.subtitle ?? "") + " " + item.keywords).toLowerCase();
  const title = item.title.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    const i = hay.indexOf(t);
    if (i < 0) return 0;
    s += title.startsWith(t) ? 30 : title.includes(t) ? 18 : 6;
    s += Math.max(0, 8 - Math.min(8, i / 12));
  }
  return s;
}

function Initials({ text }: { text: string }) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const initials = (parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "");
  return <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold uppercase text-white">{initials}</span>;
}

export function CommandPalette({ open, onClose, page }: { open: boolean; onClose: () => void; page: Page }) {
  const store = useStore();
  const { state } = store;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const ctxProjectId = projectIdOf(page);
  const ctxProject = ctxProjectId ? state.projects.find(p => p.id === ctxProjectId) : undefined;

  useEscape(open, onClose);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  const items = useMemo<Item[]>(() => {
    if (!open) return [];
    const nav: Item[] = [
      { id: "nav-home", group: "Navigate", title: "Command Center", keywords: "home dashboard overview", href: "#/home", icon: <IconHome size={18} className="text-ink/60" /> },
      { id: "nav-projects", group: "Navigate", title: "Projects", keywords: "clients list all projects", href: "#/projects", icon: <IconFolder size={18} className="text-ink/60" /> },
      { id: "nav-new", group: "Navigate", title: "New project", keywords: "create client add", href: "#/new-project", hint: "Create", icon: <IconFolder size={18} className="text-ink/60" /> },
      { id: "nav-apps", group: "Navigate", title: "App registry", keywords: "tools apps catalog", href: "#/apps", icon: <IconStar size={18} className="text-ink/60" /> },
      { id: "nav-notes", group: "Navigate", title: "Notes", keywords: "notes global", href: "#/notes", icon: <IconStar size={18} className="text-ink/60" /> },
      { id: "nav-data", group: "Navigate", title: "Data & backup", keywords: "export import trash storage restore settings", href: "#/data", icon: <IconStar size={18} className="text-ink/60" /> },
    ];
    const projects: Item[] = state.projects.flatMap(p => ([
      {
        id: "p-" + p.id,
        group: "Projects" as Group,
        title: p.clientName || "Untitled client",
        subtitle: [p.projectName, p.status].filter(Boolean).join(" · "),
        hint: "Open",
        keywords: "project client " + p.status,
        href: "#/project/" + p.id,
        icon: <Initials text={p.clientName || "?"} />,
      },
      {
        id: "b-" + p.id,
        group: "Projects" as Group,
        title: (p.clientName || "Untitled") + " board",
        subtitle: `${p.metrics.done}/${p.metrics.total} tasks done` + (p.metrics.overdue ? ` · ${p.metrics.overdue} overdue` : ""),
        hint: "Kanban",
        keywords: "board kanban tasks delivery " + (p.clientName ?? ""),
        href: "#/project/" + p.id + "/board",
        icon: <IconClipboard size={18} className="text-ink/60" />,
      },
      {
        id: "sp-" + p.id,
        group: "Projects" as Group,
        title: (p.clientName || "Untitled") + " sprints",
        subtitle: `${p.sprints.length} sprint${p.sprints.length === 1 ? "" : "s"}` + (p.sprints.some(s => s.status === "active") ? " · 1 active" : ""),
        hint: "Scrum",
        keywords: "sprint scrum velocity burndown " + (p.clientName ?? ""),
        href: "#/project/" + p.id + "/sprints",
        icon: <IconClipboard size={18} className="text-ink/60" />,
      },
    ]));
    const tasks: Item[] = store.openTasks.map(t => {
      const project = state.projects.find(p => p.id === t.projectId);
      return {
        id: "task-" + t.id,
        group: "Tasks" as Group,
        title: t.title,
        subtitle: [project?.clientName, t.assignee || "Unassigned", t.dueDate ? "Due " + t.dueDate : ""].filter(Boolean).join(" · "),
        hint: "Open board",
        keywords: `task ${t.status} ${t.priority} ${project?.clientName ?? ""} ${t.assignee}`,
        href: `#/project/${t.projectId}/board`,
        icon: <IconClipboard size={18} className="text-ink/60" />,
      };
    });
    const tools: Item[] = APP_CATALOG.map(app => {
      const Icon = CATALOG_ICONS[app.icon];
      return {
        id: "t-" + app.id,
        group: "Tools",
        title: app.name,
        subtitle: app.description,
        hint: ctxProject ? "Launch in " + ctxProject.clientName : "Launch unattached",
        keywords: "tool app " + app.category + " " + String(app.num).padStart(2, "0"),
        href: ctxProjectId ? `#/project/${ctxProjectId}/app/${app.id}/new` : "#/app/" + app.id,
        icon: Icon ? <Icon size={18} className="text-ink/70" /> : <IconStar size={18} />,
      };
    });
    const sessions: Item[] = [...state.sessions]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 12)
      .map(s => {
        const app = getApp(s.appId);
        const project = state.projects.find(p => p.id === s.projectId);
        const Icon = app ? CATALOG_ICONS[app.icon] : undefined;
        return {
          id: "s-" + s.id,
          group: "Sessions" as Group,
          title: s.title || app?.name || "Session",
          subtitle: [app?.name, project?.clientName, relativeTime(s.updatedAt)].filter(Boolean).join(" · "),
          hint: "Resume",
          keywords: "session recent " + (app?.name ?? "") + " " + (project?.clientName ?? ""),
          href: s.projectId ? `#/project/${s.projectId}/app/${s.appId}/${s.id}` : `#/app/${s.appId}/${s.id}`,
          icon: Icon ? <Icon size={18} className="text-ink/70" /> : <IconStar size={18} />,
        };
      });
    return [...tasks, ...sessions, ...projects, ...tools, ...nav];
  }, [open, state.projects, state.sessions, store.openTasks, ctxProjectId, ctxProject]);

  const results = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!tokens.length) {
      // Curated default: a few recent sessions, active projects, a handful of tools, then navigation.
      const sessions = items.filter(i => i.group === "Sessions").slice(0, 4);
      const tasks = items.filter(i => i.group === "Tasks").slice(0, 4);
      const projects = items.filter(i => i.group === "Projects" && i.id.startsWith("p-")).slice(0, 5);
      const tools = items.filter(i => i.group === "Tools").slice(0, 6);
      const nav = items.filter(i => i.group === "Navigate");
      return [...tasks, ...sessions, ...projects, ...tools, ...nav];
    }
    return items
      .map(i => ({ i, s: score(i, tokens) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || GROUP_ORDER.indexOf(a.i.group) - GROUP_ORDER.indexOf(b.i.group))
      .slice(0, 40)
      .map(x => x.i);
  }, [items, query]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const go = (item: Item) => {
    onClose();
    if (window.location.hash === item.href) return;
    window.location.hash = item.href.replace(/^#/, "");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(results.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); const it = results[active]; if (it) go(it); }
  };

  // Group headers are rendered where the group changes in the (already ordered) results.
  let lastGroup: Group | null = null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="palette-enter w-full max-w-[640px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(21,25,13,0.25)]" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-[rgba(120,120,128,0.16)] px-5 py-4">
          <IconSearch size={18} className="shrink-0 text-subtitle" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder={ctxProject ? `Jump anywhere · tools launch inside ${ctxProject.clientName}` : "Jump to a project, session, or tool…"}
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-black/30"
            aria-label="Search"
          />
          <Kbd>Esc</Kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-4 py-10 text-center text-sm text-subtitle">Nothing matches “{query}”.</p>}
          {results.map((item, idx) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const isActive = idx === active;
            return (
              <div key={item.id}>
                {header && <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.08em] text-subtitle">{header}</p>}
                <button
                  type="button"
                  data-index={idx}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => go(item)}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition", isActive ? "bg-card" : "hover:bg-black/[0.03]")}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center">{item.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-ink">{item.title}</span>
                    {item.subtitle && <span className="block truncate text-[12px] text-subtitle">{item.subtitle}</span>}
                  </span>
                  {item.hint && <span className={cn("shrink-0 text-[10px] font-medium uppercase tracking-[0.06em]", isActive ? "text-ink" : "text-ink/35")}>{item.hint} {isActive && <Kbd>↵</Kbd>}</span>}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(120,120,128,0.16)] px-5 py-2.5 text-[11px] text-subtitle">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate · <Kbd>↵</Kbd> open</span>
          <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
