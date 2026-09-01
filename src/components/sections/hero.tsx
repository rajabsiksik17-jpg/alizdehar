"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { pick, getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { PageSection } from "@/types";
import { Icon } from "@/components/icon";

type Slide = {
  id: string;
  title?: { en: string; ar: string };
  subtitle?: { en: string; ar: string };
  description?: { en: string; ar: string };
  icon?: string;
  url?: string;
  cta?: { en: string; ar: string };
  background?: string;
};

export function HeroSlider({ section, locale }: { section: PageSection; locale: Locale }) {
  const dict = getDictionary(locale);
  const slides = (section.items as unknown as Slide[]) || [];
  const settings = section.settings as { interval?: number; autoplay?: boolean };
  const interval = settings.interval || 6000;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval, paused]);

  if (!slides.length) return null;
  const slide = slides[active % slides.length];
  const background = slide.background || section.image || null;

  return (
    <section className="relative overflow-hidden bg-brand-950 pt-32 pb-20 text-white md:pt-40 md:pb-28">
      {background ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} aria-hidden="true" />
      ) : null}
      <div className="absolute inset-0 bg-brand-950/85" aria-hidden="true" />
      <HeroPattern />
      <div className="relative mx-auto grid max-w-[var(--container-content)] items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Main message */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-xs font-semibold text-accent-300">
            <Icon name="award" className="h-3.5 w-3.5" />
            {pick(section.body, locale)}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {pick(section.title, locale)}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            {pick(section.subtitle, locale)}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href={href(locale, "/quote")}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-brand-950 transition-all hover:-translate-y-0.5 hover:bg-accent-400"
            >
              {dict.actions.requestQuote}
              <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
            </a>
            <a
              href={href(locale, "/services")}
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
            >
              {dict.nav.services}
            </a>
          </div>
        </div>

        {/* Services slider card */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur md:p-10">
            <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-accent-500/10 blur-2xl" aria-hidden="true" />
            <div className="flex min-h-[240px] flex-col" key={slide.id} style={{ animation: "fade-in 0.5s ease" }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 text-accent-400">
                <Icon name={slide.icon} className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-white md:text-3xl">{pick(slide.title, locale)}</h2>
              <p className="mt-1 text-sm font-semibold text-accent-300">{pick(slide.subtitle, locale)}</p>
              <p className="mt-4 flex-1 leading-relaxed text-white/70">{pick(slide.description, locale)}</p>
              <a
                href={href(locale, slide.url || "/services")}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200"
              >
                {pick(slide.cta, locale)}
                <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
              </a>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? "w-8 bg-accent-500" : "w-3 bg-white/25 hover:bg-white/40",
                  )}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActive((i) => (i - 1 + slides.length) % slides.length)}
                aria-label="Previous"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <Icon name="chevron-left" className="h-5 w-5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setActive((i) => (i + 1) % slides.length)}
                aria-label="Next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <Icon name="chevron-right" className="h-5 w-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#fff" strokeWidth="1">
          <circle cx="600" cy="400" r="300" />
          <circle cx="600" cy="400" r="210" />
          <circle cx="600" cy="400" r="120" />
          <path d="M0 400H1200M600 0V800" />
          <path d="M320 120l560 560M880 120L320 680" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
