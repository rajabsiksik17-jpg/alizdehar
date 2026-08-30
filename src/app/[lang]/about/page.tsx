import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getPage } from "@/lib/content";
import { loadSectionData } from "@/lib/sections";
import { buildMetadata } from "@/lib/seo";
import { SectionRenderer } from "@/components/sections";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const page = await getPage("about");
  return buildMetadata({
    locale,
    path: "/about",
    title: page?.seo.seo_title,
    description: page?.seo.seo_description,
    ogImage: page?.seo.og_image,
    noindex: page?.seo.noindex,
  });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const page = await getPage("about");
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
