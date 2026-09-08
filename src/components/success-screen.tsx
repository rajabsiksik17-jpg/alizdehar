"use client";

import type { Locale } from "@/lib/i18n/config";

export function SuccessScreen({
  locale,
  title,
  subtitle,
}: {
  locale: Locale;
  title: string;
  subtitle?: string;
}) {
  const rtl = locale === "ar";
  return (
    <div className="flex flex-col items-center rounded-2xl bg-brand-50 px-6 py-12 text-center">
      <div className="relative">
        <span
          className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-800 text-5xl shadow-lift"
          style={{ animation: "pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          aria-hidden="true"
        >
          😊
        </span>
        <span
          className="absolute -end-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent-500 text-brand-950 shadow-sm"
          style={{ animation: "pop-in 0.5s ease 0.25s both" }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </div>
      <h3
        className="mt-6 text-xl font-bold text-brand-900"
        style={{ animation: "fade-up 0.5s ease 0.2s both" }}
      >
        {title}
      </h3>
      {subtitle ? (
        <p
          className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted"
          dir={rtl ? "rtl" : "ltr"}
          style={{ animation: "fade-up 0.5s ease 0.35s both" }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
