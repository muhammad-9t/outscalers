"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Styled replacement for a native <select>, whose open list can't be themed.
 * Follows the ARIA "select-only combobox" pattern: focus stays on the button and
 * the highlighted option is exposed via aria-activedescendant. The value is
 * submitted through a hidden input, so it works with FormData like a select.
 */
export function SelectField({
  id,
  name,
  options,
  placeholder,
  className,
}: {
  id: string;
  name: string;
  options: string[];
  placeholder: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const listId = `${id}-list`;
  const optId = (i: number) => `${id}-opt-${i}`;

  // Option 0 is the empty placeholder, so the list can be cleared again.
  const items = ["", ...options];

  // Clear the choice when the surrounding form is reset (e.g. after sending).
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onReset = () => setValue("");
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.querySelector(`#${CSS.escape(optId(active))}`)?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  function show() {
    setActive(Math.max(0, items.indexOf(value)));
    setOpen(true);
  }

  function choose(i: number) {
    setValue(items[i]);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const last = items.length - 1;
    const move = (i: number) => {
      e.preventDefault();
      if (!open) show();
      setActive(Math.min(last, Math.max(0, i)));
    };
    switch (e.key) {
      case "ArrowDown":
        return open ? move(active + 1) : move(Math.max(0, items.indexOf(value)));
      case "ArrowUp":
        return open ? move(active - 1) : move(Math.max(0, items.indexOf(value)));
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "Enter":
      case " ":
        e.preventDefault();
        return open ? choose(active) : show();
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        if (open) choose(active);
        return;
    }
    // Type to jump to the first option starting with the typed letters
    if (e.key.length === 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const t = typeahead.current;
      window.clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = window.setTimeout(() => (t.text = ""), 600);
      const match = items.findIndex((o, i) => i > 0 && o.toLowerCase().startsWith(t.text));
      if (match > 0) move(match);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optId(active) : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
        className={cn(className, "flex items-center justify-between gap-3 text-left", open && "border-brand-400")}
      >
        <span className={cn("truncate", !value && "text-fg-subtle")}>{value || placeholder}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-200", open && "rotate-180 text-brand-300")}
        />
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={id}
        tabIndex={-1}
        hidden={!open}
        className="animate-fade-up absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-xl border border-line-strong bg-ink-850 p-1.5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7)]"
      >
        {items.map((o, i) => {
          const selected = o === value;
          return (
            <li
              key={o || "placeholder"}
              id={optId(i)}
              role="option"
              aria-selected={selected}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem]",
                i === active ? "bg-ink-700 text-fg" : "text-fg-muted",
                selected && "text-brand-200",
                !o && "text-fg-subtle",
              )}
            >
              {o || placeholder}
              {selected && o && <Check aria-hidden className="size-4 shrink-0 text-brand-300" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
