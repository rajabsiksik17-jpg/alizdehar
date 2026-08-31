"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import {
  countries,
  countryByCode,
  detectCountryByLocale,
  parsePhone,
  type CountryOption,
} from "@/lib/phone";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";

export interface PhoneValue {
  country: string;
  number: string;
  e164: string;
  valid: boolean;
  dialCode: string;
}

export function PhoneInput({
  id,
  label,
  locale = "en",
  required,
  defaultCountry,
  onChange,
  error,
  placeholder,
}: {
  id?: string;
  label?: string;
  locale?: Locale;
  required?: boolean;
  defaultCountry?: string;
  onChange?: (v: PhoneValue) => void;
  error?: string;
  placeholder?: string;
}) {
  const [countryCode, setCountryCode] = useState(defaultCountry || "JO");
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const current = countryByCode(countryCode) ?? countryByCode("JO")!;
  const isRtl = locale === "ar";

  useEffect(() => {
    if (!defaultCountry) {
      const id = requestAnimationFrame(() => {
        const detected = detectCountryByLocale(navigator.language);
        if (detected) setCountryCode(detected);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [defaultCountry]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function emit(nextCountry: string, nextNumber: string) {
    const parsed = parsePhone(nextNumber, nextCountry);
    const c = countryByCode(nextCountry) ?? countryByCode("JO")!;
    onChange?.({
      country: nextCountry,
      number: nextNumber,
      e164: parsed.e164,
      valid: parsed.valid,
      dialCode: parsed.dialCode || c.dial,
    });
  }

  const filtered = query.trim()
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.nameAr.includes(query) ||
          c.dial.includes(query) ||
          c.code.toLowerCase().includes(query.toLowerCase()),
      )
    : countries;

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</span>
      ) : null}

      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-xl border bg-white transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100",
          error ? "border-red-400" : "border-brand-200",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1.5 border-e border-brand-100 bg-surface-muted px-3 text-sm font-medium text-brand-900"
          dir="ltr"
        >
          <span className="text-base leading-none">{current.flag}</span>
          <span>{current.dial}</span>
          <Icon name="chevron-down" className={cn("h-3.5 w-3.5 text-ink-muted transition-transform", open && "rotate-180")} />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          dir="ltr"
          required={required}
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            emit(countryCode, e.target.value);
          }}
          placeholder={placeholder ?? (locale === "ar" ? "7X XXX XXXX" : "7X XXX XXXX")}
          className="w-full min-w-0 bg-white px-3 py-3 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
        />
      </div>

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
                placeholder={isRtl ? "ابحث عن الدولة…" : "Search country…"}
                className="w-full bg-transparent py-2 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {filtered.map((c: CountryOption) => (
              <li key={c.code} role="option" aria-selected={c.code === countryCode}>
                <button
                  type="button"
                  onClick={() => {
                    setCountryCode(c.code);
                    setOpen(false);
                    setQuery("");
                    emit(c.code, number);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-brand-50",
                    c.code === countryCode ? "bg-brand-50 font-semibold text-brand-900" : "text-ink",
                  )}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 text-start">{isRtl ? c.nameAr : c.name}</span>
                  <span className="text-ink-muted" dir="ltr">
                    {c.dial}
                  </span>
                  {c.code === countryCode ? <Icon name="check" className="h-4 w-4 text-accent-500" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
