"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { IconPicker } from "@/components/admin/icon-picker";
import { MediaPicker } from "@/components/admin/media-picker";

type L = { en: string; ar: string };
type OfferItem = { icon: string; title: L; description: L };
type FaqItem = { question: L; answer: L };

interface ServiceForm {
  name: L;
  slug: string;
  short_description: L;
  content: L;
  icon: string;
  hero_image: string;
  thumbnail: string;
  status: "draft" | "published";
  sort_order: number;
  what_we_offer: OfferItem[];
  how_it_works: OfferItem[];
  features: OfferItem[];
  faq: FaqItem[];
  seo: { seo_title: L; seo_description: L; focus_keyword: L };
}

const input =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const lbl = "mb-1 block text-xs font-semibold text-brand-900";

function emptyOffer(): OfferItem {
  return { icon: "box", title: { en: "", ar: "" }, description: { en: "", ar: "" } };
}

function LocalizedField({
  label,
  labelAr,
  value,
  onChange,
  textarea,
}: {
  label: string;
  labelAr: string;
  value: L;
  onChange: (v: L) => void;
  textarea?: boolean;
}) {
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

function Repeater({
  title,
  items,
  onChange,
  render,
  addLabel,
}: {
  title: string;
  items: OfferItem[];
  onChange: (items: OfferItem[]) => void;
  render: (item: OfferItem, i: number, update: (i: number, item: OfferItem) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-brand-900">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...items, emptyOffer()])}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-brand-100 bg-surface-muted p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-500">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
            </div>
            {render(item, i, (idx, next) => onChange(items.map((it, j) => (j === idx ? next : it))))}
          </div>
        ))}
        {!items.length ? <p className="py-4 text-center text-sm text-ink-muted">No items yet.</p> : null}
      </div>
    </section>
  );
}

export function ServiceEditor({
  initial,
  isNew,
}: {
  initial: ServiceForm | null;
  isNew: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceForm>(() =>
    initial ?? {
      name: { en: "", ar: "" },
      slug: "",
      short_description: { en: "", ar: "" },
      content: { en: "", ar: "" },
      icon: "ship",
      hero_image: "",
      thumbnail: "",
      status: "draft",
      sort_order: 0,
      what_we_offer: [],
      how_it_works: [],
      features: [],
      faq: [],
      seo: { seo_title: { en: "", ar: "" }, seo_description: { en: "", ar: "" }, focus_keyword: { en: "", ar: "" } },
    },
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = <K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const url = isNew ? "/api/admin/services" : `/api/admin/services/${form.slug}`;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: json.error || "Failed to save." });
      } else {
        setMessage({ ok: true, text: "Saved successfully." });
        router.refresh();
        if (isNew) router.push("/admin/services");
      }
    } catch {
      setMessage({ ok: false, text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">Basic information</h2>
        <div className="mt-4 space-y-3">
          <LocalizedField label="Name" labelAr="الاسم" value={form.name} onChange={(v) => set("name", v)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Slug</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={input} />
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value as "draft" | "published")} className={input}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={lbl}>Icon</span>
              <IconPicker value={form.icon} onChange={(v) => set("icon", v)} />
            </div>
            <div>
              <label className={lbl}>Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MediaPicker label="Hero image" value={form.hero_image} onChange={(v) => set("hero_image", v)} />
            <MediaPicker label="Thumbnail" value={form.thumbnail} onChange={(v) => set("thumbnail", v)} />
          </div>
          <LocalizedField label="Short description" labelAr="الوصف المختصر" value={form.short_description} onChange={(v) => set("short_description", v)} textarea />
          <LocalizedField label="Full description" labelAr="الوصف الكامل" value={form.content} onChange={(v) => set("content", v)} textarea />
        </div>
      </section>

      <Repeater
        title="What We Offer"
        addLabel="Add item"
        items={form.what_we_offer}
        onChange={(items) => set("what_we_offer", items)}
        render={(item, i, update) => (
          <div className="space-y-3">
            <IconPicker value={item.icon} onChange={(icon) => update(i, { ...item, icon })} />
            <LocalizedField label="Title" labelAr="العنوان" value={item.title} onChange={(title) => update(i, { ...item, title })} />
            <LocalizedField label="Description" labelAr="الوصف" value={item.description} onChange={(description) => update(i, { ...item, description })} textarea />
          </div>
        )}
      />

      <Repeater
        title="How We Work"
        addLabel="Add step"
        items={form.how_it_works}
        onChange={(items) => set("how_it_works", items)}
        render={(item, i, update) => (
          <div className="space-y-3">
            <IconPicker value={item.icon} onChange={(icon) => update(i, { ...item, icon })} />
            <LocalizedField label="Title" labelAr="العنوان" value={item.title} onChange={(title) => update(i, { ...item, title })} />
            <LocalizedField label="Description" labelAr="الوصف" value={item.description} onChange={(description) => update(i, { ...item, description })} textarea />
          </div>
        )}
      />

      <Repeater
        title="Why Choose Us"
        addLabel="Add benefit"
        items={form.features}
        onChange={(items) => set("features", items)}
        render={(item, i, update) => (
          <div className="space-y-3">
            <IconPicker value={item.icon} onChange={(icon) => update(i, { ...item, icon })} />
            <LocalizedField label="Title" labelAr="العنوان" value={item.title} onChange={(title) => update(i, { ...item, title })} />
            <LocalizedField label="Description" labelAr="الوصف" value={item.description} onChange={(description) => update(i, { ...item, description })} textarea />
          </div>
        )}
      />

      <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-brand-900">FAQ</h3>
          <button
            type="button"
            onClick={() => set("faq", [...form.faq, { question: { en: "", ar: "" }, answer: { en: "", ar: "" } }])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
            Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {form.faq.map((item, i) => (
            <div key={i} className="rounded-xl border border-brand-100 bg-surface-muted p-4">
              <div className="mb-2 flex justify-end">
                <button type="button" onClick={() => set("faq", form.faq.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-red-600 hover:bg-red-50" aria-label="Delete">
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>
              <LocalizedField
                label="Question"
                labelAr="السؤال"
                value={item.question}
                onChange={(question) => set("faq", form.faq.map((it, j) => (j === i ? { ...it, question } : it)))}
              />
              <div className="mt-3">
                <LocalizedField
                  label="Answer"
                  labelAr="الإجابة"
                  value={item.answer}
                  onChange={(answer) => set("faq", form.faq.map((it, j) => (j === i ? { ...it, answer } : it)))}
                  textarea
                />
              </div>
            </div>
          ))}
          {!form.faq.length ? <p className="py-4 text-center text-sm text-ink-muted">No FAQ yet.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
        <h2 className="text-base font-bold text-brand-900">SEO</h2>
        <div className="mt-4 space-y-3">
          <LocalizedField label="SEO title" labelAr="عنوان SEO" value={form.seo.seo_title} onChange={(v) => set("seo", { ...form.seo, seo_title: v })} />
          <LocalizedField label="Meta description" labelAr="وصف SEO" value={form.seo.seo_description} onChange={(v) => set("seo", { ...form.seo, seo_description: v })} textarea />
          <LocalizedField label="Focus keyword" labelAr="الكلمة المفتاحية" value={form.seo.focus_keyword} onChange={(v) => set("seo", { ...form.seo, focus_keyword: v })} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => router.push("/admin/services")} className="rounded-xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50">
          Cancel
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
