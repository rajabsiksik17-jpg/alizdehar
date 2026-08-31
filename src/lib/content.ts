import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { LocalizedText } from "@/lib/i18n/config";
import type {
  BlogPost,
  Career,
  ClientLogo,
  GalleryItem,
  MenuItem,
  Page,
  Service,
  SiteSettings,
  Statistic,
  Testimonial,
  WhyUsItem,
} from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { seedSettings, seedMenu } from "@/content/settings";
import { seedServices } from "@/content/services";
import { homePage, seedWhyUs, seedStatistics } from "@/content/home";
import { aboutPage } from "@/content/about";
import {
  seedTestimonials,
  seedClients,
  seedBlogPosts,
  seedCareers,
  seedGallery,
  seedCargoTypes,
} from "@/content/misc";

function createReadonlyClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

/** Attempt a Supabase read; return null on missing config / error / empty. */
async function fromSupabase<T>(
  fn: (client: ReturnType<typeof createReadonlyClient>) => Promise<T | null>,
): Promise<T | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    return await fn(createReadonlyClient());
  } catch {
    return null;
  }
}

/* ── Settings & menu ──────────────────────────────────────── */

export async function getSettings(): Promise<SiteSettings> {
  const row = await fromSupabase(async (c) => {
    const { data, error } = await c.from("settings").select("*").eq("id", 1).single();
    if (error || !data) return null;
    const { data: social } = await c
      .from("social_links")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    return { ...data, social_links: social ?? [] } as SiteSettings;
  });
  return row ?? seedSettings;
}

export async function getMenu(): Promise<MenuItem[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("menu_items")
      .select("*")
      .eq("enabled", true)
      .eq("parent_id", null)
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as MenuItem[];
  });
  return rows ?? seedMenu;
}

/* ── Services ─────────────────────────────────────────────── */

export async function getServices(): Promise<Service[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("services")
      .select("*")
      .eq("status", "published")
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as Service[];
  });
  return rows ?? seedServices.filter((s) => s.status === "published");
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const row = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return data as Service;
  });
  return (
    row ?? seedServices.find((s) => s.slug === slug && s.status === "published") ?? null
  );
}

export async function getServiceSlugs(): Promise<string[]> {
  const services = await getServices();
  return services.map((s) => s.slug);
}

/* ── Pages ────────────────────────────────────────────────── */

const seedPages: Record<string, Page> = {
  home: homePage,
  about: aboutPage,
};

export async function getPage(slug: string): Promise<Page | null> {
  const row = await fromSupabase(async (c) => {
    const { data: page, error } = await c
      .from("pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !page) return null;
    const { data: sections } = await c
      .from("page_sections")
      .select("*")
      .eq("page_id", page.id)
      .eq("hidden", false)
      .order("sort_order");
    return { ...page, sections: (sections ?? []) as Page["sections"] } as Page;
  });
  return row ?? seedPages[slug] ?? null;
}

export async function getPageSlugs(): Promise<string[]> {
  return Object.keys(seedPages);
}

/* ── Global reusable blocks ───────────────────────────────── */

export async function getWhyUs(): Promise<WhyUsItem[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("why_us")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as WhyUsItem[];
  });
  return rows ?? seedWhyUs;
}

export async function getStatistics(): Promise<Statistic[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("statistics")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as Statistic[];
  });
  return rows ?? seedStatistics;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("testimonials")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as Testimonial[];
  });
  return rows ?? seedTestimonials;
}

export async function getClients(): Promise<ClientLogo[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("clients")
      .select("*")
      .eq("enabled", true)
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as ClientLogo[];
  });
  return rows ?? seedClients;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("gallery")
      .select("*")
      .order("sort_order");
    if (error || !data?.length) return null;
    return data as GalleryItem[];
  });
  return rows ?? seedGallery;
}

/* ── Blog ─────────────────────────────────────────────────── */

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as BlogPost[];
  });
  return rows ?? seedBlogPosts;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const row = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogPost;
  });
  return row ?? seedBlogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await getBlogPosts();
  return posts.map((p) => p.slug);
}

/* ── Careers ──────────────────────────────────────────────── */

export async function getCareers(): Promise<Career[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("careers")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (error || !data?.length) return null;
    return data as Career[];
  });
  return rows ?? seedCareers;
}

export async function getCareerBySlug(slug: string): Promise<Career | null> {
  const row = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("careers")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error || !data) return null;
    return data as Career;
  });
  return row ?? seedCareers.find((j) => j.slug === slug) ?? null;
}

export async function getCareerSlugs(): Promise<string[]> {
  const careers = await getCareers();
  return careers.map((j) => j.slug);
}

/* ── Cargo types ──────────────────────────────────────────── */

export async function getCargoTypes(): Promise<LocalizedText[]> {
  const rows = await fromSupabase(async (c) => {
    const { data, error } = await c
      .from("cargo_types")
      .select("label")
      .order("sort_order");
    if (error || !data?.length) return null;
    return data.map((r: { label: LocalizedText }) => r.label) as LocalizedText[];
  });
  return rows ?? seedCargoTypes;
}
