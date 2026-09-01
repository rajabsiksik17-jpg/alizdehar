"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";

interface MediaItem {
  id: string;
  url: string;
}

export function MediaPicker({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { t } = useAdminLang();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (res.ok) setItems(json.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        void load();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [open, load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok && json.data?.url) {
        onChange(json.data.url);
        setOpen(false);
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      {label ? <span className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</span> : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm transition-colors hover:border-brand-400"
      >
        {value ? (
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-10 w-14 rounded object-cover" />
            <span className="truncate text-xs text-ink-muted">{value.split("/").pop()}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2 text-brand-900">
            <Icon name="package" className="h-4 w-4 text-brand-500" />
            {t("Select image", "اختر صورة")}
          </span>
        )}
        <span className="text-xs text-brand-600">{t("Change", "تغيير")}</span>
      </button>
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
        >
          <Icon name="x" className="h-3.5 w-3.5" />
          {t("Remove image", "إزالة الصورة")}
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-brand-100 p-4">
              <h3 className="font-bold text-brand-900">{t("Media Library", "مكتبة الوسائط")}</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
                  {uploading ? t("Uploading…", "جارٍ الرفع…") : t("Upload", "رفع")}
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("Close", "إغلاق")} className="rounded-lg p-1.5 text-brand-800 hover:bg-brand-50">
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            </div>

            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4">
              {loading ? (
                <p className="col-span-full py-10 text-center text-sm text-ink-muted">{t("Loading…", "جارٍ التحميل…")}</p>
              ) : items.length ? (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className={`overflow-hidden rounded-xl border transition-colors ${value === item.url ? "border-accent-500 ring-2 ring-accent-200" : "border-brand-100 hover:border-brand-300"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  </button>
                ))
              ) : (
                <p className="col-span-full py-10 text-center text-sm text-ink-muted">{t("No images yet.", "لا توجد صور بعد.")}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
