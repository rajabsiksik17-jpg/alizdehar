"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";
import type { Lead } from "@/types";

const typeLabel: Record<string, string> = {
  quote: "Quote",
  contact: "Contact",
  career: "Application",
};

export function NotificationsBell() {
  const { t, lang } = useAdminLang();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/admin/notifications", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setUnread(json.unread ?? 0);
        setRecent(json.recent ?? []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, 30000);
    const initial = setTimeout(refresh, 0);
    return () => {
      clearInterval(id);
      clearTimeout(initial);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markAll() {
    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await refresh();
    } catch {
      // ignore
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-200 text-brand-800 transition-colors hover:bg-brand-50"
        aria-label={t("Notifications", "الإشعارات")}
      >
        <Icon name="bell" className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold leading-none text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-lift">
          <div className="flex items-center justify-between border-b border-brand-50 px-4 py-3">
            <p className="text-sm font-bold text-brand-900">{t("Notifications", "الإشعارات")}</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAll}
                className="text-xs font-semibold text-brand-700 hover:text-accent-600"
              >
                {t("Mark all read", "تحديد الكل كمقروء")}
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {recent.length ? (
              <ul className="divide-y divide-brand-50">
                {recent.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href="/admin/leads"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-muted"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <Icon name="mail" className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-brand-900">{lead.name}</span>
                        <span className="block truncate text-xs text-ink-muted">{lead.service || lead.email}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                        {lang === "ar" ? typeLabel[lead.type] ?? lead.type : typeLabel[lead.type] ?? lead.type}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-10 text-center">
                <Icon name="check-check" className="mx-auto h-8 w-8 text-brand-200" />
                <p className="mt-2 text-sm text-ink-muted">{t("You're all caught up.", "لا توجد إشعارات جديدة.")}</p>
              </div>
            )}
          </div>
          <Link
            href="/admin/leads"
            onClick={() => setOpen(false)}
            className="block border-t border-brand-50 px-4 py-3 text-center text-xs font-semibold text-brand-700 hover:bg-surface-muted"
          >
            {t("View all leads", "عرض كل الطلبات")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
