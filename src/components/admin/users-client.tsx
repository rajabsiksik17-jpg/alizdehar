"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
  last_sign_in_at: string | null;
}

const ROLES = [
  { value: "super_admin", label: "Super Admin", ar: "مدير عام" },
  { value: "admin", label: "Admin", ar: "مدير" },
  { value: "content_manager", label: "Content Manager", ar: "مدير محتوى" },
  { value: "seo_manager", label: "SEO Manager", ar: "مدير SEO" },
  { value: "editor", label: "Editor", ar: "محرر" },
];

export function UsersClient({ users, currentId }: { users: AdminUser[]; currentId: string }) {
  const { t, lang } = useAdminLang();
  const [list, setList] = useState(users);
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function changeRole(id: string, role: string) {
    setSaving(id);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setList((l) => l.map((u) => (u.id === id ? { ...u, role } : u)));
        setMsg({ ok: true, text: t("Role updated.", "تم تحديث الصلاحية.") });
      } else {
        setMsg({ ok: false, text: json.error || "Failed to update role" });
      }
    } catch {
      setMsg({ ok: false, text: "Failed to update role" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-soft">
        <table className="w-full min-w-[720px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 text-start font-semibold">{t("User", "المستخدم")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Role", "الصلاحية")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Last sign in", "آخر تسجيل دخول")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-surface-muted/60">
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-900">
                    {u.email}
                    {u.id === currentId ? (
                      <span className="ms-2 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                        {t("You", "أنت")}
                      </span>
                    ) : null}
                  </p>
                  {u.full_name ? <p className="text-xs text-ink-muted">{u.full_name}</p> : null}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    disabled={saving === u.id || u.id === currentId}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm text-brand-900 focus:border-brand-500 focus:outline-none disabled:opacity-50"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {lang === "ar" ? r.ar : r.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        {msg ? (
          <span className={`flex items-center gap-2 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>
            {msg.ok ? <Icon name="check" className="h-4 w-4" /> : null}
            {msg.text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
