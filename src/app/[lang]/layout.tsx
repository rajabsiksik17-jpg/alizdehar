import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, dir, locales } from "@/lib/i18n/config";
import { cairo } from "@/lib/fonts";
import { getSettings, getMenu, getServices } from "@/lib/content";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SocialFloat } from "@/components/layout/social-float";
import { CookieConsent } from "@/components/layout/cookie-consent";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.site_name.en,
      template: `%s | ${settings.site_name.en}`,
    },
    description: settings.site_description.en,
    openGraph: {
      type: "website",
      siteName: settings.site_name.en,
      title: settings.site_name.en,
      description: settings.site_description.en,
      ...(settings.default_og_image ? { images: [settings.default_og_image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: { index: true, follow: true },
    verification: {
      ...(settings.google_site_verification ? { google: settings.google_site_verification } : {}),
      ...(settings.bing_site_verification ? { other: { "msvalidate.01": settings.bing_site_verification } } : {}),
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [settings, menu, services] = await Promise.all([
    getSettings(),
    getMenu(),
    getServices(),
  ]);

  return (
    <html lang={lang} dir={dir(lang)} className={`${cairo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
        <Header locale={lang} menu={menu} settings={settings} />
        <main className="flex-1">{children}</main>
        <Footer locale={lang} settings={settings} menu={menu} services={services} />
        <SocialFloat socials={settings.social_links} locale={lang} />
        <CookieConsent locale={lang} />
      </body>
    </html>
  );
}
