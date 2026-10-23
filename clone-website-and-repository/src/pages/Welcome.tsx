import { Logo } from "../icons";

export function Welcome() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-white">
      <div className="login-grid pointer-events-none absolute -top-[208px] left-1/2 h-[768px] w-[768px] -translate-x-1/2" />
      <div className="oym-fade relative z-10 flex flex-col items-center gap-12 px-8 text-center">
        <Logo className="block h-8 w-[111px]" />
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-subtitle">Project &amp; Session Suite</p>
          <h1 className="text-[36px] font-normal leading-[40px] tracking-[-0.04em] text-title sm:text-[48px] sm:leading-[48px]">
            Brand &amp; Design<br />Consultancy
          </h1>
        </div>
        <a href="#/home" className="inline-flex items-center rounded-full border border-ink bg-ink px-7 py-3 text-[13px] font-medium uppercase tracking-[0.06em] text-white transition hover:bg-white hover:text-ink">
          Enter Suite
        </a>
        <p className="text-xs text-subtitle/60">Local-first · Live sessions · Clean exports</p>
      </div>
    </div>
  );
}
