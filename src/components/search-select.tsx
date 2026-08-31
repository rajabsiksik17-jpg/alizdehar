"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

export interface SelectOption {
  value: string;
  label: string;
}

export function SearchSelect({
  id,
  label,
  locale = "en",
  options,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  id?: string;
  label?: string;
  locale?: Locale;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isRtl = locale === "ar";

  const selected = options.find((o) => o.value === value);
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</span>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-sm transition-colors focus:outline-none",
          error ? "border-red-400" : "border-brand-200 focus:border-brand-500",
          !selected && "text-ink-muted/60",
        )}
      >
        <span className="truncate text-start">{selected ? selected.label : placeholder}</span>
        <Icon name="chevron-down" className={cn("h-4 w-4 shrink-0 text-ink-muted transition-transform", open && "rotate-180")} />
      </button>
      {required ? <input id={id} type="hidden" value={value || ""} required /> : null}

      {open ? (
        <div
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-brand-100 bg-white shadow-lift"
          role="listbox"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="border-b border-brand-100 p-2">
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3">
              <Icon name="search" className="h-4 w-4 text-ink-muted" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isRtl ? "ابحث…" : "Search…"}
                className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length ? (
              filtered.map((o) => (
                <li key={o.value} role="option" aria-selected={o.value === value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(o.value);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-brand-50",
                      o.value === value ? "bg-brand-50 font-semibold text-brand-900" : "text-ink",
                    )}
                  >
                    <span>{o.label}</span>
                    {o.value === value ? <Icon name="check" className="h-4 w-4 text-accent-500" /> : null}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-ink-muted">
                {isRtl ? "لا توجد نتائج" : "No results"}
              </li>
            )}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
