import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mergen | Premier ServiceNow Partner \u2013 Put AI to Work",
  description:
    "Mergen is a premier ServiceNow partner helping enterprises put AI to work with intelligent workflows, automation, and seamless digital transformation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
