import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getServiceBySlug, getServices, getServiceSlugs } from "@/lib/content";
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

  const [service, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getServices(),
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
        <section className="bg-surface-muted py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-900">
                {pick({ en: "What We Offer", ar: "ما نقدمه" }, lang)}
              </h2>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.what_we_offer.map((item, i) => (
                <Reveal key={i} delay={i * 40}>
                  <div className="flex h-full items-start gap-3 rounded-xl border border-brand-100 bg-white px-5 py-4 shadow-soft">
                    <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                    <span className="text-sm font-medium text-brand-900">{pick(item, lang)}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* How it works */}
      {service.how_it_works.length ? (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-brand-900">
                {pick({ en: "How It Works", ar: "كيف نعمل" }, lang)}
              </h2>
            </Reveal>
            <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.how_it_works.map((step, i) => (
                <Reveal key={i} delay={i * 60}>
                  <li className="relative rounded-2xl border border-brand-100 bg-surface-muted p-6 pt-8">
                    <span className="absolute -top-5 start-6 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="font-semibold text-brand-900">{pick(step, lang)}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Why choose */}
      {service.features.length ? (
        <section className="bg-brand-950 py-16 text-white md:py-24">
          <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
            <Reveal className="mb-12 max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">
                {pick({ en: "Why Choose Al-Izdehar", ar: "لماذا تختار الإزدهار" }, lang)}
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.features.map((feature, i) => (
                <Reveal key={i} delay={i * 50}>
                  <div className="flex h-full items-center gap-4 rounded-xl bg-white/5 p-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-brand-950">
                      <Icon name="check" className="h-5 w-5" />
                    </span>
                    <p className="font-semibold text-white">{pick(feature, lang)}</p>
                  </div>
                </Reveal>
              ))}
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
      <section className="bg-brand-950 py-20 text-center text-white">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {pick(
                { en: "Your Cargo. Our Commitment.", ar: "بضائعكم. التزامنا." },
                lang,
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              {pick(
                {
                  en: "Let us take care of the logistics while you focus on growing your business.",
                  ar: "دعنا نهتم باللوجستيات بينما تركز على تنمية أعمالك.",
                },
                lang,
              )}
            </p>
            <a
              href={href(lang, service.cta?.url || `/quote?service=${encodeURIComponent(name)}`)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-sm font-semibold text-brand-950 transition-all hover:-translate-y-0.5 hover:bg-accent-400"
            >
              {pick(service.cta?.label, lang) || dict.actions.requestQuote}
              <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
            </a>
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
