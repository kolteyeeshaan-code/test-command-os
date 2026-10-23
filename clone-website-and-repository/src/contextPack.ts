/**
 * Project context packs for LLM project memory.
 *
 * These are pure formatters. They receive hydrated project data + sessions from the
 * store and never read localStorage directly, so the same formatters can sit behind a
 * future Wix Headless/API adapter without touching the UI.
 */
import { APP_VERSION, SCHEMA_VERSION, TASK_COLUMNS, TASK_COLUMN_META, type ProjectView, type Session } from "./db/schema";
import { formatCurrency, formatDate, formatDateTime, getApp } from "./data";
import { renderAppMarkdown } from "./apps/markdownRenderers";
import { renderAppBody } from "./apps/printRenderers";

const mdEsc = (v: unknown) => String(v ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
const escapeHtml = (v: unknown) => String(v ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function mdTable(headers: string[], rows: (string | number)[][]): string {
  if (!rows.length) return "";
  return `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n${rows.map(r => `| ${r.map(mdEsc).join(" | ")} |`).join("\n")}\n\n`;
}

export function projectContextMarkdown(project: ProjectView, sessions: Session[]): string {
  const orderedSessions = [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const lines: string[] = [
    `# ${project.clientName} — ${project.projectName || "Untitled Project"}`,
    "",
    "> Consultancy Suite project context pack · Generated " + new Date().toLocaleString(),
    "",
    "## How to Use This Context",
    "",
    "Treat the content below as the authoritative project memory. Distinguish confirmed client inputs from consultant hypotheses, preserve source wording where possible, and flag contradictions or missing evidence instead of inventing details.",
    "",
    "## Project Brief",
    "",
    `**Client:** ${project.clientName}`,
    "",
    `**Project:** ${project.projectName || "Untitled Project"}`,
    "",
    `**Status:** ${project.status}`,
    "",
    `**Timeline:** ${formatDate(project.startDate)} → ${formatDate(project.targetEndDate)}`,
    "",
    `**Commercial:** ${formatCurrency(project.fee, project.feeCurrency)} · ${project.feeType}`,
    "",
    `**Progress:** ${project.donePhases}/${project.phases.length} phases · ${project.metrics.done}/${project.metrics.total} tasks · ${project.metrics.pointsDone}/${project.metrics.points} points`,
    "",
  ];

  if (project.scopeSummary.trim()) lines.push("### Scope", "", project.scopeSummary, "");
  if (project.goals.length) lines.push("### Goals / Success Criteria", "", ...project.goals.map(g => "- " + g), "");
  if (project.phases.length) lines.push("### Project Phases", "", project.phases.map((p, i) => `${i < project.donePhases ? "[x]" : "[ ]"} ${i + 1}. ${p}`).join("\n"), "");

  lines.push("## Delivery State", "");
  lines.push(`**Open tasks:** ${project.metrics.total - project.metrics.done} · **In flight:** ${project.metrics.active} · **Overdue:** ${project.metrics.overdue} · **Unassigned:** ${project.metrics.unassigned}`, "");
  for (const status of TASK_COLUMNS) {
    const tasks = project.tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
    if (!tasks.length) continue;
    lines.push(`### ${TASK_COLUMN_META[status].label} (${tasks.length})`, "");
    lines.push(mdTable(["Task", "Priority", "Assignee", "Due", "Points", "Phase", "Sprint"], tasks.map(t => [
      t.title + (t.description ? `<br>${t.description}` : ""),
      t.priority,
      t.assignee || "Unassigned",
      t.dueDate || "—",
      t.estimate || "—",
      t.phaseIndex >= 0 ? project.phases[t.phaseIndex] || "—" : "—",
      t.sprintId ? project.sprints.find(s => s.id === t.sprintId)?.name || "Archived sprint" : "—",
    ])));
  }

  if (project.sprints.length) {
    lines.push("## Sprints", "");
    for (const sprint of project.sprints) {
      const tasks = project.tasks.filter(t => t.sprintId === sprint.id);
      const done = tasks.filter(t => t.status === "done");
      const points = tasks.reduce((n, t) => n + t.estimate, 0);
      const pointsDone = done.reduce((n, t) => n + t.estimate, 0);
      lines.push(`### ${sprint.name} · ${sprint.status}`, "", sprint.goal || "_No sprint goal recorded._", "", `**Window:** ${formatDate(sprint.startDate)} → ${formatDate(sprint.endDate)} · **Progress:** ${done.length}/${tasks.length} tasks · ${pointsDone}/${points} points`, "");
    }
  }

  if (project.notes.length) {
    lines.push("## Project Notes", "");
    project.notes.forEach(n => lines.push(`### ${n.author} · ${formatDateTime(n.createdAt)}`, "", n.body, ""));
  }

  if (project.files.length) {
    lines.push("## File Register", "", mdTable(["File", "Metadata", "Type", "Size (bytes)"], project.files.map(f => [f.name, f.meta, f.mimeType || "—", f.size || "—"])));
  }

  lines.push("## Structured Session Outputs", "");
  if (!orderedSessions.length) lines.push("_No sessions have been recorded for this project._", "");
  orderedSessions.forEach((session, i) => {
    const app = getApp(session.appId);
    const body = renderAppMarkdown(session.appId, session.data).trim();
    lines.push(
      `### ${i + 1}. ${session.title || app?.name || "Session"}`,
      "",
      `**Tool:** ${app?.name || session.appId} · **Updated:** ${formatDateTime(session.updatedAt)} · **Revision:** ${session.revision}`,
      "",
      body || "_No structured answers captured._",
      "",
    );
  });

  lines.push("---", `*Schema v${SCHEMA_VERSION} · App ${APP_VERSION} · Context pack generated ${new Date().toISOString()}*`, "");
  return lines.join("\n");
}

export function projectContextJson(project: ProjectView, sessions: Session[]) {
  return {
    format: "consultancy-suite/llm-context-pack",
    schemaVersion: SCHEMA_VERSION,
    appVersion: APP_VERSION,
    generatedAt: new Date().toISOString(),
    instructions: "Use this as authoritative project memory. Flag contradictions and missing evidence; do not invent client facts.",
    project: {
      id: project.id,
      clientName: project.clientName,
      projectName: project.projectName,
      status: project.status,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      fee: project.fee,
      feeType: project.feeType,
      feeCurrency: project.feeCurrency,
      scopeSummary: project.scopeSummary,
      phases: project.phases,
      donePhases: project.donePhases,
      goals: project.goals,
    },
    delivery: {
      metrics: project.metrics,
      tasks: project.tasks.map(({ deletedAt: _deletedAt, ...task }) => task),
      sprints: project.sprints.map(({ deletedAt: _deletedAt, ...sprint }) => sprint),
    },
    notes: project.notes.map(({ projectId: _projectId, deletedAt: _deletedAt, ...note }) => note),
    files: project.files.map(({ projectId: _projectId, deletedAt: _deletedAt, ...file }) => file),
    sessions: [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(session => ({
      id: session.id,
      appId: session.appId,
      appName: getApp(session.appId)?.name || session.appId,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      revision: session.revision,
      dataVersion: session.dataVersion,
      data: session.data,
    })),
  };
}

export function projectContextHtml(project: ProjectView, sessions: Session[]): string {
  const e = escapeHtml;
  const metrics = project.metrics;
  let html = `<div class="doc-header"><div class="doc-eyebrow">LLM Project Context Pack</div><h1 class="doc-title">${e(project.clientName)} — ${e(project.projectName || "Untitled Project")}</h1><div class="doc-meta"><span>${e(project.status)}</span><span>${formatDate(project.startDate)} → ${formatDate(project.targetEndDate)}</span><span>Generated ${new Date().toLocaleDateString()}</span></div></div>`;
  html += `<h2>Project Brief</h2><div class="grid-2"><div class="field"><div class="field-label">Client</div><div class="field-value">${e(project.clientName)}</div></div><div class="field"><div class="field-label">Commercial</div><div class="field-value">${e(formatCurrency(project.fee, project.feeCurrency))} · ${e(project.feeType)}</div></div></div><div class="field"><div class="field-label">Scope</div><div class="field-value">${e(project.scopeSummary || "No scope summary recorded.")}</div></div>`;
  if (project.goals.length) html += `<h3>Goals / Success Criteria</h3><ul>${project.goals.map(g => `<li>${e(g)}</li>`).join("")}</ul>`;
  if (project.phases.length) html += `<h3>Project Phases</h3><table><thead><tr><th>#</th><th>Phase</th><th>Status</th></tr></thead><tbody>${project.phases.map((p, i) => `<tr><td>${i + 1}</td><td>${e(p)}</td><td>${i < project.donePhases ? "Complete" : "Open"}</td></tr>`).join("")}</tbody></table>`;
  html += `<h2>Delivery State</h2><div class="field"><div class="field-value"><strong>${metrics.done}/${metrics.total}</strong> tasks done · <strong>${metrics.pointsDone}/${metrics.points}</strong> points · <strong>${metrics.active}</strong> in flight · <strong>${metrics.overdue}</strong> overdue</div></div>`;
  for (const status of TASK_COLUMNS) {
    const tasks = project.tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
    if (!tasks.length) continue;
    html += `<h3>${TASK_COLUMN_META[status].label} (${tasks.length})</h3><table><thead><tr><th>Task</th><th>Priority</th><th>Assignee</th><th>Due</th><th>Points</th></tr></thead><tbody>${tasks.map(t => `<tr><td><strong>${e(t.title)}</strong>${t.description ? `<div style="font-size:11px;color:#535862">${e(t.description)}</div>` : ""}</td><td>${e(t.priority)}</td><td>${e(t.assignee || "Unassigned")}</td><td>${e(t.dueDate || "—")}</td><td>${t.estimate || "—"}</td></tr>`).join("")}</tbody></table>`;
  }
  if (project.sprints.length) {
    html += `<h2>Sprints</h2>`;
    for (const sprint of project.sprints) {
      const tasks = project.tasks.filter(t => t.sprintId === sprint.id);
      const done = tasks.filter(t => t.status === "done");
      const points = tasks.reduce((n, t) => n + t.estimate, 0);
      const pointsDone = done.reduce((n, t) => n + t.estimate, 0);
      html += `<h3>${e(sprint.name)} · ${e(sprint.status)}</h3>${sprint.goal ? `<div class="field"><div class="field-label">Sprint goal</div><div class="field-value">${e(sprint.goal)}</div></div>` : ""}<p>${formatDate(sprint.startDate)} → ${formatDate(sprint.endDate)} · ${done.length}/${tasks.length} tasks · ${pointsDone}/${points} points</p>`;
    }
  }
  if (project.notes.length) html += `<h2>Project Notes</h2>${project.notes.map(n => `<div class="field"><div class="field-label">${e(n.author)} · ${formatDateTime(n.createdAt)}</div><div class="field-value">${e(n.body)}</div></div>`).join("")}`;
  if (project.files.length) html += `<h2>File Register</h2><table><thead><tr><th>File</th><th>Metadata</th><th>Type</th><th>Size</th></tr></thead><tbody>${project.files.map(f => `<tr><td><strong>${e(f.name)}</strong></td><td>${e(f.meta)}</td><td>${e(f.mimeType || "—")}</td><td>${f.size ? f.size.toLocaleString() + " bytes" : "—"}</td></tr>`).join("")}</tbody></table>`;
  html += `<h2>Structured Session Outputs</h2>`;
  const ordered = [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (!ordered.length) html += `<p><em>No sessions have been recorded.</em></p>`;
  ordered.forEach((s, i) => {
    const app = getApp(s.appId);
    html += `<h2>${i + 1}. ${e(s.title || app?.name || "Session")}</h2><p style="color:#535862;font-size:11px;text-transform:uppercase">${e(app?.name || s.appId)} · ${formatDateTime(s.updatedAt)} · revision ${s.revision}</p>${renderAppBody(s.appId, s.data)}`;
  });
  return html;
}