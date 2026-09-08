import type { SiteSettings } from "@/types";

export interface EmailContext {
  settings: SiteSettings;
  locale: "en" | "ar";
}

type Social = { label: string; url: string };

/** Build a localized, responsive HTML email with Al-Izdehar branding. */
export function baseTemplate(opts: {
  locale: "en" | "ar";
  title: string;
  bodyHtml: string;
  context: EmailContext;
  preheader?: string;
}): string {
  const { locale, title, bodyHtml, context, preheader } = opts;
  const { settings } = context;
  const rtl = locale === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";

  const siteName = locale === "ar" ? settings.site_name.ar : settings.site_name.en;
  const tagline = locale === "ar" ? settings.tagline.ar : settings.tagline.en;
  const phone = settings.phone;
  const email = settings.email;
  const logo = settings.logo;

  const socials: Social[] = (settings.social_links || [])
    .filter((s) => s.enabled && s.url)
    .map((s) => ({ label: s.label || s.platform, url: s.url }));

  const phoneRow = phone
    ? `<td style="padding:0 6px;"><a href="tel:${phone}" style="color:#5b6b82;text-decoration:none;font-size:13px;">${phone}</a></td>`
    : "";
  const emailRow = email
    ? `<td style="padding:0 6px;"><a href="mailto:${email}" style="color:#5b6b82;text-decoration:none;font-size:13px;">${email}</a></td>`
    : "";

  const socialHtml = socials
    .map(
      (s) =>
        `<a href="${s.url}" target="_blank" rel="noopener" style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;background:#0f2a48;border-radius:8px;color:#ffffff;text-decoration:none;margin:${rtl ? "0 0 0 6px" : "0 6px 0 0"};font-size:13px;font-weight:bold;">${s.label.charAt(0).toUpperCase()}</a>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI','Cairo',Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader || title}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f6f9;padding:24px 12px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6ebf2;">

        <!-- Header -->
        <tr>
          <td style="background-color:#0f2a48;padding:28px 32px;text-align:${align};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="text-align:${align};">
                  ${logo ? `<img src="${logo}" alt="${siteName}" width="44" height="44" style="display:block;border-radius:8px;${rtl ? "margin-left:12px;float:right;" : "margin-right:12px;float:left;"}" />` : ""}
                  <span style="display:inline-block;vertical-align:middle;">
                    <span style="display:block;font-size:18px;font-weight:800;color:#ffffff;">${siteName}</span>
                    <span style="display:block;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#d98c1f;">${tagline}</span>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:32px 32px 8px 32px;">
            <h2 style="margin:0;font-size:22px;font-weight:800;color:#0b1d33;text-align:${align};">${title}</h2>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:16px 32px 8px 32px;text-align:${align};">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:16px 32px;">
            <div style="height:1px;background-color:#eef1f6;"></div>
          </td>
        </tr>

        <!-- Contact & social -->
        <tr>
          <td style="padding:16px 32px 8px 32px;text-align:${align};">
            <p style="margin:0 0 8px;font-size:12px;color:#8895a7;">${rtl ? "بيانات التواصل" : "Contact details"}</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>${phoneRow}${emailRow}</tr>
            </table>
            ${socialHtml ? `<div style="margin-top:14px;">${socialHtml}</div>` : ""}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f8fafc;padding:20px 32px;text-align:center;">
            <p dir="${dir}" style="margin:0;font-size:11px;color:#9aa6b6;line-height:1.6;">
              ${rtl ? "©" : "©"} ${new Date().getFullYear()} ${siteName} — ${rtl ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Contact request received (customer confirmation). */
export function contactReceived(opts: { context: EmailContext; name: string; message?: string }): string {
  const { context, name, message } = opts;
  const rtl = context.locale === "ar";
  const t = {
    head: rtl ? "تم استلام رسالتك بنجاح" : "Your message has been received",
    thanks: rtl ? `شكراً ${name} لتواصلك معنا.` : `Thank you ${name} for contacting us.`,
    note: rtl
      ? "تم استلام رسالتك وسيتواصل معك فريقنا في أقرب وقت ممكن."
      : "We have received your message and our team will get back to you as soon as possible.",
  };
  const body = `<p style="margin:0 0 16px;font-size:15px;color:#3a4859;line-height:1.7;">${t.thanks}<br />${t.note}</p>${
    message
      ? `<div style="background:#f8fafc;border-radius:10px;padding:14px 16px;font-size:13px;color:#5b6b82;line-height:1.6;">${message.replace(/\n/g, "<br />")}</div>`
      : ""
  }`;
  return baseTemplate({ locale: context.locale, title: t.head, bodyHtml: body, context });
}

/** Quote request received (customer confirmation). */
export function quoteReceived(opts: { context: EmailContext; name: string; service?: string }): string {
  const { context, name, service } = opts;
  const rtl = context.locale === "ar";
  const t = {
    head: rtl ? "تم استلام طلب عرض السعر" : "Your quote request has been received",
    thanks: rtl ? `شكراً ${name} لتقديم طلب عرض سعر.` : `Thank you ${name} for submitting a quote request.`,
    note: rtl
      ? "يقوم فريقنا بمراجعة طلبك وسنرسل لك عرض السعر في أقرب وقت ممكن."
      : "Our team is reviewing your request and we will send you a quote as soon as possible.",
  };
  const body = `<p style="margin:0 0 16px;font-size:15px;color:#3a4859;line-height:1.7;">${t.thanks}<br />${t.note}</p>${
    service
      ? `<div style="background:#fdf3e7;border:1px solid #f5dfbc;border-radius:10px;padding:12px 16px;font-size:13px;color:#7a5a1f;">${rtl ? "الخدمة المطلوبة:" : "Requested service:"} <strong>${service}</strong></div>`
      : ""
  }`;
  return baseTemplate({ locale: context.locale, title: t.head, bodyHtml: body, context });
}

/** Career application received (customer confirmation). */
export function careerReceived(opts: { context: EmailContext; name: string; position?: string }): string {
  const { context, name, position } = opts;
  const rtl = context.locale === "ar";
  const t = {
    head: rtl ? "تم استلام طلب التوظيف" : "Your application has been received",
    thanks: rtl ? `شكراً ${name} لتقديم طلبك.` : `Thank you ${name} for applying.`,
    note: rtl
      ? "تم استلام طلبك وسيتواصل معك فريق الموارد البشرية في حال تطابق مؤهلاتك."
      : "We received your application and our HR team will contact you if your profile matches.",
  };
  const body = `<p style="margin:0 0 16px;font-size:15px;color:#3a4859;line-height:1.7;">${t.thanks}<br />${t.note}</p>${
    position
      ? `<div style="background:#fdf3e7;border:1px solid #f5dfbc;border-radius:10px;padding:12px 16px;font-size:13px;color:#7a5a1f;">${rtl ? "الوظيفة المتقدم لها:" : "Position:"} <strong>${position}</strong></div>`
      : ""
  }`;
  return baseTemplate({ locale: context.locale, title: t.head, bodyHtml: body, context });
}

/** Admin notification — new lead (contact / quote / career). */
export function adminLeadNotification(opts: {
  context: EmailContext;
  type: "contact" | "quote" | "career";
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  meta?: { label: string; value: string }[];
}): string {
  const { context, type, name, email, phone, service, message, meta } = opts;
  const locale = context.locale;
  const rtl = locale === "ar";
  const typeLabel =
    type === "quote"
      ? rtl
        ? "طلب عرض سعر جديد"
        : "New Quote Request"
      : type === "career"
        ? rtl
          ? "طلب توظيف جديد"
          : "New Career Application"
        : rtl
          ? "رسالة تواصل جديدة"
          : "New Contact Message";

  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#8895a7;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 0 6px 16px;font-size:14px;color:#0b1d33;">${value}</td></tr>`
      : "";

  const metaRows = (meta || []).map((m) => row(m.label, m.value)).join("");

  const body = `
    <div style="background:#fdf3e7;border:1px solid #f5dfbc;border-radius:10px;padding:10px 16px;margin-bottom:16px;font-size:13px;font-weight:700;color:#7a5a1f;">${typeLabel}</div>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;">
      ${row(rtl ? "الاسم" : "Name", name)}
      ${row(rtl ? "البريد الإلكتروني" : "Email", email)}
      ${row(rtl ? "الهاتف" : "Phone", phone || "")}
      ${row(rtl ? "الخدمة" : "Service", service || "")}
      ${metaRows}
    </table>
    ${message ? `<div style="background:#f8fafc;border-radius:10px;padding:14px 16px;margin-top:12px;font-size:13px;color:#5b6b82;line-height:1.6;">${message.replace(/\n/g, "<br />")}</div>` : ""}
  `;

  return baseTemplate({
    locale,
    title: typeLabel,
    bodyHtml: body,
    context,
  });
}

/** OTP email. */
export function otpEmail(opts: {
  context: EmailContext;
  code: string;
  expiresInMinutes: number;
}): string {
  const { context, code, expiresInMinutes } = opts;
  const rtl = context.locale === "ar";
  const t = {
    head: rtl ? "رمز التحقق من الدخول" : "Your login verification code",
    note: rtl
      ? "أدخل الرمز التالي لإكمال تسجيل الدخول إلى لوحة التحكم. لا تشارك هذا الرمز مع أي شخص."
      : "Enter the following code to complete signing in to the admin dashboard. Do not share this code with anyone.",
    expires: rtl
      ? `تنتهي صلاحية هذا الرمز خلال ${expiresInMinutes} دقيقة.`
      : `This code expires in ${expiresInMinutes} minutes.`,
  };
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#3a4859;line-height:1.7;">${t.note}</p>
    <div style="background:#0f2a48;border-radius:12px;padding:22px;text-align:center;">
      <div style="font-size:32px;font-weight:800;letter-spacing:0.5em;color:#ffffff;">${code}</div>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#8895a7;">${t.expires}</p>
  `;
  return baseTemplate({ locale: context.locale, title: t.head, bodyHtml: body, context });
}

/** Security notification (new device login). */
export function securityNotification(opts: {
  context: EmailContext;
  time: string;
  browser: string;
  os: string;
}): string {
  const { context, time, browser, os } = opts;
  const rtl = context.locale === "ar";
  const t = {
    head: rtl ? "تنبيه أمني: تسجيل دخول جديد" : "Security alert: New sign-in",
    note: rtl
      ? "تم تسجيل الدخول إلى حسابك في لوحة التحكم من جهاز أو بيئة جديدة. إذا لم تكن أنت من قام بذلك، يرجى تغيير كلمة المرور فوراً."
      : "A sign-in to your admin account was detected from a new device or environment. If this was not you, please change your password immediately.",
  };
  const row = (label: string, value: string) =>
    `<tr><td style="padding:5px 0;font-size:13px;color:#8895a7;">${label}</td><td style="padding:5px 0 5px 16px;font-size:13px;color:#0b1d33;">${value}</td></tr>`;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#3a4859;line-height:1.7;">${t.note}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      ${row(rtl ? "وقت الدخول" : "Time", time)}
      ${row(rtl ? "المتصفح" : "Browser", browser)}
      ${row(rtl ? "نظام التشغيل" : "Operating system", os)}
    </table>
  `;
  return baseTemplate({ locale: context.locale, title: t.head, bodyHtml: body, context });
}
