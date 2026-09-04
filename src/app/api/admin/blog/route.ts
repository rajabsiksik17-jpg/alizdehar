import { NextResponse } from "next/server";
import { getAdminUser, requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const row = normalizeBody(body);
  if (!row.slug) {
    return NextResponse.json({ error: "A title is required to generate a link." }, { status: 422 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.from("blog_posts").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

function normalizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const title = body.title as { en?: string; ar?: string } | undefined;
  let slug = String(body.slug ?? "").trim();
  if (!slug) slug = slugify(title?.en ?? "") || slugify(title?.ar ?? "") || "";
  const status = body.status === "published" ? "published" : "draft";
  const row: Record<string, unknown> = {
    ...body,
    slug,
    status,
    published_at:
      status === "published"
        ? (body.published_at as string | null | undefined) ?? new Date().toISOString()
        : null,
  };
  return row;
}
