import "server-only";
import nodemailer from "nodemailer";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";

export interface EmailSettings {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean;
  smtp_user: string | null;
  smtp_pass: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
}

export async function getEmailSettings(): Promise<EmailSettings | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
    return (data as EmailSettings) ?? null;
  } catch {
    return null;
  }
}

export function isSmtpConfigured(settings: EmailSettings | null): boolean {
  return !!settings?.smtp_host && !!settings?.smtp_user;
}

export function createTransporter(settings: EmailSettings) {
  return nodemailer.createTransport({
    host: settings.smtp_host!,
    port: settings.smtp_port ?? 587,
    secure: settings.smtp_secure ?? false,
    auth: { user: settings.smtp_user!, pass: settings.smtp_pass ?? "" },
  });
}

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  const settings = await getEmailSettings();
  if (!isSmtpConfigured(settings)) {
    throw new Error("SMTP is not configured.");
  }
  const transporter = createTransporter(settings!);
  const from = settings!.from_email
    ? `"${settings!.from_name || "Al-Izdehar Logistics"}" <${settings!.from_email}>`
    : settings!.smtp_user!;
  await transporter.sendMail({
    from,
    replyTo: settings!.reply_to || settings!.from_email || undefined,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export async function testSmtpConnection(): Promise<{ ok: boolean; message: string }> {
  const settings = await getEmailSettings();
  if (!isSmtpConfigured(settings)) {
    return { ok: false, message: "SMTP is not configured." };
  }
  try {
    const transporter = createTransporter(settings!);
    await transporter.verify();
    return { ok: true, message: "SMTP connection successful." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "SMTP connection failed." };
  }
}
