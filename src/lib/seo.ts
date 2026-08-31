import type { Metadata } from "next";
import type { Locale, LocalizedText } from "@/lib/i18n/config";
import { locales, pick } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/utils";
import type { FaqItem, Service, SiteSettings } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function buildMetadata(opts: {
  locale: Locale;
  path: string;
  title?: LocalizedText | string | null;
  description?: LocalizedText | string | null;
  ogImage?: string | null;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const { locale, path, type = "website" } = opts;
  const title = opts.title ? pick(opts.title, locale) : undefined;
  const description = opts.description ? pick(opts.description, locale) : undefined;
  const ogImage = opts.ogImage || null;

  const canonicalPath = path === "/" ? "" : path;

  return {
    metadataBase: new URL(siteUrl),
    title: title || undefined,
    description,
    alternates: {
      canonical: `/${locale}${canonicalPath}`,
      languages: {
        en: `/en${canonicalPath}`,
        ar: `/ar${canonicalPath}`,
        "x-default": `/en${canonicalPath}`,
      },
    },
    openGraph: {
      title: title || undefined,
      description,
      url: `/${locale}${canonicalPath}`,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "ar" ? "ar" : "en_US",
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: title || undefined,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: !opts.noindex,
      follow: !opts.noindex,
    },
  };
}

/* ── JSON-LD structured data ──────────────────────────────── */

export function organizationJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.site_name.en,
    alternateName: s.site_name.ar,
    url: siteUrl,
    description: s.site_description.en,
    ...(s.logo ? { logo: absoluteUrl(s.logo) } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.address ? { address: { "@type": "PostalAddress", streetAddress: s.address.en } } : {}),
    sameAs: s.social_links
      .filter((x) => x.enabled && x.url)
      .map((x) => x.url),
  };
}

export function websiteJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: s.site_name.en,
    alternateName: s.site_name.ar,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function serviceJsonLd(service: Service, locale: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: pick(service.name, locale),
    description: pick(service.short_description, locale),
    url: absoluteUrl(url),
    serviceType: pick(service.name, locale),
    provider: {
      "@type": "Organization",
      name: "Al-Izdehar Logistics",
    },
  };
}

export function faqJsonLd(faq: FaqItem[], locale: Locale) {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: pick(f.question, locale),
      acceptedAnswer: {
        "@type": "Answer",
        text: pick(f.answer, locale),
      },
    })),
  };
}

export function articleJsonLd(post: {
  title: LocalizedText;
  excerpt: LocalizedText;
  cover_image: string | null;
  published_at: string | null;
  author: LocalizedText | null;
}, locale: Locale, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: pick(post.title, locale),
    description: pick(post.excerpt, locale),
    ...(post.cover_image ? { image: absoluteUrl(post.cover_image) } : {}),
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.author ? { author: { "@type": "Person", name: pick(post.author, locale) } } : {}),
    mainEntityOfPage: absoluteUrl(url),
  };
}

export const supportedLocales = locales;
