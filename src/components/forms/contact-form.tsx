"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { PhoneInput, type PhoneValue } from "@/components/phone-input";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function ContactForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [phone, setPhone] = useState<PhoneValue>({
    country: "JO",
    number: "",
    e164: "",
    valid: false,
    dialCode: "+962",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      ...data,
      phone: phone.number,
      phone_country: phone.country,
      phone_dial_code: phone.dialCode,
      phone_e164: phone.e164,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      form.reset();
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
          <label htmlFor="cf-name" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.name}
          </label>
          <input id="cf-name" name="name" required className={input} />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.email}
          </label>
          <input id="cf-email" name="email" type="email" required className={input} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <PhoneInput id="cf-phone" label={dict.quote.phone} locale={locale} onChange={setPhone} />
        <div>
          <label htmlFor="cf-subject" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.service}
          </label>
          <input id="cf-subject" name="subject" className={input} />
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="mb-1.5 block text-sm font-semibold text-brand-900">
          {dict.quote.message}
        </label>
        <textarea id="cf-message" name="message" rows={5} required className={input} />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-xl bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" ? dict.actions.sending : dict.quote.submit}
      </button>
      {state === "error" ? (
        <p className="text-sm font-semibold text-red-600">{dict.quote.error}</p>
      ) : null}
    </form>
  );
}
