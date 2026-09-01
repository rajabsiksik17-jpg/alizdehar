import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getAdminUser();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { to?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const to = String(body.to ?? "").trim();
  const subject = String(body.subject ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!to || !subject || !message) {
    return NextResponse.json({ error: "to, subject and message are required" }, { status: 422 });
  }

  try {
    await sendEmail({ to, subject, html: `<div style="font-family:Arial,sans-serif;color:#0b1d33;line-height:1.6">${message.replace(/\n/g, "<br/>")}</div>` });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to send email" },
      { status: 500 },
    );
  }
}
