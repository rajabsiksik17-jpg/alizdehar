"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";

const input =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-brand-900">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={input} />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-brand-900">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-brand-300" />
      {label}
    </label>
  );
}

type Status = "not_configured" | "testing" | "connected" | "failed";

function StatusBadge({ status, kind }: { status: Status; kind: "smtp" | "imap" }) {
  const { t } = useAdminLang();
  const map: Record<Status, { label: string; cls: string }> = {
    not_configured: { label: t("Not Configured", "غير مُهيّأ"), cls: "bg-surface-muted text-ink-muted" },
    testing: { label: t("Testing", "جارٍ الاختبار"), cls: "bg-amber-50 text-amber-700" },
    connected: { label: t("Connected", "متصل"), cls: "bg-emerald-50 text-emerald-700" },
    failed: { label: t("Connection Failed", "فشل الاتصال"), cls: "bg-red-50 text-red-700" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "connected" ? "bg-emerald-500" : status === "failed" ? "bg-red-500" : status === "testing" ? "bg-amber-500" : "bg-ink-muted"}`} />
      {kind.toUpperCase()} — {m.label}
    </span>
  );
}

export function EmailSettings() {
  const { t } = useAdminLang();
  const [form, setForm] = useState({
    smtp_host: "", smtp_port: "587", smtp_secure: true, smtp_user: "", smtp_pass: "",
    from_name: "", from_email: "", reply_to: "",
    imap_host: "", imap_port: "993", imap_secure: true, imap_user: "", imap_pass: "",
    notify_quote: true, notify_contact: true, notify_application: true, auto_reply: true,
    notify_security: true, notify_login: true, admin_email: "",
  });
  const [status, setStatus] = useState<{ smtp_verified: boolean; smtp_status: string | null; imap_verified: boolean; imap_status: string | null }>({ smtp_verified: false, smtp_status: null, imap_verified: false, imap_status: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<null | "smtp" | "imap">(null);
  const [msg, setMsg] = useState<{ ok: boolean; kind: "save" | "test"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/email");
        const json = await res.json();
        if (json.data) {
          setForm((f) => ({
            ...f,
            smtp_host: json.data.smtp_host ?? "",
            smtp_port: String(json.data.smtp_port ?? "587"),
            smtp_secure: json.data.smtp_secure ?? true,
            smtp_user: json.data.smtp_user ?? "",
            from_name: json.data.from_name ?? "",
            from_email: json.data.from_email ?? "",
            reply_to: json.data.reply_to ?? "",
            imap_host: json.data.imap_host ?? "",
            imap_port: String(json.data.imap_port ?? "993"),
            imap_secure: json.data.imap_secure ?? true,
            imap_user: json.data.imap_user ?? "",
            notify_quote: json.data.notify_quote ?? true,
            notify_contact: json.data.notify_contact ?? true,
            notify_application: json.data.notify_application ?? true,
            notify_security: json.data.notify_security ?? true,
            notify_login: json.data.notify_login ?? true,
            admin_email: json.data.admin_email ?? "",
            auto_reply: json.data.auto_reply ?? true,
          }));
          setStatus({
            smtp_verified: json.data.smtp_verified ?? false,
            smtp_status: json.data.smtp_status ?? null,
            imap_verified: json.data.imap_verified ?? false,
            imap_status: json.data.imap_status ?? null,
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      setMsg(json.success ? { ok: true, kind: "save", text: t("Saved. Test the connection to enable notifications.", "تم الحفظ. اختبر الاتصال لتفعيل الإشعارات.") } : { ok: false, kind: "save", text: json.error || "Failed" });
    } catch {
      setMsg({ ok: false, kind: "save", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function test(kind: "smtp" | "imap") {
    setTesting(kind);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: kind }),
      });
      const json = await res.json();
      setMsg({ ok: json.ok, kind: "test", text: json.message });
      if (kind === "smtp") {
        setStatus((s) => ({ ...s, smtp_verified: json.ok, smtp_status: json.ok ? "connected" : "failed" }));
      } else {
        setStatus((s) => ({ ...s, imap_verified: json.ok, imap_status: json.ok ? "connected" : "failed" }));
      }
    } catch {
      setMsg({ ok: false, kind: "test", text: "Test failed" });
    } finally {
      setTesting(null);
    }
  }

  function smtpStatus(): Status {
    if (testing === "smtp") return "testing";
    if (!form.smtp_host || !form.smtp_user) return "not_configured";
    if (status.smtp_status === "connected" && status.smtp_verified) return "connected";
    if (status.smtp_status === "failed") return "failed";
    return "not_configured";
  }

  if (loading) return <p className="py-10 text-center text-sm text-ink-muted">{t("Loading…", "جارٍ التحميل…")}</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-brand-900">SMTP (outgoing)</h2>
          <StatusBadge status={smtpStatus()} kind="smtp" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="SMTP Host" value={form.smtp_host} onChange={(v) => set("smtp_host", v)} />
          <Field label="Port" value={form.smtp_port} onChange={(v) => set("smtp_port", v)} />
          <Field label="Username" value={form.smtp_user} onChange={(v) => set("smtp_user", v)} />
          <Field label="Password" type="password" value={form.smtp_pass} onChange={(v) => set("smtp_pass", v)} />
          <Field label="From Name" value={form.from_name} onChange={(v) => set("from_name", v)} />
          <Field label="From Email" type="email" value={form.from_email} onChange={(v) => set("from_email", v)} />
          <Field label="Reply-To" type="email" value={form.reply_to} onChange={(v) => set("reply_to", v)} />
        </div>
        <div className="mt-3">
          <Toggle label="Use SSL/TLS (secure)" checked={form.smtp_secure} onChange={(v) => set("smtp_secure", v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-brand-900">IMAP (incoming)</h2>
          <StatusBadge status={testing === "imap" ? "testing" : !form.imap_host ? "not_configured" : status.imap_status === "connected" ? "connected" : status.imap_status === "failed" ? "failed" : "not_configured"} kind="imap" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="IMAP Host" value={form.imap_host} onChange={(v) => set("imap_host", v)} />
          <Field label="Port" value={form.imap_port} onChange={(v) => set("imap_port", v)} />
          <Field label="Username" value={form.imap_user} onChange={(v) => set("imap_user", v)} />
          <Field label="Password" type="password" value={form.imap_pass} onChange={(v) => set("imap_pass", v)} />
        </div>
        <div className="mt-3">
          <Toggle label="Use SSL/TLS (secure)" checked={form.imap_secure} onChange={(v) => set("imap_secure", v)} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-brand-900">{t("Notifications", "الإشعارات")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("Admin email (notifications recipient)", "بريد الإدارة (مستقبل الإشعارات)")} type="email" value={form.admin_email} onChange={(v) => set("admin_email", v)} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle label={t("Email on new quote request", "بريد عند طلب عرض سعر جديد")} checked={form.notify_quote} onChange={(v) => set("notify_quote", v)} />
          <Toggle label={t("Email on new contact message", "بريد عند رسالة تواصل جديدة")} checked={form.notify_contact} onChange={(v) => set("notify_contact", v)} />
          <Toggle label={t("Email on new application", "بريد عند طلب وظيفة جديد")} checked={form.notify_application} onChange={(v) => set("notify_application", v)} />
          <Toggle label={t("Security alert on new device login", "تنبيه أمني عند الدخول من جهاز جديد")} checked={form.notify_security} onChange={(v) => set("notify_security", v)} />
          <Toggle label={t("Email on admin login", "بريد عند تسجيل دخول المدير")} checked={form.notify_login} onChange={(v) => set("notify_login", v)} />
          <Toggle label={t("Send auto-reply to customer", "إرسال رد تلقائي للعميل")} checked={form.auto_reply} onChange={(v) => set("auto_reply", v)} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
        </button>
        <button type="button" onClick={() => test("smtp")} disabled={testing !== null} className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60">
          <Icon name="check" className="h-4 w-4" />
          {testing === "smtp" ? t("Testing…", "جارٍ الاختبار…") : t("Test SMTP connection", "اختبار اتصال SMTP")}
        </button>
        <button type="button" onClick={() => test("imap")} disabled={testing !== null} className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 disabled:opacity-60">
          <Icon name="mail" className="h-4 w-4" />
          {testing === "imap" ? t("Testing…", "جارٍ الاختبار…") : t("Test IMAP connection", "اختبار اتصال IMAP")}
        </button>
        {msg ? (
          <span className={`flex items-center gap-2 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
            {msg.ok ? <Icon name="check" className="h-4 w-4" /> : <Icon name="x" className="h-4 w-4" />}
            {msg.text}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-ink-muted">
        {t(
          "Email notifications only become active after a successful SMTP connection test. Saving settings alone does not enable email.",
          "لا تُفعَّل إشعارات البريد إلا بعد نجاح اختبار اتصال SMTP. حفظ الإعدادات وحده لا يفعّل البريد.",
        )}
      </p>
    </div>
  );
}
