import { greeting, relativeTime, formatDate, formatCurrency, getImplementedApps, getApp } from "../data";
import { TASK_COLUMN_META } from "../db/schema";
import { CATALOG_ICONS, IconArrowRight20, IconChat, IconCheck, IconClipboard, IconFolder, IconStar, IconPlus, IconFile } from "../icons";
import { useStore } from "../store";
import { modKey } from "../hooks";
import { Badge, Card, Kbd, PageShell, StatusBadge, Stepper, Topbar, PrimaryButton } from "../ui";
import { cn } from "../utils/cn";

const ICONS = { session: IconStar, note: IconChat, status: IconCheck, file: IconFile, project: IconFolder, task: IconClipboard };
export function CommandCenter() {
  const store = useStore();
  const { state } = store;
  const byActivity = (a: { lastActivityAt: string }, b: { lastActivityAt: string }) => b.lastActivityAt.localeCompare(a.lastActivityAt);
  const active = state.projects.filter(p => p.status === "active").sort(byActivity);
  const paused = state.projects.filter(p => p.status === "paused");
  const completed = state.projects.filter(p => p.status === "completed");
  const recentSessions = [...state.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const openTasks = store.openTasks;
  const today = new Date().toISOString().slice(0, 10);
  const overdueCount = openTasks.filter(t => t.dueDate && t.dueDate < today && t.status !== "done").length;
  const storage = store.storageInfo();
  const trashCount = state.trash.projects.length + state.trash.sessions.length + state.trash.tasks.length + state.trash.sprints.length;

  return (
    <PageShell>
      <Topbar current="home" />

      <header className="relative z-10 mb-[60px]">
        <div className="flex flex-wrap items-end justify-between gap-6 pt-2">
          <div className="flex items-center gap-8">
            <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-full bg-ink">
              <span className="text-[32px] font-semibold tracking-[-0.04em] text-white">CS</span>
            </div>
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium uppercase leading-4 tracking-[0.02em] text-ink">{greeting()}</p>
              <h1 className="text-[32px] font-normal leading-[36px] tracking-[-0.04em] text-ink sm:text-[48px] sm:leading-[44px]">
                Command Center
              </h1>
            </div>
          </div>
          <PrimaryButton href="#/new-project"><IconPlus size={14} /> New Project</PrimaryButton>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:[grid-template-areas:'stats_activity_projects_projects'_'stats_activity_projects_projects']">
        {/* Stats */}
        <Card className="flex flex-col justify-between gap-8 lg:[grid-area:stats]">
          <div className="flex flex-col gap-4">
            <p className="text-base leading-6 tracking-[-0.01em]">Project Load</p>
            <p className="text-[36px] font-normal leading-[36px] tracking-[-0.04em] sm:text-[48px] sm:leading-[44px]">
              {active.length} active
            </p>
            <div className="flex flex-wrap gap-2">
              {paused.length > 0 && <StatusBadge status="paused" />}
              {completed.length > 0 && <StatusBadge status="completed" />}
              {storage.percent >= 75 && <Badge tone="orange">Storage {storage.percent}%</Badge>}
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-dashed border-[rgba(120,120,128,0.16)] pt-5">
            <div className="flex justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle">
              <span>Sessions logged</span><span className="text-ink">{state.sessions.length}</span>
            </div>
            <div className="flex justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle">
              <span>Total projects</span><span className="text-ink">{state.projects.length}</span>
            </div>
            {trashCount > 0 && (
              <div className="flex justify-between text-[11px] font-medium uppercase tracking-[0.04em] text-subtitle">
                <span>In trash</span><a href="#/data" className="text-ink underline decoration-dotted underline-offset-2">{trashCount}</a>
              </div>
            )}
          </div>
        </Card>

        {/* Activity */}
        <Card className="flex flex-col gap-4 lg:[grid-area:activity]">
          <p className="text-base leading-6 tracking-[-0.01em]">Recent Activity</p>
          {state.activity.slice(0, 4).map((a, i) => {
            const Icon = ICONS[a.icon] || IconStar;
            return (
              <a key={a.id} href={a.href} className={cn(
                "flex flex-col gap-2 py-4 text-ink no-underline transition hover:opacity-70",
                i < Math.min(3, state.activity.length - 1) && "border-b border-dashed border-[rgba(120,120,128,0.16)]"
              )}>
                <Icon size={22} />
                <p className="text-[13px] font-bold leading-4 tracking-[0.02em]">{a.title}</p>
                <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.02em] text-black/60" title={a.createdAt}>{relativeTime(a.createdAt)}</p>
              </a>
            );
          })}
          {state.activity.length === 0 && <p className="py-6 text-sm text-subtitle">No activity yet.</p>}
        </Card>

        {/* Projects column */}
        <div className="flex flex-col gap-4 lg:[grid-area:projects]">
          {active.length === 0 && (
            <Card className="text-center">
              <p className="text-[15px] font-semibold">No active projects</p>
              <p className="mt-1 text-sm text-subtitle">Create one to start running sessions.</p>
              <div className="mt-4"><PrimaryButton href="#/new-project"><IconPlus size={14} /> New Project</PrimaryButton></div>
            </Card>
          )}
          {active.slice(0, 2).map(project => (
            <a key={project.id} href={"#/project/" + project.id} className="flex flex-col justify-between gap-5 rounded-2xl bg-card p-7 text-ink no-underline transition duration-250 hover:-translate-y-1 hover:bg-[#ededed] hover:shadow-[0_12px_28px_rgba(21,25,13,0.1)]">
              <div className="flex items-start justify-between gap-6">
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="text-[13px] font-medium uppercase tracking-[0.02em] text-subtitle">{project.clientName}</p>
                  <p className="break-words text-[26px] font-normal leading-[28px] tracking-[-0.04em] sm:text-[32px] sm:leading-[34px]">{project.projectName || "Untitled Project"}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>
              <Stepper steps={project.phases} done={project.donePhases} sollPct={project.sollPct} />
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.02em]">{formatCurrency(project.fee, project.feeCurrency)} · {project.feeType} · {project.metrics.done}/{project.metrics.total} tasks{project.metrics.overdue ? ` · ${project.metrics.overdue} overdue` : ""}</p>
                <span className="inline-flex shrink-0 items-center gap-1 rounded border border-ink px-2 py-1 text-[11px] font-medium uppercase tracking-[0.02em]">Open <IconArrowRight20 size={16} /></span>
              </div>
            </a>
          ))}

          {/* Cross-project delivery tracking */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base leading-6 tracking-[-0.01em]">My Open Tasks</p>
              <span className="text-[11px] uppercase tracking-[0.06em] text-subtitle">
                {openTasks.length} open{overdueCount > 0 && <span className="ml-1 font-semibold text-[#c77700]">· {overdueCount} overdue</span>}
              </span>
            </div>
            <div className="flex flex-col">
              {openTasks.length === 0 && <p className="py-4 text-sm text-subtitle">Nothing open. Every task across every project is done.</p>}
              {openTasks.slice(0, 6).map((t, i) => {
                const p = state.projects.find(x => x.id === t.projectId);
                const overdue = !!t.dueDate && t.dueDate < today && t.status !== "done";
                return (
                  <a key={t.id} href={`#/project/${t.projectId}/board`}
                    className={cn("flex items-center gap-3 py-2.5 no-underline transition hover:opacity-70", i < Math.min(5, openTasks.length - 1) && "border-b border-dashed border-[rgba(120,120,128,0.16)]")}>
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", t.priority === "urgent" ? "bg-[#34c759]" : t.priority === "high" ? "bg-[#ff9f0a]" : t.priority === "medium" ? "bg-ink/50" : "bg-ink/20")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[13px] font-medium text-ink", t.status === "done" && "line-through")}>{t.title}</span>
                      <span className="block truncate text-[11px] uppercase tracking-[0.04em] text-subtitle">{p?.clientName ?? "—"} · {TASK_COLUMN_META[t.status].label}{t.assignee ? ` · ${t.assignee}` : ""}</span>
                    </span>
                    {t.estimate > 0 && <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-ink/60">{t.estimate}pt</span>}
                    <span className={cn("w-14 shrink-0 text-right text-[11px] font-semibold tabular-nums", overdue ? "text-[#b3001b]" : "text-subtitle")}>{t.dueDate ? formatDate(t.dueDate).slice(0, 6) : ""}</span>
                  </a>
                );
              })}
              {openTasks.length > 6 && (
                <p className="pt-2.5 text-[11px] uppercase tracking-[0.05em] text-subtitle">
                  + {openTasks.length - 6} more across {new Set(openTasks.map(t => t.projectId)).size} projects
                </p>
              )}
            </div>
          </Card>

          {/* Recent sessions */}
          <Card>
            <p className="text-base leading-6 tracking-[-0.01em]">Recent Sessions</p>
            <div className="mt-4 flex flex-col">
              {recentSessions.length === 0 && <p className="py-4 text-sm text-subtitle">No sessions yet. Launch a tool inside a project.</p>}
              {recentSessions.map((s, i) => {
                const app = getApp(s.appId);
                if (!app) return null;
                const project = state.projects.find(p => p.id === s.projectId);
                const Icon = CATALOG_ICONS[app.icon];
                const href = project ? `#/project/${project.id}/app/${app.id}/${s.id}` : `#/app/${app.id}/${s.id}`;
                return (
                  <a
                    key={s.id}
                    href={href}
                    className={cn("flex items-center gap-3 py-3 no-underline transition hover:opacity-70", i < recentSessions.length - 1 && "border-b border-dashed border-[rgba(120,120,128,0.16)]")}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center">{Icon ? <Icon size={20} className="text-ink/70" /> : <IconStar size={18} />}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-semibold text-ink">{s.title}</span>
                      <span className="text-[11px] uppercase tracking-[0.04em] text-subtitle">{app.name} · {project ? project.clientName : "unattached"}</span>
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-[0.04em] text-subtitle" title={s.updatedAt}>{relativeTime(s.updatedAt)}</span>
                  </a>
                );
              })}
            </div>
          </Card>

          {/* Quick launch */}
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-base leading-6 tracking-[-0.01em]">Quick Launch</p>
              <span className="text-[11px] text-subtitle">Press <Kbd>{modKey}</Kbd><Kbd>K</Kbd> to launch inside a project</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {getImplementedApps().slice(0, 8).map(app => {
                const Icon = CATALOG_ICONS[app.icon];
                return (
                  <a key={app.id} href={"#/app/" + app.id} className="flex flex-col items-center gap-2 rounded-xl border border-[rgba(117,117,117,0.12)] bg-white p-3 text-center no-underline transition hover:-translate-y-0.5 hover:border-[rgba(117,117,117,0.3)] hover:shadow-sm">
                    {Icon ? <Icon size={22} className="text-ink" /> : <IconStar size={20} />}
                    <span className="text-[10px] font-semibold leading-tight">{app.name}</span>
                  </a>
                );
              })}
            </div>
          </Card>

          <div className="flex flex-wrap gap-4">
            <a href="#/projects" className="text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70">All projects</a>
            <a href="#/apps" className="text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70">App registry</a>
            <a href="#/data" className="text-sm font-medium text-ink underline underline-offset-4 hover:opacity-70">Data &amp; backup</a>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
