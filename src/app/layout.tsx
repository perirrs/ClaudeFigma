import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mergen | Enterprise Platform for the Future",
  description:
    "Transform your business with AI-powered workflows, intelligent automation, and seamless enterprise integration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="noise">
      <body>{children}</body>
    </html>
  );
}
