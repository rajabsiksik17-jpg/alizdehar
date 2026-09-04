import { NextResponse } from "next/server";
import { getAdminUser, requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("blog_posts")
    .select("published_at,status")
    .eq("slug", slug)
    .maybeSingle();

  const row = normalizeBody(body, slug, existing as { published_at?: string | null } | null);
  if (!row.slug) {
    return NextResponse.json({ error: "A title is required to generate a link." }, { status: 422 });
  }

  const { error } = await admin.from("blog_posts").update(row).eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();
  const { slug } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

function normalizeBody(
  body: Record<string, unknown>,
  fallbackSlug?: string,
  existing?: { published_at?: string | null } | null,
): Record<string, unknown> {
  const title = body.title as { en?: string; ar?: string } | undefined;
  let slug = String(body.slug ?? "").trim() || fallbackSlug || "";
  if (body.slug === undefined && title) slug = slugify(title.en ?? "") || slugify(title.ar ?? "") || fallbackSlug || "";

  const row: Record<string, unknown> = { ...body, slug };

  if (body.status === "published") {
    // Keep the original publish date on re-save; stamp it only on first publish.
    row.published_at = (body.published_at as string | null | undefined) ?? existing?.published_at ?? new Date().toISOString();
  } else if (body.status === "draft") {
    row.published_at = null;
  }

  return row;
}
