"use client";

import dynamic from "next/dynamic";
import type { ForceGraphData } from "@/lib/graph";

const ForceGraphClient = dynamic(() => import("./force-graph"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-xs tui-dim p-8">
      <span className="text-primary tui-cursor">Loading graph</span>
    </div>
  ),
});

export function GraphWrapper({ data }: { data: ForceGraphData }) {
  return <ForceGraphClient data={data} />;
}
