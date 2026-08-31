import "server-only";
import { getSettings } from "@/lib/content";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export interface PageBackground {
  image: string | null;
  mobile_image: string | null;
  position: string;
  overlay: number;
  color: string;
  align: "start" | "center";
  heading_color: string;
  description_color: string;
}

export const defaultPageBackground: PageBackground = {
  image: null,
  mobile_image: null,
  position: "center",
  overlay: 0.86,
  color: "#081c33",
  align: "start",
  heading_color: "#ffffff",
  description_color: "rgba(255,255,255,0.72)",
};

/**
 * Resolve the effective hero background for a page:
 * per-page override (`pages.background`) > global default (`settings.page_background`).
 */
export async function resolvePageBackground(slug: string): Promise<PageBackground> {
  const global =
    (await getSettings()).page_background ?? defaultPageBackground;

  let perPage: Partial<PageBackground> | null = null;
  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("pages")
        .select("background")
        .eq("slug", slug)
        .maybeSingle();
      if (data?.background) perPage = data.background as Partial<PageBackground>;
    } catch {
      perPage = null;
    }
  }

  return { ...global, ...(perPage ?? {}) } as PageBackground;
}
