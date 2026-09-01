"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";
import type { Lead } from "@/types";

const statusColors: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  in_progress: "bg-violet-50 text-violet-700",
  quoted: "bg-brand-50 text-brand-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-700",
  archived: "bg-surface-muted text-ink-muted",
};

const typeLabel: Record<string, string> = { quote: "Quote", contact: "Contact", career: "Application" };

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const { t } = useAdminLang();
  const [viewing, setViewing] = useState<Lead | null>(null);
  const [emailing, setEmailing] = useState<Lead | null>(null);

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-soft">
        <table className="w-full min-w-[820px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 text-start font-semibold">{t("Date", "التاريخ")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Name", "الاسم")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Email", "البريد")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Service", "الخدمة")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Status", "الحالة")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Actions", "إجراءات")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-surface-muted/60">
                <td className="px-4 py-3 text-ink-muted">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 font-medium text-brand-900">{lead.name}</td>
                <td className="px-4 py-3 text-ink-muted">{lead.email}</td>
                <td className="px-4 py-3 text-ink-muted">{lead.service || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[lead.status] ?? statusColors.new}`}>{lead.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setViewing(lead)} className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">
                      <Icon name="eye" className="h-3.5 w-3.5" />
                      {t("View", "عرض")}
                    </button>
                    <button type="button" onClick={() => setEmailing(lead)} className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">
                      <Icon name="mail" className="h-3.5 w-3.5" />
                      {t("Email", "بريد")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing ? <ViewModal lead={viewing} onClose={() => setViewing(null)} /> : null}
      {emailing ? <EmailModal lead={emailing} onClose={() => setEmailing(null)} /> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-sm text-brand-900">{value}</dd>
    </div>
  );
}

function ViewModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t } = useAdminLang();
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:max-w-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">
            {t(typeLabel[lead.type] || lead.type, typeLabel[lead.type] || lead.type)} — {lead.name}
          </h3>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <dl className="divide-y divide-brand-50">
          <Row label={t("Email", "البريد")} value={lead.email} />
          <Row label={t("Phone", "الهاتف")} value={lead.phone_e164 || lead.phone} />
          <Row label={t("Service", "الخدمة")} value={lead.service} />
          <Row label={t("Cargo type", "نوع البضاعة")} value={lead.cargo_type} />
          <Row label={t("Weight", "الوزن")} value={lead.weight ? `${lead.weight} ${lead.weight_unit ?? ""}` : null} />
          <Row label={t("Origin", "نقطة الانطلاق")} value={lead.origin} />
          <Row label={t("Destination", "الوجهة")} value={lead.destination} />
          <Row label={t("Shipment size", "حجم الشحنة")} value={lead.shipment_size} />
          <Row label={t("Shipping date", "تاريخ الشحن")} value={lead.shipping_date} />
          <Row label={t("Cargo description", "وصف البضاعة")} value={lead.cargo_description} />
          <Row label={t("Message", "الرسالة")} value={lead.message} />
        </dl>
      </div>
    </div>
  );
}

function EmailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const { t } = useAdminLang();
  const [subject, setSubject] = useState(`Re: ${lead.service || "Your request"}`);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: lead.email, subject, message }),
      });
      const json = await res.json();
      setMsg(json.success ? { ok: true, text: t("Email sent.", "تم إرسال البريد.") } : { ok: false, text: json.error || "Failed" });
    } catch {
      setMsg({ ok: false, text: "Failed to send" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:max-w-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">{t("Reply by email", "الرد بالبريد")}</h3>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Recipient", "المستلم")}</label>
            <input value={lead.email} disabled className="w-full rounded-lg border border-brand-100 bg-surface-muted px-3 py-2 text-sm text-ink-muted" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Subject", "الموضوع")}</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Message", "الرسالة")}</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
          </div>
          {msg ? <p className={`text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>{msg.text}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
              {t("Cancel", "إلغاء")}
            </button>
            <button type="button" onClick={send} disabled={sending} className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {sending ? t("Sending…", "جارٍ الإرسال…") : t("Send", "إرسال")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
