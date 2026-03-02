import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ENTITY_DIR  = path.join(CONTENT_DIR, "entities");

export interface TopicMeta {
  slug: string;
  title: string;
  type: "topic" | "entity";
  lastUpdated: string | null;
  relatedTopics: string[];
  entryCount: number;
  status: "active" | "dormant";
}

export interface TopicFull extends TopicMeta {
  content: string; // raw markdown (after frontmatter stripped)
}

export interface GraphNode {
  links_to: string[];
  linked_from: string[];
  latest_entry: string | null;
}

function parseMd(filePath: string): { data: Record<string, unknown>; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return matter(raw);
  } catch {
    return null;
  }
}

function toMeta(data: Record<string, unknown>, slug: string, type: "topic" | "entity"): TopicMeta {
  return {
    slug,
    title: (data.title as string) ?? slug,
    type: (data.type as "topic" | "entity") ?? type,
    lastUpdated: (data.lastUpdated as string) ?? null,
    relatedTopics: (data.relatedTopics as string[]) ?? [],
    entryCount: (data.entryCount as number) ?? 0,
    status: (data.status as "active" | "dormant") ?? "active",
  };
}

// ─── Topics ────────────────────────────────────────────────────────────────

export function getAllTopics(): TopicMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const parsed = parseMd(path.join(CONTENT_DIR, f));
      if (!parsed) return null;
      return toMeta(parsed.data, slug, "topic");
    })
    .filter((t): t is TopicMeta => t !== null)
    .sort((a, b) => {
      // active first, then by lastUpdated desc
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      if (!a.lastUpdated && !b.lastUpdated) return 0;
      if (!a.lastUpdated) return 1;
      if (!b.lastUpdated) return -1;
      return b.lastUpdated.localeCompare(a.lastUpdated);
    });
}

export function getTopic(slug: string): TopicFull | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  const parsed = parseMd(filePath);
  if (!parsed) return null;
  return { ...toMeta(parsed.data, slug, "topic"), content: parsed.content };
}

// ─── Entities ──────────────────────────────────────────────────────────────

export function getAllEntities(): TopicMeta[] {
  if (!fs.existsSync(ENTITY_DIR)) return [];

  return fs
    .readdirSync(ENTITY_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const parsed = parseMd(path.join(ENTITY_DIR, f));
      if (!parsed) return null;
      return toMeta(parsed.data, slug, "entity");
    })
    .filter((e): e is TopicMeta => e !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getEntity(slug: string): TopicFull | null {
  const filePath = path.join(ENTITY_DIR, `${slug}.md`);
  const parsed = parseMd(filePath);
  if (!parsed) return null;
  return { ...toMeta(parsed.data, slug, "entity"), content: parsed.content };
}

// ─── Graph ─────────────────────────────────────────────────────────────────

export function getGraph(): Record<string, GraphNode> {
  const graphPath = path.join(CONTENT_DIR, "graph.json");
  try {
    return JSON.parse(fs.readFileSync(graphPath, "utf8"));
  } catch {
    return {};
  }
}

// ─── Stats for footer ──────────────────────────────────────────────────────

export function getKBStats() {
  const topics = getAllTopics();
  const entities = getAllEntities();
  const totalEntries = topics.reduce((sum, t) => sum + t.entryCount, 0);
  const dates = topics
    .map((t) => t.lastUpdated)
    .filter(Boolean)
    .sort();
  const lastUpdated = dates.length ? dates[dates.length - 1]!.slice(0, 10) : "";
  return {
    topicCount: topics.length,
    entityCount: entities.length,
    entryCount: totalEntries,
    lastUpdated,
  };
}
