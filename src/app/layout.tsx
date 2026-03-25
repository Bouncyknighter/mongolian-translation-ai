import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mongolian Translation AI - Neural Machine Translation",
  description: "Break language barriers with AI-powered Mongolian translation. Neural machine translation trained on millions of bilingual texts.",
  keywords: ["Mongolian translation", "AI translation", "Neural machine translation", "MN to EN", "EN to MN"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
