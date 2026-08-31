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
  const [servicesOpen, setServicesOpen] = useState(true);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const solid = scrolled || mobileOpen;
  const linkColor = solid ? "text-brand-800 hover:text-accent-600" : "text-white/90 hover:text-white";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          solid ? "bg-white/95 shadow-soft backdrop-blur" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-20 max-w-[var(--container-content)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 shrink-0">
            <Logo settings={settings} locale={locale} className={solid ? "" : "[&_span]:!text-white"} />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {menu.map((item) =>
              item.children.length ? (
                <div key={item.id} className="group relative">
                  <Link
                    href={href(locale, item.url || "/")}
                    className={cn("flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors", linkColor)}
                  >
                    {pick(item.label, locale)}
                    <Icon name="chevron-down" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute start-0 top-full pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul className="w-72 overflow-hidden rounded-xl border border-brand-100 bg-white p-2 shadow-lift">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={href(locale, child.url || "/")}
                            className="flex items-center justify-between whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
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
                  className={cn("whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors", linkColor)}
                >
                  {pick(item.label, locale)}
                </Link>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className={cn(solid ? "" : "[&_button]:text-white")}>
              <LanguageSwitcher locale={locale} />
            </div>
            <a
              href={href(locale, "/quote")}
              className={cn(
                "hidden whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-semibold transition-all sm:inline-flex",
                solid ? "bg-brand-800 text-white hover:bg-brand-700" : "bg-accent-500 text-brand-950 hover:bg-accent-400",
              )}
            >
              {dict.actions.requestQuote}
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? dict.header.closeMenu : dict.header.openMenu}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={cn(
                "rounded-lg p-2 transition-colors lg:hidden",
                solid ? "text-brand-800 hover:bg-brand-50" : "text-white hover:bg-white/10",
              )}
            >
              <Icon name={mobileOpen ? "x" : "menu"} className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer (rendered as a sibling so backdrop-blur on <header>
          does not become a containing block for its fixed position) */}
      {mobileOpen ? (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={dict.header.menu}
        >
          <div
            className="absolute inset-0 bg-brand-950/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 start-0 flex w-full max-w-sm flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <Logo settings={settings} locale={locale} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={dict.header.closeMenu}
                className="rounded-lg p-2 text-brand-800 transition-colors hover:bg-brand-50"
              >
                <Icon name="x" className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Mobile">
              <ul className="space-y-1">
                {menu.map((item) =>
                  item.children.length ? (
                    <li key={item.id}>
                      <div className="flex items-center">
                        <Link
                          href={href(locale, item.url || "/")}
                          onClick={() => setMobileOpen(false)}
                          className="flex-1 rounded-lg px-3 py-3 text-base font-bold text-brand-800 hover:bg-brand-50"
                        >
                          {pick(item.label, locale)}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setServicesOpen((v) => !v)}
                          aria-expanded={servicesOpen}
                          aria-label={pick(item.label, locale)}
                          className="rounded-lg p-3 text-brand-600 transition-colors hover:bg-brand-50"
                        >
                          <Icon name="chevron-down" className={cn("h-4 w-4 transition-transform", servicesOpen && "rotate-180")} />
                        </button>
                      </div>
                      {servicesOpen ? (
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
                      ) : null}
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
            </nav>

            <div className="space-y-3 border-t border-brand-100 p-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-semibold text-brand-900">{dict.header.language}</span>
                <LanguageSwitcher locale={locale} />
              </div>
              <a
                href={href(locale, "/quote")}
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-brand-800 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {dict.actions.requestQuote}
                <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
