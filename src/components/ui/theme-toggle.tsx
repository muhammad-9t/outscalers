"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

type Theme = "dark" | "light";

// Must match the key read by the bootstrap script in app/layout.tsx.
const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  listeners.forEach((l) => l());
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        "grid size-10 place-items-center rounded-lg border border-line-strong text-fg-muted transition-colors hover:border-brand-500/60 hover:text-fg lg:size-9",
        className,
      )}
    >
      {theme === "dark" ? <Sun aria-hidden className="size-[1.1rem]" /> : <Moon aria-hidden className="size-[1.1rem]" />}
    </button>
  );
}
