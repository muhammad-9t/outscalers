"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { mainNav } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { Logo } from "./logo";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const servicesMenuId = useId();
  const mobileMenuId = useId();

  // Close menus whenever the route changes (state adjusted during render, per React guidance).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes menus; clicks outside close the services dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
      if (servicesOpen) {
        setServicesOpen(false);
        servicesRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (servicesOpen && !servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [mobileOpen, servicesOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || mobileOpen
          ? "border-b border-line/80 bg-ink-900/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-site flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Link href="/" className="rounded-lg" aria-label="Outscalers — home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.slice(1).map((item) =>
              item.href === "/services" ? (
                <li
                  key={item.href}
                  ref={servicesRef}
                  className="relative"
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setServicesOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "rounded-lg py-2 pl-3 pr-1 text-sm font-medium transition-colors hover:text-fg",
                        isActive(pathname, item.href) ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      aria-expanded={servicesOpen}
                      aria-controls={servicesMenuId}
                      aria-label="Show service pages"
                      onClick={() => setServicesOpen((o) => !o)}
                      className="rounded-md p-1.5 text-fg-muted transition-colors hover:text-fg"
                    >
                      <ChevronDown
                        aria-hidden
                        className={cn("size-4 transition-transform duration-200", servicesOpen && "rotate-180")}
                      />
                    </button>
                  </div>
                  <div
                    id={servicesMenuId}
                    hidden={!servicesOpen}
                    className="absolute left-1/2 top-full w-[34rem] -translate-x-1/2 pt-3"
                  >
                    <div className="animate-fade-up overflow-hidden rounded-card border border-line-strong bg-ink-850 p-2 shadow-2xl shadow-black/60">
                      <ul className="grid grid-cols-2 gap-1">
                        {services.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={serviceHref(s.slug)}
                              aria-current={pathname === serviceHref(s.slug) ? "page" : undefined}
                              className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-ink-700/60"
                            >
                              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-line-strong bg-ink-800 text-brand-300 group-hover:border-brand-500/50">
                                <ServiceGlyph slug={s.slug} />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-fg">{s.title}</span>
                                <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-fg-subtle">
                                  {s.summary}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                        <li className="flex">
                          <Link
                            href="/services"
                            className="flex w-full items-center justify-between rounded-xl border border-dashed border-line-strong p-3 text-sm font-semibold text-brand-300 transition-colors hover:border-brand-500/60 hover:bg-ink-700/40"
                          >
                            All services
                            <ArrowRight aria-hidden className="size-4" />
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-fg",
                      isActive(pathname, item.href) ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {item.label}
                    {isActive(pathname, item.href) && (
                      <span aria-hidden className="absolute inset-x-3 -bottom-0.5 h-px bg-brand-400" />
                    )}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/contact" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Start a Project
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-line-strong text-fg lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
            {mobileOpen ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id={mobileMenuId}
        hidden={!mobileOpen}
        className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ink-900 lg:hidden"
      >
        <nav aria-label="Mobile" className="container-site animate-fade-up py-6">
          <ul className="space-y-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-3.5 font-display text-xl font-medium",
                    isActive(pathname, item.href) ? "bg-ink-800 text-fg" : "text-fg-muted",
                  )}
                >
                  {item.label}
                  {isActive(pathname, item.href) && <span aria-hidden className="size-1.5 rounded-full bg-brand-400" />}
                </Link>
                {item.href === "/services" && (
                  <ul className="mb-2 ml-3 grid gap-0.5 border-l border-line pl-3">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={serviceHref(s.slug)}
                          aria-current={pathname === serviceHref(s.slug) ? "page" : undefined}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-[0.9375rem] text-fg-muted aria-[current=page]:text-brand-300"
                        >
                          <ServiceGlyph slug={s.slug} className="size-4 text-brand-400" />
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn btn-primary mt-6 w-full">
            Start a Project
          </Link>
        </nav>
      </div>
    </header>
  );
}
