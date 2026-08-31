"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/layout/logo";
import { Icon } from "@/components/icon";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "sliders" }],
  },
  {
    label: "Content",
    items: [
      { label: "Homepage", href: "/admin/homepage", icon: "file-text" },
      { label: "Pages", href: "/admin/pages", icon: "file-text" },
      { label: "Services", href: "/admin/services", icon: "ship" },
      { label: "Blog", href: "/admin/blog", icon: "calendar" },
      { label: "Careers", href: "/admin/careers", icon: "briefcase" },
      { label: "Media", href: "/admin/media", icon: "package" },
    ],
  },
  {
    label: "Leads",
    items: [
      { label: "Quote Requests", href: "/admin/leads?type=quote", icon: "mail" },
      { label: "Contact Requests", href: "/admin/leads?type=contact", icon: "mail" },
      { label: "Career Applications", href: "/admin/leads?type=career", icon: "briefcase" },
    ],
  },
  {
    label: "Forms",
    items: [
      { label: "Forms", href: "/admin/forms", icon: "file-text" },
      { label: "Form Submissions", href: "/admin/submissions", icon: "mail" },
    ],
  },
  {
    label: "Appearance",
    items: [
      { label: "Header", href: "/admin/header", icon: "menu" },
      { label: "Footer", href: "/admin/footer", icon: "menu" },
      { label: "Menus", href: "/admin/menus", icon: "menu" },
      { label: "Global Styles", href: "/admin/styles", icon: "sliders" },
      { label: "Icons", href: "/admin/icons", icon: "box" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "SEO", href: "/admin/seo", icon: "search" },
      { label: "Social Media", href: "/admin/social", icon: "globe" },
      { label: "Analytics", href: "/admin/analytics", icon: "search" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "General Settings", href: "/admin/settings", icon: "sliders" },
      { label: "Languages", href: "/admin/languages", icon: "globe" },
      { label: "Users / Admins", href: "/admin/users", icon: "users" },
      { label: "Security", href: "/admin/security", icon: "shield-check" },
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
          <p className="text-[10px] uppercase tracking-wider text-white/50">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {group.label}
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
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/60 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon name={item.icon} className="h-4 w-4" />
                      {item.label}
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
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 bg-brand-950 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
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
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {role}
          </span>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
