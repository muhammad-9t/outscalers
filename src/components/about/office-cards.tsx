"use client";

import { useSyncExternalStore } from "react";
import { MapPin, Navigation, Phone } from "lucide-react";
import { Flag } from "@/components/ui/brand-icons";
import { siteConfig } from "@/lib/site";

/** IANA time zone of each office, for the live local clock */
const ZONES: Record<string, string> = {
  Germany: "Europe/Berlin",
  Italy: "Europe/Rome",
  "Hong Kong": "Asia/Hong_Kong",
  Pakistan: "Asia/Karachi",
};

const TICK = 30_000;
const subscribeClock = (onChange: () => void) => {
  const t = window.setInterval(onChange, TICK / 3);
  return () => window.clearInterval(t);
};

/** Local time and whether it is office hours (Mon–Fri, 9:00–18:00) there */
function localNow(zone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = Number(get("hour"));
  const open = !["Sat", "Sun"].includes(get("weekday")) && hour >= 9 && hour < 18;
  return { time: `${get("hour")}:${get("minute")}`, open };
}

/**
 * About "Where we are": one card per office with its flag, address, phone, a directions link and a
 * live local clock that shows whether the team there is in office hours. The clock appears after
 * the page loads (so the server and browser render the same HTML). Styles: .oc-* in globals.css.
 */
export function OfficeCards() {
  // A clock as an external store: ticks every 30 s; null on the server so hydration matches
  const tick = useSyncExternalStore(subscribeClock, () => Math.floor(Date.now() / TICK), () => null);
  const now = tick === null ? null : new Date(tick * TICK);

  return (
    <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {siteConfig.offices.map((o) => {
        const zone = ZONES[o.country];
        const local = now && zone ? localNow(zone, now) : null;
        return (
          <li key={o.country} className="oc-card">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5">
                <span className="oc-flag">
                  <Flag country={o.country} className="h-3.5 w-5 rounded-[3px]" />
                </span>
                <span>
                  <span className="block font-semibold text-fg">{o.country}</span>
                  <span className="block text-sm text-fg-muted">{o.city}</span>
                </span>
              </span>
              <span className="oc-time" data-open={local?.open ? "" : undefined} aria-live="off">
                {local ? (
                  <>
                    <span aria-hidden className="oc-dot" />
                    {local.time}
                  </>
                ) : (
                  "--:--"
                )}
              </span>
            </div>
            <p className="mt-1 text-right text-xs text-fg-subtle">{local ? (local.open ? "Open now" : "After hours") : "Local time"}</p>

            <address className="mt-3 flex gap-2 text-sm not-italic leading-relaxed text-fg-muted">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-fg-subtle" />
              {o.address}
            </address>

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="oc-action">
                <Phone aria-hidden className="size-3.5" /> {o.phone}
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="oc-action"
              >
                <Navigation aria-hidden className="size-3.5" /> Directions
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
