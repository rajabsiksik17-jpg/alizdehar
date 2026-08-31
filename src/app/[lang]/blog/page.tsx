import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getBlogPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { href } from "@/lib/site";
import { resolvePageBackground } from "@/lib/page-background";
import { Section } from "@/components/sections";
import { PageHero } from "@/components/page-hero";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/icon";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  return buildMetadata({
    locale,
    path: "/blog",
    title: { en: "Insights & Blog", ar: "المدونة والمقالات" },
    description: {
      en: "Insights and articles on logistics, shipping, freight, customs and international trade.",
      ar: "مقالات ورؤى حول اللوجستيات والشحن والنقل والجمارك والتجارة الدولية.",
    },
  });
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const posts = await getBlogPosts();
  const dict = getDictionary(lang);
  const background = await resolvePageBackground("blog");

  return (
    <>
      <PageHero
        title={dict.nav.blog}
        subtitle={pick(
          {
            en: "Logistics, shipping and international trade insights.",
            ar: "رؤى حول اللوجستيات والشحن والتجارة الدولية.",
          },
          lang,
        )}
        background={background}
      />

      <Breadcrumbs locale={lang} items={[{ name: dict.nav.blog }]} />

      <Section bg="muted">
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 60}>
                <a
                  href={href(lang, `/blog/${post.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <MediaImage
                    src={post.cover_image}
                    alt={pick(post.title, lang)}
                    className="aspect-[16/9]"
                    imageClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString(lang === "ar" ? "ar" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : null}
                    </p>
                    <h2 className="mt-2 text-lg font-bold text-brand-900">{pick(post.title, lang)}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                      {pick(post.excerpt, lang)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 group-hover:text-accent-600">
                      {dict.actions.readMore}
                      <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-16 text-center">
            <Icon name="file-text" className="mx-auto h-12 w-12 text-brand-200" />
            <h2 className="mt-4 text-xl font-bold text-brand-900">
              {pick({ en: "Articles coming soon", ar: "المقالات قادمة قريباً" }, lang)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-ink-muted">
              {pick(
                {
                  en: "We are preparing insightful content on logistics and international trade. Check back soon.",
                  ar: "نحضر محتوى قيماً حول اللوجستيات والتجارة الدولية. عد قريباً.",
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
