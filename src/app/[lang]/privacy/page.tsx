import type { Metadata } from "next";
import { isLocale, pick } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";

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
  const background = await resolvePageBackground("privacy");
  return (
    <>
      <PageHero title={title} background={background} />
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
