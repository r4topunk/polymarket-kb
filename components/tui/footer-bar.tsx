export function FooterBar({
  topicCount = 0,
  entryCount = 0,
  lastUpdated = "",
}: {
  topicCount?: number;
  entryCount?: number;
  lastUpdated?: string;
}) {
  return (
    <footer className="border-t border-border bg-card text-card-foreground px-3 py-1 flex items-center justify-between gap-4 shrink-0 text-xs tui-dim mt-auto">
      <div className="flex items-center gap-3 min-w-0">
        {topicCount > 0 && (
          <span className="shrink-0">{topicCount} TOPICS</span>
        )}
        {entryCount > 0 && (
          <span className="shrink-0 hidden sm:inline">{entryCount} ENTRIES</span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {lastUpdated && (
          <span className="hidden sm:inline">
            UPDATED {lastUpdated}
          </span>
        )}
        <span>
          <span className="text-primary">■</span> NANOCLAW
        </span>
      </div>
    </footer>
  );
}
