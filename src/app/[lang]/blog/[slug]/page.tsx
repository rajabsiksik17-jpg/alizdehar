import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, pick, getDictionary } from "@/lib/i18n/config";
import { getBlogPostBySlug, getBlogSlugs } from "@/lib/content";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { href } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { MediaImage } from "@/components/media-image";
import { RichText } from "@/components/rich-text";
import { Reveal } from "@/components/reveal";

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const post = await getBlogPostBySlug(slug);
  if (!post) return buildMetadata({ locale, path: "/blog", noindex: true });
  return buildMetadata({
    locale,
    path: `/blog/${slug}`,
    title: post.seo.seo_title || post.title,
    description: post.seo.seo_description || post.excerpt,
    ogImage: post.seo.og_image || post.cover_image,
    noindex: post.seo.noindex,
    type: "article",
  });
}

export default async function BlogPostPage({
  params,
}: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const dict = getDictionary(lang);
  const title = pick(post.title, lang);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(post, lang, href(lang, `/blog/${post.slug}`)),
          breadcrumbJsonLd([
            { name: dict.common.home, url: href(lang, "/") },
            { name: dict.nav.blog, url: href(lang, "/blog") },
            { name: title, url: href(lang, `/blog/${post.slug}`) },
          ]),
        ]}
      />

      <section className="bg-brand-950 pt-36 pb-16 text-white">
        <div className="mx-auto max-w-[var(--container-content)] px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl">
            {post.category ? (
              <p className="text-xs font-bold uppercase tracking-widest text-accent-400">{post.category}</p>
            ) : null}
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              {title}
            </h1>
            {post.author ? (
              <p className="mt-5 text-sm text-white/60">
                {pick(post.author, lang)}
                {post.published_at
                  ? ` · ${new Date(post.published_at).toLocaleDateString(lang === "ar" ? "ar" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`
                  : ""}
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>

      <Breadcrumbs
        locale={lang}
        items={[{ name: dict.nav.blog, path: "/blog" }, { name: title }]}
      />

      <article className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {post.cover_image ? (
            <MediaImage
              src={post.cover_image}
              alt={title}
              className="mb-10 aspect-[16/9] rounded-3xl shadow-lift"
              priority
            />
          ) : null}
          <RichText content={pick(post.content, lang)} />
        </div>
      </article>
    </>
  );
}
