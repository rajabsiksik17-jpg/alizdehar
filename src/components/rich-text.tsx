import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Block = { type: "h2" | "h3" | "p" | "ul" | "ol" | "quote"; items?: string[]; text?: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const chunks = text.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- "));
    const isOrdered = lines.every((l) => /^\d+\.\s/.test(l.trim()));
    const isQuote = lines.every((l) => l.trim().startsWith("> "));

    if (isList) {
      blocks.push({ type: "ul", items: lines.map((l) => l.trim().replace(/^- /, "")) });
    } else if (isOrdered) {
      blocks.push({ type: "ol", items: lines.map((l) => l.trim().replace(/^\d+\.\s/, "")) });
    } else if (isQuote) {
      blocks.push({ type: "quote", text: lines.map((l) => l.trim().replace(/^> /, "")).join(" ") });
    } else if (lines.length === 1 && lines[0].startsWith("### ")) {
      blocks.push({ type: "h3", text: lines[0].replace(/^### /, "") });
    } else if (lines.length === 1 && lines[0].startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].replace(/^## /, "") });
    } else {
      blocks.push({ type: "p", text: chunk.replace(/\n/g, " ") });
    }
  }
  return blocks;
}

const INLINE = /(\[([^\]]+)\]\(([^)\s]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  INLINE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <a key={key++} href={m[3]} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-600 underline underline-offset-2 hover:text-accent-700">
          {renderInline(m[2])}
        </a>,
      );
    } else if (m[4]) {
      out.push(<strong key={key++} className="font-semibold text-brand-900">{m[5]}</strong>);
    } else if (m[6]) {
      out.push(<em key={key++} className="italic">{m[7]}</em>);
    } else if (m[8]) {
      out.push(<code key={key++} className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-sm text-brand-800">{m[9]}</code>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({
  content,
  className,
  headingClass = "text-2xl font-bold text-brand-900",
}: {
  content: string;
  className?: string;
  headingClass?: string;
}) {
  const blocks = parse(content);
  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className={cn(headingClass, "pt-4")}>
                {renderInline(block.text ?? "")}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-xl font-semibold text-brand-900">
                {renderInline(block.text ?? "")}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i} className="border-s-4 border-accent-400 ps-4 italic text-ink-muted">
                {renderInline(block.text ?? "")}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={i} className="grid gap-2 pl-1">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="grid gap-2 pl-1">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-ink-muted">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                      {j + 1}
                    </span>
                    <span className="pt-0.5">{renderInline(item)}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="leading-relaxed text-ink-muted">
                {renderInline(block.text ?? "")}
              </p>
            );
        }
      })}
    </div>
  );
}
