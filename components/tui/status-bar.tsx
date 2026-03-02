import { ThemeToggle } from "./theme-toggle";

export function StatusBar() {
  return (
    <header className="border-b border-border bg-card text-card-foreground px-3 py-1.5 flex items-center justify-between gap-4 shrink-0">
      {/* Left: title */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-primary font-bold text-sm tracking-tight shrink-0">
          POLYMARKET-KB
        </span>
        <span className="tui-dim text-xs hidden sm:inline shrink-0">v1.0</span>
        <span className="tui-dim text-xs hidden md:inline truncate">
          — PREDICTION MARKET INTELLIGENCE
        </span>
      </div>

      {/* Right: status indicators + toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs tui-dim hidden sm:inline">[ONLINE]</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
