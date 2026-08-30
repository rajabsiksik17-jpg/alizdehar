import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getServiceSlugs, getBlogSlugs } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [services, posts] = await Promise.all([getServiceSlugs(), getBlogSlugs()]);

  const staticPages = ["", "/about", "/services", "/careers", "/contact", "/blog"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPages) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
      });
    }
    for (const slug of services) {
      entries.push({
        url: `${siteUrl}/${locale}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.9,
      });
    }
    for (const slug of posts) {
      entries.push({
        url: `${siteUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
