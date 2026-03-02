"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="text-xs tui-dim w-[14ch]">[LOADING...]</span>;

  const isTerminal = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isTerminal ? "light" : "dark")}
      className="text-xs border border-border px-2 py-2 sm:py-0.5 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer shrink-0"
      aria-label="Toggle theme"
    >
      {isTerminal ? (
        <span className="text-primary">[TERMINAL]</span>
      ) : (
        <span className="text-primary">[PINK]</span>
      )}
    </button>
  );
}
