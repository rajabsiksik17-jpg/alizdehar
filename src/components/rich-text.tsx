import { cn } from "@/lib/utils";

type Block = { type: "h2" | "h3" | "p" | "ul" | "ol"; items?: string[]; text?: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const chunks = text.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const isList = lines.every((l) => l.trim().startsWith("- "));
    const isOrdered = lines.every((l) => /^\d+\.\s/.test(l.trim()));

    if (isList) {
      blocks.push({ type: "ul", items: lines.map((l) => l.trim().replace(/^- /, "")) });
    } else if (isOrdered) {
      blocks.push({ type: "ol", items: lines.map((l) => l.trim().replace(/^\d+\.\s/, "")) });
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
                {block.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="text-xl font-semibold text-brand-900">
                {block.text}
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="grid gap-2 pl-1">
                {block.items!.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{item}</span>
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
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="leading-relaxed text-ink-muted">
                {block.text}
              </p>
            );
        }
      })}
    </div>
  );
}
