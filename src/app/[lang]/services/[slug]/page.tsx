import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getServiceBySlug, getServices, getServiceSlugs, getCargoTypes } from "@/lib/content";
import {
  buildMetadata,
  serviceJsonLd,
  faqJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { href } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { Icon } from "@/components/icon";
import { LocaleLink } from "@/components/link";
import { QuoteForm } from "@/components/forms/quote-form";

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const service = await getServiceBySlug(slug);
  if (!service) return buildMetadata({ locale, path: "/services", noindex: true });
  return buildMetadata({
    locale,
    path: `/services/${slug}`,
    title: service.seo.seo_title || service.name,
    description: service.seo.seo_description || service.short_description,
    ogImage: service.seo.og_image || service.hero_image,
    noindex: service.seo.noindex,
  });
}

export default async function ServicePage({
  params,
}: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [service, allServices, cargoTypes] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
    getCargoTypes(),
  ]);
  if (!service) notFound();

  const dict = getDictionary(lang);
  const name = pick(service.name, lang);
  const related = allServices.filter((s) =>
    service.related_services.includes(s.slug),
  );

  const path = `/services/${service.slug}`;
  const structuredData = [
    serviceJsonLd(service, lang, href(lang, path)),
    faqJsonLd(service.faq, lang),
    breadcrumbJsonLd([
      { name: dict.common.home, url: href(lang, "/") },
      { name: dict.nav.services, url: href(lang, "/services") },
      { name, url: href(lang, path) },
    ]),
  ].filter(Boolean);

  return (
    <>
      <JsonLd data={structuredData} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 pt-36 pb-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="#fff" strokeWidth="1">
              <circle cx="600" cy="200" r="180" />
              <circle cx="600" cy="200" r="100" />
              <path d="M0 200H1200M600 0V400" />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-800 text-accent-400">
              <Icon name={service.icon} className="h-7 w-7" />
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {name}
            </h1>
            <p className="mt-4 text-xl font-semibold text-accent-300">
              {pick(service.short_description, lang)}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={href(lang, service.cta?.url || `/quote?service=${encodeURIComponent(name)}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-brand-950 transition-all hover:-translate-y-0.5 hover:bg-accent-400"
              >
                {pick(service.cta?.label, lang) || dict.actions.requestQuote}
                <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
              </a>
              <a
                href={href(lang, "/contact")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                {dict.actions.contactUs}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Breadcrumbs
        locale={lang}
        items={[{ name: dict.nav.services, path: "/services" }, { name }]}
      />

      {/* Introduction */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <RichText content={pick(service.content, lang)} />
            </Reveal>
            <Reveal delay={100} className="lg:col-span-5">
              <div className="sticky top-28">
                <MediaImage
                  src={service.hero_image || service.thumbnail}
                  icon={service.icon}
                  alt={name}
                  className="aspect-[4/3] rounded-3xl shadow-lift"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What we offer */}
      {service.what_we_offer.length ? (
        <section className="relative bg-surface-muted py-20 md:py-28">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <div className="mb-14 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
                  {pick({ en: "Capabilities", ar: "الإمكانيات" }, lang)}
                </p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
                  {pick({ en: "What We Offer", ar: "ما نقدمه" }, lang)}
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="max-w-md leading-relaxed text-ink-muted">
                  {pick(
                    {
                      en: "A complete range of capabilities designed around your cargo and delivery requirements.",
                      ar: "مجموعة متكاملة من الإمكانيات مصممة حول بضائعك ومتطلبات التسليم.",
                    },
                    lang,
                  )}
                </p>
              </Reveal>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {service.what_we_offer.map((item, i) => (
                <Reveal key={item.id ?? i} delay={i * 50}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-accent-500 to-accent-300 transition-transform duration-300 group-hover:scale-x-100 rtl:origin-right" aria-hidden="true" />
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-800 text-white transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-brand-950">
                      <Icon name={item.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-brand-900">{pick(item.title, lang)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pick(item.description, lang)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* How it works */}
      {service.how_it_works.length ? (
        <section className="relative overflow-hidden bg-brand-950 py-20 text-white md:py-28">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-16 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
                {pick({ en: "Process", ar: "آلية العمل" }, lang)}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {pick({ en: "How We Work", ar: "كيف نعمل" }, lang)}
              </h2>
            </Reveal>

            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:gap-6">
              <div className="absolute inset-x-8 top-8 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent xl:block" aria-hidden="true" />
              {service.how_it_works.map((step, i) => (
                <Reveal key={step.id ?? i} delay={i * 70}>
                  <li className="group flex items-start gap-4 xl:flex-col xl:items-center xl:text-center">
                    <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-800 text-accent-400 ring-1 ring-white/10 transition-transform duration-300 group-hover:-translate-y-1">
                      <Icon name={step.icon} className="h-7 w-7" />
                    </span>
                    <div className="xl:mt-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-accent-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-white">{pick(step.title, lang)}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{pick(step.description, lang)}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Why choose */}
      {service.features.length ? (
        <section className="relative overflow-hidden bg-white py-20 md:py-28">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <Reveal className="lg:col-span-5">
                <div className="relative">
                  <MediaImage
                    src={service.hero_image || service.thumbnail}
                    icon={service.icon}
                    alt={name}
                    className="aspect-[4/5] rounded-3xl shadow-lift"
                  />
                  <div className="absolute -bottom-6 -end-4 hidden w-48 rounded-2xl bg-brand-800 p-5 text-white shadow-lift sm:block">
                    <p className="text-3xl font-extrabold text-accent-400">40+</p>
                    <p className="mt-1 text-sm text-white/70">
                      {pick({ en: "Years of experience", ar: "سنوات من الخبرة" }, lang)}
                    </p>
                  </div>
                </div>
              </Reveal>

              <div className="lg:col-span-7">
                <Reveal className="mb-10">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
                    {pick({ en: "Why Us", ar: "لماذا نحن" }, lang)}
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900 md:text-4xl">
                    {pick({ en: "Why Choose Al-Izdehar", ar: "لماذا تختار الإزدهار" }, lang)}
                  </h2>
                </Reveal>
                <div className="grid gap-5 sm:grid-cols-2">
                  {service.features.map((feature, i) => (
                    <Reveal key={feature.id ?? i} delay={i * 50}>
                      <div className="group flex h-full gap-4 rounded-2xl border border-brand-100 bg-surface-muted p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white hover:shadow-lift">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-white transition-colors duration-300 group-hover:bg-accent-500 group-hover:text-brand-950">
                          <Icon name={feature.icon} className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-bold text-brand-900">{pick(feature.title, lang)}</h3>
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{pick(feature.description, lang)}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {service.faq.length ? (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-900">
                {dict.common.faq}
              </h2>
            </Reveal>
            <FaqList faq={service.faq} locale={lang} />
          </div>
        </section>
      ) : null}

      {/* Request a Quote */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon name="handshake" className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-brand-900">
                {dict.actions.requestQuote}
              </h2>
              <p className="mt-4 max-w-md leading-relaxed text-ink-muted">
                {pick(
                  {
                    en: "Tell us about your shipment and our team will prepare a tailored solution for you.",
                    ar: "أخبرنا عن شحنتك وسيقوم فريقنا بإعداد حل مخصص لك.",
                  },
                  lang,
                )}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  pick({ en: "Fast response", ar: "استجابة سريعة" }, lang),
                  pick({ en: "Tailored to your cargo", ar: "مخصصة لبضائعك" }, lang),
                  pick({ en: "No obligation", ar: "بدون أي التزام" }, lang),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-brand-900">
                    <Icon name="check" className="h-4 w-4 text-accent-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={100}>
              <div className="rounded-2xl border border-brand-100 bg-surface-muted p-6 shadow-soft md:p-8">
                <QuoteForm
                  locale={lang}
                  services={allServices.map((s) => ({ slug: s.slug, name: pick(s.name, lang) }))}
                  cargoTypes={cargoTypes.map((c) => pick(c, lang))}
                  defaultService={service.slug}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Related services */}
      {related.length ? (
        <section className="bg-surface-muted py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-900">
                {dict.common.relatedServices}
              </h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((s, i) => (
                <Reveal key={s.id} delay={i * 60}>
                  <LocaleLink
                    locale={lang}
                    href={`/services/${s.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon name={s.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-brand-900">{pick(s.name, lang)}</h3>
                    <p className="mt-2 flex-1 text-sm text-ink-muted">
                      {pick(s.short_description, lang)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-accent-600">
                      {dict.actions.exploreService}
                      <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  </LocaleLink>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="relative overflow-hidden bg-brand-950 py-20 text-white md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="#fff" strokeWidth="1">
              <circle cx="600" cy="200" r="200" />
              <path d="M0 200H1200M600 0V400" />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                {pick({ en: "Ready to Move Your Shipment?", ar: "جاهز لبدء شحنتك؟" }, lang)}
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/70">
                {pick(
                  {
                    en: "Tell us what you are shipping and our logistics team will help you find the right solution.",
                    ar: "أخبرنا بما تشحنه وسيساعدك فريقنا اللوجستي في إيجاد الحل المناسب.",
                  },
                  lang,
                )}
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-500 text-brand-950">
                    <Icon name="package-check" className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="font-bold text-white">{dict.actions.getQuote}</p>
                    <p className="text-sm text-white/60">
                      {pick({ en: "Free consultation", ar: "استشارة مجانية" }, lang)}
                    </p>
                  </div>
                </div>
                <a
                  href={href(lang, service.cta?.url || `/quote?service=${encodeURIComponent(name)}`)}
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-semibold text-brand-950 transition-all hover:-translate-y-0.5 hover:bg-accent-400 sm:w-auto"
                >
                  {dict.actions.requestQuote}
                  <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-12">
            <div className="grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
              {[
                { icon: "zap", n: "01", label: pick({ en: "Fast Response", ar: "استجابة سريعة" }, lang) },
                { icon: "package", n: "02", label: pick({ en: "Tailored to Your Cargo", ar: "مخصصة لبضائعك" }, lang) },
                { icon: "shield-check", n: "03", label: pick({ en: "No Obligation", ar: "بدون أي التزام" }, lang) },
              ].map((item) => (
                <div key={item.n} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-400">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-accent-400">{item.n}</span>
                    <p className="font-semibold text-white">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* Local FAQ list (server, non-accordion to keep service page static-friendly) */
function FaqList({ faq, locale }: { faq: { id: string; question: { en: string; ar: string }; answer: { en: string; ar: string } }[]; locale: "en" | "ar" }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faq.map((item) => (
        <details key={item.id} className="group rounded-xl border border-brand-100 bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
            <span className="font-semibold text-brand-900">{pick(item.question, locale)}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-transform group-open:rotate-45">
              <Icon name="plus" className="h-4 w-4" />
            </span>
          </summary>
          <p className="px-5 pb-5 leading-relaxed text-ink-muted">{pick(item.answer, locale)}</p>
        </details>
      ))}
    </div>
  );
}
