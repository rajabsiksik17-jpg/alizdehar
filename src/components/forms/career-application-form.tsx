"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { PhoneInput, type PhoneValue } from "@/components/phone-input";
import { SearchSelect } from "@/components/search-select";
import { countries, countryByCode } from "@/lib/phone";
import type { FormDef, FormFieldDef } from "@/lib/job-forms";
import { Icon } from "@/components/icon";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function L(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

function label(field: FormFieldDef, locale: Locale) {
  return locale === "ar" ? field.label.ar || field.label.en : field.label.en || field.label.ar;
}

export function CareerApplicationForm({
  locale,
  position,
  form,
}: {
  locale: Locale;
  position: string;
  form: FormDef;
}) {
  const dict = getDictionary(locale);
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phone, setPhone] = useState<PhoneValue>({
    country: "JO",
    number: "",
    e164: "",
    valid: false,
    dialCode: "+962",
  });
  const [country, setCountry] = useState("JO");
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});

  const countryOptions = countries.map((c) => ({
    value: c.code,
    label: locale === "ar" ? c.nameAr : c.name,
  }));

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setFileError(L(locale, "Please upload a PDF, DOC or DOCX file.", "يرجى رفع ملف PDF أو DOC أو DOCX."));
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE) {
      setFileError(L(locale, "File must be smaller than 5MB.", "يجب أن يكون حجم الملف أقل من 5 ميجابايت."));
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hasFileField = form.fields.some((f) => f.type === "file");
    if (hasFileField && !file) {
      setFileError(L(locale, "Please attach your CV.", "يرجى إرفاق سيرتك الذاتية."));
      return;
    }
    setState("loading");
    const target = e.currentTarget;
    const fd = new FormData(target);
    fd.set("position", position);
    fd.set("phone", phone.number);
    fd.set("phone_country", phone.country);
    fd.set("phone_dial_code", phone.dialCode);
    fd.set("phone_e164", phone.e164);
    fd.set("country", countryByCode(country)?.name ?? "");
    fd.set("website", ""); // honeypot

    try {
      const res = await fetch("/api/careers", { method: "POST", body: fd });
      if (!res.ok) throw new Error("failed");
      target.reset();
      setFile(null);
      setSelectValues({});
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="rounded-xl bg-brand-50 px-5 py-4 text-sm font-semibold text-brand-800">
        {dict.quote.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {form.fields.map((field) => {
          const required = field.required;
          if (field.type === "text") {
            return (
              <div key={field.name} className={field.name === "name" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <input name={field.name} required={required} className={input} />
              </div>
            );
          }
          if (field.type === "email") {
            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <input name={field.name} type="email" required={required} className={input} />
              </div>
            );
          }
          if (field.type === "phone") {
            return <PhoneInput key={field.name} id={field.name} label={label(field, locale)} locale={locale} onChange={setPhone} />;
          }
          if (field.type === "country") {
            return (
              <div key={field.name}>
                <SearchSelect
                  id={field.name}
                  locale={locale}
                  label={label(field, locale)}
                  options={countryOptions}
                  value={country}
                  onChange={setCountry}
                  placeholder={L(locale, "Select country", "اختر الدولة")}
                />
                <input type="hidden" name={field.name} value={countryByCode(country)?.name ?? ""} />
              </div>
            );
          }
          if (field.type === "url") {
            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <input name={field.name} type="url" required={required} className={input} />
              </div>
            );
          }
          if (field.type === "number") {
            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <input name={field.name} type="number" min="0" step="1" required={required} className={input} />
              </div>
            );
          }
          if (field.type === "date") {
            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <input name={field.name} type="date" required={required} className={input} />
              </div>
            );
          }
          if (field.type === "select") {
            const opts = field.options ?? [];
            return (
              <div key={field.name}>
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <select
                  name={field.name}
                  required={required}
                  value={selectValues[field.name] ?? ""}
                  onChange={(e) => setSelectValues((s) => ({ ...s, [field.name]: e.target.value }))}
                  className={input}
                >
                  <option value="">{L(locale, "Select…", "اختر…")}</option>
                  {opts.map((o) => (
                    <option key={o.value} value={o.value}>{locale === "ar" ? o.label.ar : o.label.en}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (field.type === "textarea") {
            return (
              <div key={field.name} className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {label(field, locale)}{required ? <span className="text-accent-600"> *</span> : null}
                </label>
                <textarea name={field.name} rows={4} required={required} className={input} />
              </div>
            );
          }
          if (field.type === "file") {
            return null; // rendered once below
          }
          return null;
        })}
      </div>

      {form.fields.some((f) => f.type === "file") ? (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-brand-900">
            {L(locale, "CV / Resume", "السيرة الذاتية")}
            <span className="text-accent-600"> *</span>
          </span>
          <label
            htmlFor="ap-cv"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-brand-300 bg-surface-muted px-4 py-4 text-sm transition-colors hover:border-brand-500"
          >
            <Icon name="file-text" className="h-5 w-5 text-brand-500" />
            <span className="text-ink-muted">
              {file ? file.name : L(locale, "Attach your CV (PDF, DOC, DOCX — max 5MB)", "أرفق سيرتك الذاتية (PDF أو DOC أو DOCX — بحد أقصى 5 ميجابايت)")}
            </span>
          </label>
          <input
            ref={fileRef}
            id="ap-cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={onFile}
            className="hidden"
          />
          {fileError ? <p className="mt-1.5 text-xs font-semibold text-red-600">{fileError}</p> : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-xl bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" ? dict.actions.sending : dict.actions.applyNow}
      </button>
      {state === "error" ? (
        <p className="text-sm font-semibold text-red-600">{dict.quote.error}</p>
      ) : null}
    </form>
  );
}
