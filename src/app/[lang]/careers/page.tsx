import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getCareers } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/sections";
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
              {dict.nav.careers}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              {pick(
                {
                  en: "Build your career with a team guided by experience and a commitment to excellence.",
                  ar: "ابنِ مسيرتك المهنية مع فريق تقوده الخبرة والالتزام بالتميز.",
                },
                lang,
              )}
            </p>
          </Reveal>
        </div>
      </section>

      <Breadcrumbs locale={lang} items={[{ name: dict.nav.careers }]} />

      <Section bg="muted">
        {careers.length ? (
          <div className="space-y-4">
            {careers.map((job, i) => (
              <Reveal key={job.id} delay={i * 60}>
                <div className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-brand-900">{pick(job.title, lang)}</h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {pick(job.department, lang)} · {pick(job.location, lang)} · {pick(job.employment_type, lang)}
                    </p>
                  </div>
                  <a
                    href={`/${lang}/quote`}
                    className="shrink-0 rounded-xl bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    {dict.actions.applyNow}
                  </a>
                </div>
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
