import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/admin-auth";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_APPLICATION_FORM, type FormDef, type FormFieldDef } from "@/lib/job-forms";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ forms: [DEFAULT_APPLICATION_FORM] });
  }

  const admin = createAdminClient();
  const { data: forms, error } = await admin
    .from("forms")
    .select("*")
    .eq("entity", "application")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: FormDef[] = [];
  for (const form of forms ?? []) {
    const { data: fields } = await admin
      .from("form_fields")
      .select("*")
      .eq("form_id", form.id)
      .order("sort_order");
    result.push(
      normalizeForm(
        form as Record<string, unknown>,
        (fields ?? []) as Record<string, unknown>[],
      ),
    );
  }

  return NextResponse.json({ forms: result });
}

/** Create or update a form with its fields. */
export async function POST(req: Request) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: { id?: string; slug?: string; name?: { en: string; ar: string }; description?: { en: string; ar: string }; fields?: FormFieldDef[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.name?.en || !body.name?.ar || !body.slug) {
    return NextResponse.json({ error: "name (en/ar) and slug are required" }, { status: 422 });
  }

  const admin = createAdminClient();

  const formRow = {
    slug: body.slug,
    name: body.name,
    description: body.description ?? null,
    entity: "application",
    is_default: false,
  };

  let formId = body.id;
  if (formId) {
    const { error } = await admin.from("forms").update(formRow).eq("id", formId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data, error } = await admin.from("forms").insert(formRow).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    formId = data.id;
  }

  if (Array.isArray(body.fields)) {
    await admin.from("form_fields").delete().eq("form_id", formId);
    const fieldRows = body.fields.map((f, i) => ({
      form_id: formId,
      name: f.name,
      type: f.type,
      label: f.label,
      placeholder: f.placeholder ?? null,
      help_text: f.help_text ?? null,
      required: Boolean(f.required),
      options: f.type === "select" ? (f.options ?? []).map((o) => ({ ...o, label: o.label })) : [],
      sort_order: i + 1,
    }));
    if (fieldRows.length) {
      const { error } = await admin.from("form_fields").insert(fieldRows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, id: formId });
}

export async function DELETE(req: Request) {
  const denied = await requireApiPermission("content");
  if (denied) return denied;
  if (!isSupabaseConfigured()) return unauthorized();

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("forms").delete().eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

function normalizeForm(
  form: Record<string, unknown>,
  fields: Record<string, unknown>[],
): FormDef {
  const name = (form.name as { en: string; ar: string }) || { en: "", ar: "" };
  return {
    id: String(form.id),
    slug: String(form.slug ?? ""),
    name,
    description: (form.description as { en: string; ar: string } | null) ?? null,
    is_default: Boolean(form.is_default),
    entity: String(form.entity ?? "application"),
    fields: fields.map((f) => ({
      id: String(f.id),
      name: String(f.name ?? ""),
      type: (f.type as FormFieldDef["type"]) || "text",
      label: (f.label as { en: string; ar: string }) || { en: "", ar: "" },
      placeholder: (f.placeholder as { en: string; ar: string } | null) ?? null,
      help_text: (f.help_text as { en: string; ar: string } | null) ?? null,
      required: Boolean(f.required),
      options: Array.isArray(f.options) ? (f.options as FormFieldDef["options"]) : [],
      sort_order: Number(f.sort_order ?? 0),
    })),
  };
}
