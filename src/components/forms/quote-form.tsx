"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icon";
import { PhoneInput, type PhoneValue } from "@/components/phone-input";
import { SearchSelect } from "@/components/search-select";

const input =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function L(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en;
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold text-brand-900">
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </span>
      {children}
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-brand-900">
        {label}
        {required ? <span className="text-accent-600"> *</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn(input, error && "border-red-400")}
      />
      {error ? <p className="mt-1 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}

const steps = (locale: Locale) => [
  L(locale, "Contact", "التواصل"),
  L(locale, "Shipment", "الشحنة"),
  L(locale, "Details", "التفاصيل"),
  L(locale, "Review", "المراجعة"),
];

export function QuoteForm({
  locale,
  services,
  cargoTypes,
  defaultService,
}: {
  locale: Locale;
  services: { slug: string; name: string }[];
  cargoTypes: string[];
  defaultService?: string;
}) {
  const dict = getDictionary(locale);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({
    country: "JO",
    number: "",
    e164: "",
    valid: false,
    dialCode: "+962",
  });

  const [service, setService] = useState(defaultService || "");
  const [cargoType, setCargoType] = useState("");
  const [shipmentSize, setShipmentSize] = useState("");
  const [urgency, setUrgency] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [dimUnit, setDimUnit] = useState("m");
  const [packages, setPackages] = useState("1");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [shippingDate, setShippingDate] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");
  const [message, setMessage] = useState("");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const serviceOptions = services.map((s) => ({ value: s.slug, label: s.name }));
  const cargoOptions = cargoTypes.map((c) => ({ value: c, label: c }));

  const selectedService = services.find((s) => s.slug === service);

  // Smart visibility
  const showSeaSize = ["sea-freight", "land-freight"].includes(service);
  const showUrgency = service === "air-freight";
  const showOriginDest = ["customs-clearance", "integrated-logistics"].includes(service);

  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!name.trim()) e.name = L(locale, "Please enter your name", "يرجى إدخال اسمك");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = L(locale, "Enter a valid email", "أدخل بريداً إلكترونياً صحيحاً");
      if (!phone.number.trim() || !phone.valid) e.phone = L(locale, "Enter a valid phone number", "أدخل رقم هاتف صحيحاً");
    }
    if (s === 1) {
      if (!service) e.service = L(locale, "Select a service", "اختر خدمة");
      if (!shippingDate) e.shippingDate = L(locale, "Select a shipping date", "اختر تاريخ الشحن");
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => s + 1);
  }
  function back() {
    setStep((s) => s - 1);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const payload = {
      name,
      email,
      phone: phone.number,
      phone_country: phone.country,
      phone_dial_code: phone.dialCode,
      phone_e164: phone.e164,
      service: selectedService?.name || service,
      service_slug: service,
      cargo_type: cargoType,
      cargo_description: cargoDescription,
      shipment_size: shipmentSize,
      urgency,
      origin,
      destination,
      weight,
      weight_unit: weightUnit,
      dimensions: { length, width, height, unit: dimUnit, packages },
      shipping_date: shippingDate,
      message,
      locale,
      source_page:
        typeof window !== "undefined" ? window.location.pathname : "",
      website: "", // honeypot
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      setErrors({ submit: L(locale, "Something went wrong. Please try again.", "حدث خطأ ما. حاول مرة أخرى.") });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-brand-50 px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-800 text-white">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-brand-900">{dict.quote.success}</h3>
        <p className="mt-2 text-sm text-ink-muted">
          {L(locale, "Our team will get back to you shortly.", "سيتواصل معك فريقنا في أقرب وقت ممكن.")}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <ol className="mb-8 flex items-center justify-between gap-2" aria-label="Progress">
        {steps(locale).map((label, i) => {
          const active = i === step;
          const complete = i < step;
          return (
            <li key={i} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    complete
                      ? "bg-brand-800 text-white"
                      : active
                        ? "bg-accent-500 text-brand-950"
                        : "bg-brand-100 text-brand-600",
                  )}
                >
                  {complete ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("hidden text-sm font-semibold sm:block", active ? "text-brand-900" : "text-ink-muted")}>
                  {label}
                </span>
              </div>
              {i < steps(locale).length - 1 ? (
                <span className={cn("h-px flex-1", complete ? "bg-brand-300" : "bg-brand-100")} />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Step 1 — Contact */}
      {step === 0 ? (
        <div className="space-y-4">
          <TextField id="qf-name" label={dict.quote.name} value={name} onChange={setName} required error={errors.name} />
          <TextField id="qf-email" label={dict.quote.email} type="email" value={email} onChange={setEmail} required error={errors.email} />
          <div>
            <PhoneInput
              id="qf-phone"
              label={dict.quote.phone}
              locale={locale}
              required
              onChange={setPhone}
              error={errors.phone}
            />
          </div>
        </div>
      ) : null}

      {/* Step 2 — Shipment */}
      {step === 1 ? (
        <div className="space-y-4">
          <Field label={dict.quote.service} required>
            <SearchSelect
              id="qf-service"
              locale={locale}
              options={serviceOptions}
              value={service}
              onChange={setService}
              placeholder={dict.quote.servicePlaceholder}
              error={errors.service}
            />
          </Field>

          <Field label={L(locale, "Cargo Type", "نوع البضاعة")}>
            <SearchSelect
              id="qf-cargo"
              locale={locale}
              options={cargoOptions}
              value={cargoType}
              onChange={setCargoType}
              placeholder={L(locale, "Select cargo type", "اختر نوع البضاعة")}
            />
          </Field>

          {showSeaSize ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="qf-size" className="mb-1.5 block text-sm font-semibold text-brand-900">
                  {L(locale, "Shipment Size", "حجم الشحنة")}
                </label>
                <select id="qf-size" value={shipmentSize} onChange={(e) => setShipmentSize(e.target.value)} className={input}>
                  <option value="">{L(locale, "Select…", "اختر…")}</option>
                  {service === "sea-freight" ? (
                    <>
                      <option value="FCL">{L(locale, "Full Container Load (FCL)", "حاوية كاملة (FCL)")}</option>
                      <option value="LCL">{L(locale, "Less than Container Load (LCL)", "أقل من حاوية (LCL)")}</option>
                    </>
                  ) : (
                    <>
                      <option value="FTL">{L(locale, "Full Truckload (FTL)", "حمولة شاحنة كاملة (FTL)")}</option>
                      <option value="LTL">{L(locale, "Less than Truckload (LTL)", "حمولة جزئية (LTL)")}</option>
                    </>
                  )}
                </select>
              </div>
              {showUrgency ? (
                <div>
                  <label htmlFor="qf-urgency" className="mb-1.5 block text-sm font-semibold text-brand-900">
                    {L(locale, "Urgency", "الأولوية")}
                  </label>
                  <select id="qf-urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className={input}>
                    <option value="">{L(locale, "Select…", "اختر…")}</option>
                    <option value="standard">{L(locale, "Standard", "عادي")}</option>
                    <option value="urgent">{L(locale, "Urgent", "عاجل")}</option>
                    <option value="express">{L(locale, "Express", "سريع جداً")}</option>
                  </select>
                </div>
              ) : null}
            </div>
          ) : null}

          {showOriginDest ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField id="qf-origin" label={dict.quote.origin} value={origin} onChange={setOrigin} />
              <TextField id="qf-destination" label={dict.quote.destination} value={destination} onChange={setDestination} />
            </div>
          ) : null}

          {/* Dimensions */}
          <fieldset className="rounded-xl border border-brand-100 p-4">
            <legend className="px-2 text-sm font-semibold text-brand-900">
              {L(locale, "Dimensions", "الأبعاد")}
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">{L(locale, "Length", "الطول")}</label>
                <input type="number" min="0" step="0.01" value={length} onChange={(e) => setLength(e.target.value)} className={input} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">{L(locale, "Width", "العرض")}</label>
                <input type="number" min="0" step="0.01" value={width} onChange={(e) => setWidth(e.target.value)} className={input} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">{L(locale, "Height", "الارتفاع")}</label>
                <input type="number" min="0" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)} className={input} placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">{L(locale, "Unit", "الوحدة")}</label>
                <select value={dimUnit} onChange={(e) => setDimUnit(e.target.value)} className={input}>
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                {L(locale, "Number of packages", "عدد الطرود")}
              </label>
              <input type="number" min="1" step="1" value={packages} onChange={(e) => setPackages(e.target.value)} className={input} />
            </div>
          </fieldset>

          {/* Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qf-weight" className="mb-1.5 block text-sm font-semibold text-brand-900">
                {dict.quote.weight}
              </label>
              <input id="qf-weight" type="number" min="0" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className={input} />
            </div>
            <div>
              <label htmlFor="qf-wu" className="mb-1.5 block text-sm font-semibold text-brand-900">
                {L(locale, "Unit", "الوحدة")}
              </label>
              <select id="qf-wu" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className={input}>
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="qf-date" className="mb-1.5 block text-sm font-semibold text-brand-900">
              {dict.quote.date}
              <span className="text-accent-600"> *</span>
            </label>
            <input id="qf-date" type="date" min={today} value={shippingDate} onChange={(e) => setShippingDate(e.target.value)} className={cn(input, errors.shippingDate && "border-red-400")} />
            {errors.shippingDate ? <p className="mt-1 text-xs font-semibold text-red-600">{errors.shippingDate}</p> : null}
          </div>
        </div>
      ) : null}

      {/* Step 3 — Details */}
      {step === 2 ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="qf-cdesc" className="mb-1.5 block text-sm font-semibold text-brand-900">
              {L(locale, "Describe your cargo", "صف بضاعتك")}
            </label>
            <textarea
              id="qf-cdesc"
              rows={4}
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder={L(
                locale,
                "Please briefly describe the goods, quantity, packaging, and any special handling requirements.",
                "يرجى وصف البضاعة والكمية والتغليف وأي متطلبات مناولة خاصة بشكل مختصر.",
              )}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="qf-msg" className="mb-1.5 block text-sm font-semibold text-brand-900">
              {dict.quote.message}
            </label>
            <textarea id="qf-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={input} />
          </div>
        </div>
      ) : null}

      {/* Step 4 — Review */}
      {step === 3 ? (
        <dl className="divide-y divide-brand-100 rounded-xl border border-brand-100">
          <ReviewRow label={dict.quote.name} value={name} />
          <ReviewRow label={dict.quote.email} value={email} />
          <ReviewRow label={dict.quote.phone} value={`${phone.dialCode} ${phone.number}`} dir="ltr" />
          <ReviewRow label={dict.quote.service} value={selectedService?.name || ""} />
          {cargoType ? <ReviewRow label={L(locale, "Cargo Type", "نوع البضاعة")} value={cargoType} /> : null}
          {shipmentSize ? <ReviewRow label={L(locale, "Shipment Size", "حجم الشحنة")} value={shipmentSize} /> : null}
          {origin ? <ReviewRow label={dict.quote.origin} value={origin} /> : null}
          {destination ? <ReviewRow label={dict.quote.destination} value={destination} /> : null}
          {weight ? <ReviewRow label={dict.quote.weight} value={`${weight} ${weightUnit}`} dir="ltr" /> : null}
          {shippingDate ? <ReviewRow label={dict.quote.date} value={shippingDate} /> : null}
          {cargoDescription ? <ReviewRow label={L(locale, "Cargo Description", "وصف البضاعة")} value={cargoDescription} /> : null}
        </dl>
      ) : null}

      {/* Error */}
      {errors.submit ? (
        <p className="mt-4 text-sm font-semibold text-red-600">{errors.submit}</p>
      ) : null}

      {/* Nav */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <Icon name="arrow-left" className="h-4 w-4 rtl:rotate-180" />
            {L(locale, "Back", "رجوع")}
          </button>
        ) : <span />}

        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {L(locale, "Continue", "متابعة")}
            <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-brand-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
          >
            {submitting ? dict.actions.sending : dict.quote.submit}
            <Icon name="arrow-right" className="h-4 w-4 rtl:rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-semibold text-brand-900">{label}</dt>
      <dd className="text-sm text-ink-muted" dir={dir}>
        {value || "—"}
      </dd>
    </div>
  );
}
