import Link from "next/link";
import { getAllEntities } from "@/lib/content";

export const metadata = {
  title: "Entities — Polymarket KB",
  description: "Browse entities in the knowledge base",
};

export default function EntitiesPage() {
  const entities = getAllEntities();

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-5 text-sm">
        <span className="tui-dim">root@polymarket-kb:~/entities$</span>{" "}
        <span className="text-primary tui-cursor">ls -la</span>
      </div>

      {/* Stats row */}
      <div className="border border-border bg-card px-4 py-2 mb-6 flex flex-wrap gap-x-6 gap-y-1 text-xs">
        <span>
          <span className="tui-dim">ENTITIES</span>{" "}
          <span className="text-primary font-bold">{entities.length}</span>
        </span>
        {/* TODO: Add more stats if desired (total related topics, etc.) */}
      </div>

      {/* Entities grid/list */}
      {entities.length > 0 ? (
        <div className="grid gap-px border border-border">
          {entities.map((entity) => (
            <EntityCard key={entity.slug} entity={entity} />
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card p-4 text-xs tui-dim">
          No entities found
        </div>
      )}
    </div>
  );
}

function EntityCard({
  entity,
}: {
  entity: ReturnType<typeof getAllEntities>[number];
}) {
  return (
    <Link
      href={`/entities/${entity.slug}`}
      className={[
        "flex items-start sm:items-center justify-between gap-3 px-3 py-2 bg-background",
        "hover:bg-accent hover:text-accent-foreground transition-colors group",
        "flex-col sm:flex-row",
      ].join(" ")}
    >
      {/* Left: title + related */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-sm font-medium truncate shrink-0 text-foreground group-hover:text-primary">
          {entity.title}
        </span>
        {entity.relatedTopics.slice(0, 2).map((r) => (
          <span key={r} className="text-xs tui-dim hidden md:inline shrink-0">
            [[{r}]]
          </span>
        ))}
      </div>

      {/* Right: meta */}
      <div className="flex items-center gap-4 text-xs tui-dim shrink-0">
        {entity.entryCount > 0 && (
          <span className="hidden sm:inline">{entity.entryCount} entries</span>
        )}
        {entity.relatedTopics.length > 0 && (
          <span className="hidden sm:inline">
            {entity.relatedTopics.length} related
          </span>
        )}
      </div>
    </Link>
  );
}
