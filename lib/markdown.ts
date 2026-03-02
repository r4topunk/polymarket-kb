import { remark } from "remark";
import html from "remark-html";

/**
 * Convert markdown content to HTML
 * Uses remark + remark-html pipeline
 * TODO: Add additional rehype plugins for syntax highlighting, custom components, etc.
 */
export async function markdownToHtml(content: string): Promise<string> {
  try {
    const result = await remark()
      .use(html)
      .process(content);
    return result.toString();
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    // TODO: implement error handling strategy
    throw new Error("Failed to render markdown");
  }
}
