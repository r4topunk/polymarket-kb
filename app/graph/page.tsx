import { buildForceGraphData } from "@/lib/graph";
import { GraphWrapper } from "@/components/tui/graph-wrapper";

export const metadata = {
  title: "Graph — Polymarket KB",
  description: "Interactive knowledge graph of topics and entities",
};

export default function GraphPage() {
  const data = buildForceGraphData();

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 5.5rem)" }}>
      {/* Terminal prompt */}
      <div className="px-3 sm:px-4 py-3 shrink-0 text-sm border-b border-border">
        <span className="tui-dim">
          <span className="hidden sm:inline">root@polymarket-kb:~$</span>
          <span className="sm:hidden">~$</span>
        </span>{" "}
        <span className="text-primary tui-cursor">graph --interactive</span>
      </div>

      {/* Graph canvas — fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <GraphWrapper data={data} />
      </div>
    </div>
  );
}
