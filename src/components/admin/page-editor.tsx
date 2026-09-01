"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { IconPicker } from "@/components/admin/icon-picker";
import { MediaPicker } from "@/components/admin/media-picker";
import { useAdminLang } from "@/components/admin/lang";

type L = { en: string; ar: string };
interface SectionItem {
  icon: string;
  label: L;
  description: L;
}
interface Section {
  id: string;
  type: string;
  title: L | null;
  subtitle: L | null;
  body: L | null;
  image: string | null;
  items: Record<string, unknown>[];
  hidden: boolean;
  sort_order: number;
}

const sectionTypes = [
  { type: "hero", label: "Hero", ar: "الهيرو" },
  { type: "rich_text", label: "Rich Text", ar: "نص" },
  { type: "image_text", label: "Image + Text", ar: "صورة ونص" },
  { type: "text_image", label: "Text + Image", ar: "نص وصورة" },
  { type: "features", label: "Features", ar: "مميزات" },
  { type: "services_grid", label: "Services", ar: "الخدمات" },
  { type: "statistics", label: "Statistics", ar: "إحصائيات" },
  { type: "process", label: "Process", ar: "مراحل" },
  { type: "timeline", label: "Timeline", ar: "خط زمني" },
  { type: "faq", label: "FAQ", ar: "أسئلة شائعة" },
  { type: "cta", label: "CTA", ar: "دعوة لاتخاذ إجراء" },
  { type: "testimonials", label: "Testimonials", ar: "آراء العملاء" },
  { type: "gallery", label: "Gallery", ar: "معرض" },
  { type: "logos", label: "Logos", ar: "شعارات" },
  { type: "trust", label: "Trust Bar", ar: "شريط الثقة" },
];

const input =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const lbl = "mb-1 block text-xs font-semibold text-brand-900";

function typeLabel(type: string, t: (en: string, ar: string) => string) {
  const found = sectionTypes.find((s) => s.type === type);
  return found ? t(found.label, found.ar) : type;
}

function Localized({ label, labelAr, value, onChange, textarea }: { label: string; labelAr: string; value: L; onChange: (v: L) => void; textarea?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={lbl}>{label} (EN)</label>
        {textarea ? (
          <textarea value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} rows={4} className={input} />
        ) : (
          <input value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} className={input} />
        )}
      </div>
      <div>
        <label className={lbl}>{labelAr} (AR)</label>
        {textarea ? (
          <textarea value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} rows={4} dir="rtl" className={input} />
        ) : (
          <input value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} dir="rtl" className={input} />
        )}
      </div>
    </div>
  );
}

export function PageEditor({ pageSlug }: { pageSlug: string }) {
  const { t } = useAdminLang();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Section | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sections?page=${pageSlug}`);
      const json = await res.json();
      if (res.ok) {
        setSections(json.sections || []);
        setError("");
      } else {
        setError(json.error || "Failed to load");
      }
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  async function move(index: number, dir: -1 | 1) {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    await Promise.all(
      next.map((s, i) =>
        fetch(`/api/admin/sections/${s.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i + 1 }),
        }),
      ),
    );
  }

  async function toggleHidden(s: Section) {
    await fetch(`/api/admin/sections/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hidden: !s.hidden }),
    });
    await load();
  }

  async function duplicate(s: Section) {
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageSlug, type: s.type, title: s.title, subtitle: s.subtitle, body: s.body, image: s.image, items: s.items, settings: {} }),
    });
    if (res.ok) await load();
  }

  async function remove(id: string) {
    if (!confirm(t("Delete this section?", "حذف هذا القسم؟"))) return;
    await fetch(`/api/admin/sections/${id}`, { method: "DELETE" });
    await load();
  }

  async function addSection(type: string) {
    setSaving(true);
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: pageSlug, type, title: { en: "", ar: "" }, items: [], settings: {} }),
    });
    setSaving(false);
    setAdding(false);
    if (res.ok) await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {sections.length} {t("section(s)", "قسم")}
        </p>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          {t("Add section", "إضافة قسم")}
        </button>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-muted">{t("Loading…", "جارٍ التحميل…")}</p>
      ) : sections.length ? (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={s.id} className={`rounded-2xl border bg-white p-4 shadow-soft ${s.hidden ? "border-dashed border-brand-200 opacity-60" : "border-brand-100"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Icon name="layers" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-brand-900">{typeLabel(s.type, t)}</p>
                    <p className="truncate text-xs text-ink-muted">{s.title?.en || s.title?.ar || t("Untitled section", "قسم بدون عنوان")}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 disabled:opacity-30" aria-label={t("Move up", "تحريك لأعلى")}>
                    <Icon name="chevron-up" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50 disabled:opacity-30" aria-label={t("Move down", "تحريك لأسفل")}>
                    <Icon name="chevron-down" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => toggleHidden(s)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" aria-label={t("Toggle visibility", "إظهار/إخفاء")}>
                    <Icon name={s.hidden ? "eye" : "eye"} className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => duplicate(s)} className="rounded-lg p-1.5 text-brand-600 hover:bg-brand-50" aria-label={t("Duplicate", "نسخ")}>
                    <Icon name="copy" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setEditing(s)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">
                    {t("Edit", "تعديل")}
                  </button>
                  <button type="button" onClick={() => remove(s.id)} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label={t("Delete", "حذف")}>
                    <Icon name="x" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center">
          <p className="text-sm text-ink-muted">{t("No sections yet.", "لا توجد أقسام بعد.")}</p>
        </div>
      )}

      {editing ? <SectionEditorModal section={editing} saving={saving} onClose={() => setEditing(null)} onSave={async (form) => { setSaving(true); await fetch(`/api/admin/sections/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setSaving(false); setEditing(null); await load(); }} /> : null}

      {adding ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setAdding(false)} aria-hidden="true" />
          <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lift">
            <h3 className="mb-4 text-lg font-bold text-brand-900">{t("Add section", "إضافة قسم")}</h3>
            <div className="grid grid-cols-2 gap-3">
              {sectionTypes.map((st) => (
                <button key={st.type} type="button" onClick={() => addSection(st.type)} disabled={saving} className="rounded-xl border border-brand-100 bg-surface-muted p-4 text-start transition-colors hover:border-brand-300 hover:bg-white">
                  <p className="font-semibold text-brand-900">{t(st.label, st.ar)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SectionEditorModal({
  section,
  saving,
  onClose,
  onSave,
}: {
  section: Section;
  saving: boolean;
  onClose: () => void;
  onSave: (form: Record<string, unknown>) => void;
}) {
  const { t } = useAdminLang();
  const [title, setTitle] = useState<L>(section.title ?? { en: "", ar: "" });
  const [subtitle, setSubtitle] = useState<L>(section.subtitle ?? { en: "", ar: "" });
  const [body, setBody] = useState<L>(section.body ?? { en: "", ar: "" });
  const [image, setImage] = useState<string>(section.image ?? "");
  const [items, setItems] = useState<SectionItem[]>(
    (section.items || []).map((it) => {
      const o = it as Record<string, unknown>;
      const label = (o.label ?? o.title ?? { en: "", ar: "" }) as L;
      return { icon: (o.icon as string) || "box", label: label || { en: "", ar: "" }, description: (o.description as L) || { en: "", ar: "" } };
    }),
  );

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:max-w-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">{t("Edit section", "تعديل القسم")}</h3>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Localized label="Title" labelAr="العنوان" value={title} onChange={setTitle} />
          <Localized label="Subtitle" labelAr="العنوان الفرعي" value={subtitle} onChange={setSubtitle} />
          <Localized label="Description" labelAr="الوصف" value={body} onChange={setBody} textarea />
          <MediaPicker label={t("Image", "الصورة")} value={image} onChange={setImage} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-900">{t("Items", "العناصر")}</span>
              <button type="button" onClick={() => setItems([...items, { icon: "box", label: { en: "", ar: "" }, description: { en: "", ar: "" } }])} className="inline-flex items-center gap-1 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                <Icon name="plus" className="h-3.5 w-3.5" />
                {t("Add item", "إضافة عنصر")}
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="rounded-xl border border-brand-100 bg-surface-muted p-3">
                  <div className="mb-2 flex justify-end">
                    <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="rounded-lg p-1 text-red-600 hover:bg-red-50" aria-label={t("Delete", "حذف")}>
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                  <IconPicker value={item.icon} onChange={(icon) => setItems(items.map((it, j) => (j === i ? { ...it, icon } : it)))} />
                  <div className="mt-2">
                    <Localized label="Label" labelAr="النص" value={item.label} onChange={(label) => setItems(items.map((it, j) => (j === i ? { ...it, label } : it)))} />
                  </div>
                  <div className="mt-2">
                    <Localized label="Description" labelAr="الوصف" value={item.description} onChange={(description) => setItems(items.map((it, j) => (j === i ? { ...it, description } : it)))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSave({ title, subtitle, body, image: image || null, items: items.map((it) => ({ icon: it.icon, label: it.label, title: it.label, description: it.description })) })}
            className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
          </button>
        </div>
      </div>
    </div>
  );
}
