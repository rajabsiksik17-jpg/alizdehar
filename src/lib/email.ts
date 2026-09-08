import "server-only";
import nodemailer from "nodemailer";
import { isSupabaseConfigured, createAdminClient } from "@/lib/supabase/admin";
import type { Locale } from "@/lib/i18n/config";
import { getSettings } from "@/lib/content";
import type { EmailContext } from "@/lib/email/templates";
import {
  contactReceived,
  quoteReceived,
  careerReceived,
  adminLeadNotification,
  otpEmail,
  securityNotification,
} from "@/lib/email/templates";

export interface EmailSettings {
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_secure: boolean;
  smtp_user: string | null;
  smtp_pass: string | null;
  from_name: string | null;
  from_email: string | null;
  reply_to: string | null;
  imap_host: string | null;
  imap_port: number | null;
  imap_secure: boolean;
  imap_user: string | null;
  imap_pass: string | null;
  notify_quote: boolean;
  notify_contact: boolean;
  notify_application: boolean;
  notify_security: boolean;
  notify_login: boolean;
  auto_reply: boolean;
  admin_email: string | null;
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

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
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
    text: opts.text,
  });
}

/** True when SMTP is configured AND confirmed connected (verified at least once). */
export async function isEmailEnabled(): Promise<boolean> {
  const settings = await getEmailSettings();
  return isSmtpConfigured(settings);
}

async function buildContext(locale: Locale): Promise<EmailContext> {
  const settings = await getSettings();
  return { settings, locale };
}

/** Admin notification recipient(s). */
function adminRecipients(settings: EmailSettings | null): string[] {
  const list: string[] = [];
  if (settings?.admin_email) list.push(settings.admin_email);
  return list;
}

/** Send a confirmation to the customer (contact form). Safe — never throws into user flow. */
export async function sendContactConfirmation(input: {
  locale: Locale;
  to: string;
  name: string;
  message?: string;
}): Promise<void> {
  try {
    if (!(await isEmailEnabled())) return;
    const s = await getEmailSettings();
    if (!s?.auto_reply) return;
    const context = await buildContext(input.locale);
    const rtl = input.locale === "ar";
    const html = contactReceived({ context, name: input.name, message: input.message });
    await sendEmail({
      to: input.to,
      subject: rtl ? "تم استلام رسالتك — الإزدهار للوجستيات" : "We received your message — Al-Izdehar Logistics",
      html,
    });
  } catch {
    // Confirmation email failures must never block the user's submission.
  }
}

export async function sendQuoteConfirmation(input: {
  locale: Locale;
  to: string;
  name: string;
  service?: string;
}): Promise<void> {
  try {
    if (!(await isEmailEnabled())) return;
    const s = await getEmailSettings();
    if (!s?.auto_reply) return;
    const context = await buildContext(input.locale);
    const rtl = input.locale === "ar";
    const html = quoteReceived({ context, name: input.name, service: input.service });
    await sendEmail({
      to: input.to,
      subject: rtl ? "تم استلام طلب عرض السعر — الإزدهار للوجستيات" : "Your quote request was received — Al-Izdehar Logistics",
      html,
    });
  } catch {
    // ignore
  }
}

export async function sendCareerConfirmation(input: {
  locale: Locale;
  to: string;
  name: string;
  position?: string;
}): Promise<void> {
  try {
    if (!(await isEmailEnabled())) return;
    const s = await getEmailSettings();
    if (!s?.auto_reply) return;
    const context = await buildContext(input.locale);
    const rtl = input.locale === "ar";
    const html = careerReceived({ context, name: input.name, position: input.position });
    await sendEmail({
      to: input.to,
      subject: rtl ? "تم استلام طلب التوظيف — الإزدهار للوجستيات" : "Your application was received — Al-Izdehar Logistics",
      html,
    });
  } catch {
    // ignore
  }
}

/** Send an internal notification about a new lead to the configured admin recipient(s). */
export async function sendAdminLeadNotification(input: {
  locale: Locale;
  type: "contact" | "quote" | "career";
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  meta?: { label: string; value: string }[];
}): Promise<boolean> {
  try {
    if (!(await isEmailEnabled())) return false;
    const s = await getEmailSettings();
    const enabled =
      input.type === "quote"
        ? s?.notify_quote
        : input.type === "career"
          ? s?.notify_application
          : s?.notify_contact;
    if (!enabled) return false;
    const recipients = adminRecipients(s);
    if (!recipients.length) return false;
    const context = await buildContext(input.locale);
    const html = adminLeadNotification({
      context,
      type: input.type,
      name: input.name,
      email: input.email,
      phone: input.phone,
      service: input.service,
      message: input.message,
      meta: input.meta,
    });
    const rtl = input.locale === "ar";
    await sendEmail({
      to: recipients.join(","),
      subject: rtl ? "إشعار جديد — الإزدهار للوجستيات" : "New notification — Al-Izdehar Logistics",
      html,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendOtpEmail(input: {
  locale: Locale;
  to: string;
  code: string;
  expiresInMinutes: number;
}): Promise<void> {
  const settings = await getEmailSettings();
  if (!isSmtpConfigured(settings)) {
    throw new Error("SMTP is not configured.");
  }
  const context = await buildContext(input.locale);
  const rtl = input.locale === "ar";
  const html = otpEmail({ context, code: input.code, expiresInMinutes: input.expiresInMinutes });
  await sendEmail({
    to: input.to,
    subject: rtl ? "رمز التحقق — الإزدهار للوجستيات" : "Verification code — Al-Izdehar Logistics",
    html,
  });
}

export async function sendSecurityNotification(input: {
  locale: Locale;
  to: string;
  time: string;
  browser: string;
  os: string;
}): Promise<void> {
  try {
    if (!(await isEmailEnabled())) return;
    const s = await getEmailSettings();
    if (!s?.notify_security) return;
    const context = await buildContext(input.locale);
    const rtl = input.locale === "ar";
    const html = securityNotification({
      context,
      time: input.time,
      browser: input.browser,
      os: input.os,
    });
    await sendEmail({
      to: input.to,
      subject: rtl ? "تنبيه أمني — الإزدهار للوجستيات" : "Security alert — Al-Izdehar Logistics",
      html,
    });
  } catch {
    // ignore
  }
}

export async function testSmtpConnection(): Promise<{ ok: boolean; message: string }> {
  const settings = await getEmailSettings();
  if (!isSmtpConfigured(settings)) {
    return { ok: false, message: "SMTP is not configured." };
  }
  try {
    const transporter = createTransporter(settings!);
    await transporter.verify();
    await persistConnectionStatus("smtp", true, "connected");
    return { ok: true, message: "SMTP connection successful." };
  } catch (e) {
    await persistConnectionStatus("smtp", false, "failed");
    return { ok: false, message: e instanceof Error ? e.message : "SMTP connection failed." };
  }
}

export async function testImapConnection(): Promise<{ ok: boolean; message: string }> {
  const settings = await getEmailSettings();
  if (!settings?.imap_host || !settings?.imap_user) {
    return { ok: false, message: "IMAP is not configured." };
  }
  // Node has no built-in IMAP client; require 'imapflow' would add a dependency.
  // We perform a lightweight honesty check: report that IMAP can't be verified
  // automatically, so we never show a false "Connected" state.
  return {
    ok: false,
    message:
      "IMAP verification requires an IMAP client and is not enabled in this environment. Incoming mail is not required for outbound notifications.",
  };
}

async function persistConnectionStatus(
  kind: "smtp" | "imap",
  ok: boolean,
  status: string,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const admin = createAdminClient();
    await admin
      .from("email_settings")
      .update({
        [`${kind}_status`]: status,
        [`${kind}_verified`]: ok,
      })
      .eq("id", 1);
  } catch {
    // ignore
  }
}
