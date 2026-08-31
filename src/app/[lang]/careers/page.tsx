import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getCareers } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { href } from "@/lib/site";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/careers">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/careers",
    title: { en: "Careers", ar: "الوظائف" },
    description: {
      en: "Join the Al-Izdehar Logistics team. Explore current career opportunities.",
      ar: "انضم إلى فريق الإزدهار للوجستيات. استكشف فرص العمل الحالية.",
    },
  });
}

export default async function CareersPage({ params }: PageProps<"/[lang]/careers">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const careers = await getCareers();
  const dict = getDictionary(lang);
  const background = await resolvePageBackground("careers");

  return (
    <>
      <PageHero
        title={dict.nav.careers}
        subtitle={pick(
          {
            en: "Build your career with a team guided by experience and a commitment to excellence.",
            ar: "ابنِ مسيرتك المهنية مع فريق تقوده الخبرة والالتزام بالتميز.",
          },
          lang,
        )}
        background={background}
      />

      <Breadcrumbs locale={lang} items={[{ name: dict.nav.careers }]} />

      <Section bg="muted">
        {careers.length ? (
          <div className="space-y-4">
            {careers.map((job, i) => (
              <Reveal key={job.id} delay={i * 60}>
                <a
                  href={href(lang, `/careers/${job.slug}`)}
                  className="group flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <Icon name="briefcase" className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-brand-900">{pick(job.title, lang)}</h2>
                        {job.demo ? (
                          <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
                            {pick({ en: "Sample", ar: "عينة" }, lang)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="building" className="h-3.5 w-3.5" />
                          {pick(job.department, lang)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="map-pin" className="h-3.5 w-3.5" />
                          {pick(job.location, lang)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {pick(job.employment_type, lang)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-brand-700">
                    {dict.actions.applyNow}
                    <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-16 text-center">
            <Icon name="briefcase" className="mx-auto h-12 w-12 text-brand-200" />
            <h2 className="mt-4 text-xl font-bold text-brand-900">
              {pick({ en: "No openings right now", ar: "لا توجد وظائف شاغرة حالياً" }, lang)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-muted">
              {pick(
                {
                  en: "There are no open positions at the moment. Please check back later.",
                  ar: "لا توجد وظائف شاغرة في الوقت الحالي. يرجى العودة لاحقاً.",
                },
                lang,
              )}
            </p>
          </div>
        )}
      </Section>
    </>
  );
}
