"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";

interface MediaItem {
  id: string;
  url: string;
  mime_type?: string;
  size?: number;
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const json = await res.json();
      if (res.ok) {
        setItems(json.data || []);
        setError("");
      } else {
        setError(json.error || "Failed to load");
      }
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Upload failed");
      else await load();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  async function remove(id: string, url: string) {
    setError("");
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, url }),
    });
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          <Icon name="arrow-up-right" className="h-4 w-4" />
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif" onChange={onFile} className="hidden" />
        <p className="text-xs text-ink-muted">JPG, PNG, WEBP, SVG — max 10MB</p>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-muted">Loading…</p>
      ) : items.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-xl border border-brand-100 bg-white shadow-soft">
              <div className="aspect-[4/3] overflow-hidden bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <button
                  type="button"
                  onClick={() => copy(item.url)}
                  className="inline-flex items-center gap-1 rounded-md border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                >
                  <Icon name={copied === item.url ? "check" : "external-link"} className="h-3.5 w-3.5" />
                  {copied === item.url ? "Copied" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id, item.url)}
                  className="rounded-md border border-red-200 p-1.5 text-red-600 transition-colors hover:bg-red-50"
                  aria-label="Delete"
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center">
          <Icon name="package" className="mx-auto h-8 w-8 text-brand-200" />
          <p className="mt-2 text-sm text-ink-muted">No images yet. Upload your first image.</p>
        </div>
      )}
    </div>
  );
}
