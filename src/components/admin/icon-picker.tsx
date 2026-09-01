"use client";

import { useMemo, useState } from "react";
import { Icon, iconCategories } from "@/components/icon";

const categoryOrder = [
  "Logistics",
  "Transportation",
  "Shipping",
  "Containers",
  "Air Freight",
  "Trucks",
  "Customs",
  "Warehouse",
  "Tracking",
  "Documents",
  "Business",
  "Security",
  "Technology",
  "Communication",
  "Arrows",
  "General",
];

export function IconPicker({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const allIcons = useMemo(() => {
    const set = new Set<string>();
    Object.values(iconCategories).forEach((list) => list.forEach((i) => set.add(i)));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    let list = category === "All" ? allIcons : iconCategories[category] || [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.toLowerCase().includes(q));
    }
    return list;
  }, [allIcons, category, query]);

  return (
    <div>
      {label ? <span className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</span> : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm transition-colors hover:border-brand-400"
      >
        <span className="flex items-center gap-2 text-brand-900">
          {value ? <Icon name={value} className="h-5 w-5 text-brand-700" /> : null}
          {value || "Select icon"}
        </span>
        <span className="text-xs text-brand-600">Change</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-lift">
            <div className="border-b border-brand-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-brand-900">Select icon</h3>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-brand-800 hover:bg-brand-50">
                  <Icon name="x" className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3">
                <Icon name="search" className="h-4 w-4 text-ink-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search icons…"
                  className="w-full bg-transparent py-2 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-brand-100 px-3 py-2">
              {["All", ...categoryOrder].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    category === c ? "bg-brand-800 text-white" : "text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid flex-1 grid-cols-4 gap-2 overflow-y-auto p-4 sm:grid-cols-6">
              {filtered.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                    value === name ? "border-accent-500 bg-accent-50" : "border-brand-100 hover:border-brand-300 hover:bg-brand-50"
                  }`}
                >
                  <Icon name={name} className="h-6 w-6 text-brand-700" />
                  <span className="w-full truncate text-center text-[10px] text-ink-muted">{name}</span>
                </button>
              ))}
              {!filtered.length ? (
                <p className="col-span-full py-8 text-center text-sm text-ink-muted">No icons found.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
