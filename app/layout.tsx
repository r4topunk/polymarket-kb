import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { StatusBar } from "@/components/tui/status-bar";
import { NavBar } from "@/components/tui/nav-bar";
import { FooterBar } from "@/components/tui/footer-bar";
import { getKBStats } from "@/lib/content";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polymarket KB — Prediction Market Intelligence",
  description:
    "Real-time geopolitical and crypto research powering an autonomous prediction market analysis system.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stats = getKBStats();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <div className="tui-scanlines flex flex-col min-h-screen">
            <StatusBar />
            <NavBar />
            <main className="flex-1 overflow-auto">{children}</main>
            <FooterBar
              topicCount={stats.topicCount}
              entryCount={stats.entryCount}
              lastUpdated={stats.lastUpdated}
            />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
