import type { Locale } from "@/lib/i18n/config";
import { pick, getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { cn } from "@/lib/utils";
import type {
  ClientLogo,
  FaqItem,
  GalleryItem,
  PageSection,
  Service,
  Statistic,
  Testimonial,
  WhyUsItem,
} from "@/types";
import { Icon } from "@/components/icon";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { LocaleLink } from "@/components/link";
import { HeroSlider } from "@/components/sections/hero";
import { StatisticsCounter } from "@/components/sections/statistics";
import { FaqAccordion } from "@/components/sections/faq";

/* ── Shared wrapper ───────────────────────────────────────── */

type Bg = "white" | "muted" | "dark" | "accent";

const bgClass: Record<Bg, string> = {
  white: "bg-white",
  muted: "bg-surface-muted",
  dark: "bg-brand-950 text-white",
  accent: "bg-brand-800 text-white",
};

export function Section({
  id,
  bg = "white",
  className,
  children,
  container = true,
}: {
  id?: string;
  bg?: Bg;
  className?: string;
  children: React.ReactNode;
  container?: boolean;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24", bgClass[bg], className)}>
      {container ? (
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  dark = false,
  align = "center",
}: {
  title?: string | null;
  subtitle?: string | null;
  dark?: boolean;
  align?: "center" | "start";
}) {
  if (!title && !subtitle) return null;
  return (
    <Reveal
      className={cn(
        "mb-12 max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-start",
      )}
    >
      {title ? (
        <h2
          className={cn(
            "text-3xl font-extrabold tracking-tight md:text-4xl",
            dark ? "text-white" : "text-brand-900",
          )}
        >
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/70" : "text-ink-muted")}>
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

/* ── Renderer ─────────────────────────────────────────────── */

export interface SectionData {
  services: Service[];
  whyUs: WhyUsItem[];
  statistics: Statistic[];
  testimonials: Testimonial[];
  clients: ClientLogo[];
  gallery: GalleryItem[];
  faq: FaqItem[];
}

export function SectionRenderer({
  section,
  locale,
  data,
}: {
  section: PageSection;
  locale: Locale;
  data: SectionData;
}) {
  if (section.hidden) return null;

  switch (section.type) {
    case "hero":
      return <HeroSlider section={section} locale={locale} />;
    case "page_hero":
      return <PageHero section={section} locale={locale} />;
    case "trust":
      return <TrustBar section={section} locale={locale} />;
    case "services_grid":
      return <ServicesGrid section={section} locale={locale} services={data.services} />;
    case "features": {
      const sectionItems = (section.items as unknown as WhyUsItem[]) || [];
      const items = sectionItems.length ? sectionItems : data.whyUs;
      return <Features section={section} locale={locale} items={items} />;
    }
    case "process":
      return <Process section={section} locale={locale} />;
    case "image_text":
      return <ImageText section={section} locale={locale} layout="image_right" />;
    case "text_image":
      return <ImageText section={section} locale={locale} layout="image_left" />;
    case "timeline":
      return <Timeline section={section} locale={locale} />;
    case "statistics":
      return <Statistics locale={locale} stats={data.statistics} />;
    case "faq":
      return <FaqSection section={section} locale={locale} faq={data.faq} />;
    case "cta":
      return <CtaSection section={section} locale={locale} />;
    case "testimonials":
      return <Testimonials section={section} locale={locale} items={data.testimonials} />;
    case "logos":
      return <Logos section={section} locale={locale} items={data.clients} />;
    case "rich_text": {
      const align = (section.settings as { align?: string }).align === "center" ? "center" : "start";
      return (
        <Section>
          <SectionHeading
            title={pick(section.title, locale)}
            subtitle={pick(section.subtitle, locale)}
            align={align}
          />
          {section.body ? (
            <RichText
              content={pick(section.body, locale)}
              className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}
            />
          ) : null}
        </Section>
      );
    }
    default:
      return null;
  }
}

/* ── Individual sections ──────────────────────────────────── */

function PageHero({ section, locale }: { section: PageSection; locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-brand-950 pt-40 pb-20 text-white">
      <HeroBackdrop />
      <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {pick(section.title, locale)}
          </h1>
          {section.subtitle ? (
            <p className="mt-5 text-lg leading-relaxed text-white/70">{pick(section.subtitle, locale)}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#fff" strokeWidth="1">
          <circle cx="600" cy="250" r="220" />
          <circle cx="600" cy="250" r="150" />
          <circle cx="600" cy="250" r="80" />
          <path d="M0 250H1200M600 0V500" />
          <path d="M350 60l500 380M850 60L350 440" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

function TrustBar({ section, locale }: { section: PageSection; locale: Locale }) {
  const items = section.items as { id: string; label?: { en: string; ar: string }; icon?: string }[];
  return (
    <Section bg="white" className="!py-10">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 60}>
            <li className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold text-brand-900">
                {pick(item.label, locale)}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}

function ServicesGrid({
  section,
  locale,
  services,
}: {
  section: PageSection;
  locale: Locale;
  services: Service[];
}) {
  const dict = getDictionary(locale);
  return (
    <Section bg="muted">
      <SectionHeading title={pick(section.title, locale)} subtitle={pick(section.subtitle, locale)} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <Reveal key={service.id} delay={i * 60}>
            <LocaleLink
              locale={locale}
              href={`/services/${service.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <MediaImage
                src={service.hero_image || service.thumbnail}
                icon={service.icon}
                alt={pick(service.name, locale)}
                className="aspect-[16/10]"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
              />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Icon name={service.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold text-brand-900">{pick(service.name, locale)}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {pick(service.short_description, locale)}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors group-hover:text-accent-600">
                  {dict.actions.exploreService}
                  <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </span>
              </div>
            </LocaleLink>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Features({
  section,
  locale,
  items,
}: {
  section: PageSection;
  locale: Locale;
  items: WhyUsItem[];
}) {
  const settings = (section.settings || {}) as {
    eyebrow?: { en: string; ar: string };
    badge?: { en: string; ar: string };
    badgeValue?: string;
  };

  return (
    <Section bg="white">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-5">
          <div className="relative">
            <MediaImage
              src={section.image}
              icon={section.image ? null : "network"}
              alt={pick(section.title, locale)}
              className="aspect-[4/5] rounded-3xl shadow-lift"
            />
            {settings.badge ? (
              <div className="absolute -bottom-6 -end-4 hidden w-48 rounded-2xl bg-brand-800 p-5 text-white shadow-lift sm:block">
                <p className="text-3xl font-extrabold text-accent-400">{settings.badgeValue || "40+"}</p>
                <p className="mt-1 text-sm text-white/70">{pick(settings.badge, locale)}</p>
              </div>
            ) : null}
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal className="mb-10">
            {settings.eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
                {pick(settings.eyebrow, locale)}
              </p>
            ) : null}
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
              {pick(section.title, locale)}
            </h2>
            {section.subtitle ? (
              <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">{pick(section.subtitle, locale)}</p>
            ) : null}
            {section.body ? (
              <p className="mt-4 max-w-xl leading-relaxed text-ink-muted">{pick(section.body, locale)}</p>
            ) : null}
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item, i) => (
              <Reveal key={item.id} delay={i * 50}>
                <div className="group flex h-full gap-4 rounded-2xl border border-brand-100 bg-surface-muted p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-lift">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-brand-950">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-brand-900">{pick(item.title, locale)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pick(item.description, locale)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Process({ section, locale }: { section: PageSection; locale: Locale }) {
  const items = section.items as {
    id: string;
    label?: { en: string; ar: string };
    description?: { en: string; ar: string };
    icon?: string;
  }[];
  return (
    <Section bg="dark">
      <SectionHeading title={pick(section.title, locale)} subtitle={pick(section.subtitle, locale)} dark />
      <ol className="relative grid gap-8 md:grid-cols-4">
        <div className="absolute inset-x-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-white/30 to-transparent md:block" aria-hidden="true" />
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 80}>
            <li className="relative flex flex-col items-center text-center">
              <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-accent-400 ring-4 ring-brand-950">
                <Icon name={item.icon} className="h-6 w-6" />
              </span>
              <span className="mt-3 text-xs font-bold uppercase tracking-widest text-accent-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">{pick(item.label, locale)}</h3>
              {item.description ? (
                <p className="mt-2 text-sm text-white/60">{pick(item.description, locale)}</p>
              ) : null}
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function ImageText({
  section,
  locale,
  layout,
}: {
  section: PageSection;
  locale: Locale;
  layout: "image_left" | "image_right";
}) {
  const items = section.items as { id: string; label?: { en: string; ar: string } }[];
  const link = (section.settings as { link?: string }).link;
  const dict = getDictionary(locale);
  const image = (
    <MediaImage
      src={section.image}
      alt={pick(section.title, locale)}
      className="aspect-[4/3] w-full rounded-3xl shadow-lift"
    />
  );
  const content = (
    <div>
      <h2 className="text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
        {pick(section.title, locale)}
      </h2>
      {section.subtitle ? (
        <p className="mt-3 text-lg font-semibold text-accent-600">{pick(section.subtitle, locale)}</p>
      ) : null}
      {section.body ? (
        <p className="mt-5 leading-relaxed text-ink-muted">{pick(section.body, locale)}</p>
      ) : null}
      {items.length ? (
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-xl bg-surface-muted px-4 py-3">
              <Icon name="check" className="h-4 w-4 shrink-0 text-accent-500" />
              <span className="text-sm font-medium text-brand-900">{pick(item.label, locale)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {link ? (
        <LocaleLink
          locale={locale}
          href={link}
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-accent-600"
        >
          {dict.actions.learnMore}
          <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
        </LocaleLink>
      ) : null}
    </div>
  );
  return (
    <Section bg="white">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {layout === "image_left" ? (
          <>
            <Reveal>{image}</Reveal>
            <Reveal delay={100}>{content}</Reveal>
          </>
        ) : (
          <>
            <Reveal delay={100}>{content}</Reveal>
            <Reveal>{image}</Reveal>
          </>
        )}
      </div>
    </Section>
  );
}

function Timeline({ section, locale }: { section: PageSection; locale: Locale }) {
  const items = section.items as {
    id: string;
    label?: { en: string; ar: string };
    title?: { en: string; ar: string };
    description?: { en: string; ar: string };
  }[];
  return (
    <Section bg="muted">
      <SectionHeading title={pick(section.title, locale)} />

      {/* Horizontal (desktop) */}
      <div className="relative hidden md:block">
        <div className="absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" aria-hidden="true" />
        <ol className="relative grid grid-cols-3 gap-8">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <li className="flex flex-col items-center text-center">
                <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface-muted bg-brand-800 text-accent-400 shadow-soft">
                  <span className="text-2xl font-extrabold tracking-tight text-white" dir="ltr">
                    {pick(item.label, locale)}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-bold text-brand-900">{pick(item.title, locale)}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-muted">
                  {pick(item.description, locale)}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Vertical (mobile) */}
      <ol className="relative space-y-10 border-s-2 border-brand-200 ps-8 md:hidden">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 60}>
            <li className="relative">
              <span className="absolute -start-[41px] top-0 flex h-16 w-16 items-center justify-center rounded-full bg-brand-800 ring-4 ring-surface-muted">
                <span className="text-lg font-extrabold text-white" dir="ltr">
                  {pick(item.label, locale)}
                </span>
              </span>
              <h3 className="text-lg font-bold text-brand-900">{pick(item.title, locale)}</h3>
              <p className="mt-2 max-w-md leading-relaxed text-ink-muted">
                {pick(item.description, locale)}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

function Statistics({
  locale,
  stats,
}: {
  locale: Locale;
  stats: Statistic[];
}) {
  if (!stats.length) return null;
  return (
    <Section bg="accent">
      <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 60}>
            <div className="rounded-2xl bg-white/5 p-6">
              <StatisticsCounter
                value={s.value}
                suffix={s.suffix || ""}
                className="text-4xl font-extrabold text-white md:text-5xl"
              />
              <p className="mt-3 text-sm font-medium text-white/70">{pick(s.label, locale)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function FaqSection({
  section,
  locale,
  faq,
}: {
  section: PageSection;
  locale: Locale;
  faq: FaqItem[];
}) {
  if (!faq.length) return null;
  return (
    <Section bg="white">
      <SectionHeading title={pick(section.title, locale)} />
      <FaqAccordion faq={faq} locale={locale} />
    </Section>
  );
}

function CtaSection({ section, locale }: { section: PageSection; locale: Locale }) {
  const items = section.items as { id: string; label?: { en: string; ar: string }; url?: string; variant?: string }[];
  return (
    <Section bg="dark" container={false}>
      <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 px-6 py-16 text-center md:px-16">
          <HeroBackdrop />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {pick(section.title, locale)}
            </h2>
            {section.subtitle ? (
              <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">{pick(section.subtitle, locale)}</p>
            ) : null}
            {items.length ? (
              <div className="mt-9 flex flex-wrap justify-center gap-4">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={href(locale, item.url || "/quote")}
                    className={cn(
                      "rounded-xl px-7 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5",
                      item.variant === "secondary"
                        ? "border border-white/25 text-white hover:bg-white/10"
                        : "bg-accent-500 text-brand-950 hover:bg-accent-400",
                    )}
                  >
                    {pick(item.label, locale)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Testimonials({
  section,
  locale,
  items,
}: {
  section: PageSection;
  locale: Locale;
  items: Testimonial[];
}) {
  if (!items.length) return null;
  return (
    <Section bg="muted">
      <SectionHeading title={pick(section.title, locale)} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <Reveal key={t.id} delay={i * 60}>
            <figure className="flex h-full flex-col rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <Icon name="quote" className="h-7 w-7 text-accent-400" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                {pick(t.quote, locale)}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {pick(t.client_name, locale).charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-900">{pick(t.client_name, locale)}</p>
                  {t.company ? (
                    <p className="text-xs text-ink-muted">{pick(t.company, locale)}</p>
                  ) : null}
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Logos({
  section,
  locale,
  items,
}: {
  section: PageSection;
  locale: Locale;
  items: ClientLogo[];
}) {
  if (!items.length) return null;
  return (
    <Section bg="white" className="!py-12">
      <SectionHeading title={pick(section.title, locale)} />
      <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((logo) => (
          <MediaImage
            key={logo.id}
            src={logo.logo}
            alt={logo.name}
            className="h-16 rounded-lg bg-surface-muted p-3"
          />
        ))}
      </div>
    </Section>
  );
}
