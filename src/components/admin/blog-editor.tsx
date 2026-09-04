"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { slugify } from "@/lib/utils";
import { useAdminLang } from "@/components/admin/lang";

type L = { en: string; ar: string };

const input =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const lbl = "mb-1 block text-xs font-semibold text-brand-900";

function Localized({ label, labelAr, value, onChange, textarea }: { label: string; labelAr: string; value: L; onChange: (v: L) => void; textarea?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={lbl}>{label} (EN)</label>
        {textarea ? (
          <textarea value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} rows={7} className={input} />
        ) : (
          <input value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={input} />
        )}
      </div>
      <div>
        <label className={lbl}>{labelAr} (AR)</label>
        {textarea ? (
          <textarea value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} rows={7} dir="rtl" className={input} />
        ) : (
          <input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} dir="rtl" className={input} />
        )}
      </div>
    </div>
  );
}

export function BlogEditor({
  initial,
  isNew,
}: {
  initial: Record<string, unknown> | null;
  isNew: boolean;
}) {
  const { t } = useAdminLang();
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    title: (initial?.title as L) ?? { en: "", ar: "" },
    slug: (initial?.slug as string) ?? "",
    excerpt: (initial?.excerpt as L) ?? { en: "", ar: "" },
    content: (initial?.content as L) ?? { en: "", ar: "" },
    author: (initial?.author as L) ?? { en: "", ar: "" },
    status: (initial?.status as string) ?? "published",
    category: (initial?.category as string) ?? "",
    tags: Array.isArray(initial?.tags) ? (initial.tags as string[]).join(", ") : "",
    cover_image: (initial?.cover_image as string) ?? "",
    seo_title: ((initial?.seo as Record<string, unknown>)?.seo_title as L) ?? { en: "", ar: "" },
    seo_description: ((initial?.seo as Record<string, unknown>)?.seo_description as L) ?? { en: "", ar: "" },
    focus_keyword: ((initial?.seo as Record<string, unknown>)?.focus_keyword as L) ?? { en: "", ar: "" },
  }));
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!(initial?.slug as string));

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/crud/blog_categories");
        const json = await res.json();
        if (json.data) {
          setCategories(json.data.map((c: { slug: string; name: { en: string } }) => ({ slug: c.slug, name: c.name?.en ?? c.slug })));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg(null);
    const payload = {
      title: form.title,
      slug: form.slug.trim() || slugify(form.title.en) || slugify(form.title.ar),
      excerpt: form.excerpt,
      content: form.content,
      author: form.author,
      status: form.status,
      category: form.category || null,
      tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      cover_image: form.cover_image || null,
      seo: {
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        focus_keyword: form.focus_keyword,
      },
    };
    try {
      const url = isNew ? "/api/admin/blog" : `/api/admin/blog/${form.slug}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) setMsg({ ok: false, text: json.error || "Failed to save" });
      else {
        setMsg({ ok: true, text: t("Saved successfully.", "تم الحفظ بنجاح.") });
        if (isNew) router.push("/admin/blog");
      }
    } catch {
      setMsg({ ok: false, text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">{t("Basic information", "معلومات أساسية")}</h2>
        <div className="mt-4 space-y-3">
          <Localized
            label="Title"
            labelAr="العنوان"
            value={form.title}
            onChange={(v) => {
              set("title", v);
              if (!slugTouched) set("slug", slugify(v.en));
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Slug</label>
              <input
                value={form.slug}
                onChange={(e) => {
                  set("slug", e.target.value);
                  setSlugTouched(true);
                }}
                className={input}
                placeholder="auto-generated-from-title"
              />
            </div>
            <div>
              <label className={lbl}>{t("Status", "الحالة")}</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={input}>
                <option value="draft">{t("Draft", "مسودة")}</option>
                <option value="published">{t("Published", "منشور")}</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t("Category", "التصنيف")}</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={input}>
                <option value="">{t("Select category", "اختر التصنيف")}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>{t("Tags (comma separated)", "الوسوم (مفصولة بفاصلة)")}</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={input} placeholder="logistics, shipping, freight" />
            </div>
          </div>
          <Localized label="Author" labelAr="الكاتب" value={form.author} onChange={(v) => set("author", v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MediaPicker label={t("Cover image", "صورة الغلاف")} value={form.cover_image} onChange={(v) => set("cover_image", v)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">{t("Content", "المحتوى")}</h2>
        <div className="mt-4 space-y-3">
          <Localized label="Excerpt" labelAr="المقتطف" value={form.excerpt} onChange={(v) => set("excerpt", v)} textarea />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className={lbl}>{t("Content", "المحتوى")} (EN)</label>
              <RichTextEditor value={form.content.en} onChange={(en) => set("content", { ...form.content, en })} />
            </div>
            <div>
              <label className={lbl}>{t("Content", "المحتوى")} (AR)</label>
              <RichTextEditor value={form.content.ar} onChange={(ar) => set("content", { ...form.content, ar })} dir="rtl" />
            </div>
          </div>
          <p className="text-xs text-ink-muted">
            {t("Supports headings (##), bold (**text**), italic (*text*), lists (- item), links [text](url).", "يدعم العناوين (##) والنص الغامق (**نص**) والقوائم (- عنصر) والروابط [نص](رابط).")}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">SEO</h2>
        <div className="mt-4 space-y-3">
          <Localized label="SEO title" labelAr="عنوان SEO" value={form.seo_title} onChange={(v) => set("seo_title", v)} />
          <Localized label="Meta description" labelAr="وصف SEO" value={form.seo_description} onChange={(v) => set("seo_description", v)} textarea />
          <Localized label="Focus keyword" labelAr="الكلمة المفتاحية" value={form.focus_keyword} onChange={(v) => set("focus_keyword", v)} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
          {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
        </button>
        <button type="button" onClick={() => router.push("/admin/blog")} className="rounded-xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50">
          {t("Cancel", "إلغاء")}
        </button>
        {msg ? (
          <span className={`flex items-center gap-2 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
            {msg.ok ? <Icon name="check" className="h-4 w-4" /> : null}
            {msg.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
