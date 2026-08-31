import { NextResponse } from "next/server";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const position = String(form.get("position") ?? "").trim();

  if (form.get("website")) {
    return NextResponse.json({ success: true });
  }
  if (!name || !validEmail(email) || !position) {
    return NextResponse.json({ success: false }, { status: 422 });
  }

  const file = form.get("cv");
  if (!(file instanceof File)) {
    return NextResponse.json({ success: false }, { status: 422 });
  }
  if (!ALLOWED.includes(file.type) || file.size > MAX_SIZE) {
    return NextResponse.json({ success: false }, { status: 422 });
  }

  let cvPath: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const ext = file.name.split(".").pop() || "pdf";
      const key = `${Date.now()}-${sanitizeName(name)}.${ext}`;
      const { error: uploadError } = await admin.storage
        .from("applications")
        .upload(key, file, { contentType: file.type, upsert: false });
      if (!uploadError) cvPath = key;

      const lead = {
        type: "career",
        name,
        email,
        phone: String(form.get("phone") ?? ""),
        phone_country: String(form.get("phone_country") ?? ""),
        phone_dial_code: String(form.get("phone_dial_code") ?? ""),
        phone_e164: String(form.get("phone_e164") ?? ""),
        company: "",
        service: position,
        message: String(form.get("message") ?? ""),
        payload: {
          cv_path: cvPath,
          country: String(form.get("country") ?? ""),
          linkedin: String(form.get("linkedin") ?? ""),
          experience: String(form.get("experience") ?? ""),
        },
        status: "new",
      };
      await admin.from("leads").insert(lead);
    } catch {
      // Fail open in dev — do not block the applicant.
    }
  }

  return NextResponse.json({ success: true });
}
