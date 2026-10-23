import { cn } from "@/lib/cn";

/** Brand mark: an open "O" (human craft) extending into a connected node (AI). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden focusable="false">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#0f1622" stroke="#2a3647" />
      <path
        d="M17.5 23.6A7.6 7.6 0 1 1 22.9 13"
        fill="none"
        stroke="#eaf0f6"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M15.6 16.4 22.4 9.6" stroke="#ff700e" strokeWidth="2" strokeLinecap="round" />
      <circle cx="23.4" cy="8.6" r="2.6" fill="#ff700e" />
      <circle cx="15.6" cy="16.4" r="1.7" fill="#ffb27a" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.1rem] font-semibold tracking-tight text-fg">Outscalers</span>
        <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-brand-300/90">
          Human + AI Engineering
        </span>
      </span>
    </span>
  );
}
