import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VedaAI - AI Assessment Creator",
  description: "Create AI-powered assessments, generate question papers, and manage assignments with VedaAI",
  keywords: ["AI", "assessment", "question paper", "education", "VedaAI"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
