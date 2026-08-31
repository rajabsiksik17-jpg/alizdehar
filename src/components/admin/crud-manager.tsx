"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminEntity, AdminField } from "@/lib/admin-registry";
import { Icon } from "@/components/icon";

type Row = Record<string, unknown>;

const inputCls =
  "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

function fieldValue(row: Row, field: AdminField): string {
  const v = row[field.name];
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "object") {
    const o = v as { en?: string; ar?: string };
    return o.en || o.ar || "";
  }
  return "";
}

export function CrudManager({ entity }: { entity: AdminEntity }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/crud/${entity.table}`);
      const json = await res.json();
      if (res.ok) {
        setRows(json.data || []);
        setError("");
      } else {
        setError(json.error || "Failed to load");
      }
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [entity.table]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  const titleField = entity.fields.find((f) => f.type !== "boolean" && f.name !== "sort_order") || entity.fields[0];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-muted">{rows.length} record(s)</p>
        <button
          type="button"
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <Icon name="plus" className="h-4 w-4" />
          Add {entity.singular}
        </button>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-muted">Loading…</p>
      ) : rows.length ? (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-soft">
          <ul className="divide-y divide-brand-50">
            {rows.map((row) => (
              <li key={String(row.id)} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-brand-900">{fieldValue(row, titleField) || "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row.id as string)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center">
          <p className="text-sm text-ink-muted">No records yet.</p>
        </div>
      )}

      {editing ? (
        <EditModal
          entity={entity}
          initial={editing}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            setSaving(true);
            setError("");
            try {
              const method = editing.id ? "PATCH" : "POST";
              const body = editing.id ? { ...form, id: editing.id } : form;
              const res = await fetch(`/api/admin/crud/${entity.table}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              const json = await res.json();
              if (!res.ok) setError(json.error || "Failed to save");
              else {
                setEditing(null);
                await load();
              }
            } catch {
              setError("Failed to save");
            } finally {
              setSaving(false);
            }
          }}
        />
      ) : null}
    </div>
  );

  async function remove(id: string) {
    setError("");
    await fetch(`/api/admin/crud/${entity.table}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }
}

function EditModal({
  entity,
  initial,
  saving,
  onClose,
  onSave,
}: {
  entity: AdminEntity;
  initial: Row;
  saving: boolean;
  onClose: () => void;
  onSave: (form: Row) => void;
}) {
  const [form, setForm] = useState<Row>(() => {
    const init: Row = {};
    for (const f of entity.fields) {
      if (f.type === "localized") {
        init[f.name] = { en: "", ar: "" };
      } else if (f.type === "boolean") {
        init[f.name] = false;
      } else {
        init[f.name] = "";
      }
    }
    // merge existing
    for (const f of entity.fields) {
      if (initial[f.name] !== undefined && initial[f.name] !== null) {
        init[f.name] = initial[f.name];
      }
    }
    return init;
  });

  const set = (name: string, value: unknown) => setForm((f) => ({ ...f, [name]: value }));
  const setLocalized = (name: string, lang: "en" | "ar", value: string) => {
    setForm((f) => {
      const cur = (f[name] as { en: string; ar: string }) || { en: "", ar: "" };
      return { ...f, [name]: { ...cur, [lang]: value } };
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-brand-950/50 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-brand-900">
            {initial.id ? `Edit ${entity.singular}` : `Add ${entity.singular}`}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-brand-800 hover:bg-brand-50">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          {entity.fields.map((f) => {
            if (f.type === "localized") {
              const val = (form[f.name] as { en: string; ar: string }) || { en: "", ar: "" };
              return (
                <div key={f.name} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-900">{f.label} (EN)</label>
                    <input value={val.en} onChange={(e) => setLocalized(f.name, "en", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-brand-900">{f.labelAr} (AR)</label>
                    <input value={val.ar} onChange={(e) => setLocalized(f.name, "ar", e.target.value)} dir="rtl" className={inputCls} />
                  </div>
                </div>
              );
            }
            if (f.type === "boolean") {
              return (
                <label key={f.name} className="flex items-center gap-2 text-sm text-brand-900">
                  <input
                    type="checkbox"
                    checked={Boolean(form[f.name])}
                    onChange={(e) => set(f.name, e.target.checked)}
                    className="h-4 w-4 rounded border-brand-300"
                  />
                  {f.label}
                </label>
              );
            }
            if (f.type === "textarea") {
              return (
                <div key={f.name}>
                  <label className="mb-1 block text-xs font-semibold text-brand-900">{f.label}</label>
                  <textarea value={String(form[f.name] ?? "")} onChange={(e) => set(f.name, e.target.value)} rows={4} className={inputCls} />
                </div>
              );
            }
            return (
              <div key={f.name}>
                <label className="mb-1 block text-xs font-semibold text-brand-900">{f.label}</label>
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(form[f.name] ?? "")}
                  onChange={(e) => set(f.name, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  className={inputCls}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(form)}
            disabled={saving}
            className="rounded-lg bg-brand-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
