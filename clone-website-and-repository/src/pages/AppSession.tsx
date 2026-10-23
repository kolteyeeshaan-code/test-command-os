import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApp, generateId, relativeTime, formatDateTime } from "../data";
import { IconArrowLeft, IconPrint, IconDownload, IconLogout, IconDoc, IconClipboard, IconFile, CATALOG_ICONS } from "../icons";
import { useStore } from "../store";
import { dlJSON, openPrintView, docHeader, downloadPdf, downloadHtml, downloadText, markdownDocument, makeFilename, copyText } from "../export";
import { ExportMenu, type ExportAction } from "../components/ExportMenu";
import { useToast } from "../toast";
import { useBeforeUnload, useGlobalKeydown, useStuck, useTick, modKey } from "../hooks";
import { Kbd, PageShell } from "../ui";
import { cn } from "../utils/cn";
import { SCHEMA_VERSION } from "../db/schema";
import { CustomerPainsMapper } from "../apps/CustomerPainsMapper";
import { CustomerGainsMapper } from "../apps/CustomerGainsMapper";
import { HighValueJobsRanker } from "../apps/HighValueJobsRanker";
import { BusinessModelCanvas } from "../apps/BusinessModelCanvas";
import { CreativeBriefBuilder } from "../apps/CreativeBriefBuilder";
import { CollaborationScopeBuilder } from "../apps/CollaborationScopeBuilder";
import { BrandMindsetMapper } from "../apps/BrandMindsetMapper";
import { DesignCriteriaCanvas } from "../apps/DesignCriteriaCanvas";
import { DayInLifeWorksheet } from "../apps/DayInLifeWorksheet";
import { CustomerPersonaJourneyMap } from "../apps/PersonaJourneyMap";
import { DiscoverySessionRecorder } from "../apps/DiscoverySessionRecorder";
import { WhyTheyBuyAnalyser } from "../apps/WhyTheyBuyAnalyser";
import { SixWaysToInnovate } from "../apps/SixWaysToInnovate";
import { StrategicGuidanceFramework } from "../apps/StrategicGuidanceFramework";
import { ValuationMethodSelector } from "../apps/ValuationMethodSelector";
import { AsianBusinessModelClassifier } from "../apps/AsianBusinessModelClassifier";
import { ProblemSolvingWorkbook } from "../apps/ProblemSolvingWorkbook";
import { StyleScapeSessionRecorder } from "../apps/StyleScapeRecorder";
import { DesignCritiqueFacilitator } from "../apps/DesignCritiqueFacilitator";
import { LogoBrandReviewLogger } from "../apps/LogoReviewLogger";
import { FacilitationLogEntry } from "../apps/FacilitationLog";
import { ConsortiumBidBuilder } from "../apps/ConsortiumBidBuilder";
import { DPRConsulting } from "../apps/DPRConsulting";
import { InnovationProjectScorecard } from "../apps/InnovationScorecard";
import { DisruptionRiskAssessment } from "../apps/DisruptionRisk";
import { RealLuxuriesAudit } from "../apps/RealLuxuriesAudit";
import { FinancialResearchWorkbook, ContentPillarArchitect, SignatureContentStyleLocker, StorytellingFrameworkSelector, PitchNarrativeBuilder, StorytellingDesignChecklist, MoodboardingApp } from "../apps/contentTools";
import { BrandWorldCreator } from "../apps/BrandWorldCreator";
import { CampaignBriefAlignmentEvaluator } from "../apps/CampaignBriefAlignmentEvaluator";
import { MicroMASuite } from "../apps/MicroMASuite";
import { ValuationCalculator } from "../apps/ValuationCalculator";
import { InfraReConsortiumSuite } from "../apps/InfraReConsortiumSuite";
import { AcquisitionPipelineTracker } from "../apps/AcquisitionPipelineTracker";
import { ScaffoldedApp } from "../apps/ScaffoldedApp";
import { renderAppBody } from "../apps/printRenderers";

export interface AppProps {
  data: unknown;
  onChange: (d: unknown) => void;
  live?: boolean;
}

const COMPS: Record<string, React.ComponentType<AppProps>> = {
  "pains-mapper": CustomerPainsMapper,
  "gains-mapper": CustomerGainsMapper,
  "jobs-ranker": HighValueJobsRanker,
  "bmc": BusinessModelCanvas,
  "creative-brief": CreativeBriefBuilder,
  "scope-builder": CollaborationScopeBuilder,
  "brand-mindset": BrandMindsetMapper,
  "design-criteria": DesignCriteriaCanvas,
  "day-in-life": DayInLifeWorksheet,
  "persona-journey": CustomerPersonaJourneyMap,
  "discovery-recorder": DiscoverySessionRecorder,
  "why-buy": WhyTheyBuyAnalyser,
  "six-innovate": SixWaysToInnovate,
  "strategic-guidance": StrategicGuidanceFramework,
  "valuation-selector": ValuationMethodSelector,
  "asian-bm": AsianBusinessModelClassifier,
  "problem-solving": ProblemSolvingWorkbook,
  "style-scape": StyleScapeSessionRecorder,
  "design-critique": DesignCritiqueFacilitator,
  "logo-review": LogoBrandReviewLogger,
  "facilitation-log": FacilitationLogEntry,
  "consortium-bid": ConsortiumBidBuilder,
  "dpr-consulting": DPRConsulting,
  "innovation-scorecard": InnovationProjectScorecard,
  "disruption-risk": DisruptionRiskAssessment,
  "luxuries-audit": RealLuxuriesAudit,
  "financial-research": FinancialResearchWorkbook,
  "content-pillar": ContentPillarArchitect,
  "style-locker": SignatureContentStyleLocker,
  "story-framework": StorytellingFrameworkSelector,
  "pitch-narrative": PitchNarrativeBuilder,
  "story-checklist": StorytellingDesignChecklist,
  "moodboard": MoodboardingApp,
  "brand-world-creator": BrandWorldCreator,
  "campaign-brief-alignment": CampaignBriefAlignmentEvaluator,
  "universal-micro-ma-suite": MicroMASuite,
  "valuation-calculator": ValuationCalculator,
  "infra-re-consortium": InfraReConsortiumSuite,
  "acquisition-pipeline": AcquisitionPipelineTracker,
};

type SaveState = "clean" | "dirty" | "saved";
type SaveReason = "auto" | "manual" | "unmount";
const AUTOSAVE_MS = 1200;

export function AppSession({ appId, projectId, sessionId }: { appId: string; projectId?: string; sessionId?: string }) {
  const store = useStore();
  const toast = useToast();
  const app = getApp(appId);
  const project = projectId ? store.getProject(projectId) : undefined;

  // Resolve the session to load: explicit id, else the most recent one for (project, app).
  const existing = useMemo(() => {
    if (sessionId && sessionId !== "new") return store.getSession(sessionId);
    if (sessionId === "new") return undefined;
    if (projectId) return store.sessionsForProject(projectId).find(s => s.appId === appId);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, projectId, appId]);

  const [id] = useState(() => existing?.id ?? generateId());
  const [createdAt] = useState(() => existing?.createdAt ?? new Date().toISOString());
  const [title, setTitle] = useState(() => existing?.title ?? (app?.name ?? ""));
  const [data, setData] = useState<unknown>(() => existing?.data ?? {});
  const [live, setLive] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("clean");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(existing?.updatedAt ?? null);
  const [revision, setRevision] = useState(existing?.revision ?? 0);
  const [attachTo, setAttachTo] = useState("");

  // Latest values in refs so debounced/unmount saves never write stale state.
  const latest = useRef({ data, title });
  latest.current = { data, title };
  const dirtyRef = useRef(false);
  const storeRef = useRef(store);
  storeRef.current = store;
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useTick(saveState === "saved" ? 15000 : 0);
  const { sentinelRef, stuck } = useStuck();

  // Live-mode timer
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (!live) { startRef.current = null; return; }
    startRef.current = Date.now() - elapsed * 1000;
    const t = window.setInterval(() => { if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000)); }, 1000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const doSave = useCallback((reason: SaveReason) => {
    if (!app) return;
    const saved = storeRef.current.saveSession({
      id, appId, projectId: projectId ?? null,
      title: latest.current.title.trim() || app.name,
      createdAt,
      data: latest.current.data,
    });
    dirtyRef.current = false;
    setRevision(saved.revision);
    setLastSavedAt(saved.updatedAt);
    setSaveState("saved");
    // First save turns an ephemeral /new route into a durable, reloadable session URL
    // without remounting the editor or adding an extra history entry.
    if (!sessionId || sessionId === "new") {
      const durable = saved.projectId
        ? `#/project/${saved.projectId}/app/${saved.appId}/${saved.id}`
        : `#/app/${saved.appId}/${saved.id}`;
      window.history.replaceState(null, "", durable);
    }
    if (reason === "manual") toastRef.current.show("Session saved", { tone: "success" });
  }, [app, id, appId, projectId, createdAt, sessionId]);
  const saveRef = useRef(doSave);
  saveRef.current = doSave;

  const onChange = (d: unknown) => { setData(d); dirtyRef.current = true; setSaveState("dirty"); };
  const onTitle = (t: string) => { setTitle(t); dirtyRef.current = true; setSaveState("dirty"); };

  // Debounced autosave — restarts on every keystroke.
  useEffect(() => {
    if (saveState !== "dirty") return;
    const t = window.setTimeout(() => saveRef.current("auto"), AUTOSAVE_MS);
    return () => window.clearTimeout(t);
  }, [data, title, saveState]);

  // Flush pending edits when navigating away mid-debounce.
  useEffect(() => () => { if (dirtyRef.current) saveRef.current("unmount"); }, []);

  useBeforeUnload(saveState === "dirty");

  const [busy, setBusy] = useState<string | null>(null);

  // Build the printable document once, reused by print, PDF and HTML exports.
  const docParts = useCallback(() => {
    if (!app) return null;
    const proj = project ? { clientName: project.clientName, projectName: project.projectName } : null;
    const t = latest.current.title || app.name;
    return { proj, t, header: docHeader(app.name, proj, t), body: renderAppBody(app.id, latest.current.data) };
  }, [app, project]);

  const printPDF = useCallback(() => {
    const p = docParts(); if (!p) return;
    openPrintView(p.t, p.header + p.body);
  }, [docParts]);

  const doDownloadPdf = useCallback(async () => {
    const p = docParts(); if (!p) return;
    setBusy("Building PDF");
    try {
      await downloadPdf(makeFilename(project?.clientName, app?.name, p.t), p.t, p.header + p.body);
      toastRef.current.show("PDF downloaded", { tone: "success" });
    } catch (err) {
      console.error(err);
      toastRef.current.show("Could not generate the PDF. Try “Print dialog” → Save as PDF instead.", { tone: "error" });
    } finally {
      setBusy(null);
    }
  }, [docParts, project, app]);

  const exportJSON = useCallback(() => {
    if (!app) return;
    dlJSON(makeFilename(project?.clientName, app.name, title), {
      format: "consultancy-suite/session",
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      project: project ? {
        id: project.id,
        clientName: project.clientName,
        projectName: project.projectName,
        status: project.status,
        startDate: project.startDate,
        targetEndDate: project.targetEndDate,
        scopeSummary: project.scopeSummary,
        goals: project.goals,
      } : null,
      session: { id, appId, app: app.name, projectId: projectId ?? null, title, revision, createdAt, updatedAt: lastSavedAt },
      data,
    });
  }, [app, title, id, appId, projectId, project, revision, createdAt, lastSavedAt, data]);

  const doDownloadHtml = useCallback(() => {
    const p = docParts(); if (!p) return;
    downloadHtml(makeFilename(project?.clientName, app?.name, p.t), p.t, p.header + p.body);
  }, [docParts, project, app]);

  const mdDoc = useCallback(() => {
    if (!app) return "";
    return markdownDocument(app.name, project ? {
      clientName: project.clientName,
      projectName: project.projectName,
      status: project.status,
      startDate: project.startDate,
      targetEndDate: project.targetEndDate,
      scopeSummary: project.scopeSummary,
      goals: project.goals,
    } : null, latest.current.title || app.name, latest.current.data);
  }, [app, project]);

  const doDownloadMarkdown = useCallback(() => {
    const md = mdDoc(); if (!md) return;
    downloadText(makeFilename(project?.clientName, app?.name, latest.current.title || app?.name) + ".md", md, "text/markdown");
  }, [mdDoc, project, app]);

  const doCopyMarkdown = useCallback(async () => {
    const md = mdDoc(); if (!md) return;
    const ok = await copyText(md);
    toastRef.current.show(ok ? "Copied as Markdown" : "Could not copy to clipboard", { tone: ok ? "success" : "error" });
  }, [mdDoc]);

  const exportActions: ExportAction[] = [
    { id: "pdf", label: "Download PDF", hint: makeFilename(project?.clientName, app?.name, latest.current.title || app?.name) + ".pdf", primary: true, icon: <IconDownload size={15} />, onClick: doDownloadPdf },
    { id: "print", label: "Print dialog", hint: "System “Save as PDF”", kbd: modKey + "P", icon: <IconPrint size={15} />, onClick: printPDF },
    { id: "html", label: "Download HTML", hint: "Self-contained web page", icon: <IconDoc size={15} />, onClick: doDownloadHtml },
    { id: "md", label: "Download Markdown", hint: "Paste into docs or email", icon: <IconFile size={15} />, onClick: doDownloadMarkdown },
    { id: "copy", label: "Copy as Markdown", hint: "Copy to clipboard", icon: <IconClipboard size={15} />, onClick: doCopyMarkdown },
    { id: "json", label: "Download JSON", hint: "Structured data backup", icon: <IconDownload size={15} />, onClick: exportJSON },
  ];

  useGlobalKeydown(e => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && !e.shiftKey && e.key.toLowerCase() === "s") { e.preventDefault(); saveRef.current("manual"); }
    else if (mod && !e.shiftKey && e.key.toLowerCase() === "p") { e.preventDefault(); printPDF(); }
    else if (e.key === "Escape" && live) { setLive(false); }
  });

  const attach = () => {
    if (!attachTo) return;
    if (dirtyRef.current || !storeRef.current.getSession(id)) saveRef.current("auto");
    storeRef.current.attachSession(id, attachTo);
    const target = storeRef.current.getProject(attachTo);
    toastRef.current.show("Attached to " + (target?.clientName ?? "project"), { tone: "success" });
    window.location.hash = `/project/${attachTo}/app/${appId}/${id}`;
  };

  if (!app) return <PageShell><p>App not found. <a href="#/apps" className="underline">Back to app registry</a>.</p></PageShell>;

  const Comp = COMPS[appId] ?? ScaffoldedApp;
  const AppIcon = CATALOG_ICONS[app.icon];
  const closeHref = projectId ? "#/project/" + projectId : "#/apps";
  const fmtElapsed = () => `${Math.floor(elapsed / 60).toString().padStart(2, "0")}:${(elapsed % 60).toString().padStart(2, "0")}`;

  const saveLabel = saveState === "dirty" ? "Unsaved · save now" : lastSavedAt ? `Saved · ${relativeTime(lastSavedAt)}` : "Not saved yet";
  const saveDot = <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", saveState === "dirty" ? "animate-pulse bg-[#ff9f0a]" : lastSavedAt ? "bg-[#34c759]" : "bg-ink/25")} />;

  /* ── LIVE MODE ── */
  if (live) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="fixed top-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center justify-end gap-2 rounded-3xl border border-[rgba(117,117,117,0.2)] bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="font-[family-name:var(--font-roboto)] text-[13px] font-medium tabular-nums text-ink/60">{fmtElapsed()}</span>
          <span className="h-3 w-px bg-black/10" />
          <button type="button" onClick={() => doSave("manual")} title={`${modKey}+S`} className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink hover:opacity-70">
            {saveDot}{saveState === "dirty" ? "Save" : "Saved"}
          </button>
          <span className="h-3 w-px bg-black/10" />
          <button type="button" onClick={doDownloadPdf} title="Download PDF" aria-label="Download PDF" className="text-ink hover:opacity-70"><IconDownload size={13} /></button>
          <span className="h-3 w-px bg-black/10" />
          <button type="button" onClick={printPDF} title={`Print dialog · ${modKey}+P`} aria-label="Print dialog" className="text-ink hover:opacity-70"><IconPrint size={13} /></button>
          <span className="h-3 w-px bg-black/10" />
          <button type="button" onClick={() => setLive(false)} className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-ink hover:opacity-70">
            <IconLogout size={12} /> Exit Live <Kbd>Esc</Kbd>
          </button>
        </div>

        <div className="mx-auto max-w-[1400px] px-8 pt-16 pb-24">
          <div className="mb-8 flex items-center gap-4">
            {AppIcon && <AppIcon size={28} className="shrink-0 text-ink" />}
            <div className="min-w-0 flex-1">
              <p className="break-words text-[12px] font-bold uppercase leading-snug tracking-[0.08em] text-subtitle">{app.name}</p>
              {project && <p className="text-[15px] font-semibold leading-snug text-ink">{project.clientName} — {project.projectName}</p>}
            </div>
          </div>
          <Comp data={data} onChange={onChange} live />
        </div>
      </div>
    );
  }

  /* ── NORMAL MODE ── */
  return (
    <PageShell>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      {/* Session toolbar — sticks to the top on long tools so Save / Print never scroll away. */}
      <div className={cn("session-toolbar sticky top-0 z-30 -mx-5 mb-4 px-5 py-3 sm:-mx-8 sm:px-8 md:-mx-16 md:px-16", stuck && "is-stuck")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <a href={closeHref} className="shrink-0 text-ink/40 transition hover:text-ink" title="Close session"><IconArrowLeft size={20} /></a>
            {AppIcon && <AppIcon size={24} className="shrink-0 text-ink" />}
            <div className="min-w-0 flex-1">
              <p className="break-words text-[11px] font-bold uppercase leading-normal tracking-[0.06em] text-subtitle">
                {app.name}
                {project
                  ? <> · <a href={"#/project/" + project.id} className="underline decoration-dotted hover:text-ink">{project.clientName}</a></>
                  : <> · <span className="text-[#c77700]">unattached</span></>}
              </p>
              <input
                value={title}
                onChange={e => onTitle(e.target.value)}
                placeholder="Session title…"
                aria-label="Session title"
                className="w-full bg-transparent text-[22px] font-normal leading-snug tracking-[-0.03em] outline-none placeholder:text-black/25 sm:text-[26px]"
              />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button type="button" onClick={() => setLive(true)} className="inline-flex items-center gap-1.5 rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">Live Session</button>
            <button
              type="button"
              onClick={() => doSave("manual")}
              title={`Save · ${modKey}+S`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] transition",
                saveState === "dirty" ? "border-ink bg-ink/5 text-ink hover:bg-ink hover:text-white" : "border-[rgba(117,117,117,0.25)] text-subtitle hover:border-ink hover:text-ink"
              )}
            >
              {saveDot}{saveLabel}
            </button>
            <ExportMenu busy={busy ?? undefined} actions={exportActions} />
          </div>
        </div>
      </div>

      {!projectId && (
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(255,149,0,0.35)] bg-[rgba(255,149,0,0.08)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-ink">Unattached session</p>
            <p className="text-[12px] leading-5 text-subtitle">Sessions live inside projects. Attach this one so it shows up in the project's history and exports.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={attachTo} onChange={e => setAttachTo(e.target.value)} aria-label="Project to attach to" className="rounded-lg border border-[rgba(117,117,117,0.2)] bg-white px-3 py-1.5 text-[13px] outline-none focus:border-ink">
              <option value="">Choose a project…</option>
              {store.state.projects.map(p => <option key={p.id} value={p.id}>{p.clientName}{p.projectName ? ` — ${p.projectName}` : ""}</option>)}
            </select>
            <button type="button" onClick={attach} disabled={!attachTo} className={cn("rounded-full border border-ink bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink", !attachTo && "pointer-events-none opacity-40")}>Attach</button>
            <a href="#/new-project" className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink underline underline-offset-2 hover:opacity-70">New project</a>
          </div>
        </div>
      )}

      <p className="relative z-10 mb-6 text-[11px] uppercase tracking-[0.04em] text-subtitle">
        Created {formatDateTime(createdAt)}
        {lastSavedAt && <> · Last saved {formatDateTime(lastSavedAt)} · Rev {revision}</>}
        <span className="hidden sm:inline"> · <Kbd>{modKey}</Kbd><Kbd>S</Kbd> save · <Kbd>{modKey}</Kbd><Kbd>P</Kbd> print · <Kbd>{modKey}</Kbd><Kbd>K</Kbd> jump</span>
      </p>

      <div className="relative z-10">
        <Comp data={data} onChange={onChange} />
      </div>
    </PageShell>
  );
}
