"use client";

import { useEffect, useState } from "react";
import type { FormDef } from "@/lib/job-forms";
import { useAdminLang } from "@/components/admin/lang";

const selectCls =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function FormPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const { lang, t } = useAdminLang();
  const [forms, setForms] = useState<FormDef[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetch("/api/admin/forms")
        .then((r) => r.json())
        .then((json) => setForms(json.forms ?? []))
        .catch(() => {});
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-brand-900">{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        <option value="">{t("Default form", "النموذج الافتراضي")}</option>
        {forms.map((f) => (
          <option key={f.id} value={f.id ?? ""}>
            {lang === "ar" ? f.name.ar : f.name.en}
          </option>
        ))}
      </select>
    </div>
  );
}
