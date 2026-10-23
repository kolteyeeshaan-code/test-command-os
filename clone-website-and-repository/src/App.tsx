import { useEffect, useState, type ReactNode } from "react";
import { parseHash, titleFor, type Page } from "./nav";
import { StoreProvider, useStore } from "./store";
import { ToastProvider, useToast } from "./toast";
import { useGlobalKeydown } from "./hooks";
import { CommandPalette } from "./components/CommandPalette";
import { Welcome } from "./pages/Welcome";
import { CommandCenter } from "./pages/CommandCenter";
import { Projects } from "./pages/Projects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { ProjectBoard } from "./pages/ProjectBoard";
import { ProjectSprints } from "./pages/ProjectSprints";
import { ProjectForm } from "./pages/ProjectForm";
import { AppRegistry } from "./pages/AppRegistry";
import { AppSession } from "./pages/AppSession";
import { NotesPage } from "./pages/NotesPage";
import { DataPage } from "./pages/DataPage";

function Router() {
  const [page, setPage] = useState<Page>(() => parseHash());
  const [routeKey, setRouteKey] = useState(() => window.location.hash.split("?")[0]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const store = useStore();
  const toast = useToast();

  useEffect(() => {
    const onHash = () => { setPage(parseHash()); setRouteKey(window.location.hash.split("?")[0]); };
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = titleFor(page);
    window.scrollTo(0, 0);
  }, [page]);

  // One-time boot notices (migration / recovery) and persistent write failures.
  useEffect(() => {
    if (store.bootNotice) toast.show(store.bootNotice, { tone: "warning", duration: 7000 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (store.persistError) toast.show(store.persistError, { tone: "error", duration: 9000, action: { label: "Open Data", onClick: () => { window.location.hash = "/data"; } } });
  }, [store.persistError, toast]);

  // ⌘K / Ctrl+K anywhere; the Topbar button dispatches the same custom event.
  useGlobalKeydown(e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(o => !o); }
  });
  useEffect(() => {
    const open = () => setPaletteOpen(true);
    window.addEventListener("cs:palette", open);
    return () => window.removeEventListener("cs:palette", open);
  }, []);

  let view: ReactNode;
  switch (page.id) {
    case "welcome":      view = <Welcome />; break;
    case "home":         view = <CommandCenter />; break;
    case "projects":     view = <Projects />; break;
    case "project-new":  view = <ProjectForm />; break;
    case "project":        view = <ProjectDetail projectId={page.projectId} />; break;
    case "project-board":  view = <ProjectBoard projectId={page.projectId} />; break;
    case "project-sprints": view = <ProjectSprints projectId={page.projectId} />; break;
    case "project-edit":   view = <ProjectForm projectId={page.projectId} />; break;
    case "project-app":  view = <AppSession appId={page.appId} projectId={page.projectId} sessionId={page.sessionId} />; break;
    case "apps":         view = <AppRegistry />; break;
    case "app":          view = <AppSession appId={page.appId} sessionId={page.sessionId} />; break;
    case "notes":        view = <NotesPage />; break;
    case "data":         view = <DataPage />; break;
    default:             view = <Welcome />;
  }

  return (
    <>
      {/* Keyed on the route so each page mounts fresh and fades in; AppSession relies on this to reload per session. */}
      <div key={routeKey} className="page-enter">{view}</div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} page={page} />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </StoreProvider>
  );
}
