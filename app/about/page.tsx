import Link from "next/link";

export const metadata = {
  title: "About — Polymarket KB",
  description: "About the Polymarket Knowledge Base system",
};

export default function AboutPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Terminal prompt */}
      <div className="mb-5 text-sm">
        <span className="tui-dim">root@polymarket-kb:~$</span>{" "}
        <span className="text-primary tui-cursor">cat README.md</span>
      </div>

      {/* Main content */}
      <div className="space-y-6 text-xs font-mono leading-relaxed">
        {/* Title block */}
        <section className="border border-border bg-card p-4">
          <div className="text-primary font-bold text-sm mb-2">
            POLYMARKET KNOWLEDGE BASE
          </div>
          <p className="tui-dim">
            Real-time geopolitical and crypto research powering an autonomous
            prediction market analysis system.
          </p>
        </section>

        {/* What is this */}
        <section className="border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">── WHAT IS THIS ──────────────────</div>
          {/* TODO: Implement detailed description of polymarket-kb purpose */}
          <p className="mb-2">
            Polymarket KB is a structured knowledge base system that powers
            real-time market analysis for prediction markets. It integrates
            with the NanoClaw personal assistant system to provide intelligent
            research and analysis capabilities.
          </p>
          <p>
            Topics are continuously updated by an autonomous 3-tier agent
            pipeline that monitors news, analyzes market movements, and
            generates research summaries.
          </p>
        </section>

        {/* NanoClaw system */}
        <section className="border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">── NANOCLAW SYSTEM ──────────────────</div>
          {/* TODO: Implement NanoClaw architecture description */}
          <p className="mb-2">
            <span className="text-primary font-bold">NanoClaw</span> is a
            personal Claude assistant that connects to WhatsApp and routes
            messages to specialized Claude Agent containers running on Linux
            VMs. Each group has isolated filesystem and memory.
          </p>
          <p>
            The system provides a multi-agent architecture that coordinates
            real-time research, market analysis, and knowledge synthesis.
          </p>
        </section>

        {/* Agent pipeline */}
        <section className="border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">── AGENT PIPELINE ───────────────────</div>
          {/* TODO: Implement detailed agent pipeline description */}
          <div className="space-y-3">
            <div>
              <div className="text-primary font-bold">Tier 1: News Agent</div>
              <p className="tui-dim">
                Monitors real-time news feeds and identifies market-relevant
                events. Extracts key information and flags emerging topics.
              </p>
            </div>
            <div>
              <div className="text-primary font-bold">Tier 2: Analyst Agent</div>
              <p className="tui-dim">
                Synthesizes news into structured research. Creates and updates
                topic summaries, analyzes implications, identifies connections
                between events.
              </p>
            </div>
            <div>
              <div className="text-primary font-bold">Tier 3: Market Agent</div>
              <p className="tui-dim">
                Evaluates market positions and probability impacts. Maps
                research to specific prediction market positions and generates
                trading recommendations.
              </p>
            </div>
          </div>
        </section>

        {/* How KB is updated */}
        <section className="border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">── KB UPDATE CYCLE ──────────────────</div>
          {/* TODO: Implement KB update workflow description */}
          <ol className="space-y-2 list-decimal list-inside">
            <li>News agent scans feeds and identifies relevant articles</li>
            <li>Analyst agent creates/updates topic entries with summaries</li>
            <li>Market agent maps topics to prediction markets</li>
            <li>Knowledge base graph is updated with new links and entities</li>
            <li>Changes are synchronized back to the KB and WhatsApp group</li>
          </ol>
        </section>

        {/* Navigation */}
        <section className="border border-border bg-card p-4">
          <div className="text-xs tui-dim mb-3">── NAVIGATION ───────────────────────</div>
          <div className="space-y-1">
            <p>
              <Link href="/" className="text-primary hover:underline">
                Topics
              </Link>
              <span className="tui-dim"> — Browse all knowledge base topics</span>
            </p>
            <p>
              <Link href="/entities" className="text-primary hover:underline">
                Entities
              </Link>
              <span className="tui-dim">
                {" "}
                — Browse people, organizations, and concepts
              </span>
            </p>
            <p>
              <Link href="/about" className="text-primary hover:underline">
                About
              </Link>
              <span className="tui-dim"> — System information (you are here)</span>
            </p>
          </div>
        </section>

        {/* Footer info */}
        <section className="text-xs tui-dim p-2">
          <p>
            For more information about NanoClaw, see{" "}
            <code className="bg-card px-1">container/skills/agent-browser.md</code>
          </p>
        </section>
      </div>
    </div>
  );
}
