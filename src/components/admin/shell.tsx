"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/layout/logo";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";

interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: string;
}
interface NavGroup {
  label: string;
  labelAr: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  { label: "Overview", labelAr: "نظرة عامة", items: [{ label: "Dashboard", labelAr: "لوحة التحكم", href: "/admin", icon: "sliders" }] },
  {
    label: "Content",
    labelAr: "المحتوى",
    items: [
      { label: "Pages", labelAr: "الصفحات", href: "/admin/pages", icon: "file-text" },
      { label: "Services", labelAr: "الخدمات", href: "/admin/services", icon: "ship" },
      { label: "Blog", labelAr: "المدونة", href: "/admin/blog", icon: "calendar" },
      { label: "Categories", labelAr: "تصنيفات المدونة", href: "/admin/categories", icon: "layout-grid" },
      { label: "Careers", labelAr: "الوظائف", href: "/admin/careers", icon: "briefcase" },
      { label: "Menus", labelAr: "القوائم", href: "/admin/menus", icon: "menu" },
      { label: "Media", labelAr: "الصور والوسائط", href: "/admin/media", icon: "package" },
      { label: "Statistics", labelAr: "الإحصائيات", href: "/admin/statistics", icon: "bar-chart" },
      { label: "Why Al-Izdehar", labelAr: "لماذا الازدهار", href: "/admin/why-us", icon: "award" },
      { label: "Gallery", labelAr: "المعرض", href: "/admin/gallery", icon: "boxes" },
      { label: "Cargo Types", labelAr: "أنواع البضائع", href: "/admin/cargo-types", icon: "container" },
    ],
  },
  {
    label: "Leads",
    labelAr: "الطلبات والعملاء",
    items: [
      { label: "Quote Requests", labelAr: "طلبات عرض السعر", href: "/admin/leads?type=quote", icon: "mail" },
      { label: "Contact Requests", labelAr: "رسائل التواصل", href: "/admin/leads?type=contact", icon: "mail" },
      { label: "Career Applications", labelAr: "طلبات الوظائف", href: "/admin/leads?type=career", icon: "briefcase" },
    ],
  },
  {
    label: "SEO & Marketing",
    labelAr: "تحسين محركات البحث والتسويق",
    items: [
      { label: "SEO", labelAr: "SEO العام", href: "/admin/seo", icon: "search" },
      { label: "Social Media", labelAr: "وسائل التواصل", href: "/admin/social", icon: "globe" },
      { label: "Redirects", labelAr: "التحويلات", href: "/admin/redirects", icon: "arrow-right" },
    ],
  },
  {
    label: "Settings",
    labelAr: "الإعدادات",
    items: [
      { label: "General Settings", labelAr: "الإعدادات العامة", href: "/admin/settings", icon: "sliders" },
      { label: "Email", labelAr: "البريد الإلكتروني", href: "/admin/email", icon: "mail" },
    ],
  },
];

export function AdminShell({
  email,
  role,
  children,
}: {
  email: string;
  role: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useAdminLang();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <LogoMark className="h-9 w-9" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Al-Izdehar</p>
          <p className="text-[10px] uppercase tracking-wider text-white/50">{t("Admin", "الإدارة")}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {t(group.label, group.labelAr)}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const base = item.href.split("?")[0];
                const active = base === "/admin" ? pathname === "/admin" : pathname.startsWith(base);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon name={item.icon} className="h-4 w-4" />
                      {t(item.label, item.labelAr)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-2 truncate px-1 text-xs text-white/50">{email}</div>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          <Icon name="arrow-left" className="h-4 w-4 rotate-180" />
          {t("Sign out", "تسجيل الخروج")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 bg-brand-950 lg:block">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/60" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 start-0 w-72 bg-brand-950 shadow-lift">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-brand-100 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-brand-800 hover:bg-brand-50 lg:hidden"
              aria-label="Open menu"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-brand-900">Al-Izdehar Logistics</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
            >
              <Icon name="globe" className="h-3.5 w-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 sm:inline">
              {role}
            </span>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
