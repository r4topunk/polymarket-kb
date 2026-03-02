import { cn } from "@/lib/utils";

export function MarkdownContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  // TODO: Apply TUI-appropriate prose styling
  // TODO: Handle custom markdown elements (tables, code blocks, etc.)
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none font-mono text-xs leading-relaxed",
        "prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
        "prose-code:bg-card prose-code:px-1 prose-code:py-0.5",
        "prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto",
        "prose-headings:font-mono prose-headings:font-bold",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
