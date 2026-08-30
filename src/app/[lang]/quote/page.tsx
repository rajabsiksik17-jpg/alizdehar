import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getServices } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/sections";
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

  const services = await getServices();
  const dict = getDictionary(lang);
  const sp = await searchParams;
  const defaultService = typeof sp.service === "string" ? sp.service : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950 pt-36 pb-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice">
            <g fill="none" stroke="#fff" strokeWidth="1">
              <circle cx="600" cy="200" r="180" />
              <path d="M0 200H1200M600 0V400" />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {dict.quote.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70">{dict.quote.subtitle}</p>
          </Reveal>
        </div>
      </section>

      <Breadcrumbs locale={lang} items={[{ name: dict.quote.title }]} />

      <Section bg="muted">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft md:p-10">
              <QuoteForm
                locale={lang}
                services={services.map((s) => pick(s.name, lang))}
                defaultService={defaultService}
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
