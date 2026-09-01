import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: Request) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  const url = new URL(req.url);
  const pageSlug = url.searchParams.get("page");
  if (!pageSlug) return NextResponse.json({ error: "Missing page" }, { status: 400 });

  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("id").eq("slug", pageSlug).maybeSingle();
  if (!page) return NextResponse.json({ sections: [] });

  const { data: sections, error } = await admin
    .from("page_sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections: sections ?? [] });
}

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const pageSlug = String(body.page ?? "");
  const type = String(body.type ?? "rich_text");
  if (!pageSlug) return NextResponse.json({ error: "Missing page" }, { status: 400 });

  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("id").eq("slug", pageSlug).maybeSingle();
  if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const { data: last } = await admin
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const row = {
    page_id: page.id,
    type,
    title: body.title ?? { en: "", ar: "" },
    subtitle: body.subtitle ?? null,
    body: body.body ?? null,
    image: body.image ?? null,
    items: body.items ?? [],
    settings: body.settings ?? {},
    hidden: false,
    sort_order: ((last?.[0]?.sort_order as number) ?? 0) + 1,
  };

  const { data, error } = await admin.from("page_sections").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
