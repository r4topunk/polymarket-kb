import Link from "next/link";
import { getAllTopics } from "@/lib/content";

export default function Home() {
  const topics = getAllTopics();
  const active  = topics.filter((t) => t.status === "active");
  const dormant = topics.filter((t) => t.status === "dormant");

  return (
    <div className="px-3 sm:px-4 py-4 max-w-5xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-4 sm:mb-5 text-sm">
        <span className="tui-dim">
          <span className="hidden sm:inline">root@polymarket-kb:~$</span>
          <span className="sm:hidden tui-dim">~$</span>
        </span>{" "}
        <span className="text-primary tui-cursor">ls topics/</span>
      </div>

      {/* Stats row */}
      <div className="border border-border bg-card px-3 sm:px-4 py-2 mb-5 sm:mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-3 sm:gap-x-6 gap-y-1 text-xs">
        <span><span className="tui-dim">TOPICS</span>  <span className="text-primary font-bold">{topics.length}</span></span>
        <span><span className="tui-dim">ACTIVE</span>  <span className="text-primary font-bold">{active.length}</span></span>
        <span><span className="tui-dim">DORMANT</span> <span className="text-muted-foreground">{dormant.length}</span></span>
        <span><span className="tui-dim">ENTRIES</span> <span className="text-primary font-bold">{topics.reduce((s, t) => s + t.entryCount, 0).toLocaleString()}</span></span>
      </div>

      {/* Active topics */}
      {active.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <SectionHeader label="ACTIVE" count={active.length} />
          <div className="grid gap-px border border-border">
            {active.map((topic) => (
              <TopicRow key={topic.slug} topic={topic} />
            ))}
          </div>
        </section>
      )}

      {/* Dormant topics */}
      {dormant.length > 0 && (
        <section>
          <SectionHeader label="DORMANT" count={dormant.length} />
          <div className="grid gap-px border border-border">
            {dormant.map((topic) => (
              <TopicRow key={topic.slug} topic={topic} dimmed />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="text-xs tui-dim mb-2 flex items-center gap-2 overflow-hidden">
      <span className="shrink-0">──</span>
      <span className="shrink-0">{label} ({count})</span>
      <span className="border-b border-border flex-1" />
    </div>
  );
}

function TopicRow({
  topic,
  dimmed = false,
}: {
  topic: ReturnType<typeof getAllTopics>[number];
  dimmed?: boolean;
}) {
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className={[
        "flex items-start sm:items-center justify-between gap-2 sm:gap-3 px-3 py-2.5 sm:py-2 bg-background",
        "hover:bg-accent hover:text-accent-foreground transition-colors group",
        "flex-col sm:flex-row overflow-hidden",
      ].join(" ")}
    >
      {/* Left: title + related */}
      <div className="flex items-baseline gap-2 min-w-0 overflow-hidden w-full sm:w-auto">
        <span
          className={[
            "text-sm font-medium truncate min-w-0",
            dimmed ? "tui-dim" : "text-foreground group-hover:text-primary",
          ].join(" ")}
        >
          {topic.title}
        </span>
        {topic.relatedTopics.slice(0, 3).map((r) => (
          <span
            key={r}
            className="text-xs tui-dim border border-border px-1 hidden md:inline shrink-0"
          >
            {r}
          </span>
        ))}
      </div>

      {/* Right: meta */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs tui-dim shrink-0">
        {topic.entryCount > 0 && (
          <span className="hidden sm:inline">{topic.entryCount} entries</span>
        )}
        {topic.lastUpdated && (
          <span className="tabular-nums">{topic.lastUpdated.slice(0, 10)}</span>
        )}
        <span
          className={[
            "border px-1 py-0",
            topic.status === "active"
              ? "border-primary text-primary"
              : "border-muted-foreground",
          ].join(" ")}
        >
          {topic.status.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}
