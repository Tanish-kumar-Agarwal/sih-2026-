import type { Metadata } from "next";
import "./globals.css";

import QueryProvider from "@/components/QueryProvider";
import DevPersonaSwitcher from "@/components/DevPersonaSwitcher";

export const metadata: Metadata = {
  title: "SkillSetu - AI Competency Graph & Opportunity Matchmaking Platform",
  description: "Bridging Students, Institutions, Faculty and Industry Recruiters with dynamic Neo4j knowledge graphs, explainable AI matchmaking and verified evidence portfolios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300..600&family=Geist+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#111111] text-[#ededed] antialiased selection:bg-[#296ff0] selection:text-white">
        <QueryProvider>
          {children}
          <DevPersonaSwitcher />
        </QueryProvider>
      </body>
    </html>
  );
}

