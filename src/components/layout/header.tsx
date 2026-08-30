"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { pick, getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { MenuItem, SiteSettings } from "@/types";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Icon } from "@/components/icon";

export function Header({
  locale,
  menu,
  settings,
}: {
  locale: Locale;
  menu: MenuItem[];
  settings: SiteSettings;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dict = getDictionary(locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen;
  const linkColor = solid ? "text-brand-800 hover:text-accent-600" : "text-white/90 hover:text-white";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid ? "bg-white/95 shadow-soft backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[var(--container-content)] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <Logo settings={settings} locale={locale} className={solid ? "" : "[&_span]:!text-white"} />
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {menu.map((item) =>
            item.children.length ? (
              <div key={item.id} className="group relative">
                <button
                  type="button"
                  className={cn("flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors", linkColor)}
                >
                  {pick(item.label, locale)}
                  <Icon name="chevron-down" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute start-0 top-full pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <ul className="w-72 overflow-hidden rounded-xl border border-brand-100 bg-white p-2 shadow-lift">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={href(locale, child.url || "/")}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
                        >
                          {pick(child.label, locale)}
                          <Icon name="arrow-right" className="h-3.5 w-3.5 text-accent-500 rtl:rotate-180" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.id}
                href={href(locale, item.url || "/")}
                className={cn("rounded-lg px-3 py-2 text-sm font-semibold transition-colors", linkColor)}
              >
                {pick(item.label, locale)}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className={cn(solid ? "" : "[&_button]:text-white")}>
            <LanguageSwitcher locale={locale} />
          </div>
          <a
            href={href(locale, "/quote")}
            className={cn(
              "hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all sm:inline-flex",
              solid
                ? "bg-brand-800 text-white hover:bg-brand-700"
                : "bg-accent-500 text-brand-950 hover:bg-accent-400",
            )}
          >
            {dict.actions.requestQuote}
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? dict.header.closeMenu : dict.header.openMenu}
            aria-expanded={mobileOpen}
            className={cn(
              "rounded-lg p-2 transition-colors lg:hidden",
              solid ? "text-brand-800 hover:bg-brand-50" : "text-white hover:bg-white/10",
            )}
          >
            <Icon name={mobileOpen ? "x" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-20 bottom-0 z-40 overflow-y-auto bg-white lg:hidden">
          <nav className="mx-auto max-w-[var(--container-content)] px-4 py-6 sm:px-6" aria-label="Mobile">
            <ul className="space-y-1">
              {menu.map((item) =>
                item.children.length ? (
                  <li key={item.id}>
                    <p className="px-3 pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-ink-muted">
                      {pick(item.label, locale)}
                    </p>
                    <ul className="space-y-1 border-s border-brand-100 ps-2">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={href(locale, child.url || "/")}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between rounded-lg px-3 py-3 text-base font-semibold text-brand-800 hover:bg-brand-50"
                          >
                            {pick(child.label, locale)}
                            <Icon name="arrow-right" className="h-4 w-4 text-accent-500 rtl:rotate-180" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={item.id}>
                    <Link
                      href={href(locale, item.url || "/")}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-3 text-base font-semibold text-brand-800 hover:bg-brand-50"
                    >
                      {pick(item.label, locale)}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <a
              href={href(locale, "/quote")}
              onClick={() => setMobileOpen(false)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 py-3.5 text-sm font-semibold text-white"
            >
              {dict.actions.requestQuote}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
