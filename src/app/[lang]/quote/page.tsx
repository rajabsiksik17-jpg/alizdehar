import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getServices, getCargoTypes } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";
import { QuoteForm } from "@/components/forms/quote-form";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/quote">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/quote",
    title: { en: "Request a Quote", ar: "اطلب عرض سعر" },
    description: {
      en: "Request a quote for sea, air and land freight, customs clearance and integrated logistics solutions.",
      ar: "اطلب عرض سعر للشحن البحري والجوي والبري والتخليص الجمركي والحلول اللوجستية المتكاملة.",
    },
    noindex: true,
  });
}

export default async function QuotePage({
  params,
  searchParams,
}: PageProps<"/[lang]/quote">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [services, cargoTypes] = await Promise.all([getServices(), getCargoTypes()]);
  const dict = getDictionary(lang);
  const sp = await searchParams;
  const qService = typeof sp.service === "string" ? sp.service : undefined;

  // Resolve the preselected service (accepts slug or localized name).
  const defaultService = qService
    ? (services.find(
        (s) =>
          s.slug === qService ||
          s.name.en === qService ||
          s.name.ar === qService,
      )?.slug ?? undefined)
    : undefined;
  const background = await resolvePageBackground("quote");

  return (
    <>
      <PageHero title={dict.quote.title} subtitle={dict.quote.subtitle} background={background} />

      <Breadcrumbs locale={lang} items={[{ name: dict.quote.title }]} />

      <Section bg="muted">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft md:p-10">
              <QuoteForm
                locale={lang}
                services={services.map((s) => ({ slug: s.slug, name: pick(s.name, lang) }))}
                cargoTypes={cargoTypes.map((c) => pick(c, lang))}
                defaultService={defaultService}
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
