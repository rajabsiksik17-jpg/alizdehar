import type { Metadata } from "next";
import { isLocale, pick } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { Section } from "@/components/sections";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/privacy",
    title: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
  });
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const title = pick({ en: "Privacy Policy", ar: "سياسة الخصوصية" }, locale);
  return (
    <>
      <section className="bg-brand-950 pt-36 pb-16 text-white">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">{title}</h1>
          </Reveal>
        </div>
      </section>
      <Breadcrumbs locale={locale} items={[{ name: title }]} />
      <Section bg="white">
        <div className="mx-auto max-w-3xl">
          <p className="leading-relaxed text-ink-muted">
            {pick(
              {
                en: "This page's content is managed from the CMS. The Privacy Policy will be published here by the site administrator.",
                ar: "يُدار محتوى هذه الصفحة من نظام إدارة المحتوى. سيتم نشر سياسة الخصوصية هنا من قبل مدير الموقع.",
              },
              locale,
            )}
          </p>
        </div>
      </Section>
    </>
  );
}
