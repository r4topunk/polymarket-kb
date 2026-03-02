import Link from "next/link";
import type { GraphNode } from "@/lib/content";
import { cn } from "@/lib/utils";

export function RelatedTopics({
  relatedTopics,
  backlinks,
  graph,
}: {
  relatedTopics: string[];
  backlinks: string[];
  graph: Record<string, GraphNode>;
}) {
  // TODO: Implement logic to determine whether a slug is a topic or entity
  // TODO: Filter out non-existent items from graph
  // TODO: Format [[slug]] references for display

  return (
    <div className="border border-border bg-card p-3 sm:p-4 text-xs">
      {/* LINKS TO section */}
      {relatedTopics.length > 0 && (
        <section className="mb-4">
          <div className="text-xs tui-dim mb-2">── LINKS TO ──────────────────</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1">
            {relatedTopics.map((slug) => (
              <Link
                key={slug}
                href={`/topics/${slug}`}
                className="text-primary hover:bg-accent border border-border px-1 py-0.5 transition-colors"
              >
                {slug}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LINKED FROM section */}
      {backlinks.length > 0 && (
        <section>
          <div className="text-xs tui-dim mb-2">── LINKED FROM ────────────────</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1">
            {backlinks.map((slug) => (
              <Link
                key={slug}
                href={`/topics/${slug}`}
                className="text-primary hover:bg-accent border border-border px-1 py-0.5 transition-colors"
              >
                {slug}
              </Link>
            ))}
          </div>
        </section>
      )}

      {relatedTopics.length === 0 && backlinks.length === 0 && (
        <div className="text-xs tui-dim">no connections</div>
      )}
    </div>
  );
}
