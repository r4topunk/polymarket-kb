import { getAllTopics, getAllEntities, getGraph } from "./content";

export interface FGNode {
  id: string;
  label: string;
  type: "topic" | "entity" | "phantom";
  linkCount: number;
  href: string | null;
}

export interface FGLink {
  source: string;
  target: string;
}

export interface ForceGraphData {
  nodes: FGNode[];
  links: FGLink[];
}

export function buildForceGraphData(): ForceGraphData {
  const topics = getAllTopics();
  const entities = getAllEntities();
  const graph = getGraph();

  const nodeMap = new Map<string, FGNode>();

  topics.forEach((t) => {
    nodeMap.set(t.slug, {
      id: t.slug,
      label: t.title,
      type: "topic",
      linkCount: 0,
      href: `/topics/${t.slug}`,
    });
  });

  entities.forEach((e) => {
    nodeMap.set(e.slug, {
      id: e.slug,
      label: e.title,
      type: "entity",
      linkCount: 0,
      href: `/entities/${e.slug}`,
    });
  });

  const edgeSet = new Set<string>();
  const links: FGLink[] = [];

  function addEdge(src: string, tgt: string) {
    if (src === tgt) return;
    const key = [src, tgt].sort().join("\0");
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    links.push({ source: src, target: tgt });
  }

  // From relatedTopics (these are slugs in this codebase)
  topics.forEach((t) => {
    t.relatedTopics.forEach((related) => addEdge(t.slug, related));
  });
  entities.forEach((e) => {
    e.relatedTopics.forEach((related) => addEdge(e.slug, related));
  });

  // From graph.json links_to
  Object.entries(graph).forEach(([slug, node]) => {
    node.links_to.forEach((target) => addEdge(slug, target));
  });

  // Add phantom nodes for referenced slugs without pages
  links.forEach(({ source, target }) => {
    for (const id of [source, target]) {
      if (!nodeMap.has(id)) {
        nodeMap.set(id, {
          id,
          label: id,
          type: "phantom",
          linkCount: 0,
          href: null,
        });
      }
    }
  });

  // Count links per node
  links.forEach(({ source, target }) => {
    const s = nodeMap.get(source);
    const t = nodeMap.get(target);
    if (s) s.linkCount++;
    if (t) t.linkCount++;
  });

  return { nodes: Array.from(nodeMap.values()), links };
}
