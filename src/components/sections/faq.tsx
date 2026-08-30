"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { pick } from "@/lib/i18n/config";
import type { FaqItem } from "@/types";
import { Icon } from "@/components/icon";

export function FaqAccordion({ faq, locale }: { faq: FaqItem[]; locale: Locale }) {
  const [open, setOpen] = useState<string | null>(faq[0]?.id ?? null);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {faq.map((item) => {
        const isOpen = open === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-brand-100 bg-white transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
            >
              <span className="font-semibold text-brand-900">{pick(item.question, locale)}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon
                  name={isOpen ? "minus" : "plus"}
                  className="h-4 w-4"
                />
              </span>
            </button>
            <div
              className="grid transition-all duration-300"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 leading-relaxed text-ink-muted">
                  {pick(item.answer, locale)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
