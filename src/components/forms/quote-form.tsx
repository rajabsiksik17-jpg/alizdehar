"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function Field({
  label,
  name,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={`qf-${name}`} className="mb-1.5 block text-sm font-semibold text-brand-900">
        {label}
      </label>
      <input
        id={`qf-${name}`}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className={input}
      />
    </div>
  );
}

export function QuoteForm({
  locale,
  services,
  defaultService,
}: {
  locale: Locale;
  services: string[];
  defaultService?: string;
}) {
  const dict = getDictionary(locale);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <div className="rounded-xl bg-brand-50 px-6 py-10 text-center">
        <p className="text-lg font-bold text-brand-900">{dict.quote.success}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {locale === "ar"
            ? "سيتواصل معك فريقنا في أقرب وقت ممكن."
            : "Our team will get back to you shortly."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.quote.name} name="name" required />
        <Field label={dict.quote.company} name="company" />
        <Field label={dict.quote.email} name="email" type="email" required />
        <Field label={dict.quote.phone} name="phone" type="tel" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qf-service" className="mb-1.5 block text-sm font-semibold text-brand-900">
            {dict.quote.service}
          </label>
          <select
            id="qf-service"
            name="service"
            defaultValue={defaultService || ""}
            className={input}
          >
            <option value="">{dict.quote.servicePlaceholder}</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Field label={dict.quote.country} name="country" />
        <Field label={dict.quote.origin} name="origin" />
        <Field label={dict.quote.destination} name="destination" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={dict.quote.shipmentType} name="shipment_type" />
        <Field label={dict.quote.cargoType} name="cargo_type" />
        <Field label={dict.quote.weight} name="weight" />
        <Field label={dict.quote.dimensions} name="dimensions" />
        <Field label={dict.quote.containerType} name="container_type" />
        <Field label={dict.quote.containers} name="containers" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={dict.quote.method} name="method" />
        <Field label={dict.quote.date} name="date" type="date" />
      </div>

      <div>
        <label htmlFor="qf-message" className="mb-1.5 block text-sm font-semibold text-brand-900">
          {dict.quote.message}
        </label>
        <textarea id="qf-message" name="message" rows={4} className={input} />
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-xl bg-brand-800 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {state === "loading" ? dict.actions.sending : dict.quote.submit}
      </button>
      {state === "error" ? (
        <p className="text-sm font-semibold text-red-600">{dict.quote.error}</p>
      ) : null}
    </form>
  );
}
