import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getPage } from "@/lib/content";
import { loadSectionData } from "@/lib/sections";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/sections";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/terms">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const page = await getPage("terms");
  return buildMetadata({
    locale,
    path: "/terms",
    title: page?.seo.seo_title ?? { en: "Terms & Conditions", ar: "الشروط والأحكام" },
    description: page?.seo.seo_description,
  });
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const page = await getPage("terms");
  const data = await loadSectionData();
  if (!page) notFound();

  return (
    <>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} locale={lang} data={data} />
      ))}
    </>
  );
}
