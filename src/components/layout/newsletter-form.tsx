"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { Icon } from "@/components/icon";

export function NewsletterForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state !== "idle") return;
    setState("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } finally {
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold text-accent-400">
        <Icon name="check" className="h-4 w-4" />
        {locale === "ar" ? "تم الاشتراك بنجاح." : "Subscribed successfully."}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        {dict.footer.emailPlaceholder}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={dict.footer.emailPlaceholder}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-accent-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="shrink-0 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-accent-400 disabled:opacity-60"
      >
        {state === "loading" ? <Icon name="check" className="h-4 w-4" /> : dict.footer.subscribe}
      </button>
    </form>
  );
}
