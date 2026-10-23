export type Page =
  | { id: "welcome" }
  | { id: "home" }
  | { id: "projects" }
  | { id: "project-new" }
  | { id: "project"; projectId: string }
  | { id: "project-edit"; projectId: string }
  | { id: "project-board"; projectId: string }
  | { id: "project-sprints"; projectId: string }
  | { id: "project-app"; projectId: string; appId: string; sessionId?: string }
  | { id: "apps" }
  | { id: "app"; appId: string; sessionId?: string }
  | { id: "notes" }
  | { id: "data" };

export function parseHash(): Page {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const parts = raw.split("?")[0].split("/").filter(Boolean);
  if (parts.length === 0) return { id: "welcome" };
  switch (parts[0]) {
    case "home":
      return { id: "home" };
    case "projects":
      return { id: "projects" };
    case "new-project":
      return { id: "project-new" };
    case "project":
      if (parts[2] === "edit") return { id: "project-edit", projectId: parts[1] };
      if (parts[2] === "board") return { id: "project-board", projectId: parts[1] };
      if (parts[2] === "sprints") return { id: "project-sprints", projectId: parts[1] };
      if (parts[2] === "app" && parts[3]) return { id: "project-app", projectId: parts[1], appId: parts[3], sessionId: parts[4] };
      if (parts[1]) return { id: "project", projectId: parts[1] };
      return { id: "projects" };
    case "apps":
      return { id: "apps" };
    case "app":
      if (parts[1]) return { id: "app", appId: parts[1], sessionId: parts[2] };
      return { id: "apps" };
    case "notes":
      return { id: "notes" };
    case "data":
      return { id: "data" };
    default:
      return { id: "welcome" };
  }
}

/** The project a page belongs to, if any — used to keep tool launches attached to the right project. */
export function projectIdOf(page: Page): string | undefined {
  return page.id === "project" || page.id === "project-edit" || page.id === "project-app" || page.id === "project-board" || page.id === "project-sprints" ? page.projectId : undefined;
}

export function titleFor(page: Page): string {
  switch (page.id) {
    case "welcome": return "EKC OS";
    case "home": return "Command Center | EKC OS";
    case "projects": return "Projects | EKC OS";
    case "project-new": return "New Project | EKC OS";
    case "project": return "Project | EKC OS";
    case "project-edit": return "Edit Project | EKC OS";
    case "project-board": return "Board | EKC OS";
    case "project-sprints": return "Sprints | EKC OS";
    case "project-app": return "Session | EKC OS";
    case "apps": return "App Registry | EKC OS";
    case "app": return "App | EKC OS";
    case "notes": return "Notes | EKC OS";
    case "data": return "Data & Backup | EKC OS";
  }
}
