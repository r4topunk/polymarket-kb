import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllEntities, getEntity, getGraph } from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { MarkdownContent } from "@/components/tui/markdown-content";
import { RelatedTopics } from "@/components/tui/related-topics";

export async function generateStaticParams() {
  const entities = getAllEntities();
  return entities.map((entity) => ({
    slug: entity.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entity = getEntity(slug);

  if (!entity) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${entity.title} — Polymarket KB`,
    description: `Entity page for ${entity.title}`,
  };
}

export default async function EntityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entity = getEntity(slug);

  if (!entity) {
    notFound();
  }

  const htmlContent = await markdownToHtml(entity.content);
  const graph = getGraph();

  // TODO: Extract backlinks from graph — which topics/entities link_to this entity
  const backlinks: string[] = Object.keys(graph).filter(
    (nodeSlug) => graph[nodeSlug]?.links_to.includes(slug) ?? false
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-5 text-sm">
        <span className="tui-dim">root@polymarket-kb:~/entities$</span>{" "}
        <span className="text-primary tui-cursor">cat {slug}.md</span>
      </div>

      {/* Entity header: title + metadata */}
      <div className="border border-border bg-card p-4 mb-6">
        <h1 className="text-lg font-bold text-foreground mb-3">
          {entity.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs tui-dim">
          {entity.lastUpdated && (
            <span>Last updated: {entity.lastUpdated}</span>
          )}
          {entity.entryCount > 0 && (
            <span>{entity.entryCount} entries</span>
          )}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Markdown content - spans 2 cols on large screens */}
        <div className="lg:col-span-2">
          <div className="border border-border bg-card p-4">
            <MarkdownContent html={htmlContent} />
          </div>
        </div>

        {/* Sidebar: related topics and backlinks */}
        <div className="lg:col-span-1">
          <RelatedTopics
            relatedTopics={entity.relatedTopics}
            backlinks={backlinks}
            graph={graph}
          />
        </div>
      </div>

      {/* Backlinks section (full width below content) */}
      {backlinks.length > 0 && (
        <section className="mt-6 border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">
            ── REFERENCED BY ({backlinks.length}) ──────────────────────────────
          </div>
          <div className="flex flex-wrap gap-2">
            {backlinks.map((backlink) => (
              <Link
                key={backlink}
                href={`/topics/${backlink}`}
                className="text-primary hover:underline text-xs border border-primary px-2 py-1"
              >
                [[{backlink}]]
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
