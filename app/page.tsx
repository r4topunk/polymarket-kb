import Link from "next/link";
import { getAllTopics } from "@/lib/content";

export default function Home() {
  const topics = getAllTopics();
  const active  = topics.filter((t) => t.status === "active");
  const dormant = topics.filter((t) => t.status === "dormant");

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-5 text-sm">
        <span className="tui-dim">root@polymarket-kb:~$</span>{" "}
        <span className="text-primary tui-cursor">ls topics/</span>
      </div>

      {/* Stats row */}
      <div className="border border-border bg-card px-4 py-2 mb-6 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span><span className="tui-dim">TOPICS</span>  <span className="text-primary font-bold">{topics.length}</span></span>
        <span><span className="tui-dim">ACTIVE</span>  <span className="text-primary font-bold">{active.length}</span></span>
        <span><span className="tui-dim">DORMANT</span> <span className="text-muted-foreground">{dormant.length}</span></span>
        <span><span className="tui-dim">ENTRIES</span> <span className="text-primary font-bold">{topics.reduce((s, t) => s + t.entryCount, 0).toLocaleString()}</span></span>
      </div>

      {/* Active topics */}
      {active.length > 0 && (
        <section className="mb-8">
          <div className="text-xs tui-dim mb-2">
            ── ACTIVE ({active.length}) ────────────────────────────────────
          </div>
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
          <div className="text-xs tui-dim mb-2">
            ── DORMANT ({dormant.length}) ───────────────────────────────────
          </div>
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
        "flex items-start sm:items-center justify-between gap-3 px-3 py-2 bg-background",
        "hover:bg-accent hover:text-accent-foreground transition-colors group",
        "flex-col sm:flex-row",
      ].join(" ")}
    >
      {/* Left: title + related */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span
          className={[
            "text-sm font-medium truncate shrink-0",
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
      <div className="flex items-center gap-4 text-xs tui-dim shrink-0">
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
