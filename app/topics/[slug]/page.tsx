import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTopics, getTopic, getGraph } from "@/lib/content";
import { markdownToHtml } from "@/lib/markdown";
import { parseTopic } from "@/lib/parse-entries";
import { MarkdownContent } from "@/components/tui/markdown-content";
import { RelatedTopics } from "@/components/tui/related-topics";
import { EntryCard } from "@/components/tui/entry-card";

export async function generateStaticParams() {
  return getAllTopics().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Not Found" };
  return {
    title: `${topic.title} — Polymarket KB`,
    description: `Knowledge base entry for ${topic.title}`,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const { preamble, entries } = parseTopic(topic.content);
  const preambleHtml = await markdownToHtml(preamble);
  const graph = getGraph();

  const backlinks = Object.keys(graph).filter(
    (s) => graph[s]?.links_to.includes(slug) ?? false
  );

  return (
    <div className="px-3 py-4 sm:px-4 max-w-5xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-5 text-sm flex items-baseline gap-1 overflow-hidden">
        <span className="tui-dim shrink-0">
          <span className="hidden sm:inline">root@polymarket-kb:~/topics$</span>
          <span className="sm:hidden">~/topics$</span>
        </span>{" "}
        <span className="text-primary tui-cursor truncate min-w-0">cat {slug}.md</span>
      </div>

      {/* Topic header */}
      <div className="border border-border bg-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 mb-3">
          <h1 className="text-lg font-bold text-foreground">{topic.title}</h1>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={[
                "border px-1 py-0",
                topic.status === "active"
                  ? "border-primary text-primary"
                  : "border-muted-foreground text-muted-foreground",
              ].join(" ")}
            >
              {topic.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs tui-dim">
          {topic.lastUpdated && <span>Last updated: {topic.lastUpdated}</span>}
          {topic.entryCount > 0 && <span>{topic.entryCount} entries</span>}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Content column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preamble: current state + context */}
          {preambleHtml && (
            <div className="border border-border bg-card p-4">
              <MarkdownContent html={preambleHtml} />
            </div>
          )}

          {/* Entry cards */}
          {entries.length > 0 && (
            <div>
              <div className="text-xs tui-dim mb-2 flex items-center gap-2 overflow-hidden">
                <span className="shrink-0">──</span>
                <span className="shrink-0">ENTRIES ({entries.length})</span>
                <span className="border-b border-border flex-1" />
              </div>
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <EntryCard key={`${entry.date}-${i}`} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 order-first lg:order-none space-y-4">
          <RelatedTopics
            relatedTopics={topic.relatedTopics}
            backlinks={backlinks}
            graph={graph}
          />
        </div>
      </div>
    </div>
  );
}
