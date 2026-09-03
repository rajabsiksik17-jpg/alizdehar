"use client";

import { useState } from "react";
import type { SiteSettings } from "@/types";
import { Icon } from "@/components/icon";
import { MediaPicker } from "@/components/admin/media-picker";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Field({
  label,
  value,
  onChange,
  type = "text",
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "rtl";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} dir={dir} className={input} />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({
    site_name_en: settings.site_name.en,
    site_name_ar: settings.site_name.ar,
    tagline_en: settings.tagline.en,
    tagline_ar: settings.tagline.ar,
    site_description_en: settings.site_description.en,
    site_description_ar: settings.site_description.ar,
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    whatsapp: settings.whatsapp ?? "",
    address_en: settings.address?.en ?? "",
    address_ar: settings.address?.ar ?? "",
    working_hours_en: settings.working_hours?.en ?? "",
    working_hours_ar: settings.working_hours?.ar ?? "",
    map_embed: settings.map_embed ?? "",
    ga_measurement_id: settings.ga_measurement_id ?? "",
    gtm_id: settings.gtm_id ?? "",
    logo: settings.logo ?? "",
    favicon: settings.favicon ?? "",
    maintenance_mode: settings.maintenance_mode ?? false,
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  async function save() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setState("error");
        setMessage(data.error || "Failed to save.");
      } else {
        setState("done");
        setMessage("Settings saved.");
      }
    } catch {
      setState("error");
      setMessage("Failed to save.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-brand-900">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Site name (EN)" value={form.site_name_en} onChange={set("site_name_en")} />
          <Field label="اسم الموقع (AR)" value={form.site_name_ar} onChange={set("site_name_ar")} dir="rtl" />
          <Field label="Tagline (EN)" value={form.tagline_en} onChange={set("tagline_en")} />
          <Field label="الشعار (AR)" value={form.tagline_ar} onChange={set("tagline_ar")} dir="rtl" />
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Site description (EN)" value={form.site_description_en} onChange={set("site_description_en")} />
          <Field label="وصف الموقع (AR)" value={form.site_description_ar} onChange={set("site_description_ar")} dir="rtl" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MediaPicker label="Logo" value={form.logo} onChange={(v) => setForm((f) => ({ ...f, logo: v }))} />
          <MediaPicker label="Favicon" value={form.favicon} onChange={(v) => setForm((f) => ({ ...f, favicon: v }))} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-brand-900">Contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Phone" value={form.phone} onChange={set("phone")} />
          <Field label="Email" value={form.email} onChange={set("email")} type="email" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp")} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Address (EN)" value={form.address_en} onChange={set("address_en")} />
          <Field label="العنوان (AR)" value={form.address_ar} onChange={set("address_ar")} dir="rtl" />
          <Field label="Working hours (EN)" value={form.working_hours_en} onChange={set("working_hours_en")} />
          <Field label="ساعات العمل (AR)" value={form.working_hours_ar} onChange={set("working_hours_ar")} dir="rtl" />
        </div>
        <div className="mt-4">
          <Field label="Map URL (Google Maps embed link)" value={form.map_embed} onChange={set("map_embed")} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-brand-900">Analytics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="GA4 Measurement ID" value={form.ga_measurement_id} onChange={set("ga_measurement_id")} />
          <Field label="Google Tag Manager ID" value={form.gtm_id} onChange={set("gtm_id")} />
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-bold text-brand-900">Maintenance Mode</h2>
        <label className="mt-4 flex items-center gap-3 text-sm text-brand-900">
          <input
            type="checkbox"
            checked={form.maintenance_mode}
            onChange={(e) => setForm((f) => ({ ...f, maintenance_mode: e.target.checked }))}
            className="h-4 w-4 rounded border-brand-300"
          />
          Close the public website (admins can still access it)
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={state === "loading"}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "loading" ? "Saving…" : "Save settings"}
        </button>
        {state === "done" || state === "error" ? (
          <span className={`flex items-center gap-2 text-sm font-semibold ${state === "error" ? "text-red-600" : "text-brand-700"}`}>
            {state === "done" ? <Icon name="check" className="h-4 w-4" /> : null}
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
