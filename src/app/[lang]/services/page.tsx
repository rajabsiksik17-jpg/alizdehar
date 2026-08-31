import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";
import { LocaleLink } from "@/components/link";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/services",
    title: {
      en: "Services & Solutions",
      ar: "الخدمات والحلول",
    },
    description: {
      en: "Explore Al-Izdehar Logistics services: sea freight, land freight, air freight, customs clearance and integrated logistics solutions.",
      ar: "استكشف خدمات الإزدهار للوجستيات: الشحن البحري والبري والجوي والتخليص الجمركي والحلول اللوجستية المتكاملة.",
    },
  });
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const services = await getServices();
  const dict = getDictionary(lang);
  const background = await resolvePageBackground("services");

  return (
    <>
      <PageHero
        title={dict.nav.services}
        subtitle={pick(
          {
            en: "Integrated shipping and logistics solutions that connect your business to global markets.",
            ar: "حلول شحن ولوجستيات متكاملة تربط أعمالك بالأسواق العالمية.",
          },
          lang,
        )}
        background={background}
      />

      <Breadcrumbs locale={lang} items={[{ name: dict.nav.services }]} />

      <Section bg="muted">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={i * 60}>
              <LocaleLink
                locale={lang}
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <MediaImage
                  src={service.hero_image || service.thumbnail}
                  icon={service.icon}
                  alt={pick(service.name, lang)}
                  className="aspect-[16/10]"
                  imageClassName="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon name={service.icon} className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-bold text-brand-900">{pick(service.name, lang)}</h2>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {pick(service.short_description, lang)}
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

      <Section bg="dark" container={false}>
        <div className="mx-auto flex max-w-[var(--container-content)] flex-col items-center justify-between gap-6 px-4 text-center sm:px-6 lg:flex-row lg:text-start lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              {pick(
                { en: "Not sure which service you need?", ar: "غير متأكد من الخدمة التي تحتاجها؟" },
                lang,
              )}
            </h2>
            <p className="mt-2 text-white/70">
              {pick(
                { en: "Talk to our logistics team and we'll find the right solution.", ar: "تحدث إلى فريقنا اللوجستي وسنجد لك الحل المناسب." },
                lang,
              )}
            </p>
          </div>
          <a
            href={`/${lang}/quote`}
            className="shrink-0 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-accent-400"
          >
            {dict.actions.requestQuote}
          </a>
        </div>
      </Section>
    </>
  );
}
