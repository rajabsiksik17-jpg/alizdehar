"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";

const CONSENT_KEY = "al-izdehar-cookie-consent";

export function CookieConsent({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function decide(value: "accepted" | "declined") {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-brand-100 bg-white p-5 shadow-lift">
      <p className="text-sm leading-relaxed text-ink-muted">{dict.cookie.text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {dict.cookie.accept}
        </button>
        <button
          type="button"
          onClick={() => decide("declined")}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-ink-muted transition-colors hover:bg-brand-50"
        >
          {dict.cookie.decline}
        </button>
        <a href={href(locale, "/privacy")} className="text-sm font-semibold text-brand-700 hover:underline">
          {dict.cookie.policy}
        </a>
      </div>
    </div>
  );
}
