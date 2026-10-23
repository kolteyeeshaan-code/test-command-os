import { useState } from "react";
import { newProject, type Project, type FeeType, type ProjectStatus } from "../data";
import { VERTICAL_META, type AppVertical } from "../db/schema";
import { IconTrash, IconPlus, IconArrowLeft } from "../icons";
import { useStore } from "../store";
import { useToast } from "../toast";
import { Breadcrumb, Card, PageShell, PrimaryButton, GhostButton, SectionTitle, SelectField, TextArea, TextField, Topbar } from "../ui";

const FEE_TYPES: { value: FeeType; label: string }[] = [
  { value: "fixed", label: "Fixed" }, { value: "retainer", label: "Retainer" },
  { value: "value-based", label: "Value-based" }, { value: "hourly", label: "Hourly" },
];
const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" }, { value: "paused", label: "Paused" }, { value: "completed", label: "Completed" },
];
const VERTICAL_OPTIONS: { value: AppVertical; label: string }[] = (Object.keys(VERTICAL_META) as AppVertical[]).map(key => ({
  value: key,
  label: key === "micro_ma_matchmaking" ? "matchmaking+Consultancy" : VERTICAL_META[key].label,
}));

export function ProjectForm({ projectId }: { projectId?: string }) {
  const store = useStore();
  const toast = useToast();
  const editing = projectId ? store.state.projects.find(p => p.id === projectId) : undefined;
  // Copy only persisted Project fields — ProjectView also carries joined tasks/notes/files.
  const [p, setP] = useState<Project>(() => editing ? toEditableProject(editing) : newProject());
  const [newPhase, setNewPhase] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [error, setError] = useState("");

  const upd = <K extends keyof Project>(k: K, v: Project[K]) => setP(prev => ({ ...prev, [k]: v }));

  const save = () => {
    if (!p.clientName.trim()) { setError("Client name is required."); return; }
    if (p.startDate && p.targetEndDate && p.targetEndDate < p.startDate) { setError("Target end date must be on or after the start date."); return; }
    setError("");
    if (editing) {
      store.updateProject(p.id, p);
      toast.show("Project updated", { tone: "success" });
      window.location.hash = "/project/" + p.id;
    } else {
      const created = store.createProject(p);
      toast.show("Project created", { tone: "success" });
      window.location.hash = "/project/" + created.id;
    }
  };

  const addPhase = () => {
    if (!newPhase.trim()) return;
    upd("phases", [...p.phases, newPhase.trim()]);
    setNewPhase("");
  };
  const removePhase = (i: number) => {
    const phases = p.phases.filter((_, idx) => idx !== i);
    upd("phases", phases);
    if (p.donePhases > phases.length) upd("donePhases", phases.length);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    upd("goals", [...p.goals, newGoal.trim()]);
    setNewGoal("");
  };
  const removeGoal = (i: number) => upd("goals", p.goals.filter((_, idx) => idx !== i));

  const backHref = editing ? "#/project/" + p.id : "#/projects";

  return (
    <PageShell>
      <Topbar current="projects" />
      <Breadcrumb items={[
        { label: "Projects", href: "#/projects" },
        ...(editing ? [{ label: editing.clientName, href: "#/project/" + editing.id }] : []),
        { label: editing ? "Edit" : "New Project" },
      ]} />

      <div className="relative z-10 mx-auto max-w-[860px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[13px] font-medium uppercase tracking-[0.06em] text-subtitle">{editing ? "Edit Project" : "New Project"}</p>
            <h1 className="text-[36px] font-normal leading-[38px] tracking-[-0.04em] sm:text-[44px]">
              {editing ? p.clientName || "Untitled Client" : "Create a project"}
            </h1>
          </div>
          <GhostButton href={backHref}><IconArrowLeft size={14} /> Cancel</GhostButton>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="bg-white">
            <SectionTitle>Basics</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <TextField label="Client Name *" value={p.clientName} onChange={v => upd("clientName", v)} placeholder="Acme Corp" />
              <TextField label="Project Name" value={p.projectName} onChange={v => upd("projectName", v)} placeholder="Brand Identity Redesign" />
              <SelectField label="Status" value={p.status} onChange={v => upd("status", v)} options={STATUSES} />
              <SelectField label="Project Vertical" value={p.vertical || ""} onChange={v => upd("vertical", v as AppVertical)} options={VERTICAL_OPTIONS} />
              <TextField label="Start Date" value={p.startDate} onChange={v => upd("startDate", v)} type="date" />
              <TextField label="Target End Date" value={p.targetEndDate} onChange={v => upd("targetEndDate", v)} type="date" />
            </div>
            <div className="mt-4">
              <TextArea label="Scope Summary" value={p.scopeSummary} onChange={v => upd("scopeSummary", v)} placeholder="Brief description of what this project covers…" rows={3} />
            </div>
          </Card>

          <Card className="bg-white">
            <SectionTitle>Commercials</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <TextField label="Fee Amount" value={String(p.fee || "")} onChange={v => upd("fee", +v || 0)} type="number" placeholder="0" />
              <SelectField label="Fee Type" value={p.feeType} onChange={v => upd("feeType", v)} options={FEE_TYPES} />
              <TextField label="Currency" value={p.feeCurrency} onChange={v => upd("feeCurrency", v)} placeholder="USD" />
            </div>
            <p className="mt-2 text-[11px] text-subtitle">Display only. This suite does not handle invoicing.</p>
          </Card>

          <Card className="bg-white">
            <SectionTitle>Phases &amp; Progress</SectionTitle>
            <p className="mt-2 mb-4 text-[12px] text-subtitle">Each phase is a step in the progress bar. Drag order is not supported yet — remove and re-add if you need to reorder.</p>

            <div className="mb-4 flex flex-col gap-2">
              {p.phases.map((phase, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2">
                  <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-subtitle">{String(i+1).padStart(2,"0")}</span>
                  <input value={phase} onChange={e => upd("phases", p.phases.map((x, idx) => idx === i ? e.target.value : x))} className="flex-1 bg-transparent text-sm outline-none" />
                  <button onClick={() => removePhase(i)} className="text-ink/30 hover:text-red-500"><IconTrash size={14} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newPhase} onChange={e => setNewPhase(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPhase(); } }} placeholder="Add a phase…" className="flex-1 rounded-lg border border-dashed border-[rgba(117,117,117,0.25)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                <button onClick={addPhase} className="inline-flex items-center gap-1 rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.06em] hover:border-ink"><IconPlus size={12} /> Add</button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Completed phases: {p.donePhases} / {p.phases.length}</label>
                <input type="range" min={0} max={p.phases.length} value={p.donePhases} onChange={e => upd("donePhases", +e.target.value)} className="w-full accent-ink" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.06em] text-subtitle">Target marker (Soll): {p.sollPct}%</label>
                <input type="range" min={0} max={100} value={p.sollPct} onChange={e => upd("sollPct", +e.target.value)} className="w-full accent-ink" />
              </div>
            </div>
          </Card>

          <Card className="bg-white">
            <SectionTitle>Goals &amp; Success Criteria</SectionTitle>
            <div className="mt-4 flex flex-col gap-2">
              {p.goals.map((g, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-[rgba(117,117,117,0.15)] bg-white px-3 py-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ink" />
                  <input value={g} onChange={e => upd("goals", p.goals.map((x, idx) => idx === i ? e.target.value : x))} className="flex-1 bg-transparent text-sm outline-none" />
                  <button onClick={() => removeGoal(i)} className="text-ink/30 hover:text-red-500"><IconTrash size={14} /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGoal(); } }} placeholder="Add a goal or success criterion…" className="flex-1 rounded-lg border border-dashed border-[rgba(117,117,117,0.25)] bg-white px-3 py-2 text-sm outline-none focus:border-ink" />
                <button onClick={addGoal} className="inline-flex items-center gap-1 rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.06em] hover:border-ink"><IconPlus size={12} /> Add</button>
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-3 py-2">
            {error && <p className="mr-auto text-[12px] font-medium text-[#b3001b]" role="alert">{error}</p>}
            <GhostButton href={backHref}>Cancel</GhostButton>
            <PrimaryButton onClick={save}>{editing ? "Save Changes" : "Create Project"}</PrimaryButton>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function toEditableProject(p: Project): Project {
  return {
    id: p.id,
    clientName: p.clientName,
    projectName: p.projectName,
    status: p.status,
    startDate: p.startDate,
    targetEndDate: p.targetEndDate,
    fee: p.fee,
    feeType: p.feeType,
    feeCurrency: p.feeCurrency,
    vertical: p.vertical,
    scopeSummary: p.scopeSummary,
    phases: [...p.phases],
    donePhases: p.donePhases,
    sollPct: p.sollPct,
    goals: [...p.goals],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    deletedAt: p.deletedAt ?? null,
  };
}
