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

interface RoleDef {
  id?: string;
  slug: string;
  name: { en: string; ar: string };
  description?: { en: string; ar: string } | null;
  is_builtin: boolean;
  permissions: Record<string, string[]>;
}

export function RolesManager() {
  const { t, lang } = useAdminLang();
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [editing, setEditing] = useState<RoleDef | "new" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    const res = await fetch("/api/admin/roles");
    const json = await res.json();
    if (res.ok) setRoles(json.roles ?? []);
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(id);
  }, []);

  async function remove(r: RoleDef) {
    if (!r.id) return;
    if (!confirm(t("Delete this role?", "حذف هذا الدور؟"))) return;
    await fetch("/api/admin/roles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id }),
    });
    await load();
  }

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-900">{t("Roles", "الأدوار")}</h2>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          {t("New role", "دور جديد")}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
        <ul className="divide-y divide-brand-50">
          {roles.map((r) => (
            <li key={r.slug} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-semibold text-brand-900">
                  {lang === "ar" ? r.name.ar : r.name.en}
                  {r.is_builtin ? (
                    <span className="ms-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">{t("Built-in", "مدمج")}</span>
                  ) : null}
                </p>
                <p className="text-xs text-ink-muted">
                  {t("Modules:", "الوحدات:")} {Object.keys(r.permissions).length}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!r.is_builtin ? (
                  <>
                    <button type="button" onClick={() => setEditing(r)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">
                      {t("Edit", "تعديل")}
                    </button>
                    <button type="button" onClick={() => remove(r)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                      {t("Delete", "حذف")}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setEditing(r)} className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50">
                    {t("View", "عرض")}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {editing ? (
        <RoleModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            setMsg({ ok: true, text: t("Saved successfully.", "تم الحفظ بنجاح.") });
            await load();
          }}
        />
      ) : null}

      {msg ? <p className={`mt-3 text-sm font-semibold ${msg.ok ? "text-brand-700" : "text-red-600"}`}>{msg.text}</p> : null}
    </div>
  );
}

function RoleModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: RoleDef | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, lang } = useAdminLang();
  const [name, setName] = useState(initial?.name ?? { en: "", ar: "" });
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(initial?.permissions ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readOnly = initial?.is_builtin ?? false;

  function toggleAction(mod: Module, action: Action) {
    setPermissions((prev) => {
      const cur = prev[mod] ?? [];
      const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
      return { ...prev, [mod]: next };
    });
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial?.id, slug, name, permissions }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) setError(json.error || "Failed to save");
      else onSaved();
    } catch {
      setError("Failed to save");
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
            {initial ? (readOnly ? t("View role", "عرض الدور") : t("Edit role", "تعديل الدور")) : t("New role", "دور جديد")}
          </h3>
          <button type="button" onClick={onClose} aria-label={t("Close", "إغلاق")} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Name", "الاسم")} (EN)</label>
              <input value={name.en} disabled={readOnly} onChange={(e) => setName((n) => ({ ...n, en: e.target.value }))} className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm disabled:bg-surface-muted" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("الاسم", "الاسم")} (AR)</label>
              <input value={name.ar} disabled={readOnly} onChange={(e) => setName((n) => ({ ...n, ar: e.target.value }))} dir="rtl" className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm disabled:bg-surface-muted" />
            </div>
          </div>
          {!readOnly ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-brand-900">{t("Slug", "المعرّف")}</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="custom_role" className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm" />
            </div>
          ) : null}

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
                            disabled={readOnly}
                            onClick={() => toggleAction(m.key, a)}
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-default ${on ? "bg-brand-800 text-white" : "bg-surface-muted text-ink-muted hover:bg-brand-100"}`}
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

        {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
            {t("Cancel", "إلغاء")}
          </button>
          {!readOnly ? (
            <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
