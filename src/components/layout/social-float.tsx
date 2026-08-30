"use client";

import { useState } from "react";
import type { SocialLink } from "@/types";
import { Icon } from "@/components/icon";
import { BrandIcon } from "@/components/icon";

export function SocialFloat({
  socials,
  locale,
}: {
  socials: SocialLink[];
  locale: string;
}) {
  const [open, setOpen] = useState(false);
  const items = socials.filter((s) => s.enabled && s.url);

  if (!items.length) return null;

  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col items-end gap-3" role="region" aria-label="Social media">
      <ul
        className={`flex flex-col gap-2 transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-800 text-white shadow-lift transition-transform hover:scale-110 hover:bg-brand-700"
            >
              <BrandIcon name={s.icon || s.platform} className="h-5 w-5" />
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? (locale === "ar" ? "إغلاق" : "Close") : locale === "ar" ? "تواصل معنا" : "Get in touch"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-brand-950 shadow-lift transition-all hover:bg-accent-400"
      >
        <Icon name={open ? "x" : "handshake"} className="h-6 w-6" />
      </button>
    </div>
  );
}
