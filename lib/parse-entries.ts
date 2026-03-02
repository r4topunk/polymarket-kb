/**
 * Parse a topic's markdown content into structured preamble + dated entries.
 *
 * Entry format in the knowledge base:
 *   ## 2026-02-27T15:30 — Headline
 *   [Tag](/path) [Tag2](/path) Plain Tag
 *   Body paragraph(s)...
 *   **Sources:**
 *   - [Title](url)
 *   **Impact:** LEVEL — Description
 */

export interface EntryTag {
  text: string;
  href: string | null;
}

export interface EntrySource {
  title: string;
  url: string;
}

export interface ParsedEntry {
  date: string;
  headline: string;
  tags: EntryTag[];
  body: string;
  sources: EntrySource[];
  impact: { level: string; description: string } | null;
}

export interface ParsedTopic {
  preamble: string;
  entries: ParsedEntry[];
}

// m flag: ^ matches start of each line; no $ needed since .+ stops at \n
const HEADER_RE = /^## (\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?) — (.+)/m;

export function parseTopic(content: string): ParsedTopic {
  // Split into chunks at each dated header
  const chunks = content.split(/^(?=## \d{4}-\d{2}-\d{2})/m);

  // First chunk is preamble (title, current state, context)
  let preamble = "";
  const entries: ParsedEntry[] = [];

  for (const chunk of chunks) {
    // Only match against the first line to avoid multiline $ issues
    const firstLine = chunk.split("\n")[0];
    const headerMatch = firstLine.match(HEADER_RE);
    if (!headerMatch) {
      preamble += chunk;
      continue;
    }

    entries.push(parseEntry(headerMatch[1], headerMatch[2], chunk));
  }

  return { preamble: preamble.trim(), entries };
}

function parseEntry(date: string, headline: string, raw: string): ParsedEntry {
  // Remove the header line itself
  const lines = raw.split("\n").slice(1);

  const tags: EntryTag[] = [];
  const sources: EntrySource[] = [];
  let impact: ParsedEntry["impact"] = null;
  const bodyLines: string[] = [];

  let section: "tags" | "body" | "sources" | "done" = "tags";

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip separators
    if (trimmed === "---") continue;

    // Sources header
    if (trimmed.startsWith("**Sources:**") || trimmed === "**Sources**") {
      section = "sources";
      continue;
    }

    // Impact line
    const impactMatch = trimmed.match(
      /^\*\*Impact:?\*\*\s*(EXTREMELY HIGH|HIGH|MEDIUM|LOW)\s*[—–-]\s*(.*)/i
    );
    if (impactMatch) {
      impact = { level: impactMatch[1].toUpperCase(), description: impactMatch[2] };
      section = "done";
      continue;
    }

    // Tags section: first non-blank line(s) after header that contain links
    if (section === "tags") {
      if (!trimmed) continue; // skip leading blanks
      if (/\[.+?\]/.test(trimmed)) {
        parseTags(trimmed, tags);
        section = "body";
        continue;
      }
      // No tags found — this line is already body
      section = "body";
      bodyLines.push(line);
      continue;
    }

    if (section === "sources") {
      const srcMatch = trimmed.match(/^- \[([^\]]+)\]\(([^)]+)\)/);
      if (srcMatch) {
        sources.push({ title: srcMatch[1], url: srcMatch[2] });
      }
      continue;
    }

    if (section === "body") {
      bodyLines.push(line);
    }
  }

  return {
    date,
    headline,
    tags,
    body: bodyLines.join("\n").trim(),
    sources,
    impact,
  };
}

function parseTags(line: string, out: EntryTag[]) {
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lastIndex = 0;

  while ((match = linkRe.exec(line)) !== null) {
    // Plain text before this link
    const before = line.slice(lastIndex, match.index).trim();
    if (before) {
      for (const w of before.split(/\s+/).filter(Boolean)) {
        out.push({ text: w, href: null });
      }
    }
    out.push({ text: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }

  // Trailing plain text
  const after = line.slice(lastIndex).trim();
  if (after) {
    for (const w of after.split(/\s+/).filter(Boolean)) {
      out.push({ text: w, href: null });
    }
  }
}

/** Minimal inline markdown → HTML for entry body text (links + bold) */
export function inlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
