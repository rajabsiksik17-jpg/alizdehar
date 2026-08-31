import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  const admin = createAdminClient();
  const { data, error } = await admin.from("media").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 422 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 422 });
  }

  const admin = createAdminClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${Date.now()}-${safeName}`;
  const { error: upErr } = await admin.storage.from("media").upload(key, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data: pub } = admin.storage.from("media").getPublicUrl(key);
  const row = {
    url: pub.publicUrl,
    alt: { en: "", ar: "" },
    title: { en: "", ar: "" },
    mime_type: file.type,
    size: file.size,
  };
  const { data, error } = await admin.from("media").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: Request) {
  const session = await getAdminUser();
  if (!session || !isSupabaseConfigured()) return unauthorized();

  let body: { id?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();

  // Remove the storage object (best effort — derive key from the public URL).
  if (body.url) {
    const m = body.url.match(/\/object\/public\/media\/(.+)$/);
    if (m) {
      try {
        await admin.storage.from("media").remove([decodeURIComponent(m[1])]);
      } catch {
        // ignore storage removal errors
      }
    }
  }

  const { error } = await admin.from("media").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
