"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { mainNav } from "@/lib/site";
import { services, serviceHref } from "@/content/services";
import { ServiceGlyph } from "@/components/illustrations/service-glyph";
import { Logo } from "./logo";
// Theme switcher (dark default, light via html[data-theme="light"]).
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Active nav marker: dev-tools style selection corners (top-left and bottom-right). Parent must be relative. */
function ActiveCorners() {
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 size-2 rounded-tl-[3px] border-l-2 border-t-2 border-brand-400" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 size-2 rounded-br-[3px] border-b-2 border-r-2 border-brand-400" />
    </>
  );
}

/** A nav label with two coloured copies that slice and shift while its link is hovered (see .nav-glitch). */
function GlitchLabel({ text }: { text: string }) {
  return (
    <span className="nav-glitch">
      {text}
      <span aria-hidden className="nav-glitch-a">
        {text}
      </span>
      <span aria-hidden className="nav-glitch-b">
        {text}
      </span>
    </span>
  );
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
      data-site-header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter,transform] duration-300",
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
                  <div className={cn("relative flex items-center", !isActive(pathname, item.href) && "nav-holo rounded-lg")}>
                    {isActive(pathname, item.href) && <ActiveCorners />}
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className={cn(
                        "rounded-lg py-2 pl-3 pr-1 text-sm font-medium transition-colors hover:text-fg",
                        isActive(pathname, item.href) ? "text-fg" : "text-fg-muted",
                      )}
                    >
                      <GlitchLabel text={item.label} />
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
                    className="absolute left-1/2 top-full w-[42rem] -translate-x-1/2 pt-3"
                  >
                    <div className="animate-fade-up grid grid-cols-[1.35fr_1fr] gap-2 overflow-hidden rounded-card border border-line-strong bg-ink-850 p-2 shadow-2xl shadow-black/60">
                      <ul className="grid gap-0.5">
                        {services.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={serviceHref(s.slug)}
                              aria-current={pathname === serviceHref(s.slug) ? "page" : undefined}
                              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink-700/60 aria-[current=page]:bg-ink-700/50"
                            >
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-strong bg-ink-800 text-brand-300 transition-colors group-hover:border-brand-500/50">
                                <ServiceGlyph slug={s.slug} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-fg">{s.title}</span>
                                <span className="block truncate text-xs text-fg-subtle">{s.tagline}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {/* Feature panel */}
                      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-linear-to-br from-brand-500/15 via-ink-800 to-ink-800 p-5">
                        <div aria-hidden className="bg-dots pointer-events-none absolute inset-0 opacity-25" />
                        <div className="relative">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-300">Human + AI services</p>
                          <p className="mt-3 font-display text-lg font-semibold leading-snug text-fg">
                            One team for software, AI, automation, data and security.
                          </p>
                          <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                            Experienced engineers, accelerated by AI, accountable for every release.
                          </p>
                        </div>
                        <div className="relative mt-6 space-y-2">
                          <Link
                            href="/services"
                            className="flex items-center justify-between rounded-lg bg-brand-400 px-3 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-300 [[data-theme=light]_&]:hover:bg-brand-500"
                          >
                            View all services
                            <ArrowRight aria-hidden className="size-4" />
                          </Link>
                          <Link
                            href="/how-we-work"
                            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-ink-700/60 hover:text-fg"
                          >
                            See how we work
                            <ArrowRight aria-hidden className="size-4" />
                          </Link>
                        </div>
                      </div>
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
                      isActive(pathname, item.href) ? "text-fg" : "nav-holo text-fg-muted",
                    )}
                  >
                    {isActive(pathname, item.href) && <ActiveCorners />}
                    <GlitchLabel text={item.label} />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/contact#start-project" className="btn btn-primary btn-sm hidden sm:inline-flex">
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
        data-lenis-prevent
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
          <Link href="/contact#start-project" className="btn btn-primary mt-6 w-full">
            Start a Project
          </Link>
        </nav>
      </div>
    </header>
  );
}
