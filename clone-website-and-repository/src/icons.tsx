import type { SVGProps } from "react";
import { cn } from "./utils/cn";
type P = SVGProps<SVGSVGElement> & { size?: number };
type IconComponent = React.ComponentType<P>;
const b = (p: P) => { const { size = 24, ...r } = p; return { width: size, height: size, ...r }; };

// Shared stroke attributes
const S = {
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// ── App catalog icons (monochrome line-style, matching existing UI icons) ──

export function IconPains(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 4v16M4 12h16M7 7l10 10M17 7L7 17" {...S} /></svg>; }
export function IconGains(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="12" cy="12" r="9" {...S} /><circle cx="12" cy="12" r="5" {...S} /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>; }
export function IconJobs(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" {...S} /></svg>; }
export function IconDay(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="12" cy="12" r="9" {...S} /><path d="M12 7v5l3 2M3 12h2M21 12h-2M12 3v2M12 19v2" {...S} /></svg>; }
export function IconJourney(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M3 17c3-6 6-6 9 0s6 6 9 0" {...S} /><circle cx="3" cy="17" r="2" {...S} /><circle cx="12" cy="17" r="2" {...S} /><circle cx="21" cy="17" r="2" {...S} /></svg>; }
export function IconMic(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><rect x="9" y="3" width="6" height="11" rx="3" {...S} /><path d="M5 12a7 7 0 0014 0M12 19v3M8 22h8" {...S} /></svg>; }
export function IconWhyBuy(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M9.5 2a2.5 2.5 0 010 5c-2 0-3 1.5-3 3s1 3 3 3v3h5v-3c2 0 3-1.5 3-3s-1-3-3-3a2.5 2.5 0 010-5" {...S} /></svg>; }
export function IconChart(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M4 20h16M6 16v-6m4 6V8m4 8v-4m4 4V4" {...S} /></svg>; }
export function IconDiamond(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M6 3h12l4 7-10 11L2 10l4-7zM6 3l-4 7h20L18 3M12 21l-4-11h8" {...S} /></svg>; }
export function IconCanvas(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><rect x="3" y="4" width="18" height="16" rx="2" {...S} /><path d="M3 10h18M9 4v16" {...S} /></svg>; }
export function IconSparkle(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.5 5.5l3 3M15.5 15.5l3 3M5.5 18.5l3-3M15.5 8.5l3-3" {...S} /></svg>; }
export function IconCompass(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="12" cy="12" r="9" {...S} /><polygon points="15,9 11,11 9,15 13,13" {...S} /></svg>; }
export function IconScale(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 4v17M4 7l8-3 8 3M4 7l-2 7h4l2-7M20 7l-2 7h-4l-2-7" {...S} /></svg>; }
export function IconGlobe(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="12" cy="12" r="9" {...S} /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...S} /></svg>; }
export function IconWrench(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M14.7 6.3a4 4 0 005 5l-8.1 8.1a2 2 0 01-3 0l-1-1a2 2 0 010-3l2-2a2 2 0 010-3l3-3a2 2 0 013 0l1 1a2 2 0 010 3l-1 1" {...S} /></svg>; }
export function IconMedal(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 15a6 6 0 100-12 6 6 0 000 12z" {...S} /><path d="M8 21l4-6 4 6" {...S} /></svg>; }
export function IconWarning(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 3L2 21h20L12 3z" {...S} /><path d="M12 10v5M12 18v.01" {...S} /></svg>; }
export function IconDoc(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" {...S} /><path d="M14 2v6h6M8 13h8M8 17h5" {...S} /></svg>; }
export function IconPalette(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 2a10 10 0 000 20c1 0 2-1 2-2 0-.6-.4-1-1-1.4a2 2 0 01-1-1.6c0-1 1-2 2-2h2a5 5 0 005-5c0-6-4-10-9-10z" {...S} /><circle cx="7.5" cy="10.5" r="1" fill="currentColor" /><circle cx="11" cy="7" r="1" fill="currentColor" /><circle cx="15.5" cy="9" r="1" fill="currentColor" /></svg>; }
export function IconEye(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" {...S} /><circle cx="12" cy="12" r="3" {...S} /></svg>; }
export function IconStar(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" {...S} /></svg>; }
export function IconPillar(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M6 3h12v4H6zM8 7v14M16 7v14M4 21h16" {...S} /></svg>; }
export function IconLock(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><rect x="5" y="11" width="14" height="10" rx="2" {...S} /><path d="M8 11V7a4 4 0 118 0v4" {...S} /></svg>; }
export function IconBook(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M4 19V5a2 2 0 012-2h14v16H6a2 2 0 00-2 2zM4 19c1-1 2-2 4-2h12" {...S} /></svg>; }
export function IconMicrophone(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3z" {...S} /><path d="M5 10a7 7 0 0014 0M12 17v5M8 22h8" {...S} /></svg>; }
export function IconClipboard(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M9 5H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" {...S} /><rect x="9" y="3" width="6" height="4" rx="1" {...S} /><path d="M9 12h6M9 16h4" {...S} /></svg>; }
export function IconImage(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><rect x="3" y="3" width="18" height="18" rx="2" {...S} /><circle cx="8.5" cy="8.5" r="1.5" {...S} /><path d="M21 15l-5-5L5 21" {...S} /></svg>; }
export function IconRuler(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M3 17L17 3l4 4L7 21l-4-4zM7 17l3-3M11 13l3-3M15 9l1-1" {...S} /></svg>; }
export function IconPen(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M17 3a2.8 2.8 0 014 4L7 21H3v-4L17 3z" {...S} /></svg>; }
export function IconLink(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" {...S} /></svg>; }
export function IconFiles(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" {...S} /><path d="M14 2v6h6M16 18H8M16 14H8M10 22v-6" {...S} /></svg>; }
export function IconPuzzle(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M10 3H5a2 2 0 00-2 2v5h3a2 2 0 110 4H3v5a2 2 0 002 2h5v-3a2 2 0 114 0v3h5a2 2 0 002-2v-5h-3a2 2 0 110-4h3V5a2 2 0 00-2-2h-5v3a2 2 0 11-4 0V3z" {...S} /></svg>; }
export function IconHandshake(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M2 10l4-4 4 4-2 2 2 2 4-4 4 4-2 2 2 2M7 6l2-2M15 10l2-2" {...S} /></svg>; }
export function IconCheckSquare(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><rect x="3" y="3" width="18" height="18" rx="2" {...S} /><path d="M7 12l3 3 7-7" {...S} /></svg>; }
export function IconWorld(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="10.5" cy="14" r="7.5" {...S} /><path d="M3 14h15M10.5 6.5c3 3 3 12 0 15M10.5 6.5c-3 3-3 12 0 15" {...S} /><path d="M18.5 2.5v4M16.5 4.5h4" {...S} /></svg>; }
export function IconTarget(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><circle cx="12" cy="12" r="9" {...S} /><circle cx="12" cy="12" r="5.5" {...S} /><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" /><path d="M12 1v3M12 20v3M1 12h3M20 12h3" {...S} /></svg>; }

// Registry icon key → component map
export const CATALOG_ICONS: Record<string, IconComponent> = {
  "pains": IconPains, "gains": IconGains, "jobs": IconJobs, "day": IconDay,
  "journey": IconJourney, "mic": IconMic, "why": IconWhyBuy, "chart": IconChart,
  "diamond": IconDiamond, "canvas": IconCanvas, "sparkle": IconSparkle, "compass": IconCompass,
  "scale": IconScale, "globe": IconGlobe, "wrench": IconWrench, "medal": IconMedal,
  "warning": IconWarning, "doc": IconDoc, "palette": IconPalette, "eye": IconEye,
  "star": IconStar, "pillar": IconPillar, "lock": IconLock, "book": IconBook,
  "microphone": IconMicrophone, "clipboard": IconClipboard, "image": IconImage,
  "ruler": IconRuler, "pen": IconPen, "link": IconLink, "files": IconFiles,
  "puzzle": IconPuzzle, "handshake": IconHandshake, "check": IconCheckSquare, "world": IconWorld, "target": IconTarget,
};

// ── Existing UI icons (unchanged) ──

export function IconArrowRight(p: P) { return <svg viewBox="0 0 16 16" fill="none" {...b({ size: 16, ...p })}><path d="M3.33 8h9.34M8 12.67L12.67 8 8 3.33" {...S} /></svg>; }
export function IconArrowLeft(p: P) { return <svg viewBox="0 0 16 16" fill="none" {...b({ size: 16, ...p })}><path d="M12.67 8H3.33M8 3.33L3.33 8 8 12.67" {...S} /></svg>; }
export function IconArrowRight20(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M4.17 10h11.66M10 15.83L15.83 10 10 4.17" {...S} /></svg>; }
export function IconLogout(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M16 7l5 5-5 5M21 12H9M9 3H7.8a4.8 4.8 0 00-4.5 3 4.8 4.8 0 00-.3 1.8v8.4a4.8 4.8 0 00.3 1.8 4.8 4.8 0 004.5 3H9" {...S} /></svg>; }
export function IconHome(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M7.5 18.33V10h5v8.33M2.5 7.5L10 1.67l7.5 5.83v9.17a1.67 1.67 0 01-1.67 1.66H4.17A1.67 1.67 0 012.5 16.67V7.5z" {...S} /></svg>; }
export function IconChevronRight(p: P) { return <svg viewBox="0 0 16 16" fill="none" {...b({ size: 16, ...p })}><path d="M6 12l4-4-4-4" {...S} /></svg>; }
export function IconFile(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M16.67 7.5L10.83 1.67H5a1.67 1.67 0 00-1.67 1.66v13.34A1.67 1.67 0 005 18.33h10a1.67 1.67 0 001.67-1.66V7.5zM10.83 1.67v5.83h5.84" {...S} /></svg>; }
export function IconDownload(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M17.5 12.5v3.33a1.67 1.67 0 01-1.67 1.67H4.17a1.67 1.67 0 01-1.67-1.67V12.5M14.17 8.33L10 12.5 5.83 8.33M10 12.5v-10" {...S} /></svg>; }
export function IconUpload(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M17.5 12.5v3.33a1.67 1.67 0 01-1.67 1.67H4.17a1.67 1.67 0 01-1.67-1.67V12.5M5.83 6.67L10 2.5l4.17 4.17M10 2.5v10" {...S} /></svg>; }
export function IconChat(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" {...S} /></svg>; }
export function IconCheck(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M20 6L9 17l-5-5" {...S} /></svg>; }
export function IconFolder(p: P) { return <svg viewBox="0 0 24 24" fill="none" {...b(p)}><path d="M3 7V17a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2H11L9 6H5a2 2 0 00-2 2z" {...S} /></svg>; }
export function IconPlus(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M10 4.17v11.66M4.17 10h11.66" {...S} /></svg>; }
export function IconTrash(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M2.5 5h15M6.67 5V3.33a1.67 1.67 0 011.66-1.66h3.34a1.67 1.67 0 011.66 1.66V5m2.5 0v11.67a1.67 1.67 0 01-1.66 1.66H5.83a1.67 1.67 0 01-1.66-1.66V5h11.66z" {...S} /></svg>; }
export function IconSearch(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M17.5 17.5l-3.63-3.63m1.96-4.7a6.67 6.67 0 11-13.33 0 6.67 6.67 0 0113.33 0z" {...S} /></svg>; }
export function IconGrip(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><circle cx="7" cy="5" r="1.4" fill="currentColor" stroke="none" /><circle cx="13" cy="5" r="1.4" fill="currentColor" stroke="none" /><circle cx="7" cy="10" r="1.4" fill="currentColor" stroke="none" /><circle cx="13" cy="10" r="1.4" fill="currentColor" stroke="none" /><circle cx="7" cy="15" r="1.4" fill="currentColor" stroke="none" /><circle cx="13" cy="15" r="1.4" fill="currentColor" stroke="none" /></svg>; }
export function IconPrint(p: P) { return <svg viewBox="0 0 20 20" fill="none" {...b({ size: 20, ...p })}><path d="M5 7.5V1.67h10V7.5M5 15H3.33a1.67 1.67 0 01-1.66-1.67v-3.33a1.67 1.67 0 011.66-1.67h13.34a1.67 1.67 0 011.66 1.67v3.33A1.67 1.67 0 0116.67 15H15m-10 0h10v3.33H5V15z" {...S} /></svg>; }

// Inlined so the mark renders without an external asset request (single-file build).
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      <span className="font-[family-name:var(--font-sans)] text-[20px] font-bold uppercase tracking-[-0.03em] text-ink">
        EKC <span className="font-normal opacity-50">OS</span>
      </span>
    </div>
  );
}
