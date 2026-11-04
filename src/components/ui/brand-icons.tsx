import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

// Brand marks (Lucide no longer ships them). Paths follow Simple Icons on a 24×24 grid.
const socialIcons: Record<string, (p: IconProps) => ReactNode> = {
  LinkedIn: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  ),
  Facebook: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  ),
  Instagram: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} {...p}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  YouTube: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  ),
};

export function SocialIcon({ name, ...props }: IconProps & { name: string }) {
  const Icon = socialIcons[name];
  return Icon ? <Icon aria-hidden {...props} /> : null;
}

// Country flags, drawn on a 3:2 canvas. Real flag colours, so no theme tokens here.
const flags: Record<string, ReactNode> = {
  Germany: (
    <>
      <rect width="30" height="20" fill="#000" />
      <rect y="6.67" width="30" height="6.67" fill="#dd0000" />
      <rect y="13.33" width="30" height="6.67" fill="#ffce00" />
    </>
  ),
  Italy: (
    <>
      <rect width="10" height="20" fill="#009246" />
      <rect x="10" width="10" height="20" fill="#fff" />
      <rect x="20" width="10" height="20" fill="#ce2b37" />
    </>
  ),
  "Hong Kong": (
    <>
      <rect width="30" height="20" fill="#de2910" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="15" cy="6.4" rx="1.7" ry="3.4" fill="#fff" transform={`rotate(${a} 15 10)`} />
      ))}
    </>
  ),
  Pakistan: (
    <>
      <rect width="30" height="20" fill="#01411c" />
      <rect width="7.5" height="20" fill="#fff" />
      <circle cx="19" cy="10.5" r="5.6" fill="#fff" />
      <circle cx="20.6" cy="9.1" r="4.8" fill="#01411c" />
      <polygon points="23,5.2 23.5,6.7 25.1,6.7 23.8,7.6 24.3,9.1 23,8.2 21.7,9.1 22.2,7.6 20.9,6.7 22.5,6.7" fill="#fff" />
    </>
  ),
};

export function Flag({ country, className }: { country: string; className?: string }) {
  const flag = flags[country];
  if (!flag) return null;
  return (
    <svg viewBox="0 0 30 20" aria-hidden className={className} style={{ borderRadius: 2 }}>
      {flag}
    </svg>
  );
}
