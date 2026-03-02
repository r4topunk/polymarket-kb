"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "TOPICS",   href: "/" },
  { label: "ENTITIES", href: "/entities" },
  { label: "ABOUT",    href: "/about" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-background px-3 py-1 flex items-center gap-0 overflow-x-auto shrink-0">
      {NAV_ITEMS.map(({ label, href }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "text-xs px-3 py-2 sm:px-2 sm:py-0.5 border whitespace-nowrap transition-colors",
              isActive
                ? "border-primary text-primary bg-accent"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            ].join(" ")}
          >
            {isActive ? `> ${label}` : `  ${label}`}
          </Link>
        );
      })}
    </nav>
  );
}
