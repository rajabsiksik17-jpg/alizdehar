"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { dir, getDictionary } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/site";
import { Icon } from "@/components/icon";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);

  const targets: { code: Locale; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "ar", label: "Arabic", native: "العربية" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={dict.header.language}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
      >
        <Icon name="globe" className="h-4 w-4" />
        <span>{locale === "ar" ? "العربية" : "English"}</span>
        <Icon name="chevron-down" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-brand-100 bg-white py-1 shadow-lift"
        >
          {targets.map((t) => (
            <li key={t.code} role="option" aria-selected={t.code === locale}>
              <Link
                href={switchLocalePath(pathname, t.code)}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-2 text-sm hover:bg-brand-50 ${
                  t.code === locale ? "font-bold text-brand-800" : "text-ink-muted"
                }`}
              >
                <span dir={dir(t.code)}>{t.native}</span>
                {t.code === locale ? <Icon name="check" className="h-4 w-4 text-accent-500" /> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
