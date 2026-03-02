import Link from "next/link";
import type { ParsedEntry } from "@/lib/parse-entries";
import { inlineMarkdown } from "@/lib/parse-entries";

const IMPACT_STYLES: Record<string, string> = {
  "EXTREMELY HIGH": "bg-destructive/15 text-destructive border-destructive",
  "HIGH":           "bg-primary/10 text-primary border-primary",
  "MEDIUM":         "bg-muted text-muted-foreground border-border",
  "LOW":            "bg-muted text-muted-foreground/60 border-border",
};

export function EntryCard({ entry }: { entry: ParsedEntry }) {
  const impactClass = entry.impact
    ? IMPACT_STYLES[entry.impact.level] ?? IMPACT_STYLES["MEDIUM"]
    : null;

  // Format date: "2026-02-27T15:30" → "2026-02-27 · 15:30"
  const [day, time] = entry.date.includes("T")
    ? entry.date.split("T")
    : [entry.date, null];

  return (
    <article className="border border-border bg-card">
      {/* Header row: date + impact badge */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <span className="text-xs tui-dim tabular-nums">
          {day}
          {time && <span className="text-muted-foreground"> · {time}</span>}
        </span>
        {entry.impact && (
          <span
            className={`text-xs border px-1.5 py-0 shrink-0 ${impactClass}`}
          >
            {entry.impact.level}
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Headline */}
        <h3 className="text-sm font-bold text-foreground leading-snug">
          {entry.headline}
        </h3>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, i) =>
              tag.href ? (
                <Link
                  key={i}
                  href={tag.href}
                  className="text-xs text-primary border border-border px-1 hover:bg-accent transition-colors"
                >
                  {tag.text}
                </Link>
              ) : (
                <span
                  key={i}
                  className="text-xs tui-dim border border-border px-1"
                >
                  {tag.text}
                </span>
              )
            )}
          </div>
        )}

        {/* Body */}
        {entry.body && (
          <div
            className="text-sm text-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(entry.body) }}
          />
        )}

        {/* Sources */}
        {entry.sources.length > 0 && (
          <div className="border-t border-border pt-2 mt-2">
            <div className="text-xs tui-dim mb-1">SOURCES</div>
            <div className="space-y-0.5">
              {entry.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline truncate"
                >
                  · {src.title}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Impact description */}
        {entry.impact?.description && (
          <div className="text-xs tui-dim leading-relaxed">
            {entry.impact.description}
          </div>
        )}
      </div>
    </article>
  );
}
