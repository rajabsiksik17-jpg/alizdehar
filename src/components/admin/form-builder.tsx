"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";
import {
  FIELD_TYPE_LABELS,
  DEFAULT_APPLICATION_FORM,
  type FormDef,
  type FormFieldDef,
  type FormFieldType,
} from "@/lib/job-forms";

const input =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const lbl = "mb-1 block text-xs font-semibold text-brand-900";

const FIELD_TYPES: FormFieldType[] = ["text", "email", "phone", "country", "textarea", "select", "number", "url", "date", "file"];

export function FormBuilder() {
  const { t, lang } = useAdminLang();
  const [forms, setForms] = useState<FormDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | "default" | null>(null);
  const [draft, setDraft] = useState<FormDef | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/forms");
      const json = await res.json();
      if (res.ok) setForms(json.forms || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(id);
  }, [load]);

  function openDefault() {
    setSelectedId("default");
    setDraft(JSON.parse(JSON.stringify(DEFAULT_APPLICATION_FORM)));
    setMsg(null);
  }

  function openForm(f: FormDef) {
    setSelectedId(f.id ?? null);
    setDraft(JSON.parse(JSON.stringify(f)));
    setMsg(null);
  }

  function newForm() {
    setSelectedId("new");
    setDraft({
      slug: "",
      name: { en: "", ar: "" },
      description: null,
      is_default: false,
      entity: "application",
      fields: [],
    });
    setMsg(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId && selectedId !== "new" ? selectedId : undefined,
          slug: draft.slug || "form-" + Date.now(),
          name: draft.name,
          description: draft.description,
          fields: draft.fields,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMsg({ ok: true, text: t("Saved successfully.", "تم الحفظ بنجاح.") });
        await load();
      } else {
        setMsg({ ok: false, text: json.error || "Failed to save" });
      }
    } catch {
      setMsg({ ok: false, text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  }

  async function removeForm(id: string) {
    if (!confirm(t("Delete this form?", "حذف هذا النموذج؟"))) return;
    await fetch("/api/admin/forms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSelectedId(null);
    setDraft(null);
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-brand-900">{t("Application forms", "نماذج التقديم")}</p>
            <button type="button" onClick={newForm} className="inline-flex items-center gap-1 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
              <Icon name="plus" className="h-3.5 w-3.5" />
              {t("New", "جديد")}
            </button>
          </div>
          <button
            type="button"
            onClick={openDefault}
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${selectedId === "default" ? "bg-brand-50 font-semibold text-brand-900" : "text-brand-800 hover:bg-surface-muted"}`}
          >
            <Icon name="star" className="h-4 w-4 text-accent-500" />
            {lang === "ar" ? DEFAULT_APPLICATION_FORM.name.ar : DEFAULT_APPLICATION_FORM.name.en}
            <span className="ms-auto rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">{t("Default", "افتراضي")}</span>
          </button>
          {!loading && forms.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => openForm(f)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${selectedId === f.id ? "bg-brand-50 font-semibold text-brand-900" : "text-brand-800 hover:bg-surface-muted"}`}
            >
              <Icon name="file-text" className="h-4 w-4 text-brand-400" />
              {lang === "ar" ? f.name.ar : f.name.en}
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        {draft ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              {selectedId === "default" ? (
                <p className="rounded-lg bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-800">
                  {t("Editing the default form. Changes apply to every vacancy that uses it.", "أنت تعدّل النموذج الافتراضي. تُطبّق التغييرات على كل وظيفة تستخدمه.")}
                </p>
              ) : null}
              <div className="mt-3 grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>{t("Form name", "اسم النموذج")} (EN)</label>
                    <input value={draft.name.en} onChange={(e) => setDraft((d) => d && { ...d, name: { ...d.name, en: e.target.value } })} className={input} />
                  </div>
                  <div>
                    <label className={lbl}>{t("اسم النموذج", "اسم النموذج")} (AR)</label>
                    <input value={draft.name.ar} onChange={(e) => setDraft((d) => d && { ...d, name: { ...d.name, ar: e.target.value } })} dir="rtl" className={input} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-brand-900">{t("Fields", "الحقول")} ({draft.fields.length})</p>
                <button
                  type="button"
                  onClick={() => setDraft((d) => d && { ...d, fields: [...d.fields, { name: "field_" + d.fields.length, type: "text", label: { en: "", ar: "" }, required: false, sort_order: d.fields.length + 1 }] })}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <Icon name="plus" className="h-3.5 w-3.5" />
                  {t("Add field", "إضافة حقل")}
                </button>
              </div>
              <div className="space-y-2">
                {draft.fields.map((field, i) => (
                  <FieldRow key={i} field={field} index={i} total={draft.fields.length} lang={lang} t={t} onChange={(upd) => setDraft((d) => d && { ...d, fields: d.fields.map((f, j) => (j === i ? upd(f) : f)) })} onRemove={() => setDraft((d) => d && { ...d, fields: d.fields.filter((_, j) => j !== i) })} onMove={(dir) => setDraft((d) => {
                    if (!d) return d;
                    const next = [...d.fields];
                    const target = i + dir;
                    if (target < 0 || target >= next.length) return d;
                    [next[i], next[target]] = [next[target], next[i]];
                    return { ...d, fields: next };
                  })} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
              </button>
              {selectedId !== "default" && selectedId !== "new" && draft.id ? (
                <button type="button" onClick={() => removeForm(draft.id!)} className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                  {t("Delete", "حذف")}
                </button>
              ) : null}
              {msg ? (
                <span className={`flex items-center gap-2 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
                  {msg.ok ? <Icon name="check" className="h-4 w-4" /> : null}
                  {msg.text}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
            <p className="text-sm text-ink-muted">{t("Select a form to edit, or create a new one.", "اختر نموذجاً لتعديله أو أنشئ نموذجاً جديداً.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  index,
  total,
  lang,
  t,
  onChange,
  onRemove,
  onMove,
}: {
  field: FormFieldDef;
  index: number;
  total: number;
  lang: "en" | "ar";
  t: (en: string, ar: string) => string;
  onChange: (upd: (f: FormFieldDef) => FormFieldDef) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(false);
  const setLocalized = (key: "label" | "placeholder" | "help_text", ln: "en" | "ar", value: string) => {
    onChange((f) => ({ ...f, [key]: { en: "", ar: "", ...(f[key] as object), [ln]: value } }));
  };

  return (
    <div className="rounded-xl border border-brand-100 bg-surface-muted p-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="rounded p-1 text-brand-600 hover:bg-brand-100 disabled:opacity-30" aria-label={t("Move up", "تحريك لأعلى")}>
          <Icon name="chevron-up" className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} className="rounded p-1 text-brand-600 hover:bg-brand-100 disabled:opacity-30" aria-label={t("Move down", "تحريك لأسفل")}>
          <Icon name="chevron-down" className="h-4 w-4" />
        </button>
        <span className="flex-1 truncate text-sm font-semibold text-brand-900">
          {lang === "ar" ? (field.label.ar || "حقل") : (field.label.en || "Field")}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold capitalize text-brand-600">
          {t(FIELD_TYPE_LABELS[field.type].en, FIELD_TYPE_LABELS[field.type].ar)}
        </span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="rounded p-1 text-brand-600 hover:bg-brand-100" aria-label={t("Configure", "إعداد")}>
          <Icon name="cog" className="h-4 w-4" />
        </button>
        <button type="button" onClick={onRemove} className="rounded p-1 text-red-600 hover:bg-red-50" aria-label={t("Delete", "حذف")}>
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-brand-100 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t("Label", "التسمية")} (EN)</label>
              <input value={field.label.en} onChange={(e) => setLocalized("label", "en", e.target.value)} className={input} />
            </div>
            <div>
              <label className={lbl}>{t("التسمية", "التسمية")} (AR)</label>
              <input value={field.label.ar} onChange={(e) => setLocalized("label", "ar", e.target.value)} dir="rtl" className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>{t("Field name", "اسم الحقل")}</label>
              <input value={field.name} onChange={(e) => onChange((f) => ({ ...f, name: e.target.value }))} className={input} />
            </div>
            <div>
              <label className={lbl}>{t("Type", "النوع")}</label>
              <select value={field.type} onChange={(e) => onChange((f) => ({ ...f, type: e.target.value as FormFieldType }))} className={input}>
                {FIELD_TYPES.map((ft) => (
                  <option key={ft} value={ft}>{t(FIELD_TYPE_LABELS[ft].en, FIELD_TYPE_LABELS[ft].ar)}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-brand-900">
            <input type="checkbox" checked={field.required} onChange={(e) => onChange((f) => ({ ...f, required: e.target.checked }))} className="h-4 w-4 rounded border-brand-300" />
            {t("Required", "إلزامي")}
          </label>
          {field.type === "select" ? (
            <div>
              <label className={lbl}>{t("Options (one per line, format: value = Label)", "الخيارات (سطر لكل خيار: القيمة = التسمية)")}</label>
              <textarea
                value={(field.options ?? []).map((o) => `${o.value} = ${o.label.en}`).join("\n")}
                onChange={(e) => {
                  const options = e.target.value.split("\n").map((line) => {
                    const [value, ...rest] = line.split("=");
                    const labelText = rest.join("=").trim() || value?.trim() || "";
                    return { value: (value?.trim() || labelText), label: { en: labelText, ar: labelText } };
                  }).filter((o) => o.value);
                  onChange((f) => ({ ...f, options }));
                }}
                rows={4}
                className={input}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
