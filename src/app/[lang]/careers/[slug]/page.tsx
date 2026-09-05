import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getCareerBySlug, getCareerSlugs, getCareerForm } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/sections";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { Icon } from "@/components/icon";
import { CareerApplicationForm } from "@/components/forms/career-application-form";

export async function generateStaticParams() {
  const slugs = await getCareerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/careers/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const job = await getCareerBySlug(slug);
  return buildMetadata({
    locale,
    path: `/careers/${slug}`,
    title: job?.title ?? { en: "Careers", ar: "الوظائف" },
    description: job?.description,
  });
}

export default async function CareerDetailPage({
  params,
}: PageProps<"/[lang]/careers/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const job = await getCareerBySlug(slug);
  if (!job) notFound();

  const form = await getCareerForm(job.application_form_id);

  const dict = getDictionary(lang);
  const title = pick(job.title, lang);

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
            <div className="flex items-center gap-2">
              {job.demo ? (
                <span className="rounded-full bg-accent-500 px-2.5 py-0.5 text-[11px] font-semibold text-brand-950">
                  {pick({ en: "Sample vacancy", ar: "وظيفة تجريبية" }, lang)}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-white/70">
              <span className="inline-flex items-center gap-2">
                <Icon name="building" className="h-4 w-4 text-accent-400" />
                {pick(job.department, lang)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="map-pin" className="h-4 w-4 text-accent-400" />
                {pick(job.location, lang)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="clock" className="h-4 w-4 text-accent-400" />
                {pick(job.employment_type, lang)}
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      <Breadcrumbs
        locale={lang}
        items={[{ name: dict.nav.careers, path: "/careers" }, { name: title }]}
      />

      <Section bg="muted">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
          <div className="space-y-8 lg:col-span-3">
            <Reveal>
              <h2 className="text-xl font-bold text-brand-900">
                {pick({ en: "About the role", ar: "عن الوظيفة" }, lang)}
              </h2>
              <div className="mt-3">
                <RichText content={pick(job.description, lang)} />
              </div>
            </Reveal>

            {job.responsibilities ? (
              <Reveal>
                <h2 className="text-xl font-bold text-brand-900">
                  {pick({ en: "Responsibilities", ar: "المسؤوليات" }, lang)}
                </h2>
                <div className="mt-3">
                  <RichText content={pick(job.responsibilities, lang)} />
                </div>
              </Reveal>
            ) : null}

            {job.requirements ? (
              <Reveal>
                <h2 className="text-xl font-bold text-brand-900">
                  {pick({ en: "Requirements", ar: "المتطلبات" }, lang)}
                </h2>
                <div className="mt-3">
                  <RichText content={pick(job.requirements, lang)} />
                </div>
              </Reveal>
            ) : null}

            {job.preferred ? (
              <Reveal>
                <h2 className="text-xl font-bold text-brand-900">
                  {pick({ en: "Preferred qualifications", ar: "المؤهلات المفضلة" }, lang)}
                </h2>
                <div className="mt-3">
                  <RichText content={pick(job.preferred, lang)} />
                </div>
              </Reveal>
            ) : null}

            {job.benefits ? (
              <Reveal>
                <h2 className="text-xl font-bold text-brand-900">
                  {pick({ en: "Benefits", ar: "المزايا" }, lang)}
                </h2>
                <div className="mt-3">
                  <RichText content={pick(job.benefits, lang)} />
                </div>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={100} className="lg:col-span-2">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft lg:p-8">
              <h2 className="text-lg font-bold text-brand-900">
                {pick({ en: "Apply for this position", ar: "قدّم لهذه الوظيفة" }, lang)}
              </h2>
              <div className="mt-5">
                <CareerApplicationForm locale={lang} position={title} form={form} />
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
