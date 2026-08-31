"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { PhoneInput, type PhoneValue } from "@/components/phone-input";
import { Icon } from "@/components/icon";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function L(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

export function CareerApplicationForm({
  locale,
  position,
}: {
  locale: Locale;
  position: string;
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
    if (!file) {
      setFileError(L(locale, "Please attach your CV.", "يرجى إرفاق سيرتك الذاتية."));
      return;
    }
    setState("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("position", position);
    fd.set("phone", phone.number);
    fd.set("phone_country", phone.country);
    fd.set("phone_dial_code", phone.dialCode);
    fd.set("phone_e164", phone.e164);
    fd.set("website", ""); // honeypot

    try {
      const res = await fetch("/api/careers", { method: "POST", body: fd });
      if (!res.ok) throw new Error("failed");
      form.reset();
      setFile(null);
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
        <div>
          <label htmlFor="ap-name" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.name}
          </label>
          <input id="ap-name" name="name" required className={input} />
        </div>
        <div>
          <label htmlFor="ap-email" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.email}
          </label>
          <input id="ap-email" name="email" type="email" required className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PhoneInput id="ap-phone" label={dict.quote.phone} locale={locale} onChange={setPhone} />
        <div>
          <label htmlFor="ap-country" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.country}
          </label>
          <input id="ap-country" name="country" className={input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ap-linkedin" className="mb-1.5 block text-sm font-semibold text-brand-900">
            LinkedIn
          </label>
          <input id="ap-linkedin" name="linkedin" type="url" className={input} placeholder="https://linkedin.com/in/…" />
        </div>
        <div>
          <label htmlFor="ap-experience" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {L(locale, "Years of experience", "سنوات الخبرة")}
          </label>
          <input id="ap-experience" name="experience" type="number" min="0" step="1" className={input} />
        </div>
      </div>

      <div>
        <label htmlFor="ap-cover" className="mb-1.5 block text-sm font-semibold text-brand-900">
          {L(locale, "Cover message", "رسالة تقديم")}
        </label>
        <textarea id="ap-cover" name="message" rows={4} className={input} />
      </div>

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
