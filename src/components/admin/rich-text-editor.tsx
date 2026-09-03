"use client";

import { useRef, useState } from "react";
import { RichText } from "@/components/rich-text";
import { useAdminLang } from "@/components/admin/lang";

interface Tool {
  key: string;
  label: string;
  title: string;
  titleAr: string;
  apply: (text: string, start: number, end: number) => { value: string; cursor: number };
}

function surround(before: string, after: string, placeholder: string): Tool["apply"] {
  return (text, start, end) => {
    const sel = text.slice(start, end) || placeholder;
    const value = text.slice(0, start) + before + sel + after + text.slice(end);
    return { value, cursor: start + before.length + sel.length + after.length };
  };
}

function linePrefix(prefix: string, placeholder: string): Tool["apply"] {
  return (text, start, end) => {
    const lineStart = text.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = text.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = text.length;
    const selected = (text.slice(lineStart, lineEnd) || placeholder).split("\n");
    const value =
      text.slice(0, lineStart) +
      selected.map((l) => (l.trim().startsWith(prefix.trim()) ? l : prefix + l)).join("\n") +
      text.slice(lineEnd);
    return { value, cursor: lineEnd + (selected.length > 1 ? prefix.length : 0) };
  };
}

const TOOLS: Tool[] = [
  { key: "bold", label: "B", title: "Bold", titleAr: "غامق", apply: surround("**", "**", "bold text") },
  { key: "italic", label: "I", title: "Italic", titleAr: "مائل", apply: surround("*", "*", "italic text") },
  { key: "h2", label: "H2", title: "Heading", titleAr: "عنوان", apply: linePrefix("## ", "Heading") },
  { key: "h3", label: "H3", title: "Subheading", titleAr: "عنوان فرعي", apply: linePrefix("### ", "Subheading") },
  { key: "ul", label: "• List", title: "Bullet list", titleAr: "قائمة نقطية", apply: linePrefix("- ", "List item") },
  { key: "ol", label: "1. List", title: "Numbered list", titleAr: "قائمة مرقمة", apply: linePrefix("1. ", "List item") },
  { key: "quote", label: "❝", title: "Quote", titleAr: "اقتباس", apply: linePrefix("> ", "Quote") },
  { key: "link", label: "Link", title: "Link", titleAr: "رابط", apply: surround("[", "](https://)", "link text") },
];

export function RichTextEditor({
  value,
  onChange,
  dir,
}: {
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
}) {
  const { t } = useAdminLang();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  function run(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const res = tool.apply(el.value, start, end);
    onChange(res.value);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(res.cursor, res.cursor);
    });
  }

  const textarea =
    "w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

  return (
    <div className="overflow-hidden rounded-lg border border-brand-200">
      <div className="flex flex-wrap items-center gap-1 border-b border-brand-200 bg-surface-muted px-2 py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.key}
            type="button"
            title={t(tool.title, tool.titleAr)}
            onClick={() => run(tool)}
            className="rounded px-2 py-1 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100"
          >
            {tool.label}
          </button>
        ))}
        <div className="ms-auto">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${preview ? "bg-brand-800 text-white" : "text-brand-800 hover:bg-brand-100"}`}
          >
            {t("Preview", "معاينة")}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="min-h-[180px] px-4 py-3">
          <RichText content={value} />
        </div>
      ) : (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          rows={10}
          className={textarea}
          placeholder={t("Write your content…", "اكتب المحتوى…")}
        />
      )}
    </div>
  );
}
