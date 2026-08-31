"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";

const inputCls =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function SeoSettings() {
  const [form, setForm] = useState({
    default_og_image: "",
    google_site_verification: "",
    bing_site_verification: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const json = await res.json();
        if (json.data) {
          setForm({
            default_og_image: json.data.default_og_image ?? "",
            google_site_verification: json.data.google_site_verification ?? "",
            bing_site_verification: json.data.bing_site_verification ?? "",
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setMessage(json.success ? { ok: true, text: "SEO settings saved." } : { ok: false, text: json.error || "Failed to save." });
    } catch {
      setMessage({ ok: false, text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="py-10 text-center text-sm text-ink-muted">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">Global SEO</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-900">Default OG / social image URL</label>
            <input
              value={form.default_og_image}
              onChange={(e) => setForm((f) => ({ ...f, default_og_image: e.target.value }))}
              placeholder="https://…/og.png"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-900">Google Search Console verification</label>
            <input
              value={form.google_site_verification}
              onChange={(e) => setForm((f) => ({ ...f, google_site_verification: e.target.value }))}
              placeholder="Google verification code"
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand-900">Bing verification</label>
            <input
              value={form.bing_site_verification}
              onChange={(e) => setForm((f) => ({ ...f, bing_site_verification: e.target.value }))}
              placeholder="Bing verification code"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save SEO settings"}
        </button>
        {message ? (
          <span className={`flex items-center gap-2 text-sm font-semibold ${message.ok ? "text-brand-700" : "text-red-600"}`}>
            {message.ok ? <Icon name="check" className="h-4 w-4" /> : null}
            {message.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
