"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { useAdminLang } from "@/components/admin/lang";
import {
  MODULES,
  ACTION_LABELS,
  type Module,
  type Action,
} from "@/lib/admin-permissions";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  active: boolean;
  permissions: Record<string, string[]> | null;
  created_at: string | null;
  last_sign_in_at: string | null;
}

interface RoleDef {
  id?: string;
  slug: string;
  name: { en: string; ar: string };
  is_builtin: boolean;
  permissions: Record<string, string[]>;
}

export function UsersClient({ users, currentId }: { users: AdminUser[]; currentId: string }) {
  const { t, lang } = useAdminLang();
  const [list, setList] = useState(users);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) setList(json.data);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetch("/api/admin/roles")
      .then((r) => r.json())
      .then((json) => setRoles(json.roles ?? []))
      .catch(() => {});
  }, []);

  async function toggleActive(u: AdminUser) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id, active: !u.active }),
    });
    await load();
  }

  async function remove(u: AdminUser) {
    if (!confirm(t("Delete this user?", "حذف هذا المستخدم؟"))) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setMsg({ ok: false, text: json.error || "Failed to delete" });
    else await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">{list.length} {t("user(s)", "مستخدم")}</p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          {t("Create Admin", "إنشاء مدير")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-soft">
        <table className="w-full min-w-[820px] text-start text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-xs uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 text-start font-semibold">{t("User", "المستخدم")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Role", "الصلاحية")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Status", "الحالة")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Last sign in", "آخر تسجيل دخول")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("Actions", "إجراءات")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-50">
            {list.map((u) => {
              const roleDef = roles.find((r) => r.slug === u.role);
              const roleName = roleDef ? (lang === "ar" ? roleDef.name.ar : roleDef.name.en) : u.role;
              const isSelf = u.id === currentId;
              return (
                <tr key={u.id} className="hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-900">
                      {u.email}
                      {isSelf ? (
                        <span className="ms-2 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                          {t("You", "أنت")}
                        </span>
                      ) : null}
                    </p>
                    {u.full_name ? <p className="text-xs text-ink-muted">{u.full_name}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{roleName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {u.active ? t("Active", "نشط") : t("Disabled", "معطّل")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
                      >
                        <Icon name="cog" className="h-3.5 w-3.5" />
                        {t("Edit", "تعديل")}
                      </button>
                      {!isSelf ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleActive(u)}
                            className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
                          >
                            {u.active ? t("Disable", "تعطيل") : t("Enable", "تفعيل")}
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(u)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            {t("Delete", "حذف")}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {msg ? (
        <p className={`mt-3 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>{msg.text}</p>
      ) : null}

      {editing ? (
        <UserModal
          initial={editing === "new" ? null : editing}
          roles={roles}
          currentId={currentId}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setMsg({ ok: true, text: t("Saved successfully.", "تم الحفظ بنجاح.") });
            await load();
          }}
          onError={(e) => setMsg({ ok: false, text: e })}
        />
      ) : null}
    </div>
  );
}

function UserModal({
  initial,
  roles,
  currentId,
  onClose,
  onSaved,
  onError,
}: {
  initial: AdminUser | null;
  roles: RoleDef[];
  currentId: string;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const { t, lang } = useAdminLang();
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(initial?.role ?? "editor");
  const [active, setActive] = useState(initial?.active ?? true);
  const [permissions, setPermissions] = useState<Record<string, string[]>>(initial?.permissions ?? {});
  const [saving, setSaving] = useState(false);

  const isNew = !initial;
  const isSelf = initial?.id === currentId;

  function toggleAction(mod: Module, action: Action) {
    setPermissions((prev) => {
      const cur = prev[mod] ?? [];
      const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
      return { ...prev, [mod]: next };
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { role, active, permissions };
      if (isNew) {
        payload.full_name = fullName;
        payload.email = email;
        payload.password = password;
      } else {
        payload.id = initial!.id;
        payload.full_name = fullName;
        if (password) payload.password = password;
      }

      const res = await fetch("/api/admin/users", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        onError(json.error || "Failed to save");
      } else {
        onSaved();
      }
    } catch {
      onError("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:max-w-3xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">
            {isNew ? t("Create Admin", "إنشاء مدير") : t("Edit user", "تعديل المستخدم")}
          </h3>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Full name", "الاسم الكامل")}</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Role", "الصلاحية")}</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
                className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm disabled:opacity-60"
              >
                {roles.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {lang === "ar" ? r.name.ar : r.name.en}
                  </option>
                ))}
                {!roles.some((r) => r.slug === role) ? <option value={role}>{role}</option> : null}
              </select>
            </div>
          </div>

          {isNew ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Email", "البريد الإلكتروني")}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Password", "كلمة المرور")}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("Min 8 characters", "8 أحرف على الأقل")} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Reset password (optional)", "إعادة تعيين كلمة المرور (اختياري)")}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("Leave blank to keep", "اتركه فارغاً للإبقاء")} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-brand-900">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 rounded border-brand-300" />
            {t("Account active", "الحساب نشط")}
          </label>

          <div>
            <p className="mb-2 text-sm font-bold text-brand-900">{t("Permissions", "الصلاحيات")}</p>
            <div className="rounded-xl border border-brand-100">
              {MODULES.map((m) => {
                const granted = permissions[m.key] ?? [];
                return (
                  <div key={m.key} className="flex flex-wrap items-center gap-2 border-b border-brand-50 px-3 py-2 last:border-b-0">
                    <span className="w-40 shrink-0 text-sm font-semibold text-brand-900">
                      {lang === "ar" ? m.label.ar : m.label.en}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {m.actions.map((a) => {
                        const on = granted.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggleAction(m.key, a)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${on ? "bg-brand-800 text-white" : "bg-surface-muted text-ink-muted hover:bg-brand-100"}`}
                          >
                            {lang === "ar" ? ACTION_LABELS[a].ar : ACTION_LABELS[a].en}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
            {t("Cancel", "إلغاء")}
          </button>
          <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
          </button>
        </div>
      </div>
    </div>
  );
}
